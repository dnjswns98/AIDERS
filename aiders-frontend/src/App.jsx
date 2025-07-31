import "./App.css";
import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import { WebRtcProvider, useWebRtc } from './context/WebRtcContext';
import Toast from './components/Toast';
import AppRouters from "./router/AppRouters";

const AppContent = () => {
    const { showToast } = useAppContext();
    const { isCallActive, isPipMode, localStream, remoteStream } = useWebRtc();
    const location = useLocation();

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

    // PiP 모드 활성화 조건: 통화 중이고, 현재 페이지가 AmbulanceMapPage가 아닐 때
    const shouldShowPip = isCallActive && isPipMode && location.pathname !== '/emergency/map';

    return (
        <div className="h-screen bg-gray-50 relative overflow-hidden flex flex-col" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
            {showToast && <Toast message="구급차 정보가 업데이트되었습니다" />}
            <main className="px-4 sm:px-6 lg:px-8 flex-grow">
                <AppRouters />
            </main>
            {shouldShowPip && (
                <div className="fixed bottom-4 right-4 w-48 h-32 md:w-64 md:h-48 lg:w-80 lg:h-60 bg-black rounded-lg overflow-hidden shadow-lg z-50">
                    {/* PiP Local Video */}
                    {localStream && (
                        <video 
                            id="pipLocalVideo"
                            autoPlay={true} 
                            muted={true} 
                            className="absolute top-0 left-0 w-1/3 h-1/3 object-cover z-10"
                            onLoadedMetadata={(e) => console.log('PiP Local video loaded metadata:', e.target.videoWidth, e.target.videoHeight)}
                        />
                    )}
                    {/* PiP Remote Video */}
                    {remoteStream && (
                        <video 
                            id="pipRemoteVideo"
                            autoPlay={true} 
                            className="w-full h-full object-cover"
                            onLoadedMetadata={(e) => console.log('PiP Remote video loaded metadata:', e.target.videoWidth, e.target.videoHeight)}
                        />
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
