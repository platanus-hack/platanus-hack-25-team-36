/**
 * S3 Service - Handles image uploads to AWS S3
 */

/**
 * Converts a File object to a base64 string
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image file to S3 and returns the S3 key
 * @param file - The image file to upload
 * @returns The S3 key (location/filename.ext)
 * @throws Error if upload fails
 */
export const uploadPictureToS3 = async (file: File): Promise<string> => {
  const base64 = await convertFileToBase64(file);
  const filename = `pin_${Date.now()}_${file.name}`;

  const response = await fetch('/api/s3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename,
      imageBase64: base64,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const result = await response.json();
  return result.s3Key; // Returns "location/filename.ext"
};
