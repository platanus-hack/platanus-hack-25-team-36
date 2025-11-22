import mongoose, { InferSchemaType } from "mongoose";
import { updateTimestampPreSave } from "../utils/schema-helpers";

export const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
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

type UserDocument = mongoose.HydratedDocument<InferSchemaType<typeof UserSchema>>;

UserSchema.pre("save", updateTimestampPreSave);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

