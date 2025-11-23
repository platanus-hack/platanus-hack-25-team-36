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
  users?: any[]; // Note: This is now used for UserPreferences seeding
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

async function seedUserPreferences(userPreferencesData: any[], UserPreferences: any, logging: any): Promise<Map<string, any>> {
  logging.info(`Seeding ${userPreferencesData.length} user preferences...`);
  
  const userPreferencesMap = new Map<string, any>();
  const userPreferencesByIdMap = new Map<string, any>();
  
  for (const userPreferenceData of userPreferencesData) {
    // Check if data has the required fields for UserPreferences
    if (userPreferenceData.latitude === undefined || userPreferenceData.longitude === undefined) {
      // Skip old user data format (name/email) since OAuth handles users
      // UserPreferences requires latitude/longitude, so we'll skip entries without them
      logging.warn(`Skipping user preference entry (missing latitude/longitude): ${userPreferenceData.id || userPreferenceData.email || 'unknown'}`);
      continue;
    }
    
    const processedData = {
      latitude: userPreferenceData.latitude,
      longitude: userPreferenceData.longitude,
      interests: userPreferenceData.interests || [],
    };
    
    const userPreference = await UserPreferences.create(processedData);
    
    // Store by ID for tips lookup
    if (userPreferenceData.id) {
      userPreferencesByIdMap.set(userPreferenceData.id, userPreference);
    }
    
    // Store by email for messages lookup (backward compatibility)
    if (userPreferenceData.email) {
      userPreferencesMap.set(userPreferenceData.email, userPreference);
    }
    
    logging.info(`Created user preference: ${userPreferenceData.id || userPreference._id}`);
  }
  
  // Store both maps in the returned map for backward compatibility
  const combinedMap = userPreferencesMap as any;
  combinedMap.byId = userPreferencesByIdMap;
  
  return combinedMap;
}

async function seedCommunities(communitiesData: any[], userPreferencesMap: Map<string, any>, Community: any, logging: any): Promise<Map<string, any>> {
  logging.info(`Seeding ${communitiesData.length} communities...`);
  
  const communityMap = new Map<string, any>();
  
  for (const communityData of communitiesData) {
    const processedData = { ...communityData };
    
    // Note: Communities may reference users by ID now instead of email
    // This assumes the seed data uses IDs that match userPreferencesMap.byId
    if (communityData.members) {
      processedData.members = communityData.members.map((identifier: string) => {
        return (userPreferencesMap as any).byId?.get(identifier)?._id || userPreferencesMap.get(identifier)?._id;
      }).filter(Boolean);
    }
    
    const community = await Community.create(processedData);
    communityMap.set(communityData.name, community);
    logging.info(`Created community: ${community.name}`);
  }
  
  return communityMap;
}

async function seedMessages(messagesData: any[], userPreferencesMap: Map<string, any>, Message: any, logging: any): Promise<Map<string, any>> {
  logging.info(`Seeding ${messagesData.length} messages...`);
  
  const messageMap = new Map<string, any>();
  const mongoose = await import("mongoose");
  
  for (const messageData of messagesData) {
    let authorId: any = null;
    
    // Use authorId directly if provided (as MongoDB ObjectId string)
    if (messageData.authorId) {
      try {
        authorId = new mongoose.Types.ObjectId(messageData.authorId);
      } catch (error) {
        logging.warn(`Invalid authorId for message ${messageData.id || 'unknown'}: ${messageData.authorId}`);
      }
    } else if (messageData.authorEmail) {
      // Fallback to email lookup (for backward compatibility)
      const author = userPreferencesMap.get(messageData.authorEmail);
      if (author) {
        authorId = author._id;
      }
    }
    
    // Skip message if author not found
    if (!authorId) {
      logging.warn(`Author not found for message ${messageData.id || 'unknown'}, skipping...`);
      continue;
    }
    
    const processedData: any = {
      authorId: authorId,
      text: messageData.text,
      likes: 0,
      dislikes: 0,
    };
    
    processedData.likedBy = (messageData.likedBy || []).map((identifier: string) => {
      try {
        return new mongoose.Types.ObjectId(identifier);
      } catch {
        return (userPreferencesMap as any).byId?.get(identifier)?._id || userPreferencesMap.get(identifier)?._id;
      }
    }).filter(Boolean);
    
    processedData.dislikedBy = (messageData.dislikedBy || []).map((identifier: string) => {
      try {
        return new mongoose.Types.ObjectId(identifier);
      } catch {
        return (userPreferencesMap as any).byId?.get(identifier)?._id || userPreferencesMap.get(identifier)?._id;
      }
    }).filter(Boolean);
    
    const message = await Message.create(processedData);
    messageMap.set(messageData.id || message._id.toString(), message);
    logging.info(`Created message: ${message._id}`);
  }
  
  return messageMap;
}

async function seedTips(tipsData: any[], userPreferencesMap: Map<string, any>, communityMap: Map<string, any>, messageMap: Map<string, any>, Tip: any, logging: any): Promise<void> {
  logging.info(`Seeding ${tipsData.length} tips...`);
  
  for (const tipData of tipsData) {
    const author = (userPreferencesMap as any).byId?.get(tipData.authorId);
    const community = communityMap.get(tipData.communityId);
    
    if (!author) {
      logging.warn(`Author not found for tip ${tipData.title}, skipping...`);
      continue;
    }
    
    if (!community) {
      logging.warn(`Community not found for tip ${tipData.title}, skipping...`);
      continue;
    }
    
    const processedData: any = {
      authorId: author._id,
      communityId: community._id,
      type: tipData.type,
      title: tipData.title,
      description: tipData.description,
      tags: tipData.tags || [],
      background_image: tipData.background_image,
      comments: (tipData.comments || []).map((commentId: string) => messageMap.get(commentId)?._id).filter(Boolean),
      likedBy: (tipData.likedBy || []).map((identifier: string) => {
        return (userPreferencesMap as any).byId?.get(identifier)?._id || userPreferencesMap.get(identifier)?._id;
      }).filter(Boolean),
      dislikedBy: (tipData.dislikedBy || []).map((identifier: string) => {
        return (userPreferencesMap as any).byId?.get(identifier)?._id || userPreferencesMap.get(identifier)?._id;
      }).filter(Boolean),
    };
    
    if (tipData.type === 'pin') {
      processedData.location = tipData.location;
      processedData.address = tipData.address;
      if (tipData.subtype) processedData.subtype = tipData.subtype;
      if (tipData.picture) processedData.picture = tipData.picture;
      if (tipData.colour) processedData.colour = tipData.colour;
      if (tipData.startDate) processedData.startDate = new Date(tipData.startDate);
      if (tipData.duration !== undefined) processedData.duration = tipData.duration;
    }
    
    await Tip.create(processedData);
    logging.info(`Created tip: ${tipData.title} (${tipData.type})`);
  }
}

async function seed() {
  const { initializeMongoDb } = await import("../database/connection");
  const { UserPreferences, Message, Community, Tip } = await import("../database/models");
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
    await UserPreferences.deleteMany({});
    
    logging.info("Database reset complete");
    
    const seedData: SeedData = {
      users: loadJsonFile("users.json"),
      communities: loadJsonFile("communities.json"),
      messages: loadJsonFile("messages.json"),
      tips: loadJsonFile("tips.json"),
    };
    
    // Note: UserPreferences seeding is optional since OAuth handles user creation
    // The users.json file may contain old format (name/email) which will be skipped
    // Only entries with latitude/longitude will be seeded as UserPreferences
    const userPreferencesMap = await seedUserPreferences(seedData.users || [], UserPreferences, logging);
    if ((userPreferencesMap as any).byId?.size === 0) {
      logging.info("No valid UserPreferences entries found in users.json (requires latitude/longitude). Messages and tips that reference users will be skipped.");
    }
    
    let communityMap = new Map<string, any>();
    if (seedData.communities && seedData.communities.length > 0) {
      communityMap = await seedCommunities(seedData.communities, userPreferencesMap, Community, logging);
    }
    
    let messageMap = new Map<string, any>();
    if (seedData.messages && seedData.messages.length > 0) {
      messageMap = await seedMessages(seedData.messages, userPreferencesMap, Message, logging);
    }
    
    if (seedData.tips && seedData.tips.length > 0) {
      await seedTips(seedData.tips, userPreferencesMap, communityMap, messageMap, Tip, logging);
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

