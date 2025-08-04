import React from 'react';

const ConsciousnessLevelForm = ({ consciousnessLevel, handleInputChange }) => {
  const levels = ['Alert', 'Verbal', 'Pain', 'Unresponsive'];

  return (
    <div className="border-b pb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">의식 상태 (AVPU)</h3>
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => handleInputChange({ target: { name: 'consciousnessLevel', value: level } })}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
              consciousnessLevel === level
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConsciousnessLevelForm;