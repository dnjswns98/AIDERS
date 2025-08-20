import React, { useState, useEffect, forwardRef } from 'react'; // forwardRef import
import DrawingCanvas from './DrawingCanvas';

const PatientDetailInput = forwardRef(( // forwardRef로 래핑
  {
    label,
    name,
    value,
    onChange,
    inputMode,
    isTextArea = false,
  }, ref) => { // ref를 두 번째 인자로 받음
  const [drawingMode, setDrawingMode] = useState('pen');

  useEffect(() => {
    if (inputMode === 'drawing') {
      setDrawingMode('pen');
    }
  }, [inputMode]);

  return (
    <div ref={ref}> {/* ref를 div에 할당 */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {inputMode === 'typing' ? (
        isTextArea ? (
          <textarea
            id={name}
            name={name}
            rows="3"
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        ) : (
          <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        )
      ) : (
        <DrawingCanvas 
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
          value={value}
          onChange={onChange}
          name={name}
        />
      )}
    </div>
  );
}); // forwardRef 닫기

export default PatientDetailInput;