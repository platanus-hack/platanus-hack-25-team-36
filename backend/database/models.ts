import mongoose from "mongoose";

export const testSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
export const testModel = mongoose.model("TestSchema", testSchema, "test-schema");
