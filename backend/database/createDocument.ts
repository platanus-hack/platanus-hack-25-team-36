import { logging } from "../logging";
import { getMongoDbConnection } from "./connection";
import { Document } from "mongodb";

async function createDocument<T extends Document>(document: T, collectionName: string): Promise<any> {
  const databaseConnection = await getMongoDbConnection();
  try {
    const result = await databaseConnection.db
      ?.collection(collectionName)
      .insertOne(document);

      logging.info(`Document create response: ${JSON.stringify(result) }`);

    return result;
  } catch {
    throw new Error("Failed to create document");
  }
};

export { createDocument };
