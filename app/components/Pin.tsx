import React from 'react';
import { Marker } from 'react-map-gl';
import { MapPin } from '../types/app';

interface PinProps {
  pin: MapPin;
  onClick?: (pin: MapPin) => void;
}

const Pin: React.FC<PinProps> = ({ pin, onClick }) => {
  const getIconColor = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'text-orange-600';
      case 'event':
        return 'text-purple-600';
      case 'service':
        return 'text-blue-600';
      case 'warning':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return "M3 12h18m-9-9v18m-6-6h12";
      case 'event':
        return "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z";
      case 'service':
        return "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z";
      case 'warning':
        return "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4m0 4h.01";
      default:
        return "M12 21.7c-3.1 0-6.1-2.3-6.1-6.1S8.9 4 12 4s6.1 2.9 6.1 6.1c0 3.8-3 6.1-6.1 6.1z";
    }
  };

  return (
    <Marker
      latitude={pin.location.point.coordinates[1]}
      longitude={pin.location.point.coordinates[0]}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(pin);
      }}
    >
      <div className={`${getIconColor(pin.type)} transition-transform duration-100 hover:scale-125 cursor-pointer shadow-md rounded-full`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={getIcon(pin.type)} />
          {pin.type === 'default' && <circle cx="12" cy="10" r="3" />}
        </svg>
      </div>
    </Marker>
  );
};

export default Pin;