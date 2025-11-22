import mongoose, { InferSchemaType } from "mongoose";
import { LocationSchema } from "../schemas/location";
import { updateTimestampPreSave, deduplicateObjectIds, deduplicateStrings } from "../utils/schema-helpers";

export const TipBaseSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["pin", "text"],
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  background_image: {
    type: String,
    trim: true,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  }],
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
}, {
  discriminatorKey: "type",
});

TipBaseSchema.index({ communityId: 1, createdAt: -1 });
TipBaseSchema.index({ type: 1, createdAt: -1 });
TipBaseSchema.index({ createdAt: -1 });
TipBaseSchema.index({ tags: 1 });

TipBaseSchema.pre("save", function (next) {
  updateTimestampPreSave.call(this);
  if (this.isModified("comments") || this.isNew) {
    this.comments = deduplicateObjectIds(this.comments);
  }
  if (this.isModified("likedBy") || this.isNew) {
    this.likedBy = deduplicateObjectIds(this.likedBy);
  }
  if (this.isModified("dislikedBy") || this.isNew) {
    this.dislikedBy = deduplicateObjectIds(this.dislikedBy);
  }
  if (this.isModified("tags") || this.isNew) {
    this.tags = deduplicateStrings(this.tags);
  }
  next();
});

const TipPinSchema = new mongoose.Schema({
  location: {
    type: LocationSchema,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  picture: {
    type: String,
    trim: true,
  },
  colour: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
    min: 0,
  },
});

TipPinSchema.index({ "location.point": "2dsphere" });
TipPinSchema.index({ startDate: 1 });

const TipTextSchema = new mongoose.Schema({});

type TipBaseDocument = mongoose.HydratedDocument<InferSchemaType<typeof TipBaseSchema>>;
type TipPinDocument = mongoose.HydratedDocument<InferSchemaType<typeof TipPinSchema> & InferSchemaType<typeof TipBaseSchema>>;
type TipTextDocument = mongoose.HydratedDocument<InferSchemaType<typeof TipTextSchema> & InferSchemaType<typeof TipBaseSchema>>;

export const Tip = mongoose.models.Tip || mongoose.model("Tip", TipBaseSchema);
export const TipPin = Tip.discriminators?.pin || Tip.discriminator("pin", TipPinSchema);
export const TipText = Tip.discriminators?.text || Tip.discriminator("text", TipTextSchema);

