import mongoose, { InferSchemaType } from "mongoose";

export const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  emailVerified: {
    type: Boolean,
    required: false,
  },
});

type UserDocument = mongoose.HydratedDocument<InferSchemaType<typeof UserSchema>>;


export const User = mongoose.models.User || mongoose.model("User", UserSchema);

