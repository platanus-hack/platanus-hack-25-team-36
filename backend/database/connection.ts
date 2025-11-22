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

  if (!IS_LOCAL) {
    const clusterId = MONGODB_CLUSTER_URL_ID || "";
    host = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_NAME}.${clusterId}.mongodb.net`;
  } else if (IS_CONTAINER) {
    host = "mongodb://local:local@mongo:27017";
  } else {
    host = "mongodb://local:local@localhost:27017";
  }

  // Add options to the connection string
  if (options && Object.keys(options).length > 0) {
    const optionString = Object.entries(options)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    host += `/?${optionString}`;
  }

  try {
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
  if (!mongoConnection) {
    await initializeMongoDb({});
  }
  return mongoConnection;
}

export { initializeMongoDb, getMongoDbConnection };
