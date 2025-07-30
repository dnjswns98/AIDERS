import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AmbulancePatientInputPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patientInfo, setPatientInfo] = useState({
    symptoms: '',
    severity: '경증',
    age: '',
    gender: '남',
  });

  useEffect(() => {
    if (location.state && location.state.patientInfoForEdit) {
      setPatientInfo(location.state.patientInfoForEdit);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제로는 여기서 환자 정보를 기반으로 병원 매칭 API 호출
    // 여기서는 가상의 병원 매칭 로직을 구현합니다.
    const mockHospitals = [
      { id: 1, name: '서울대학교병원', address: '서울 종로구 대학로 101', lat: 37.5795, lng: 126.9943, distance: '2.5km' },
      { id: 2, name: '세브란스병원', address: '서울 서대문구 연세로 50', lat: 37.5620, lng: 126.9373, distance: '5.1km' },
      { id: 3, name: '아주대학교병원', address: '경기 수원시 영통구 월드컵로 164', lat: 37.2822, lng: 127.0489, distance: '30.0km' },
    ];

    // 환자 정보에 따라 가상의 병원 매칭 (예시: 중증이면 서울대병원, 아니면 세브란스)
    let matched = null;
    if (patientInfo.severity === '중증') {
      matched = mockHospitals[0]; // 서울대학교병원
    } else {
      matched = mockHospitals[1]; // 세브란스병원
    }

    navigate('/emergency/map', { state: { matchedHospital: matched, patientInfo: patientInfo } });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">환자 정보 입력</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="symptoms" className="block text-gray-700 text-sm font-bold mb-2">주요 증상:</label>
          <input
            type="text"
            id="symptoms"
            name="symptoms"
            value={patientInfo.symptoms}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="severity" className="block text-gray-700 text-sm font-bold mb-2">중증도:</label>
          <select
            id="severity"
            name="severity"
            value={patientInfo.severity}
            onChange={handleInputChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="경증">경증</option>
            <option value="중등증">중등증</option>
            <option value="중증">중증</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 text-sm font-bold mb-2">나이:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={patientInfo.age}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">성별:</label>
          <select
            id="gender"
            name="gender"
            value={patientInfo.gender}
            onChange={handleInputChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="남">남</option>
            <option value="여">여</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            병원 매칭
          </button>
        </div>
      </form>
    </div>
  );
}
