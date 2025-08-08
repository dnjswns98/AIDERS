// src/pages/Emergency/AmbulanceDispatchWaitingPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AmbulanceLayout from '../../components/Emergency/Layout/AmbulanceLayout';
import useEmergencyStore from '../../store/useEmergencyStore';
import { useAuthStore } from '../../store/useAuthStore';

// 배차 상태 타입 정의
const DISPATCH_STATUS = {
  REQUESTING: 'requesting',     // 배차 요청 중
  SEARCHING: 'searching',       // 구급차 검색 중
  FOUND: 'found',              // 구급차 발견
  ASSIGNED: 'assigned',        // 배차 완료
  DISPATCHED: 'dispatched',    // 출동 중
  CANCELLED: 'cancelled'       // 취소됨
};

// 상태별 메시지와 색상 정의
const STATUS_CONFIG = {
  [DISPATCH_STATUS.REQUESTING]: {
    title: '배차 요청 중',
    message: '병원 매칭 결과를 바탕으로 구급차 배차를 요청하고 있습니다.',
    color: 'blue',
    icon: '📋'
  },
  [DISPATCH_STATUS.SEARCHING]: {
    title: '구급차 검색 중',
    message: '최적의 구급차를 찾고 있습니다.',
    color: 'yellow',
    icon: '🔍'
  },
  [DISPATCH_STATUS.FOUND]: {
    title: '구급차 발견',
    message: '적합한 구급차를 찾았습니다. 배차 승인을 기다리고 있습니다.',
    color: 'green',
    icon: '🚑'
  },
  [DISPATCH_STATUS.ASSIGNED]: {
    title: '배차 완료',
    message: '구급차가 배정되었습니다. 현재 위치로 출동 중입니다.',
    color: 'green',
    icon: '✅'
  },
  [DISPATCH_STATUS.DISPATCHED]: {
    title: '출동 중',
    message: '구급차가 현재 위치로 이동 중입니다.',
    color: 'blue',
    icon: '🏃‍♂️'
  }
};

export default function AmbulanceDispatchWaitingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuthStore();
  const { selectedAmbulance, dispatchRequest, cancelDispatch } = useEmergencyStore();

  // 상태 관리
  const [dispatchStatus, setDispatchStatus] = useState(DISPATCH_STATUS.REQUESTING);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [assignedAmbulance, setAssignedAmbulance] = useState(null);
  const [waitingTime, setWaitingTime] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // 타이머 관련
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // 페이지 진입 시 전달받은 폼 데이터
  const formData = state?.formData || {};

  useEffect(() => {
    // 대기 시간 카운터 시작
    intervalRef.current = setInterval(() => {
      setWaitingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // 배차 프로세스 시작
    startDispatchProcess();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 배차 프로세스 시뮬레이션 (실제로는 서버 통신)
  const startDispatchProcess = async () => {
    try {
      // 1단계: 배차 요청 (2초)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDispatchStatus(DISPATCH_STATUS.SEARCHING);
      
      // 2단계: 구급차 검색 (3-5초)
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      setDispatchStatus(DISPATCH_STATUS.FOUND);
      
      // 3단계: 구급차 발견 후 배정 대기 (1-2초)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // 임시 구급차 정보 생성
      const mockAmbulance = {
        id: 'AMB-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        vehicleNumber: '서울응급' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'),
        driver: {
          name: '김구급',
          experience: '7년차',
          rating: 4.8
        },
        currentLocation: '서울시 강남구',
        estimatedArrival: 8 + Math.floor(Math.random() * 7) // 8-15분
      };
      
      setAssignedAmbulance(mockAmbulance);
      setEstimatedTime(mockAmbulance.estimatedArrival);
      setDispatchStatus(DISPATCH_STATUS.ASSIGNED);
      
      // 4단계: 출동 시작 (2초 후)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDispatchStatus(DISPATCH_STATUS.DISPATCHED);
      
      // 5초 후 추적 화면으로 이동
      setTimeout(() => {
        navigate('/emergency/tracking', { 
          state: { 
            assignedAmbulance: mockAmbulance,
            formData: formData 
          } 
        });
      }, 5000);
      
    } catch (error) {
      console.error('배차 프로세스 오류:', error);
      // 에러 처리 로직
    }
  };

  // 배차 취소 핸들러
  const handleCancelDispatch = async () => {
    try {
      // 실제로는 서버에 취소 요청
      await cancelDispatch?.(selectedAmbulance?.id);
      
      setDispatchStatus(DISPATCH_STATUS.CANCELLED);
      
      // 2초 후 이전 페이지로 돌아가기
      setTimeout(() => {
        navigate('/emergency/patient-input');
      }, 2000);
      
    } catch (error) {
      console.error('배차 취소 오류:', error);
      alert('배차 취소 중 오류가 발생했습니다.');
    }
  };

  // 대기 시간 포맷팅
  const formatWaitingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 로딩 애니메이션 컴포넌트
  const LoadingAnimation = () => (
    <div className="flex justify-center items-center space-x-2 mb-6">
      <div className="relative">
        {/* 구급차 아이콘 */}
        <div className="text-6xl animate-bounce">🚑</div>
        
        {/* 회전하는 원 */}
        <div className="absolute -inset-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* 펄스 효과 */}
        <div className="absolute -inset-8 border border-blue-300 rounded-full animate-ping opacity-20"></div>
        <div className="absolute -inset-12 border border-blue-200 rounded-full animate-ping opacity-10" style={{animationDelay: '0.5s'}}></div>
      </div>
    </div>
  );

  // 진행 상태 바 렌더링
  const renderProgressBar = () => {
    const steps = [
      { key: DISPATCH_STATUS.REQUESTING, label: '요청' },
      { key: DISPATCH_STATUS.SEARCHING, label: '검색' },
      { key: DISPATCH_STATUS.FOUND, label: '발견' },
      { key: DISPATCH_STATUS.ASSIGNED, label: '배정' },
      { key: DISPATCH_STATUS.DISPATCHED, label: '출동' }
    ];

    const currentIndex = steps.findIndex(step => step.key === dispatchStatus);

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex-1 text-center transition-all duration-500 ${
                index <= currentIndex 
                  ? 'text-blue-600 font-bold' 
                  : 'text-gray-400'
              }`}
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-500 ${
                index < currentIndex 
                  ? 'bg-green-600' 
                  : index === currentIndex 
                    ? 'bg-blue-600 animate-pulse' 
                    : 'bg-gray-300'
              }`}>
                {index < currentIndex ? '✓' : index + 1}
              </div>
              <div className="text-xs">{step.label}</div>
            </div>
          ))}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // 환자 정보 요약 카드
  const renderPatientSummary = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border border-blue-200">
      <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
        <span className="mr-2">👤</span>
        환자 정보
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">KTAS:</span>
          <span className={`ml-2 px-2 py-1 rounded text-white text-xs font-bold ${
            formData.ktasLevel === '1' ? 'bg-red-500' :
            formData.ktasLevel === '2' ? 'bg-orange-500' :
            formData.ktasLevel === '3' ? 'bg-yellow-500' :
            formData.ktasLevel === '4' ? 'bg-green-500' :
            'bg-blue-500'
          }`}>
            {formData.ktasLevel}등급
          </span>
        </div>
        <div>
          <span className="text-gray-600">진료과:</span>
          <span className="ml-2 font-medium">{formData.department}</span>
        </div>
        {formData.gender && (
          <div>
            <span className="text-gray-600">성별:</span>
            <span className="ml-2 font-medium">{formData.gender}</span>
          </div>
        )}
        {formData.ageRange && (
          <div>
            <span className="text-gray-600">연령:</span>
            <span className="ml-2 font-medium">{formData.ageRange}</span>
          </div>
        )}
      </div>
    </div>
  );

  // 배정된 구급차 정보 카드
  const renderAmbulanceInfo = () => {
    if (!assignedAmbulance) return null;

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border border-green-200 animate-fadeInUp">
        <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
          <span className="mr-2">🚑</span>
          배정된 구급차
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">차량번호:</span>
            <span className="font-bold text-lg text-blue-600">{assignedAmbulance.vehicleNumber}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">운전자:</span>
            <div className="text-right">
              <div className="font-medium">{assignedAmbulance.driver.name}</div>
              <div className="text-sm text-gray-500">{assignedAmbulance.driver.experience} • ⭐ {assignedAmbulance.driver.rating}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">현재위치:</span>
            <span className="font-medium">{assignedAmbulance.currentLocation}</span>
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border">
            <span className="text-gray-600">예상 도착시간:</span>
            <span className="font-bold text-xl text-red-600">
              약 {estimatedTime}분
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 취소 확인 다이얼로그
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

  const currentConfig = STATUS_CONFIG[dispatchStatus];

  return (
    <AmbulanceLayout>
      <div className="max-w-2xl mx-auto p-6 min-h-screen">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">구급차 배차 중</h1>
          <p className="text-gray-600">잠시만 기다려주세요. 최적의 구급차를 찾고 있습니다.</p>
        </div>

        {/* 진행 상태 바 */}
        {renderProgressBar()}

        {/* 메인 카드 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* 로딩 애니메이션 */}
          {dispatchStatus !== DISPATCH_STATUS.CANCELLED && <LoadingAnimation />}
          
          {/* 현재 상태 */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{currentConfig?.icon}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{currentConfig?.title}</h2>
            <p className="text-gray-600">{currentConfig?.message}</p>
          </div>

          {/* 대기 시간 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-gray-600 mr-2">대기시간:</span>
              <span className="font-mono font-bold text-lg text-blue-600">
                {formatWaitingTime(waitingTime)}
              </span>
            </div>
          </div>

          {/* 예상 시간 (배정 완료 후) */}
          {estimatedTime && (
            <div className="text-center mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 font-bold text-lg">
                  약 {estimatedTime}분 후 도착 예정
                </div>
                <div className="text-red-600 text-sm mt-1">
                  교통상황에 따라 변경될 수 있습니다
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 환자 정보 요약 */}
        {renderPatientSummary()}

        {/* 배정된 구급차 정보 */}
        {renderAmbulanceInfo()}

        {/* 취소 버튼 */}
        {dispatchStatus !== DISPATCH_STATUS.DISPATCHED && dispatchStatus !== DISPATCH_STATUS.CANCELLED && (
          <div className="text-center">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              배차 취소하기
            </button>
          </div>
        )}

        {/* 출동 완료 메시지 */}
        {dispatchStatus === DISPATCH_STATUS.DISPATCHED && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-800 font-bold text-lg mb-2">
              🎯 구급차 출동 시작!
            </div>
            <div className="text-green-700">
              구급차 추적 화면으로 자동 이동됩니다...
            </div>
          </div>
        )}
      </div>

      {/* 취소 확인 다이얼로그 */}
      {renderCancelDialog()}

      {/* 애니메이션 CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </AmbulanceLayout>
  );
}
