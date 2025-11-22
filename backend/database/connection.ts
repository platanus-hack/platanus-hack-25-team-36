import mongoose from "mongoose";
import {
  IS_CONTAINER,
  IS_LOCAL,
  MONGO_DATABASE_NAME,
  MONGODB_USERNAME,
  MONGODB_CLUSTER_URL_ID,
  MONGODB_PASSWORD,
  MONGODB_CLUSTER_NAME,
} from "../constants";
import { logging } from "../logging";

interface ConnectionOptions {
  retryWrites?: string;
  w?: string;
  [key: string]: string | undefined;
}

interface ConnectToDbParams {
  options?: ConnectionOptions;
}

let mongoConnection: mongoose.Connection;

/**
 * Establish a connection to the MongoDB database.
 *
 * @param databaseName - The name of the database
 * @param user - The MongoDB user
 * @param password - The user's password
 * @param options - Additional connection options
 */
async function initializeMongoDb ({
  options = { retryWrites: "true", w: "majority" },
}: ConnectToDbParams): Promise<void> {
  logging.info('Initializing MongoDB connection...');
  let host: string;

  const clusterId = MONGODB_CLUSTER_URL_ID || "";
  host = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_NAME}.${clusterId}.mongodb.net`;
  logging.info(`Connecting to MongoDB cluster at ${host}`);

  // Add options to the connection string
  if (options && Object.keys(options).length > 0) {
    const optionString = Object.entries(options)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    host += `/?${optionString}`;
  }

  try {
    // If already connected
    if (mongoose.connection.readyState === 1) {
      logging.info('MongoDB already connected');
      mongoConnection = mongoose.connection;
      return;
    }
    
    await mongoose.connect(host, {
      dbName: MONGO_DATABASE_NAME,
    });

    mongoConnection = mongoose.connection;
  } catch(error) {
    logging.info(`Failed to connect to MongoDB: ${error}`);
    throw new Error("Failed to connect to MongoDB");
  }
};

async function getMongoDbConnection() {
  if (!mongoConnection || mongoose.connection.readyState === 0) {
    await initializeMongoDb({});
  }
  return mongoConnection;
}

export { initializeMongoDb, getMongoDbConnection };
