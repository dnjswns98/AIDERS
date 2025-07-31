import React from 'react';

const InputModeToggle = ({ inputMode, toggleInputMode }) => {
  return (
    <div className="absolute top-0 right-4 z-10">
      <button
        type="button"
        onClick={toggleInputMode}
        className="flex items-center px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
        title={inputMode === 'drawing' ? '타이핑 모드로 전환' : '필기 모드로 전환'}
      >
        {inputMode === 'drawing' ? (
          <>
            <i className="fas fa-pen mr-2"></i>
            <span>필기</span>
          </>
        ) : (
          <>
            <i className="fas fa-keyboard mr-2"></i>
            <span>타이핑</span>
          </>
        )}
      </button>
    </div>
  );
};

export default InputModeToggle;
