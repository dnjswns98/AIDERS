import React from 'react';

const VitalSignsForm = ({ vitalSigns, handleInputChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b pb-6">
      <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2">활력 징후</h3>
      <div>
        <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">혈압 (mmHg)</label>
        <input type="text" name="bloodPressure" id="bloodPressure" value={vitalSigns.bloodPressure} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="예: 120/80" />
      </div>
      <div>
        <label htmlFor="pulseRate" className="block text-sm font-medium text-gray-700">맥박 (회/분)</label>
        <input type="number" name="pulseRate" id="pulseRate" value={vitalSigns.pulseRate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="예: 70" />
      </div>
      <div>
        <label htmlFor="respirationRate" className="block text-sm font-medium text-gray-700">호흡 (회/분)</label>
        <input type="number" name="respirationRate" id="respirationRate" value={vitalSigns.respirationRate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="예: 18" />
      </div>
      <div>
        <label htmlFor="bodyTemperature" className="block text-sm font-medium text-gray-700">체온 (°C)</label>
        <input type="number" step="0.1" name="bodyTemperature" id="bodyTemperature" value={vitalSigns.bodyTemperature} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="예: 36.5" />
      </div>
    </div>
  );
};

export default VitalSignsForm;