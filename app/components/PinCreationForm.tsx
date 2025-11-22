import React, { useState } from 'react';
import { MapPin, LocationModel, MapPinType, PinSubtype } from '@/types/app';
import { convertFileToBase64 } from '@/app/services/s3';
import { generateBackgroundImage } from '@/app/services/imageGeneration';
import { getAvailableCategories, getCategoryColor } from '@/app/utils/categoryColors';

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
    subtype: '' as PinSubtype | '',
    picture: '',
  });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona un archivo de imagen válido (PNG, JPEG, GIF o WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('El tamaño del archivo debe ser menor a 5MB');
        return;
      }
      
      setPictureFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.address.trim() || !formData.subtype) {
      alert('Por favor completa todos los campos requeridos (Título, Descripción, Dirección y Categoría)');
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique ID for this pin
      const uniqueId = `pin_${Date.now()}`;

      // Get the color based on the selected category
      const categoryColor = getCategoryColor(formData.subtype as PinSubtype);

      // Step 1: Generate AI background from description
      console.log('Generating AI background image...');
      const backgroundImage = await generateBackgroundImage(formData.description.trim());

      if (!backgroundImage.b64_json) {
        throw new Error('Error al generar imagen de fondo');
      }

      // Upload background to pins/background_image/
      const backgroundResponse = await fetch('/api/s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `pins/background_image/${uniqueId}.png`,
          imageBase64: `data:image/png;base64,${backgroundImage.b64_json}`,
        }),
      });

      if (!backgroundResponse.ok) {
        throw new Error('Error al subir imagen de fondo');
      }

      const backgroundResult = await backgroundResponse.json();
      const backgroundImageUrl = backgroundResult.s3Key;
      console.log('Background uploaded:', backgroundImageUrl);

      // Step 2: Upload user picture if provided
      let pictureUrl = '';
      if (pictureFile) {
        console.log('Uploading user picture...');
        const imageBase64 = await convertFileToBase64(pictureFile);

        const imageResponse = await fetch('/api/s3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: `pins/image/${uniqueId}.png`,
            imageBase64,
          }),
        });

        if (!imageResponse.ok) {
          throw new Error('Error al subir imagen del usuario');
        }

        const imageResult = await imageResponse.json();
        pictureUrl = imageResult.s3Key;
        console.log('User image uploaded:', pictureUrl);
      }

      const pinData: Omit<MapPin, 'id' | 'createdAt' | 'updatedAt'> = {
        authorId: 'current-user', // TODO: Get from auth context
        communityId: 'default-community', // TODO: Get from context or props
        type: MapPinType.PIN,
        subtype: formData.subtype as PinSubtype,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location,
        address: formData.address.trim(),
        picture: pictureUrl || undefined,
        background_image: backgroundImageUrl,
        colour: categoryColor,
        tags: [],
        contact: {},
        comments: [],
        likedBy: [],
        dislikedBy: [],
      };

      onSave(pinData);
    } catch (error) {
      console.error('Error creating pin:', error);
      alert(error instanceof Error ? error.message : 'Error al crear pin');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-gray-800 pointer-events-auto">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Crear Nuevo Pin</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-base font-semibold text-gray-900 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Título del pin"
                maxLength={200}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-base font-semibold text-gray-900 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Describe esta ubicación..."
                rows={4}
                maxLength={5000}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-base font-semibold text-gray-900 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Ingresa la dirección"
                maxLength={500}
                required
              />
            </div>

            {/* Category/Subtype */}
            <div>
              <label htmlFor="subtype" className="block text-base font-semibold text-gray-900 mb-2">
                Categoría *
              </label>
              <select
                id="subtype"
                value={formData.subtype}
                onChange={(e) => setFormData({ ...formData, subtype: e.target.value as PinSubtype | '' })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-800 text-gray-900 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona una categoría</option>
                {getAvailableCategories().map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Picture Upload */}
            <div>
              <label htmlFor="picture" className="block text-base font-semibold text-gray-900 mb-2">
                Imagen (opcional)
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
                  Seleccionada: {pictureFile.name} ({(pictureFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Location Info */}
            <div className="bg-gray-100 border-2 border-gray-800 p-4 rounded-lg">
              <p className="text-base text-gray-900 font-medium mb-1">
                <strong className="font-bold">Ubicación:</strong> {location.point.coordinates[1].toFixed(6)}, {location.point.coordinates[0].toFixed(6)}
              </p>
              <p className="text-base text-gray-900 font-medium">
                <strong className="font-bold">Radio:</strong> {location.radius}m
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
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-white text-base font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                {isUploading ? 'Creando...' : 'Crear Pin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PinCreationForm;