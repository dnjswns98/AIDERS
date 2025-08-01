import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import MapDisplay from '../../components/Emergency/MapDisplay';
import HospitalCard from '../../components/Emergency/HospitalCard';
import { searchHospitals } from '../../api/emergencyApi';

export default function AmbulanceHospitalSearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState({
    department: '',
    ktasLevel: '',
    // Add other search parameters as needed, e.g., location, availableBeds
  });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchHospitals(searchQuery);
      setHospitals(data);
    } catch (err) {
      setError('병원 검색 중 오류가 발생했습니다.');
      console.error('Failed to search hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AmbulanceLayout>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">병원 검색</h1>
        
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">진료 과목</label>
              <input
                type="text"
                id="department"
                name="department"
                value={searchQuery.department}
                onChange={handleSearchInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                placeholder="예: 내과, 외과"
              />
            </div>
            <div>
              <label htmlFor="ktasLevel" className="block text-sm font-medium text-gray-700">KTAS 레벨</label>
              <input
                type="text"
                id="ktasLevel"
                name="ktasLevel"
                value={searchQuery.ktasLevel}
                onChange={handleSearchInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                placeholder="예: 1, 2, 3"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            {loading ? '검색 중...' : '병원 검색'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Hospital List */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800">검색 결과</h2>
            {hospitals.length > 0 ? (
              <div className="space-y-4">
                {hospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            ) : (
              !loading && <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
            )}
          </div>

          {/* Right Column - Map Display */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800">지도</h2>
            <div className="bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px] flex-grow">
              {hospitals.length > 0 ? (
                <MapDisplay hospitals={hospitals} /> // Assuming MapDisplay can handle multiple hospitals
              ) : (
                <p className="text-center text-gray-500">지도를 표시할 병원이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AmbulanceLayout>
  );
}