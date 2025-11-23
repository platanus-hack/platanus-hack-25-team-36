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
TipBaseSchema.index({ updatedAt: -1 });
TipBaseSchema.index({ tags: 1 });
TipBaseSchema.index({ communityId: 1, updatedAt: -1 });
TipBaseSchema.index({ communityId: 1, type: 1 });
TipBaseSchema.index({ likedBy: 1 });
TipBaseSchema.index({ dislikedBy: 1 });

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
  subtype: {
    type: String,
    enum: ["Service", "Business", "Event"],
    required: false,
    index: true,
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
TipPinSchema.index({ type: 1, subtype: 1 });
TipPinSchema.index({ communityId: 1, subtype: 1 });

const TipTextSchema = new mongoose.Schema({});

type TipBaseDocument = mongoose.HydratedDocument<InferSchemaType<typeof TipBaseSchema>>;
type TipPinDocument = mongoose.HydratedDocument<InferSchemaType<typeof TipPinSchema> & InferSchemaType<typeof TipBaseSchema>>;
type TipTextDocument = mongoose.HydratedDocument<InferSchemaType<typeof TipTextSchema> & InferSchemaType<typeof TipBaseSchema>>;

interface SearchTipsParams {
  searchQuery?: string;
  updatedAt?: Date;
  communityIds: mongoose.Types.ObjectId[];
}

interface SearchTipsResult {
  pins: TipPinDocument[];
  nonPins: TipTextDocument[];
}

interface TipStatics extends mongoose.Model<TipBaseDocument> {
  searchTips(params: SearchTipsParams): Promise<SearchTipsResult>;
}

const TipModel = (mongoose.models.Tip || mongoose.model("Tip", TipBaseSchema)) as TipStatics;

TipModel.searchTips = async function(params: SearchTipsParams): Promise<SearchTipsResult> {
  const { searchQuery, updatedAt, communityIds } = params;

  const matchFilters: mongoose.FilterQuery<TipBaseDocument> = {};
  
  if (updatedAt) {
    matchFilters.updatedAt = { $gte: updatedAt };
  }
  
  if (communityIds && communityIds.length > 0) {
    matchFilters.communityId = { $in: communityIds };
  }

  let results: TipBaseDocument[];

  if (searchQuery?.trim()) {
    const searchStage: mongoose.PipelineStage = {
      $search: {
        index: "tips_search_index",
        compound: {
          should: [
            {
              text: {
                query: searchQuery,
                path: "title",
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 2,
                  maxExpansions: 50,
                },
              },
            },
            {
              text: {
                query: searchQuery,
                path: "description",
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 2,
                  maxExpansions: 50,
                },
              },
            },
            {
              text: {
                query: searchQuery,
                path: "tags",
                fuzzy: {
                  maxEdits: 1,
                  prefixLength: 1,
                  maxExpansions: 100,
                },
              },
            },
            {
              text: {
                query: searchQuery,
                path: "address",
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 2,
                  maxExpansions: 50,
                },
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    };

    const pipeline: mongoose.PipelineStage[] = [searchStage];

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({
        $match: matchFilters,
      });
    }

    const aggregationResults = await this.aggregate(pipeline);
    const tipIds = aggregationResults.map((result) => result._id);
    results = await this.find({ _id: { $in: tipIds } }).exec();
  } else {
    results = await this.find(matchFilters).exec();
  }

  const pins: TipPinDocument[] = [];
  const nonPins: TipTextDocument[] = [];

  for (const tip of results) {
    if (tip.type === "pin") {
      pins.push(tip as TipPinDocument);
    } else {
      nonPins.push(tip);
    }
  }

  return { pins, nonPins };
};

export const Tip = TipModel;
export const TipPin = Tip.discriminators?.pin || Tip.discriminator("pin", TipPinSchema);
export const TipText = Tip.discriminators?.text || Tip.discriminator("text", TipTextSchema);

