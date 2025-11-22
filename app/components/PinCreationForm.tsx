import React, { useState } from 'react';
import { MapPin, LocationModel, MapPinType } from '../../types/app';

interface PinCreationFormProps {
  location: LocationModel;
  onSave: (pinData: Omit<MapPin, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const PinCreationForm: React.FC<PinCreationFormProps> = ({ location, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    picture: '',
    colour: '#ef4444', // Default red color
  });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (PNG, JPEG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setPictureFile(file);
    }
  };

  const uploadPictureToS3 = async (file: File): Promise<string> => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.address.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    
    try {
      let pictureUrl = '';
      
      // Upload picture to S3 if provided
      if (pictureFile) {
        pictureUrl = await uploadPictureToS3(pictureFile);
      }

      const pinData: Omit<MapPin, 'id' | 'createdAt' | 'updatedAt'> = {
        authorId: 'current-user', // TODO: Get from auth context
        communityId: 'default-community', // TODO: Get from context or props
        type: MapPinType.PIN,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location,
        address: formData.address.trim(),
        picture: pictureUrl || undefined,
        colour: formData.colour,
        contact: {},
        comments: [],
        likedBy: [],
        dislikedBy: [],
      };

      onSave(pinData);
    } catch (error) {
      console.error('Error creating pin:', error);
      alert(error instanceof Error ? error.message : 'Failed to create pin');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Pin</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter pin title"
                maxLength={200}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe this location..."
                rows={3}
                maxLength={5000}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the address"
                maxLength={500}
                required
              />
            </div>

            {/* Picture Upload */}
            <div>
              <label htmlFor="picture" className="block text-sm font-medium text-gray-700 mb-1">
                Picture (optional)
              </label>
              <input
                type="file"
                id="picture"
                accept="image/*"
                onChange={handlePictureChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {pictureFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {pictureFile.name} ({(pictureFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Color Picker */}
            <div>
              <label htmlFor="colour" className="block text-sm font-medium text-gray-700 mb-1">
                Pin Color
              </label>
              <input
                type="color"
                id="colour"
                value={formData.colour}
                onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                className="w-20 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>

            {/* Location Info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Location:</strong> {location.point.coordinates[1].toFixed(6)}, {location.point.coordinates[0].toFixed(6)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Radius:</strong> {location.radius}m
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                disabled={isUploading}
              >
                {isUploading ? 'Creating...' : 'Create Pin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PinCreationForm;