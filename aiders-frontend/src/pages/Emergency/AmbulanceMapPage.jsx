// src/pages/Emergency/AmbulanceMapPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapDisplay from '../../components/Emergency/MapDisplay';
import WebRtcCall from '../../components/webRTC/WebRtcCall';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import useEmergencyStore from '../../store/useEmergencyStore';
import { useAuthStore } from '../../store/useAuthStore';
import useLiveAmbulanceLocation from '../../hooks/useLiveAmbulanceLocation';
import { getMatchedHospital } from '../../api/api';

export default function AmbulanceMapPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const ambulanceId = user?.userId;
  const ambulanceNumber = user?.userKey;

  // 🔥 수정: 필요한 상태와 함수를 개별적으로 선택하여 가져옵니다.
  const selectedAmbulance = useEmergencyStore(state => state.selectedAmbulance);
  const matchedHospitals = useEmergencyStore(state => state.matchedHospitals);
  const completeTransport = useEmergencyStore(state => state.completeTransport);

  const [isCalling, setIsCalling] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [directHospitalInfo, setDirectHospitalInfo] = useState(null);
  const [isLoadingDirectHospital, setIsLoadingDirectHospital] = useState(false);

  const {
    ambulanceLocation,
    hospitalDistanceInfo,
  } = useLiveAmbulanceLocation(ambulanceId);

  const { matchedHospital: urlMatchedHospital, patientInfo: urlPatientInfo } = location.state || {};

  const finalMatchedHospital = useMemo(() => {
    return urlMatchedHospital || directHospitalInfo || matchedHospitals[0] || null;
  }, [urlMatchedHospital, directHospitalInfo, matchedHospitals]);

  const finalPatientInfo = useMemo(() => {
    return selectedAmbulance?.patientInfo || urlPatientInfo || {};
  }, [selectedAmbulance?.patientInfo, urlPatientInfo]);

  const finalPatientDetails = useMemo(() => {
    return selectedAmbulance?.patientDetails || {};
  }, [selectedAmbulance?.patientDetails]);

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

  const handleEndCall = useCallback(() => setIsCalling(false), []);
  const handleModifyPatientInfo = useCallback(() => navigate('/emergency/patient-input', { state: { isEditMode: true } }), [navigate]);
  
  const handleCompleteTransport = useCallback(async () => {
    if (window.confirm("환자 인계가 완료되었습니까? 이송이 종료되고 대기 상태로 돌아갑니다.")) {
        try {
            await completeTransport();
            navigate('/emergency/waiting', { replace: true });
        } catch (error) {
            console.error('이송 완료 실패:', error);
            alert('이송 완료 처리 중 오류가 발생했습니다.');
        }
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
            <div className={`flex-1 relative transition-all duration-300 ${sidebarCollapsed ? 'mr-0' : 'mr-96'}`}>
                <div className="h-full w-full">
                    <MapDisplay 
                        hospital={safeHospital}
                        ambulanceLocation={ambulanceLocation}
                        distanceInfo={hospitalDistanceInfo}
                        isFullScreen={true}
                    />
                </div>
            </div>

            <div className={`fixed top-0 right-0 h-full bg-white shadow-xl border-l border-gray-200 w-96 transition-transform duration-300 z-20 ${sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-bold">실시간 정보</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">👤 환자 정보</h3>
                            <div className="text-sm space-y-1 p-2 bg-gray-50 rounded">
                                <p><strong>이름:</strong> {finalPatientInfo.name || "-"}</p>
                                <p><strong>KTAS:</strong> {finalPatientDetails.ktasLevel || "-"}</p>
                                <p><strong>진료과:</strong> {finalPatientDetails.department || "-"}</p>
                            </div>
                            <button onClick={handleModifyPatientInfo} className="text-xs text-blue-600 mt-1">수정</button>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-2">📞 화상 통화</h3>
                            <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                                {isCalling ? (
                                    <WebRtcCall
                                        sessionId={ambulanceId.toString()}
                                        ambulanceNumber={ambulanceNumber}
                                        onLeave={handleEndCall}
                                        patientName={finalPatientInfo.name || ""}
                                        ktas={finalPatientDetails.ktasLevel || ""}
                                        hospitalId={safeHospital.id || safeHospital.hospitalId}
                                    />
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-600">통화가 종료되었습니다.</p>
                                        <button onClick={() => setIsCalling(true)} className="mt-2 text-blue-600">다시 연결</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t">
                        <button
                            onClick={handleCompleteTransport}
                            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700"
                        >
                            🏥 이송 완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AmbulanceLayout>
  );
}