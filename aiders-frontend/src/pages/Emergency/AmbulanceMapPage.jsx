// src/pages/Emergency/AmbulanceMapPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapDisplay from '../../components/Emergency/MapDisplay';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import useEmergencyStore from '../../store/useEmergencyStore';
import { useAuthStore } from '../../store/useAuthStore';
import useLiveAmbulanceLocation from '../../hooks/useLiveAmbulanceLocation';
import { getMatchedHospital } from '../../api/api';
import useWebRtcStore from '../../store/useWebRtcStore';

export default function AmbulanceMapPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const ambulanceId = user?.userId;

  const { selectedAmbulance, matchedHospitals, completeTransport } = useEmergencyStore();
  const { setPipMode } = useWebRtcStore();

  const [directHospitalInfo, setDirectHospitalInfo] = useState(null);
  const [isLoadingDirectHospital, setIsLoadingDirectHospital] = useState(false);

  useEffect(() => {
    setPipMode(true);
    return () => setPipMode(false);
  }, [setPipMode]);

  const {
    ambulanceLocation,
    hospitalDistanceInfo,
  } = useLiveAmbulanceLocation(ambulanceId);

  const { matchedHospital: urlMatchedHospital } = location.state || {};

  const finalMatchedHospital = useMemo(() => {
    return urlMatchedHospital || directHospitalInfo || matchedHospitals[0] || null;
  }, [urlMatchedHospital, directHospitalInfo, matchedHospitals]);

  const fetchDirectHospitalInfo = useCallback(async () => {
    if (!ambulanceId) return;
    setIsLoadingDirectHospital(true);
    try {
        const matchedInfo = await getMatchedHospital(ambulanceId);
        if (matchedInfo && matchedInfo.latitude && matchedInfo.longitude) {
            setDirectHospitalInfo({
                id: matchedInfo.hospitalId || matchedInfo.id,
                hospitalId: matchedInfo.hospitalId || matchedInfo.id,
                name: matchedInfo.name || '매칭된 병원',
                address: matchedInfo.address || '',
                latitude: matchedInfo.latitude,
                longitude: matchedInfo.longitude,
            });
        }
    } catch (error) {
        console.error("❌ 병원 정보 직접 조회 실패:", error);
    } finally {
        setIsLoadingDirectHospital(false);
    }
  }, [ambulanceId]);

  useEffect(() => {
    if (!urlMatchedHospital) {
      fetchDirectHospitalInfo();
    }
  }, [urlMatchedHospital, fetchDirectHospitalInfo]);

  const safeHospital = useMemo(() => {
    const hospital = finalMatchedHospital || { name: '병원 정보 없음', address: '' };
    return {
        ...hospital,
        latitude: hospital.latitude || 37.566826,
        longitude: hospital.longitude || 126.9786567,
    };
  }, [finalMatchedHospital]);

  const handleCompleteTransport = useCallback(async () => {
    if (window.confirm("환자 인계가 완료되었습니까? 이송이 종료되고 대기 상태로 돌아갑니다.")) {
        await completeTransport(navigate);
    }
  }, [completeTransport, navigate]);

  if (isLoadingDirectHospital) {
      return (
          <AmbulanceLayout>
              <div className="flex items-center justify-center h-full">
                  <p>매칭된 병원 정보를 불러오는 중...</p>
              </div>
          </AmbulanceLayout>
      );
  }

  if (!finalMatchedHospital) {
    return (
        <AmbulanceLayout>
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">매칭된 병원 정보가 없습니다.</h2>
                    <p className="text-gray-600 mb-4">환자 정보 입력 페이지로 돌아가 병원 매칭을 다시 시도해주세요.</p>
                    <button
                        onClick={() => navigate('/emergency/patient-input')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                        정보 입력 페이지로 돌아가기
                    </button>
                </div>
            </div>
        </AmbulanceLayout>
    );
  }
  
  return (
    <AmbulanceLayout>
        <div className="relative h-screen flex bg-gray-100 overflow-hidden">
            <div className="flex-1 relative">
                <div className="h-full w-full">
                    <MapDisplay 
                        hospital={safeHospital}
                        ambulanceLocation={ambulanceLocation}
                        distanceInfo={hospitalDistanceInfo}
                        isFullScreen={true}
                    />
                </div>
            </div>
        </div>
    </AmbulanceLayout>
  );
}