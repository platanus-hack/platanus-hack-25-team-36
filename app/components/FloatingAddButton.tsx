import React from 'react';
import Image from 'next/image';

interface FloatingAddButtonProps {
  isCreatingPin: boolean;
  onClick: () => void;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ isCreatingPin, onClick }) => {
  return (
    <button
      className={`fixed bottom-6 right-6 z-10 w-16 h-16 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center ${
        isCreatingPin
          ? 'bg-gray-200 hover:bg-gray-300'
          : 'bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
      title={isCreatingPin ? 'Cancel pin creation' : 'Add new pin'}
    >
      {isCreatingPin ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-gray-900"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6L18 18" />
        </svg>
      ) : (
        <Image
          src="/assets/pin_2.png"
          alt="Add Pin"
          width={40}
          height={40}
        />
      )}
    </button>
  );
};

export default FloatingAddButton;