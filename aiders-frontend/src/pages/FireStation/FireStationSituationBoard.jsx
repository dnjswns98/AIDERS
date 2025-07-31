import React, { useState, useEffect } from 'react';
import useEmergencyStore from '../../store/useEmergencyStore';
import useBedStore from '../../store/useBedStore';
import SituationMap from '../../components/FireStation/SituationMap';
import AmbulanceStatusList from '../../components/FireStation/AmbulanceStatusList';
import { useAppContext } from '../../hooks/useAppContext';
import { getStatusText } from '../../utils/statusUtils';

export default function FireStationSituationBoard() {
  const { getDispatchedAmbulances, getAvailableAmbulances } = useEmergencyStore();
  const { getHospitals } = useBedStore();
  const { ambulances } = useAppContext();

  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 36.145, lng: 128.39 }); // 구미시청 근처
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'dispatched', 'transporting', 'completed', 'standby', 'maintenance'

  useEffect(() => {
    setHospitals(getHospitals());

    const applyFilter = (allAmbulances) => {
      switch (filterStatus) {
        case 'dispatched':
          return allAmbulances.filter(a => a.status === 'dispatched');
        case 'transporting':
          return allAmbulances.filter(a => a.status === 'transporting');
        case 'completed':
          return allAmbulances.filter(a => a.status === 'completed');
        case 'standby':
          return allAmbulances.filter(a => a.status === 'standby');
        case 'maintenance':
          return allAmbulances.filter(a => a.status === 'maintenance');
        case 'all':
        default:
          return allAmbulances;
      }
    };

    const interval = setInterval(() => {
      setFilteredAmbulances(applyFilter(ambulances));
    }, 2000);
    
    setFilteredAmbulances(applyFilter(ambulances));

    return () => clearInterval(interval);
  }, [filterStatus, ambulances, getHospitals]);

  const handleSelectAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setMapCenter({ lat: ambulance.latitude, lng: ambulance.longitude });
  };

  return (
    <div className="flex h-full">
      <div className="w-1/4 bg-gray-50 shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 mb-4">구급차 현황 필터</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('dispatched')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'dispatched' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {getStatusText('dispatched')}
            </button>
            <button
              onClick={() => setFilterStatus('transporting')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'transporting' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {getStatusText('transporting')}
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {getStatusText('completed')}
            </button>
            <button
              onClick={() => setFilterStatus('standby')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'standby' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {getStatusText('standby')}
            </button>
            <button
              onClick={() => setFilterStatus('maintenance')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'maintenance' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {getStatusText('maintenance')}
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto max-h-[calc(100vh-200px)]">
          <AmbulanceStatusList
            ambulances={filteredAmbulances}
            onSelectAmbulance={handleSelectAmbulance}
            selectedAmbulanceId={selectedAmbulance?.id}
          />
        </div>
      </div>
      <div className="w-3/4 h-full">
        <SituationMap
          ambulances={filteredAmbulances}
          hospitals={hospitals}
          selectedAmbulance={selectedAmbulance}
          center={mapCenter}
        />
      </div>
    </div>
  );
}
