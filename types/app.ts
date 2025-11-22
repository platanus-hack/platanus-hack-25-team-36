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
  email: string;
  avatarUrl: string;
  joinedAt: string;
  // Relationships from the diagram
  currentPinId?: string; // Corresponds to MiPin: Pin (reference to MapPin.id)
  communityIds: string[]; // Corresponds to Communities: Community[] (references to Community.id)
}


// --- 5. Map Pin Data ---

/**
 * Represents a single dynamic pin placed on the map by a user (Point of Interest).
 * (Corresponds to the 'Pin' entity in the diagram)
 */
export interface MapPin {
  id: string; // Unique ID for the pin
  authorId: string; // Corresponds to Author: User (reference to User.id)
  
  // Location Details
  location: LocationModel; // Embedded Location information
  street: string; // Corresponds to Calle: String
  municipality: string; // Corresponds to Comuna: comuna
  
  // Pin Attributes
  title: string;
  description: string; // Corresponds to Description: User (assuming this was meant to be a string)
  type: string; // Corresponds to Tipo: String (e.g., 'Event', 'Resource')
  
  // Media & Interaction
  imageBase64?: string; // Corresponds to Image: Base64 (Warning: large Base64 strings can slow down document retrieval)
  reviewIds: string[]; // NEW: References to ReviewModel.id documents
  
  // Dynamic Contact Info
  contact: ContactInfo; // Embedded contact block
  
  // Relationships & Metadata
  communityId?: string; // Corresponds to Community: NN (reference to Community.id)
  
  // Standard fields
  createdAt: string;
  updatedAt: string;
  
  // Suggestion for Dynamic Fields from the diagram
  dynamicFields: Record<string, any>; 
}