import React, { useState } from 'react';
import { generateBackgroundImage, generateProfileImage, generateAndUploadBackground, generateAndUploadProfile } from '@/app/services/imageGeneration';

/**
 * Example component demonstrating how to use the image generation service
 */
const ImageGeneratorExample: React.FC = () => {
  const [description, setDescription] = useState('');
  const [imageType, setImageType] = useState<'background' | 'profile'>('background');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedS3Key, setUploadedS3Key] = useState<string | null>(null);

  /**
   * Example 1: Generate image and display it
   */
  const handleGenerateImage = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = imageType === 'background'
        ? await generateBackgroundImage(description.trim())
        : await generateProfileImage(description.trim());

      if (result.b64_json) {
        // Display the generated image
        setGeneratedImage(`data:image/png;base64,${result.b64_json}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Example 2: Generate image and upload to S3
   */
  const handleGenerateAndUpload = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setUploadedS3Key(null);

    try {
      const s3Key = imageType === 'background'
        ? await generateAndUploadBackground(description.trim())
        : await generateAndUploadProfile(description.trim());

      setUploadedS3Key(s3Key);
      alert(`Image uploaded successfully to S3: ${s3Key}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate and upload image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        AI Image Generator (DALL-E 2)
      </h2>

      {/* Image Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Image Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="background"
              checked={imageType === 'background'}
              onChange={(e) => setImageType(e.target.value as 'background' | 'profile')}
              className="mr-2"
            />
            <span className="text-gray-900">Background (1024x1024)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="profile"
              checked={imageType === 'profile'}
              onChange={(e) => setImageType(e.target.value as 'background' | 'profile')}
              className="mr-2"
            />
            <span className="text-gray-900">Profile (256x256)</span>
          </label>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          Describe the image you want to generate
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={imageType === 'background'
            ? "A wide panoramic landscape with mountains and sunset..."
            : "A professional headshot of a developer with glasses..."}
          rows={4}
          disabled={isGenerating}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating || !description.trim()}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>

        <button
          onClick={handleGenerateAndUpload}
          disabled={isGenerating || !description.trim()}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate & Upload to S3'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Generated Image Display */}
      {generatedImage && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generated Image:</h3>
          <img
            src={generatedImage}
            alt="Generated by DALL-E 2"
            className="w-full rounded-lg border-2 border-gray-800 shadow-md"
          />
        </div>
      )}

      {/* S3 Upload Success */}
      {uploadedS3Key && (
        <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ Image uploaded to S3: <code className="bg-green-100 px-2 py-1 rounded">{uploadedS3Key}</code>
          </p>
        </div>
      )}

      {/* Usage Info */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Usage:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Background:</strong> Generates 1024x1024 panoramic images (DALL-E 2 max resolution)</li>
          <li>• <strong>Profile:</strong> Generates 256x256 portrait images (perfect for user profiles)</li>
          <li>• <strong>Generate Image:</strong> Creates an image and displays it</li>
          <li>• <strong>Generate & Upload to S3:</strong> Creates an image and uploads it to your S3 bucket</li>
          <li>• Powered by OpenAI's DALL-E 2 model</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageGeneratorExample;
