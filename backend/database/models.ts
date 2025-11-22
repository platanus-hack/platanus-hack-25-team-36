import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  point: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },
  radius: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

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

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

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

MessageSchema.index({ authorId: 1, createdAt: -1 });
MessageSchema.index({ createdAt: -1 });

MessageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (this.isModified("likedBy") || this.isNew) {
    const uniqueIds = new Set<string>();
    this.likedBy = this.likedBy.filter((id: mongoose.Types.ObjectId) => {
      const idStr = id.toString();
      if (uniqueIds.has(idStr)) return false;
      uniqueIds.add(idStr);
      return true;
    });
  }
  if (this.isModified("dislikedBy") || this.isNew) {
    const uniqueIds = new Set<string>();
    this.dislikedBy = this.dislikedBy.filter((id: mongoose.Types.ObjectId) => {
      const idStr = id.toString();
      if (uniqueIds.has(idStr)) return false;
      uniqueIds.add(idStr);
      return true;
    });
  }
  next();
});

export const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  colour: {
    type: String,
    trim: true,
  },
  members: [{
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

CommunitySchema.index({ "location.point": "2dsphere" });
CommunitySchema.index({ name: "text", description: "text" });
CommunitySchema.index({ tags: 1 });
CommunitySchema.index({ createdAt: -1 });

CommunitySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (this.isModified("members") || this.isNew) {
    const uniqueIds = new Set<string>();
    this.members = this.members.filter((id: mongoose.Types.ObjectId) => {
      const idStr = id.toString();
      if (uniqueIds.has(idStr)) return false;
      uniqueIds.add(idStr);
      return true;
    });
  }
  if (this.isModified("tags") || this.isNew) {
    this.tags = [...new Set(this.tags.filter((tag: string) => tag.trim().length > 0))];
  }
  next();
});

const TipBaseSchema = new mongoose.Schema({
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
  this.updatedAt = new Date();
  if (this.isModified("comments") || this.isNew) {
    const uniqueIds = new Set<string>();
    this.comments = this.comments.filter((id: mongoose.Types.ObjectId) => {
      const idStr = id.toString();
      if (uniqueIds.has(idStr)) return false;
      uniqueIds.add(idStr);
      return true;
    });
  }
  if (this.isModified("likedBy") || this.isNew) {
    const uniqueIds = new Set<string>();
    this.likedBy = this.likedBy.filter((id: mongoose.Types.ObjectId) => {
      const idStr = id.toString();
      if (uniqueIds.has(idStr)) return false;
      uniqueIds.add(idStr);
      return true;
    });
  }
  if (this.isModified("dislikedBy") || this.isNew) {
    const uniqueIds = new Set<string>();
    this.dislikedBy = this.dislikedBy.filter((id: mongoose.Types.ObjectId) => {
      const idStr = id.toString();
      if (uniqueIds.has(idStr)) return false;
      uniqueIds.add(idStr);
      return true;
    });
  }
  if (this.isModified("tags") || this.isNew) {
    this.tags = [...new Set(this.tags.filter((tag: string) => tag.trim().length > 0))];
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

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const Community = mongoose.models.Community || mongoose.model("Community", CommunitySchema);
export const Tip = mongoose.models.Tip || mongoose.model("Tip", TipBaseSchema);
export const TipPin = Tip.discriminators?.pin || Tip.discriminator("pin", TipPinSchema);
export const TipText = Tip.discriminators?.text || Tip.discriminator("text", TipTextSchema);
