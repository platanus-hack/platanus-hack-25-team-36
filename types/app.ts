/**
 * =========================================
 * CORE APPLICATION TYPES (Based on MongoDB Diagram)
 * =========================================
 * Note: Relationships (like 'authorId') are modeled as strings (references to other document IDs).
 */

// --- 1. Utility Types ---

/**
 * Standard API response structure for consistency.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * GeoJSON Point structure required by MongoDB for 2dsphere indexing.
 * The order MUST be [longitude, latitude].
 */
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Represents the geographic location and its influence radius from the diagram.
 * (Corresponds to 'Location' entity in the diagram)
 */
export interface LocationModel {
  // NEW: This is the GeoJSON structure MongoDB will index for efficient spatial queries
  point: GeoJSONPoint; 
  radius: number; // Corresponds to Radio: int (e.g., in meters)
}

/**
 * Contact information associated with a Pin.
 * (Corresponds to 'Contact' sub-document in the Pin entity)
 */
export interface ContactInfo {
  phone?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}


// --- 2. Social & Communication Data ---

/**
 * Represents a chat message, forum comment, or reply in the system.
 * (Corresponds to the 'Mensaje' entity in the diagram)
 * Note: This model is recursive as 'Respuestas' links back to itself.
 */
export interface MessageModel {
  id: string; // Unique message ID
  authorId: string; // Corresponds to Autor: User (reference to User.id)
  text: string; // Content of the message
  likes: number; // Corresponds to Likes: int
  dislikes: number; // Corresponds to Dislikes: int
  // These fields enable threading, which are excluded in ReviewModel
  replyIds?: string[]; // Corresponds to Respuestas: Mensaje[] (references to MessageModel.id)
  parentMessageId?: string; // Optional ID if this message is a reply to another MessageModel
  createdAt: string;
}

/**
 * Represents a review/rating tied to a Pin.
 * (Based on MessageModel, but specifically designed for non-threaded feedback with up/downvotes)
 */
export interface ReviewModel {
  id: string; // Unique review ID
  authorId: string; // ID of the user who wrote the review
  pinId: string; // ID of the pin being reviewed
  text: string; // The content of the review
  // Scoring/Voting mechanism
  likes: number; // Corresponds to Likes: int (upvotes)
  dislikes: number; // Corresponds to Dislikes: int (downvotes)
  createdAt: string;
}


// --- 3. Community Data ---

/**
 * Represents a group or community, often centered around a geographic area or interest.
 * (Corresponds to 'Community' entity in the diagram)
 */
export interface Community {
  id: string;
  locationId: string; // Reference to a LocationModel for the center of the community area
  memberIds: string[]; // Corresponds to users: User[] (references to User.id)
  pinIds: string[]; // Corresponds to interestPoints: Pins[] (references to MapPin.id)
  title: string;
  tags: string[];
  description: string;
  createdAt: string;
}


// --- 4. User Data ---

/**
 * Represents a user in the system.
 * (Corresponds to the 'User' entity in the diagram)
 */
export interface User {
  id: string; // Unique user ID (e.g., Firebase UID)
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
  // Relationships from the diagram
  currentPinId?: string; // Corresponds to MiPin: Pin (reference to MapPin.id)
  communityIds: string[]; // Corresponds to Communities: Community[] (references to Community.id)
  interests: string[]; // Corresponds to Interests: string[]
}


// --- 5. Map Pin Data ---

export enum MapPinType {
  PIN = 'pin', // New type for user-created pins
  SHOPPING = 'shopping',
  LANDMARK = 'landmark',
  RESIDENTIAL = 'residential',
}
/**
 * Represents a single dynamic pin placed on the map by a user (Point of Interest).
 * Aligned with TipPinSchema MongoDB model.
 */
export interface MapPin {
  id: string; // Unique ID for the pin
  authorId: string; // Author: User (reference to User.id)
  communityId: string; // Community: Community (reference to Community.id) - required
  
  // Pin Attributes
  type: MapPinType; // Discriminator type for TipPin
  title: string;
  description: string; // Main content for MVP (replaces contact and dynamic fields)
  tags: string[]; // Tags for categorization and search

  // Location Details
  location: LocationModel; // Embedded Location information
  address: string; // Single address field (replaces street + municipality)
  street?: string; // Optional street name
  municipality?: string; // Optional municipality name
  reviewIds?: string[]; // References to ReviewModel.id documents
  
  // Media & Visual
  picture?: string; // User-uploaded image URL (S3 key)
  background_image?: string; // AI-generated background image URL (S3 key)
  colour?: string; // Pin color
  
  // Event fields (optional)
  startDate?: string; // ISO date string for event start
  duration?: number; // Duration in milliseconds
  contact: ContactInfo; // Embedded contact information
  dynamicFields?: Record<string, any>; // Flexible dynamic fields for future use
  
  // User Interactions (aligned with MongoDB arrays)
  comments: string[]; // References to Message.id documents
  likedBy: string[]; // References to User.id who liked this pin
  dislikedBy: string[]; // References to User.id who disliked this pin
  
  // Standard fields
  createdAt: string;
  updatedAt: string;
}