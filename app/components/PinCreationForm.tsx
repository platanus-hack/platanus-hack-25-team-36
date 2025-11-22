import React, { useState } from 'react';
import { MapPin, LocationModel, MapPinType } from '@/types/app';
import { uploadPictureToS3 } from '@/app/services/s3';

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
        tags: [],
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-gray-800 pointer-events-auto">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Pin</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-base font-semibold text-gray-900 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Enter pin title"
                maxLength={200}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-base font-semibold text-gray-900 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Describe this location..."
                rows={4}
                maxLength={5000}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-base font-semibold text-gray-900 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Enter the address"
                maxLength={500}
                required
              />
            </div>

            {/* Picture Upload */}
            <div>
              <label htmlFor="picture" className="block text-base font-semibold text-gray-900 mb-2">
                Picture (optional)
              </label>
              <input
                type="file"
                id="picture"
                accept="image/*"
                onChange={handlePictureChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-blue-700"
              />
              {pictureFile && (
                <p className="text-base text-gray-900 mt-2 font-medium">
                  Selected: {pictureFile.name} ({(pictureFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Color Picker */}
            <div>
              <label htmlFor="colour" className="block text-base font-semibold text-gray-900 mb-2">
                Pin Color
              </label>
              <input
                type="color"
                id="colour"
                value={formData.colour}
                onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                className="w-24 h-12 bg-white border-2 border-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Location Info */}
            <div className="bg-gray-100 border-2 border-gray-800 p-4 rounded-lg">
              <p className="text-base text-gray-900 font-medium mb-1">
                <strong className="font-bold">Location:</strong> {location.point.coordinates[1].toFixed(6)}, {location.point.coordinates[0].toFixed(6)}
              </p>
              <p className="text-base text-gray-900 font-medium">
                <strong className="font-bold">Radius:</strong> {location.radius}m
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 text-gray-900 text-base font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors border-2 border-gray-800"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-white text-base font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
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