import mongoose, { InferSchemaType } from "mongoose";
import { updateTimestampPreSave, deduplicateObjectIds } from "../utils/schema-helpers";

export const MessageSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

type MessageDocument = mongoose.HydratedDocument<InferSchemaType<typeof MessageSchema>>;

MessageSchema.index({ authorId: 1, createdAt: -1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ likedBy: 1 });
MessageSchema.index({ dislikedBy: 1 });

MessageSchema.pre("save", function (next) {
  updateTimestampPreSave.call(this);
  if (this.isModified("likedBy") || this.isNew) {
    this.likedBy = deduplicateObjectIds(this.likedBy);
  }
  if (this.isModified("dislikedBy") || this.isNew) {
    this.dislikedBy = deduplicateObjectIds(this.dislikedBy);
  }
  next();
});

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

