import mongoose, { InferSchemaType } from "mongoose";
import { LocationSchema } from "../schemas/location";
import { updateTimestampPreSave, deduplicateObjectIds, deduplicateStrings } from "../utils/schema-helpers";

interface Point {
  type: string;
  coordinates: [number, number];
}

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

type CommunityDocument = mongoose.HydratedDocument<InferSchemaType<typeof CommunitySchema>>;

interface CommunityStatics extends mongoose.Model<CommunityDocument> {
  findIntersectingWithLocation(
    point: Point
  ): Promise<CommunityDocument[]>;
}

CommunitySchema.index({ "location.point": "2dsphere" });
CommunitySchema.index({ name: "text", description: "text" });
CommunitySchema.index({ tags: 1 });
CommunitySchema.index({ createdAt: -1 });
CommunitySchema.index({ members: 1 });

CommunitySchema.pre("save", function (next) {
  updateTimestampPreSave.call(this);
  if (this.isModified("members") || this.isNew) {
    this.members = deduplicateObjectIds(this.members);
  }
  if (this.isModified("tags") || this.isNew) {
    this.tags = deduplicateStrings(this.tags);
  }
  next();
});

/**
 * Finds communities whose circles contain a given point.
 * A point is contained in a circle if the distance from the circle's center to the point
 * is less than or equal to the circle's radius.
 *
 * @param point - The point to check if it's contained within any community's circle
 * @returns Array of communities whose circles contain the given point
 */
const findIntersectingWithLocation = async function(
  this: mongoose.Model<CommunityDocument>,
  point: Point
): Promise<CommunityDocument[]> {
  const results = await this.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: point.coordinates,
        },
        distanceField: "distance",
        spherical: true,
      },
    },
    {
      $match: {
        $expr: {
          $lte: ["$distance", "$location.radius"],
        },
      },
    },
  ]);

  return results;
};

CommunitySchema.statics.findIntersectingWithLocation = findIntersectingWithLocation;

const Community = (mongoose.models.Community || mongoose.model("Community", CommunitySchema)) as CommunityStatics;

// Ensure static method is attached even if model was cached (for hot reloading)
if (!Community.findIntersectingWithLocation) {
  (Community as unknown as CommunityStatics).findIntersectingWithLocation = findIntersectingWithLocation;
}

export { Community };

