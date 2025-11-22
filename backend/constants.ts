export const IS_LOCAL = process.env.NODE_ENV === "development";
export const IS_CONTAINER = process.env.RUNNING_IN_CONTAINER === "true";
export const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME || "pasaeldato";
export const MONGODB_USERNAME = process.env.MONGODB_USERNAME || "";
export const MONGODB_CLUSTER_URL_ID = process.env.MONGODB_CLUSTER_URL_ID || "";
export const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || "";
export const MONGODB_CLUSTER_NAME = process.env.MONGODB_CLUSTER_NAME || "pasa-el-dato";