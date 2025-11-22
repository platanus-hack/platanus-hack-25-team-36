import * as fs from "node:fs";
import * as path from "node:path";

const loadEnvFile = () => {
  let dotenv;
  try {
    dotenv = require("dotenv");
  } catch (error) {
    console.error("dotenv package not found. Please install it first:");
    console.error("  pnpm install");
    process.exit(1);
  }

  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envPath = path.join(process.cwd(), ".env");

  if (fs.existsSync(envLocalPath)) {
    const result = dotenv.config({ path: envLocalPath });
    if (result.error) {
      console.error(`Failed to load .env.local: ${result.error.message}`);
      process.exit(1);
    }
    console.log("Loaded environment variables from .env.local");
  } else if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.error(`Failed to load .env: ${result.error.message}`);
      process.exit(1);
    }
    console.log("Loaded environment variables from .env");
  } else {
    console.warn("No .env.local or .env file found");
  }
};

loadEnvFile();

console.log("Environment variables check:");
console.log(`MONGODB_USERNAME: ${process.env.MONGODB_USERNAME ? "***" : "NOT SET"}`);
console.log(`MONGODB_PASSWORD: ${process.env.MONGODB_PASSWORD ? "***" : "NOT SET"}`);
console.log(`MONGODB_CLUSTER_NAME: ${process.env.MONGODB_CLUSTER_NAME || "NOT SET"}`);
console.log(`MONGODB_CLUSTER_URL_ID: ${process.env.MONGODB_CLUSTER_URL_ID || "NOT SET"}`);

interface SeedData {
  users?: any[];
  communities?: any[];
  messages?: any[];
  tips?: any[];
}

function loadJsonFile(filename: string): any {
  const filePath = path.join(__dirname, "assets", filename);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filename} not found in assets folder, skipping...`);
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
}

async function seedUsers(usersData: any[], User: any, logging: any): Promise<Map<string, any>> {
  logging.info(`Seeding ${usersData.length} users...`);
  
  const userMap = new Map<string, any>();
  
  for (const userData of usersData) {
    const user = await User.create(userData);
    userMap.set(userData.email, user);
    logging.info(`Created user: ${user.email}`);
  }
  
  return userMap;
}

async function seedCommunities(communitiesData: any[], userMap: Map<string, any>, Community: any, logging: any): Promise<Map<string, any>> {
  logging.info(`Seeding ${communitiesData.length} communities...`);
  
  const communityMap = new Map<string, any>();
  
  for (const communityData of communitiesData) {
    const processedData = { ...communityData };
    
    if (communityData.members && Array.isArray(communityData.members)) {
      processedData.members = communityData.members
        .map((email: string) => userMap.get(email)?._id)
        .filter((id: any) => id !== undefined);
    }
    
    const community = await Community.create(processedData);
    communityMap.set(communityData.name, community);
    logging.info(`Created community: ${community.name}`);
  }
  
  return communityMap;
}

async function seedMessages(messagesData: any[], userMap: Map<string, any>, Message: any, logging: any): Promise<Map<string, any>> {
  logging.info(`Seeding ${messagesData.length} messages...`);
  
  const messageMap = new Map<string, any>();
  
  for (const messageData of messagesData) {
    const processedData = { ...messageData };
    
    if (messageData.authorEmail) {
      const author = userMap.get(messageData.authorEmail);
      if (!author) {
        logging.warn(`Author ${messageData.authorEmail} not found, skipping message`);
        continue;
      }
      processedData.authorId = author._id;
      delete processedData.authorEmail;
    }
    
    if (messageData.likedBy && Array.isArray(messageData.likedBy)) {
      processedData.likedBy = messageData.likedBy
        .map((email: string) => userMap.get(email)?._id)
        .filter((id: any) => id !== undefined);
    }
    
    if (messageData.dislikedBy && Array.isArray(messageData.dislikedBy)) {
      processedData.dislikedBy = messageData.dislikedBy
        .map((email: string) => userMap.get(email)?._id)
        .filter((id: any) => id !== undefined);
    }
    
    const message = await Message.create(processedData);
    messageMap.set(messageData.id || message._id.toString(), message);
    logging.info(`Created message: ${message._id}`);
  }
  
  return messageMap;
}

async function seedTips(tipsData: any[], userMap: Map<string, any>, communityMap: Map<string, any>, messageMap: Map<string, any>, Tip: any, logging: any): Promise<void> {
  logging.info(`Seeding ${tipsData.length} tips...`);
  
  for (const tipData of tipsData) {
    const processedData = { ...tipData };
    
    if (tipData.communityName) {
      const community = communityMap.get(tipData.communityName);
      if (!community) {
        logging.warn(`Community ${tipData.communityName} not found, skipping tip`);
        continue;
      }
      processedData.communityId = community._id;
      delete processedData.communityName;
    }
    
    if (tipData.comments && Array.isArray(tipData.comments)) {
      processedData.comments = tipData.comments
        .map((commentId: string) => {
          const message = messageMap.get(commentId);
          return message ? message._id : null;
        })
        .filter((id: any) => id !== null);
    }
    
    if (tipData.likedBy && Array.isArray(tipData.likedBy)) {
      processedData.likedBy = tipData.likedBy
        .map((email: string) => userMap.get(email)?._id)
        .filter((id: any) => id !== undefined);
    }
    
    if (tipData.dislikedBy && Array.isArray(tipData.dislikedBy)) {
      processedData.dislikedBy = tipData.dislikedBy
        .map((email: string) => userMap.get(email)?._id)
        .filter((id: any) => id !== undefined);
    }
    
    await Tip.create(processedData);
    logging.info(`Created tip: ${tipData.title} (${tipData.type})`);
  }
}

async function seed() {
  const { initializeMongoDb } = await import("../database/connection");
  const { User, Message, Community, Tip } = await import("../database/models");
  const { logging } = await import("../logging");
  
  try {
    logging.info("Starting database seeding...");
    
    const requiredVars = [
      "MONGODB_USERNAME",
      "MONGODB_PASSWORD",
      "MONGODB_CLUSTER_NAME",
    ];
    
    const missing = requiredVars.filter((varName) => !process.env[varName]);
    
    if (missing.length > 0) {
      logging.error(`Missing required environment variables: ${missing.join(", ")}`);
      logging.error("Please set these variables in a .env.local or .env file");
      logging.error("Required variables:");
      logging.error("  - MONGODB_USERNAME");
      logging.error("  - MONGODB_PASSWORD");
      logging.error("  - MONGODB_CLUSTER_NAME");
      logging.error("Optional variables:");
      logging.error("  - MONGODB_CLUSTER_URL_ID (if your cluster URL includes an ID)");
      logging.error("  - MONGO_DATABASE_NAME (defaults to 'pasaeldato')");
      process.exit(1);
    }
    
    await initializeMongoDb({});
    
    logging.info("Resetting database...");
    
    await Message.deleteMany({});
    await Tip.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});
    
    logging.info("Database reset complete");
    
    const seedData: SeedData = {
      users: loadJsonFile("users.json"),
      communities: loadJsonFile("communities.json"),
      messages: loadJsonFile("messages.json"),
      tips: loadJsonFile("tips.json"),
    };
    
    if (!seedData.users || seedData.users.length === 0) {
      logging.error("No users data found. Please provide users.json");
      process.exit(1);
    }
    
    const userMap = await seedUsers(seedData.users, User, logging);
    
    let communityMap = new Map<string, any>();
    if (seedData.communities && seedData.communities.length > 0) {
      communityMap = await seedCommunities(seedData.communities, userMap, Community, logging);
    }
    
    let messageMap = new Map<string, any>();
    if (seedData.messages && seedData.messages.length > 0) {
      messageMap = await seedMessages(seedData.messages, userMap, Message, logging);
    }
    
    if (seedData.tips && seedData.tips.length > 0) {
      await seedTips(seedData.tips, userMap, communityMap, messageMap, Tip, logging);
    }
    
    logging.info("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    const { logging } = await import("../logging");
    logging.error(`Error seeding database: ${error}`);
    process.exit(1);
  }
}

seed();
