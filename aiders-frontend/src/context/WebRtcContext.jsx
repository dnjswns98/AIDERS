import React, { createContext, useContext, useState, useCallback } from 'react';

// createContext에 기본값 추가 (Provider 밖에서 사용시 에러 방지)
const WebRtcContext = createContext({
  isCallActive: false,
  isPipMode: false,
  localStream: null,
  remoteStream: null,
  startCall: () => {},
  endCall: () => {},
  togglePipMode: () => {}, // setPipMode → togglePipMode로 변경
});

export const useWebRtc = () => {
  const context = useContext(WebRtcContext);
  if (context === undefined) {
    throw new Error('useWebRtc must be used within a WebRtcProvider');
  }
  return context;
};

export const WebRtcProvider = ({ children }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const startCall = useCallback((local, remote) => {
    console.log('WebRtcContext: startCall called.', { local, remote });
    setIsCallActive(true);
    setLocalStream(local);
    if (remote) {
      setRemoteStream(remote);
    }
  }, []);

  const endCall = useCallback(() => {
    console.log('WebRtcContext: endCall called.');
    setIsCallActive(false);
    setIsPipMode(false);
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  // setPipMode → togglePipMode로 함수명 변경
  const togglePipMode = useCallback((enabled) => {
    console.log(`WebRtcContext: togglePipMode called with ${enabled}`);
    setIsPipMode(enabled);
  }, []);

  const value = {
    isCallActive,
    isPipMode,
    localStream,
    remoteStream,
    startCall,
    endCall,
    togglePipMode, // 함수명 변경됨
  };

  return (
    <WebRtcContext.Provider value={value}>
      {children}
    </WebRtcContext.Provider>
  );
};
