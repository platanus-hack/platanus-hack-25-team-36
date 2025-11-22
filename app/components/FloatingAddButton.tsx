import React from 'react';

interface FloatingAddButtonProps {
  isCreatingPin: boolean;
  onClick: () => void;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ isCreatingPin, onClick }) => {
  return (
    <button
      className={`fixed bottom-6 right-6 z-10 w-16 h-16 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 ${
        isCreatingPin
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-green-500 hover:bg-green-600'
      } text-white flex items-center justify-center`}
      onClick={onClick}
      title={isCreatingPin ? 'Cancel pin creation' : 'Add new pin'}
      style={{
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        borderBottom: '1px solid var(--foreground)',
        borderBottomLeftRadius: '50px',
        borderBottomRightRadius: '50px'
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8"
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
          <path d="M12 5v14m-7-7h14" />
        )}
      </svg>
    </button>
  );
};

export default FloatingAddButton;