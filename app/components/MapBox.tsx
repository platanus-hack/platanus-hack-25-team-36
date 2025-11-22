import React, { useState, useMemo } from 'react';
import Map, { NavigationControl, GeolocateControl, ViewState } from 'react-map-gl';
// Mapbox CSS is required for styling controls and basic layout
import 'mapbox-gl/dist/mapbox-gl.css';
import Pin from './Pin';
import PinCreationForm from './PinCreationForm';
import AddPinButton from './AddPinButton';
import FloatingAddButton from './FloatingAddButton';
import { MapPin, LocationModel } from '../../types/app';

// The Mapbox token provided by the user
const MAPBOX_TOKEN: string = 'sk.eyJ1IjoidmljdG9ycGF0byIsImEiOiJjbWk5c3R1OWswcm12MnFweDlrbzczeG51In0.H7c4HwPZkhydNiTQ3idjgA';

// Initial coordinates for Santiago, Chile (Lng, Lat)
const SANTIAGO_CENTER: ViewState = {
  latitude: -33.4569,
  longitude: -70.6483,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

/**
 * Main application component that renders the Mapbox map and sidebar interface.
 */
const MapApp: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(SANTIAGO_CENTER);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [newPinLocation, setNewPinLocation] = useState<LocationModel | null>(null);
  
  // Simulated pins (will be replaced by API data of type MapPin[])
  const [pins, setPins] = useState<MapPin[]>([
    {
      id: '1',
      authorId: 'user1',
      location: { point: { type: 'Point', coordinates: [-70.6737, -33.4474] }, radius: 100 },
      street: 'Plaza de Armas',
      municipality: 'Santiago Centro',
      title: 'Plaza de Armas',
      description: 'Historic central square.',
      type: 'landmark',
      reviewIds: [],
      contact: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dynamicFields: {}
    },
    {
      id: '2',
      authorId: 'user2',
      location: { point: { type: 'Point', coordinates: [-70.5750, -33.4215] }, radius: 200 },
      street: 'Avenida Providencia',
      municipality: 'Providencia',
      title: 'Costanera Center',
      description: 'Tallest building in South America.',
      type: 'shopping',
      reviewIds: [],
      contact: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dynamicFields: {}
    },
    {
      id: '3',
      authorId: 'user3',
      location: { point: { type: 'Point', coordinates: [-70.7500, -33.4680] }, radius: 150 },
      street: 'Avenida Las Torres',
      municipality: 'Maipú',
      title: 'Ciudad Satélite',
      description: 'Residential area to the west.',
      type: 'residential',
      reviewIds: [],
      contact: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dynamicFields: {}
    },
  ]);

  const renderMarkers = useMemo(() => {
    return pins.map(pin => (
      <Pin
        key={pin.id}
        pin={pin}
        onClick={handlePinClick}
      />
    ));
  }, [pins]);

  // Handle map click to create new pin
  const handleMapClick = (event: any) => {
    // Only create pin if we're in creation mode and it's a direct map click (not on existing pins)
    if (isCreatingPin && event.originalEvent) {
      const { lng, lat } = event.lngLat;
      const location: LocationModel = {
        point: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        radius: 100
      };
      setNewPinLocation(location);
      console.log('Map clicked at:', lng, lat);
    }
  };

  // Handle pin creation
  const handleCreatePin = (pinData: Omit<MapPin, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPin: MapPin = {
      ...pinData,
      id: `pin_${Date.now()}`, // Generate temporary ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setPins(prevPins => [...prevPins, newPin]);
    setIsCreatingPin(false);
    setNewPinLocation(null);
    
    console.log('New pin created:', newPin);
    // TODO: Send to backend API
  };

  // Handle pin creation cancellation
  const handleCancelPinCreation = () => {
    setIsCreatingPin(false);
    setNewPinLocation(null);
  };

  // Placeholder for modal/detail logic
  const handlePinClick = (pin: MapPin) => {
    // In a real React app, you would set a state like setSelectedPin(pin) 
    // and display a detailed sidebar or modal using the Pin data.
    console.log('Pin clicked:', pin.title);
    alert(`Pin Details: ${pin.title}\n\nDescription: ${pin.description}\nType: ${pin.type}\nAddress: ${pin.address}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 font-sans antialiased flex flex-col items-center">
      <header className="w-full max-w-7xl text-center py-4">
        <h1 className="text-4xl font-extrabold text-blue-800">Dynamic Pin Map App</h1>
        <p className="text-lg text-gray-500 mt-1">Santiago, Chile: Pin, Forum, and Chat Interface</p>
      </header>

      {/* Main Content Area: Map and Sidebar/Controls */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 flex-grow h-[80vh]">
        
        {/* Map Container (3/4 width on large screens) */}
        <div className="lg:w-3/4 flex-grow rounded-xl shadow-2xl overflow-hidden h-full">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={handleMapClick}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            cursor={isCreatingPin ? 'crosshair' : 'auto'}
          >
            {/* Map Controls */}
            <GeolocateControl position="top-left" positionOptions={{ enableHighAccuracy: true }} trackUserLocation={true} showUserHeading={true} />
            <NavigationControl position="top-left" />

            {/* Render Pins */}
            {renderMarkers}
          </Map>
        </div>

        {/* Sidebar/Control Panel (1/4 width on large screens) */}
        <div className="lg:w-1/4 bg-white p-6 rounded-xl shadow-lg flex flex-col space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">Interaction Hub</h2>
          
          {/* Pin Creation Mode Indicator */}
          {isCreatingPin && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-blue-700 mb-2">📍 Pin Creation Mode</h3>
              <p className="text-sm text-blue-600">Click anywhere on the map to place a new pin!</p>
            </div>
          )}
          
          <AddPinButton
            isCreatingPin={isCreatingPin}
            onClick={() => {
              if (isCreatingPin) {
                handleCancelPinCreation();
              } else {
                setIsCreatingPin(true);
                console.log('Pin creation mode activated - click on the map to place a pin');
              }
            }}
          />
          
          <div className="flex flex-col space-y-4 pt-4">
              {/* Placeholder for Forums */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Community Forum</h3>
                  <p className="text-sm text-gray-500">Discussion threads associated with the current map area or selected pin.</p>
              </div>
              
              {/* Placeholder for Chat */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-500">Real-time chat for nearby users (requires authentication setup).</p>
              </div>
          </div>
        </div>

      </div>

      {/* Floating Add Pin Button */}
      <FloatingAddButton
        isCreatingPin={isCreatingPin}
        onClick={() => {
          if (isCreatingPin) {
            handleCancelPinCreation();
          } else {
            setIsCreatingPin(true);
            console.log('Pin creation mode activated - click on the map to place a pin');
          }
        }}
      />

      {/* Pin Creation Form Modal */}
      {isCreatingPin && newPinLocation && (
        <PinCreationForm
          location={newPinLocation}
          onSave={handleCreatePin}
          onCancel={handleCancelPinCreation}
        />
      )}
    </div>
  );
}

export default MapApp;