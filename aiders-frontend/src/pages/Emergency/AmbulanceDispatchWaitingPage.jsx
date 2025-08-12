// src/pages/Emergency/AmbulanceDispatchWaitingPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import useEmergencyStore from '../../store/useEmergencyStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function AmbulanceDispatchWaitingPage() {
  const navigate = useNavigate();
  // 🔥 selectMyAmbulance 함수를 스토어에서 가져옵니다.
  const { selectedAmbulance, transferToHospital, completeTransport, resetHospitalMatching, selectMyAmbulance } = useEmergencyStore();
  const { logout } = useAuthStore();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const ambulanceStatus = selectedAmbulance?.status?.toLowerCase();
  
  // 🔥 --- 신규 추가된 로직 --- 🔥
  // 이 페이지에 머무는 동안 3초마다 구급차의 최신 상태를 서버에 요청합니다.
  useEffect(() => {
    console.log("[AmbulanceDispatchWaitingPage] 상태 폴링을 시작합니다.");

    // 3초 간격으로 selectMyAmbulance 함수를 실행
    const pollingInterval = setInterval(() => {
        console.log("[Polling] 서버에 최신 구급차 상태를 요청합니다...");
        selectMyAmbulance(); 
    }, 3000); // 3000ms = 3초

    // 이 페이지를 벗어나면(컴포넌트가 언마운트되면) 폴링을 중지합니다.
    // 이렇게 해야 불필요한 요청을 막고 메모리 누수를 방지할 수 있습니다.
    return () => {
        console.log("[AmbulanceDispatchWaitingPage] 상태 폴링을 중지합니다.");
        clearInterval(pollingInterval);
    };
  }, [selectMyAmbulance]); // selectMyAmbulance 함수가 변경될 때만 이 effect를 재실행합니다.
  // 🔥 --- 로직 추가 끝 --- 🔥


  const handlePatientTransfer = async () => {
    if (window.confirm("환자 탑승이 완료되었습니까? 이송 중 상태로 변경됩니다.")) {
      await transferToHospital();
      navigate('/emergency/patient-input', { state: { isEditMode: false } });
    }
  };
  
  const handleCompleteTransport = async () => {
    if (window.confirm("환자 인계가 완료되었습니까? 이송이 종료됩니다.")) {
      await completeTransport();
      await resetHospitalMatching();
    }
  };

  const handleCancelDispatch = async () => {
    try {
      await completeTransport();
      await resetHospitalMatching();
      
      setTimeout(() => {
        navigate('/emergency');
      }, 2000);
      
    } catch (error) {
      console.error('배차 취소 오류:', error);
      alert('배차 취소 중 오류가 발생했습니다.');
    }
  };
  
  const handleLogout = async () => {
      await logout();
      navigate('/');
  };

  const renderCancelDialog = () => {
    if (!showCancelDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl max-w-sm mx-4 animate-fadeInUp">
          <h3 className="font-bold text-lg mb-4 text-center">배차 취소</h3>
          <p className="text-gray-600 text-center mb-6">
            정말 배차 요청을 취소하시겠습니까?<br/>
            취소 후에는 다시 처음부터 요청해야 합니다.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCancelDialog(false)}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              계속 기다리기
            </button>
            <button
              onClick={handleCancelDispatch}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              취소하기
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <AmbulanceLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto p-6 min-h-screen">
          <div className="text-center mb-8">
            {ambulanceStatus === 'dispatched' && (
              <div className="animate-pulse text-6xl">🚨</div>
            )}
            {ambulanceStatus === 'transfer' && (
              <div className="text-6xl">🏥</div>
            )}
            {(ambulanceStatus === 'wait' || ambulanceStatus === 'standby') && (
              <div className="text-6xl animate-pulse">⏳</div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">
              {ambulanceStatus === 'dispatched' && '출동 중'}
              {ambulanceStatus === 'transfer' && '이송 중'}
              {(ambulanceStatus === 'wait' || ambulanceStatus === 'standby') && '배차 대기 중'}
              {ambulanceStatus === 'completed' && '이송 완료'}
              {!ambulanceStatus && '상태를 불러오는 중...'}
            </h1>
            
            <p className="text-gray-600">
              {ambulanceStatus === 'dispatched' && '환자에게 이동 중입니다.'}
              {ambulanceStatus === 'transfer' && '환자를 태우고 병원으로 이동 중입니다.'}
              {(ambulanceStatus === 'wait' || ambulanceStatus === 'standby') && '소방서의 출동 지시를 기다리고 있습니다.'}
              {ambulanceStatus === 'completed' && '임무가 완료되었습니다. 대시보드로 돌아갑니다.'}
            </p>
          </div>
          
          {ambulanceStatus === 'dispatched' && (
            <div className="text-center">
              <button
                onClick={handlePatientTransfer}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                환자 탑승 완료 (이송 시작)
              </button>
            </div>
          )}
          
          {ambulanceStatus === 'transfer' && (
            <div className="text-center">
              <button
                onClick={handleCompleteTransport}
                className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                이송 완료 (대기 상태로 복귀)
              </button>
            </div>
          )}
          
          {(ambulanceStatus === 'dispatched' || ambulanceStatus === 'transfer') && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                긴급 상황 종료 (강제 복귀)
              </button>
            </div>
          )}
          
          {(ambulanceStatus === 'wait' || ambulanceStatus === 'standby') && (
            <div className="text-center mt-8">
                <button
                    onClick={handleLogout}
                    className="px-6 py-3 border-2 border-gray-500 text-gray-500 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                    로그아웃
                </button>
            </div>
          )}

        </div>
        
        {renderCancelDialog()}
      </div>
    </AmbulanceLayout>
  );
}