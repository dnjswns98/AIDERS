import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const WebRtcContext = createContext({
  isCallActive: false,
  isPipMode: false,
  localStream: null,
  remoteStream: null,
  setLocalStream: () => {},
  setRemoteStream: () => {},
  startCall: () => {},
  endCall: () => {},
  togglePipMode: () => {},
  remoteVideoRef: null,
  localVideoRef: null,
  debugStreams: () => {},
  testRemoteStream: () => {},
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

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  const handleSetLocalStream = useCallback((stream) => {
    setLocalStream(stream);
    setIsCallActive(!!stream);
  }, []);

  const handleSetRemoteStream = useCallback((stream) => {
    setRemoteStream(stream);
  }, []);

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true
      });
      setLocalStream(stream);
      setIsCallActive(true);
    } catch (error) {
      console.error('❌❌❌ 카메라/마이크 권한 실패! ❌❌❌');
      console.error('에러 타입:', error.name);
      console.error('에러 메시지:', error.message);
      alert('카메라/마이크 권한이 필요합니다.');
      setIsCallActive(false);
    }
  }, []);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    setIsCallActive(false);
    setIsPipMode(false);
    setLocalStream(null);
    setRemoteStream(null);
  }, [localStream, remoteStream]);

  const togglePipMode = useCallback((enabled) => {
    setIsPipMode(enabled);
  }, []);

  const debugStreams = useCallback(() => {
  }, [isCallActive, isPipMode, localStream, remoteStream]);

  const testRemoteStream = useCallback(() => {
    try {
      const fakeStream = new MediaStream();
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.fillText('FAKE REMOTE STREAM', 150, 240);
      const canvasStream = canvas.captureStream(30);
      canvasStream.getTracks().forEach(track => {
        fakeStream.addTrack(track);
      });
      handleSetRemoteStream(fakeStream);
    } catch (error) {
      console.error('❌ 가짜 스트림 생성 실패:', error);
    }
  }, [handleSetRemoteStream]);

  const value = {
    isCallActive,
    isPipMode,
    localStream,
    remoteStream,
    setLocalStream: handleSetLocalStream,
    setRemoteStream: handleSetRemoteStream,
    startCall,
    endCall,
    togglePipMode,
    remoteVideoRef,
    localVideoRef,
    debugStreams,
    testRemoteStream,
  };

  return (
    <WebRtcContext.Provider value={value}>
      {children}
    </WebRtcContext.Provider>
  );
};