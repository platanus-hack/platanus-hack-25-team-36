/**
 * Pins Service - Handles pin operations with MongoDB
 */

import { MapPin, MapPinType, PinSubtype } from '@/types/app';

export interface PinFormData {
  title: string;
  description: string;
  address: string;
  subtype?: PinSubtype;
  communityId?: string;
  colour: string;
  picture?: string;
  background_image?: string;
  icon?: string;
}

export interface PinLocation {
  lng: number;
  lat: number;
  radius: number;
}

/**
 * Generates a valid MongoDB ObjectId
 * This is a temporary placeholder until we implement proper authentication
 */
function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomHex = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + randomHex;
}

/**
 * Saves a new pin to the MongoDB database
 * @param formData - The pin form data (title, description, etc.)
 * @param location - The pin location (lng, lat, radius)
 * @returns The created pin data from the server
 * @throws Error if save fails
 */
export const savePinToDatabase = async (
  formData: PinFormData,
  location: PinLocation
): Promise<MapPin> => {
  const pinData = {
    type: MapPinType.PIN,
    title: formData.title,
    description: formData.description || 'No description provided',
    address: formData.address,
    subtype: formData.subtype,
    location: {
      point: {
        type: 'Point' as const,
        coordinates: [location.lng, location.lat],
      },
      radius: location.radius,
    },
    colour: formData.colour,
    picture: formData.picture || '',
    background_image: formData.background_image || '',
    icon: formData.icon || '',
    contact: {},
    comments: [],
    likedBy: [],
    dislikedBy: [],
    // Use provided communityId or generate as fallback
    // TODO: Replace with actual user ID from auth
    authorId: generateObjectId(),
    communityId: formData.communityId || generateObjectId(),
  };

  const response = await fetch('/api/tips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pinData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save pin to database');
  }

  const result = await response.json();
  return result.data;
};
