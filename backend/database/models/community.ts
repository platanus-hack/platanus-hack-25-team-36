import mongoose, { InferSchemaType } from "mongoose";
import { LocationSchema } from "../schemas/location";
import { updateTimestampPreSave, deduplicateObjectIds, deduplicateStrings } from "../utils/schema-helpers";

interface Location {
  point: {
    type: string;
    coordinates: [number, number];
  };
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
    location: Location,
    radius: number,
    maxDistance?: number
  ): Promise<CommunityDocument[]>;
}

CommunitySchema.index({ "location.point": "2dsphere" });
CommunitySchema.index({ name: "text", description: "text" });
CommunitySchema.index({ tags: 1 });
CommunitySchema.index({ createdAt: -1 });

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
 * Finds communities that intersect with a given location.
 * Two circles intersect if the distance between their centers is less than or equal to the sum of their radii.
 *
 * @param location - The location point to check intersection with
 * @param radius - The radius in meters of the location to check intersection with
 * @param maxDistance - Optional maximum distance in meters to search (defaults to query radius + 50000m to account for community radii)
 * @returns Array of communities that intersect with the given location
 */
CommunitySchema.statics.findIntersectingWithLocation = async function(
  location: Location,
  radius: number,
  maxDistance?: number
) {
  const queryRadius = radius;
  const searchRadius = maxDistance ?? queryRadius + 50000;

  const results = await this.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: location.point.coordinates,
        },
        distanceField: "distance",
        spherical: true,
        maxDistance: searchRadius,
      },
    },
    {
      $addFields: {
        totalRadius: { $add: [queryRadius, "$location.radius"] },
      },
    },
    {
      $match: {
        $expr: {
          $lte: ["$distance", "$totalRadius"],
        },
      },
    },
  ]);

  return results;
};

export const Community = (mongoose.models.Community || mongoose.model("Community", CommunitySchema)) as CommunityStatics;

