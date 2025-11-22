"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type Marker = {
  title: string;
  description: string;
  longitude: number;
  latitude: number;
  color: string;
};

type Props = {
  markers: Marker[];
  onChangeBounds?: (newBounds: mapboxgl.LngLatBounds) => void;
};

const Map = ({ markers, onChangeBounds }: Props) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<{lng: number, lat: number} | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-70.6009, -33.4173],
      zoom: 12,
    });

    map.on("load", () => {
      map.on("moveend", () => {
        if (onChangeBounds) {
          const bounds = map.getBounds();
          if (bounds) {
            onChangeBounds(bounds);
          }
        }
      });
    });

    mapRef.current = map;

    // Add click handler for pin creation
    map.on('click', (e) => {
      if (isCreatingPin) {
        setClickedLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        setShowForm(true);
        console.log('Map clicked at:', e.lngLat.lng, e.lngLat.lat);
      }
    });

    // Change cursor when in creation mode
    map.on('mouseenter', () => {
      if (isCreatingPin) {
        map.getCanvas().style.cursor = 'crosshair';
      }
    });

    map.on('mouseleave', () => {
      map.getCanvas().style.cursor = '';
    });

    markers.forEach((marker) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<strong>${marker.title}</strong><p>${marker.description}</p>`
      );

      new mapboxgl.Marker({
        color: marker.color,
      })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
    );

    // Test marker to verify marker functionality works
    map.on('load', () => {
      console.log('Map loaded, adding test marker...');
      const testMarker = new mapboxgl.Marker({ color: '#00ff00' })
        .setLngLat([-70.6009, -33.4173])
        .setPopup(new mapboxgl.Popup().setHTML('<div><strong>Test Marker</strong><p>This marker tests if markers work</p></div>'))
        .addTo(map);
      console.log('Test marker added successfully');
    });

    return () => map.remove();
  }, [markers, onChangeBounds, isCreatingPin]);

  const handleCreatePin = async (formData: {
    title: string;
    description: string;
    address: string;
    picture?: File;
  }) => {
    if (!clickedLocation) return;

    console.log('Creating pin with data:', formData);
    console.log('Location:', clickedLocation);

    try {
      // Upload picture ONLY if provided and has content
      let pictureUrl = '';
      if (formData.picture && formData.picture.size > 0) {
        console.log('Uploading picture:', formData.picture.name, formData.picture.size);
        
        const base64 = await convertFileToBase64(formData.picture);
        const filename = `pin_${Date.now()}_${formData.picture.name}`;
        
        const response = await fetch('/api/s3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, imageBase64: base64 }),
        });

        if (response.ok) {
          const result = await response.json();
          pictureUrl = result.s3Key;
          console.log('Picture uploaded successfully:', pictureUrl);
        } else {
          const error = await response.json();
          console.error('Picture upload failed:', error);
          alert('Picture upload failed, but pin will be created without image');
        }
      } else {
        console.log('No picture provided, creating pin without image');
      }

      // Create new marker on the map
      console.log('Adding marker to map at:', clickedLocation.lng, clickedLocation.lat);
      console.log('Map reference exists:', !!mapRef.current);
      console.log('Map loaded:', mapRef.current?.loaded());
      
      if (!mapRef.current) {
        console.error('Map reference is null!');
        alert('Map not ready, please try again');
        return;
      }

      const popupHTML = `<div>
        <strong>${formData.title}</strong>
        ${formData.description ? `<p>${formData.description}</p>` : ''}
        <p><small>📍 ${formData.address}</small></p>
        ${pictureUrl ? `<p><small>📷 Image uploaded</small></p>` : ''}
      </div>`;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

      console.log('Creating marker with popup HTML...');
      console.log('Popup HTML content:', popupHTML);
      
      try {
        // First try a simple marker without popup to test
        console.log('Creating simple test marker first...');
        const simpleMarker = new mapboxgl.Marker({ color: '#ff0000' })
          .setLngLat([clickedLocation.lng, clickedLocation.lat])
          .addTo(mapRef.current);
        console.log('Simple marker added successfully');
        
        // Now try the full marker with popup
        console.log('Step 1: Creating marker object...');
        const marker = new mapboxgl.Marker({ 
          color: '#ef4444' // Red color for new pins
        });
        
        console.log('Step 2: Setting marker position...');
        marker.setLngLat([clickedLocation.lng, clickedLocation.lat]);
        
        console.log('Step 3: Setting popup...');
        marker.setPopup(popup);
        
        console.log('Step 4: Adding marker to map...');
        console.log('Map instance:', mapRef.current);
        
        const addedMarker = marker.addTo(mapRef.current);
        
        console.log('Step 5: Marker added successfully');
        console.log('Added marker:', addedMarker);
        console.log('Marker LngLat:', addedMarker.getLngLat());
        console.log('Current map zoom:', mapRef.current.getZoom());
        console.log('Current map center:', mapRef.current.getCenter());
        
        // Small delay before panning to ensure marker is rendered
        setTimeout(() => {
          console.log('Step 6: Panning to marker...');
          mapRef.current!.flyTo({
            center: [clickedLocation.lng, clickedLocation.lat],
            zoom: Math.max(mapRef.current!.getZoom(), 16),
            duration: 1500
          });
        }, 100);
        
        console.log('Map will pan to new marker location');
        
      } catch (markerError) {
        console.error('Error creating/adding marker:', markerError);
        console.error('Error details:', markerError);
        const errorMessage = markerError instanceof Error ? markerError.message : 'Unknown error';
        alert('Failed to add marker to map: ' + errorMessage);
        return;
      }
      // Save pin to MongoDB
      console.log('Saving pin to MongoDB...');
      const pinData = {
        type: 'pin',
        authorId: '6921d07f466304c0cc484380', // TODO: Get from auth context
        communityId: '6921d07f466304c0cc484380', // TODO: Get from context or props  
        title: formData.title,
        description: formData.description || '',
        location: {
          point: {
            type: 'Point',
            coordinates: [clickedLocation.lng, clickedLocation.lat]
          },
          radius: 100
        },
        address: formData.address,
        picture: pictureUrl || undefined,
        colour: '#ef4444',
        comments: [],
        likedBy: [],
        dislikedBy: []
      };

      try {
        const response = await fetch('/api/tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pinData),
        });

        if (response.ok) {
          const savedPin = await response.json();
          console.log('Pin saved to MongoDB:', savedPin);
          
          // Show success message
          alert('Pin created and saved successfully!');
        } else {
          const error = await response.json();
          console.error('Failed to save pin to MongoDB:', error);
          alert('Pin created on map but failed to save to database');
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        alert('Pin created on map but database error occurred');
      }

      console.log('Pin created successfully:', { 
        ...formData, 
        location: clickedLocation, 
        picture: pictureUrl || 'none' 
      });
      
      // Reset states
      setShowForm(false);
      setClickedLocation(null);
      setIsCreatingPin(false);
      
    } catch (error) {
      console.error('Error creating pin:', error);
      alert(`Failed to create pin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="relative w-150 h-150">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Floating Add Pin Button */}
      <button
        className={`absolute bottom-4 right-4 z-10 w-14 h-14 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 ${
          isCreatingPin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white flex items-center justify-center`}
        onClick={() => {
          if (isCreatingPin) {
            setIsCreatingPin(false);
            setShowForm(false);
            setClickedLocation(null);
          } else {
            setIsCreatingPin(true);
            console.log('Pin creation mode activated - click on the map to place a pin');
          }
        }}
        title={isCreatingPin ? 'Cancel pin creation' : 'Add new pin'}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isCreatingPin ? (
            <path d="M18 6L6 18M6 6L18 18" />
          ) : (
            <path d="M12 5v14m-7-7h14" />
          )}
        </svg>
      </button>

      {/* Pin Creation Mode Indicator */}
      {isCreatingPin && !showForm && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          📍 Click on the map to place a pin
        </div>
      )}

      {/* Simple Pin Creation Form Modal */}
      {showForm && clickedLocation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Pin</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Form submission started');
              
              const formData = new FormData(e.currentTarget);
              const title = formData.get('title') as string;
              const description = formData.get('description') as string;
              const address = formData.get('address') as string;
              const pictureFile = formData.get('picture') as File;
              
              console.log('Form data extracted:');
              console.log('- Title:', title);
              console.log('- Description:', description);
              console.log('- Address:', address);
              console.log('- Picture file:', pictureFile ? pictureFile.name : 'none');
              console.log('- Picture size:', pictureFile ? pictureFile.size : 0);
              console.log('- Clicked location:', clickedLocation);
              
              // Validate required fields
              if (!title || !address) {
                alert('Please fill in all required fields (Title and Address)');
                return;
              }
              
              if (!clickedLocation) {
                alert('No location selected. Please try clicking on the map again.');
                return;
              }
              
              handleCreatePin({
                title: title.trim(),
                description: description?.trim() || '',
                address: address.trim(),
                picture: pictureFile && pictureFile.size > 0 ? pictureFile : undefined,
              });
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input name="title" required className="w-full p-2 border rounded" placeholder="Pin title" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea name="description" className="w-full p-2 border rounded" rows={3} placeholder="Describe this location..." />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Address *</label>
                <input name="address" required className="w-full p-2 border rounded" placeholder="Enter address" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Picture (optional)</label>
                <input name="picture" type="file" accept="image/*" className="w-full p-2 border rounded" />
              </div>
              <div className="mb-4 text-sm text-gray-600">
                Location: {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => { setShowForm(false); setIsCreatingPin(false); }} 
                  className="flex-1 px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Create Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
