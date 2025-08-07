// src/App.jsx

import "./App.css";
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import { WebRtcProvider, useWebRtc } from './context/WebRtcContext';
import Toast from './components/Toast';
import AppRouters from "./router/AppRouters";
import { useAuthStore } from "./store/useAuthStore";

// 🔥 AppContent 컴포넌트 - 메인 앱 로직
const AppContent = () => {
  const { showToast } = useAppContext();
  const { isCallActive, isPipMode, localStream, remoteStream } = useWebRtc();
  const location = useLocation();
  
  // 🔥 오타 수정: initalize → initialize
  const { initialize, user, isAuthenticated } = useAuthStore();
  
  // 🔥 앱 초기화 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  // 🔥 앱 시작시 인증 정보 복원 (localStorage에서 JWT 토큰 복원)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // console.log('[App] 앱 초기화 시작 - JWT 토큰 복원 중...');
        
        // 🔥 useAuthStore의 initialize 함수 호출
        await initialize();
        
        // console.log('[App] 앱 초기화 완료');
        // console.log('[App] 복원된 사용자 정보:', useAuthStore.getState().user);
        // console.log('[App] 인증 상태:', useAuthStore.getState().isAuthenticated);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] 앱 초기화 중 에러 발생:', error);
        setInitError(error.message);
        setIsInitialized(true); // 에러가 나도 앱은 계속 실행
      }
    };

    initializeApp();
  }, [initialize]);

  // 🔥 PiP Local Video 스트림 연결
  useEffect(() => {
    const pipLocalVideoElement = document.getElementById('pipLocalVideo');
    if (pipLocalVideoElement && localStream) {
      // console.log('[App] PiP Local Video 스트림 연결');
      pipLocalVideoElement.srcObject = localStream;
    }
  }, [localStream]);

  // 🔥 PiP Remote Video 스트림 연결
  useEffect(() => {
    const pipRemoteVideoElement = document.getElementById('pipRemoteVideo');
    if (pipRemoteVideoElement && remoteStream) {
      // console.log('[App] PiP Remote Video 스트림 연결');
      pipRemoteVideoElement.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 🔥 사용자 인증 상태 변화 감지
  useEffect(() => {
    // console.log('[App] 사용자 인증 상태 변화:', {
    //   isAuthenticated,
    //   userId: user?.userId,
    //   userKey: user?.userKey
    // });
  }, [isAuthenticated, user]);

  // 🔥 경로 변경 감지 (디버깅용)
  useEffect(() => {
    // console.log('[App] 현재 경로:', location.pathname);
  }, [location.pathname]);

  // 🔥 PiP 모드 표시 조건
  // - 화상 통화가 활성화 상태이고
  // - PiP 모드가 켜져 있고  
  // - 현재 페이지가 지도 페이지가 아닐 때만 표시
  const shouldShowPip = isCallActive && isPipMode && location.pathname !== '/emergency/map';

  // console.log('[App] PiP 모드 상태:', {
  //   isCallActive,
  //   isPipMode,
  //   currentPath: location.pathname,
  //   shouldShowPip
  // });

  // 🔥 앱이 초기화되지 않았으면 로딩 화면 표시
  if (!isInitialized) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">앱 초기화 중...</p>
          <p className="text-gray-500 text-sm mt-2">JWT 토큰 복원 및 인증 상태 확인</p>
        </div>
      </div>
    );
  }

  // 🔥 초기화 에러 발생시 에러 화면 표시
  if (initError) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">앱 초기화 실패</h1>
          <p className="text-gray-600 mb-4">인증 정보 복원 중 문제가 발생했습니다.</p>
          <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded mb-4">
            에러: {initError}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 relative overflow-hidden flex flex-col" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
      {/* 🔥 토스트 메시지 표시 */}
      {showToast && <Toast message="구급차 정보가 업데이트되었습니다" />}
      
      {/* 🔥 메인 콘텐츠 영역 */}
      <main className="px-4 sm:px-6 lg:px-8 flex-grow">
        <AppRouters />
      </main>
      
      {/* 🔥 Picture-in-Picture(PiP) 화상통화 화면 */}
      {shouldShowPip && (
        <div className="fixed bottom-4 right-4 w-48 h-32 md:w-64 md:h-48 lg:w-80 lg:h-60 bg-black rounded-lg overflow-hidden shadow-xl z-50 border-2 border-gray-300">
          {/* 🔥 PiP 헤더 (드래그용/제어용) */}
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 z-20">
            <span>화상통화 진행 중</span>
          </div>
          
          {/* 🔥 PiP Local Video (내 화면 - 작은 창) */}
          {localStream && (
            <video 
              id="pipLocalVideo"
              autoPlay={true} 
              muted={true} 
              playsInline={true} // 🔥 모바일에서 전체화면 방지
              className="absolute top-0 left-0 w-1/3 h-1/3 object-cover z-10 border border-white rounded-sm"
              onLoadedMetadata={(e) => {
                // console.log('[App] PiP Local video 메타데이터 로드됨:', {
                //   width: e.target.videoWidth,
                //   height: e.target.videoHeight
                // });
              }}
              onError={(e) => {
                console.error('[App] PiP Local video 에러:', e);
              }}
            />
          )}
          
          {/* 🔥 PiP Remote Video (상대방 화면 - 전체 배경) */}
          {remoteStream && (
            <video 
              id="pipRemoteVideo"
              autoPlay={true} 
              playsInline={true} // 🔥 모바일에서 전체화면 방지
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                // console.log('[App] PiP Remote video 메타데이터 로드됨:', {
                //   width: e.target.videoWidth,
                //   height: e.target.videoHeight
                // });
              }}
              onError={(e) => {
                console.error('[App] PiP Remote video 에러:', e);
              }}
            />
          )}
          
          {/* 🔥 비디오 스트림이 없을 때 플레이스홀더 */}
          {!remoteStream && !localStream && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">📹</div>
                <div className="text-xs">연결 중...</div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 🔥 디버깅 정보 (개발 환경에서만) */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-40 max-w-xs">
          <div>🔍 <strong>디버깅 정보</strong></div>
          <div>인증됨: {isAuthenticated ? '✅' : '❌'}</div>
          <div>사용자: {user?.userId || '없음'}</div>
          <div>통화 중: {isCallActive ? '✅' : '❌'}</div>
          <div>PiP 모드: {isPipMode ? '✅' : '❌'}</div>
          <div>현재 경로: {location.pathname}</div>
        </div>
      )}
    </div>
  );
};

// 🔥 메인 App 컴포넌트 - Context Providers 래핑
const App = () => {
  // console.log('[App] 메인 App 컴포넌트 렌더링 시작');

  return (
    <AppProvider>
      <WebRtcProvider>
        <Router>
          <AppContent />
        </Router>
      </WebRtcProvider>
    </AppProvider>
  );
};

export default App;
