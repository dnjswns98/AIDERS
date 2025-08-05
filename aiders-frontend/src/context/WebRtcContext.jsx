// WebRtcContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// createContext에 기본값 추가 (Provider 밖에서 사용시 에러 방지)
const WebRtcContext = createContext({
  isCallActive: false,
  isPipMode: false,
  localStream: null,
  remoteStream: null,
  startCall: () => {},
  endCall: () => {},
  togglePipMode: () => {},
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

  // 영상출력 엘리먼트 ref
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  // remoteStream 상태가 바뀌면 비디오 엘리먼트에 연결
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    } else if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStream]);

  // localStream 상태가 바뀌면 비디오 엘리먼트에 연결
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    } else if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [localStream]);

  const startCall = useCallback((local, remote) => {
    console.log('WebRtcContext: startCall called.', { local, remote });
    setIsCallActive(true);
    setLocalStream(local);
    if (remote) {
      setRemoteStream(remote);
    } else {
      setRemoteStream(null);
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
    togglePipMode,
    // 비디오 엘리먼트 ref 공개 (아래 컴포넌트에서 ref 연결용)
    remoteVideoRef,
    localVideoRef,
  };

  return (
    <WebRtcContext.Provider value={value}>
      {children}
    </WebRtcContext.Provider>
  );
};
