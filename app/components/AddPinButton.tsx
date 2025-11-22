import React from 'react';
import Image from 'next/image';

interface AddPinButtonProps {
  isCreatingPin: boolean;
  onClick: () => void;
}

const AddPinButton: React.FC<AddPinButtonProps> = ({ isCreatingPin, onClick }) => {
  return (
    <button
      className={`w-full font-semibold py-3 px-4 transition-all shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center ${
        isCreatingPin
          ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          : 'bg-white text-gray-900 hover:bg-gray-50'
      }`}
      onClick={onClick}
      style={{
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        borderBottom: '1px solid var(--foreground)',
        borderBottomLeftRadius: '50px',
        borderBottomRightRadius: '50px'
      }}
    >
      {isCreatingPin ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
          Cancel Pin Creation
        </>
      ) : (
        <>
          <Image
            src="/assets/pin_2.png"
            alt="Add Pin"
            width={24}
            height={24}
            className="mr-2"
          />
          Add New Pin
        </>
      )}
    </button>
  );
};

export default AddPinButton;