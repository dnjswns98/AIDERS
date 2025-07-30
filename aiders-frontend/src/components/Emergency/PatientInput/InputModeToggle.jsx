import React from 'react';

const InputModeToggle = ({ inputMode, toggleInputMode }) => {
  return (
    <div className="absolute top-4 right-4">
      <button
        type="button"
        onClick={toggleInputMode}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
        title={inputMode === 'drawing' ? '타이핑 모드로 전환' : '필기 모드로 전환'}
      >
        {inputMode === 'drawing' ? (
          <i className="fas fa-pen text-lg"></i>
        ) : (
          <i className="fas fa-keyboard text-lg"></i>
        )}
      </button>
    </div>
  );
};

export default InputModeToggle;
