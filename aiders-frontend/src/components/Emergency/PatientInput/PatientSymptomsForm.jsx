import React from 'react';

const PatientSymptomsForm = ({ symptoms, handleSymptomChange }) => {
  const symptomOptions = [
    '호흡곤란', '흉통', '의식장애', '마비', '경련', '외상', '복통', '두통/어지럼증', '고열', '기타'
  ];

  return (
    <div className="border-b pb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">주요 증상 (다중 선택 가능)</h3>
      <div className="flex flex-wrap gap-3">
        {symptomOptions.map((symptom) => (
          <button
            key={symptom}
            type="button"
            onClick={() => handleSymptomChange(symptom)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
              symptoms.includes(symptom)
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            {symptom}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatientSymptomsForm;