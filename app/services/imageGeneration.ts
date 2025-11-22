/**
 * Image Generation Service - Handles AI image generation using OpenAI DALL-E 2
 * Provides two specialized endpoints:
 * - Background images: 1024x1024 (DALL-E 2 max resolution)
 * - Profile images: 256x256 (perfect for user profiles)
 */

export interface GeneratedImage {
  url?: string;
  b64_json?: string;
  size?: string;
  type?: string;
}

/**
 * Converts base64 image data to a File object
 * @param base64Data - Base64 encoded image string
 * @param filename - Desired filename for the image
 * @returns File object ready for upload
 */
export const base64ToFile = (base64Data: string, filename: string = 'generated-image.png'): File => {
  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');

  // Convert base64 to bytes
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });

  return new File([blob], filename, { type: 'image/png' });
};

/**
 * Generates a 1024x1024 background image from a description (DALL-E 2 max resolution)
 * Note: DALL-E 2 supports 256x256, 512x512, and 1024x1024 only
 * @param description - Text description of the background scene
 * @returns Generated background image data (1024x1024)
 * @throws Error if generation fails
 */
export const generateBackgroundImage = async (description: string): Promise<GeneratedImage> => {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required for background image generation');
  }

  try {
    const response = await fetch('/api/generate-background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: description.trim() }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate background image');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Background image generation error:', error);
    throw error instanceof Error ? error : new Error('Unknown error during background generation');
  }
};

/**
 * Generates a 256x256 profile image from a description (DALL-E 2 small size)
 * Perfect size for user profile pictures
 * @param description - Text description of the profile picture
 * @returns Generated profile image data (256x256)
 * @throws Error if generation fails
 */
export const generateProfileImage = async (description: string): Promise<GeneratedImage> => {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required for profile image generation');
  }

  try {
    const response = await fetch('/api/generate-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: description.trim() }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate profile image');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Profile image generation error:', error);
    throw error instanceof Error ? error : new Error('Unknown error during profile generation');
  }
};

/**
 * Generates a background image and uploads it to S3
 * @param description - Text description of the background scene
 * @returns S3 key of the uploaded background image
 * @throws Error if generation or upload fails
 */
export const generateAndUploadBackground = async (description: string): Promise<string> => {
  const { uploadPictureToS3 } = await import('./s3');

  const imageData = await generateBackgroundImage(description);

  if (!imageData.b64_json) {
    throw new Error('No image data received');
  }

  const imageFile = base64ToFile(imageData.b64_json, `background_${Date.now()}.png`);
  const s3Key = await uploadPictureToS3(imageFile);

  return s3Key;
};

/**
 * Generates a profile image and uploads it to S3
 * @param description - Text description of the profile picture
 * @returns S3 key of the uploaded profile image
 * @throws Error if generation or upload fails
 */
export const generateAndUploadProfile = async (description: string): Promise<string> => {
  const { uploadPictureToS3 } = await import('./s3');

  const imageData = await generateProfileImage(description);

  if (!imageData.b64_json) {
    throw new Error('No image data received');
  }

  const imageFile = base64ToFile(imageData.b64_json, `profile_${Date.now()}.png`);
  const s3Key = await uploadPictureToS3(imageFile);

  return s3Key;
};
