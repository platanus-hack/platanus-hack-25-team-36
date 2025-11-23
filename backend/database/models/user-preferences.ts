import mongoose, { InferSchemaType } from "mongoose";
import { updateTimestampPreSave } from "../utils/schema-helpers";

export const UserPreferencesSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  interests: {
    type: [String],
    default: [],
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

type UserPreferencesDocument = mongoose.HydratedDocument<InferSchemaType<typeof UserPreferencesSchema>>;

UserPreferencesSchema.index({ createdAt: -1 });
UserPreferencesSchema.index({ interests: 1 });

UserPreferencesSchema.pre("save", updateTimestampPreSave);

export const UserPreferences = mongoose.models.UserPreferences || mongoose.model("UserPreferences", UserPreferencesSchema);

