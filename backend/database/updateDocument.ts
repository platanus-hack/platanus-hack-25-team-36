import { logging } from "../logging";
import { getMongoDbConnection } from "./connection";
import { Document } from "mongodb";

async function updateDocument<T extends Document>(
  collectionName: string,
  identifier: string,
  filter: Partial<T> | Record<string, unknown>,
  document: T,
  upsert: boolean = false,
): Promise<T> {
  const databaseConnection = await getMongoDbConnection();
  try {
    logging.info(`Updating document with upsert: ${upsert} and filter: ${JSON.stringify(filter)}`);
    const result = await databaseConnection.db
      ?.collection(collectionName)
      .updateOne({ identifier, ...filter}, { $set: document }, { upsert });

    logging.info(`Update document response: ${JSON.stringify(result)}`);
      
    if (!result || result.matchedCount === 0) {
      throw new Error("No document found to update");
    }

    const updatedDocument = await databaseConnection.db
      ?.collection(collectionName)
      .findOne({ identifier });

    logging.info(`Retrieved updated document: ${JSON.stringify(updatedDocument)}`);

    if (!updatedDocument) {
      throw new Error("Failed to retrieve updated document");
    }

    return updatedDocument as unknown as T;
  } catch {
    throw new Error("Failed to update document");
  }
};

export { updateDocument };
