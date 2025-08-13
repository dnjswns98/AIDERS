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

const AppContent = () => {
  const { showToast } = useAppContext();
  const { isCallActive, isPipMode, localStream, remoteStream } = useWebRtc();
  const location = useLocation();
  const { initialize, user, isAuthenticated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] 앱 초기화 중 에러 발생:', error);
        setInitError(error.message);
        setIsInitialized(true);
      }
    };
    initializeApp();
  }, [initialize]);

  useEffect(() => {
    const pipLocalVideoElement = document.getElementById('pipLocalVideo');
    if (pipLocalVideoElement && localStream) {
      pipLocalVideoElement.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const pipRemoteVideoElement = document.getElementById('pipRemoteVideo');
    if (pipRemoteVideoElement && remoteStream) {
      pipRemoteVideoElement.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 🔥 수정: PIP 표시 조건을 '대시보드' 페이지만 제외하도록 변경
  const shouldShowPip = isCallActive && isPipMode && location.pathname !== '/emergency/dashboard';

  if (!isInitialized) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">앱 초기화 중...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">앱 초기화 실패</h1>
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
      {showToast && <Toast message="구급차 정보가 업데이트되었습니다" />}
      <main className="px-4 sm:px-6 lg:px-8 flex-grow">
        <AppRouters />
      </main>
      
      {shouldShowPip && (
        <div className="fixed bottom-4 right-4 w-48 h-32 md:w-64 md:h-48 lg:w-80 lg:h-60 bg-black rounded-lg overflow-hidden shadow-xl z-50 border-2 border-gray-300">
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 z-20">
            <span>화상통화 진행 중</span>
          </div>
          {localStream && (
            <video 
              id="pipLocalVideo"
              autoPlay={true} 
              muted={true} 
              playsInline={true}
              className="absolute top-0 left-0 w-1/3 h-1/3 object-cover z-10 border border-white rounded-sm"
            />
          )}
          {remoteStream && (
            <video 
              id="pipRemoteVideo"
              autoPlay={true} 
              playsInline={true}
              className="w-full h-full object-cover"
            />
          )}
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
    </div>
  );
};

const App = () => {
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