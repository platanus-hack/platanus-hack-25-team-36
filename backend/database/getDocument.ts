import { getMongoDbConnection } from "./connection";

async function getDocument<T>(
  identifier: string,
  collectionName: string,
): Promise<T> {
  const databaseConnection = await getMongoDbConnection();
  try {
    const document = await databaseConnection.db
      ?.collection(collectionName)
      .findOne({ identifier });
    
    if (!document) {
      throw new Error("Document not found");
    }

    return document as T;
  } catch {
    throw new Error("Failed to get document");
  }
};

export { getDocument }