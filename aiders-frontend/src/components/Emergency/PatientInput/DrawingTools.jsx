import React from 'react';

const DrawingTools = ({ drawingMode, setDrawingMode, onClear }) => {
  return (
    <div className="absolute top-1 right-1 flex flex-col space-y-1">
      <button
        type="button"
        onClick={() => setDrawingMode('pen')}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
          drawingMode === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        title="펜 모드"
      >
        <i className="fas fa-pen text-xs"></i>
      </button>
      <button
        type="button"
        onClick={() => setDrawingMode('eraser')}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
          drawingMode === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        title="지우개 모드"
      >
        <i className="fas fa-eraser text-xs"></i>
      </button>
      <button
        type="button"
        onClick={onClear}
        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
        title="전체 지우기"
      >
        <i className="fas fa-trash-alt text-xs"></i>
      </button>
    </div>
  );
};

export default DrawingTools;
