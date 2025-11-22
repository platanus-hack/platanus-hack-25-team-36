import React from 'react';

interface AddPinButtonProps {
  isCreatingPin: boolean;
  onClick: () => void;
}

const AddPinButton: React.FC<AddPinButtonProps> = ({ isCreatingPin, onClick }) => {
  return (
    <button 
      className={`w-full font-semibold py-3 px-4 transition-colors shadow-md transform hover:scale-[1.02] active:scale-[0.98] ${
        isCreatingPin 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-green-500 text-white hover:bg-green-600'
      }`}
      onClick={onClick}
      style={{
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        borderBottom: '1px solid var(--foreground)',
        borderBottomLeftRadius: '50px',
        borderBottomRightRadius: '50px'
      }}
    >
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
        {isCreatingPin ? (
          <path d="M18 6L6 18M6 6L18 18" />
        ) : (
          <>
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 21.7c-3.1 0-6.1-2.3-6.1-6.1S8.9 4 12 4s6.1 2.9 6.1 6.1c0 3.8-3 6.1-6.1 6.1z"/>
          </>
        )}
      </svg>
      {isCreatingPin ? 'Cancel Pin Creation' : 'Add New Pin'}
    </button>
  );
};

export default AddPinButton;