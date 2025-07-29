import React, { createContext, useContext, useState, useCallback } from 'react';

const WebRtcContext = createContext();

export const useWebRtc = () => useContext(WebRtcContext);

export const WebRtcProvider = ({ children }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const startCall = useCallback((local, remote) => {
    console.log('WebRtcContext: startCall called.', { local, remote });
    setIsCallActive(true);
    setLocalStream(local);
    setRemoteStream(remote);
  }, []);

  const endCall = useCallback(() => {
    console.log('WebRtcContext: endCall called.');
    setIsCallActive(false);
    setIsPipMode(false);
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const setPipMode = useCallback((mode) => {
    setIsPipMode(mode);
  }, []);

  const value = {
    isCallActive,
    isPipMode,
    localStream,
    remoteStream,
    startCall,
    endCall,
    setPipMode,
  };

  return (
    <WebRtcContext.Provider value={value}>
      {children}
    </WebRtcContext.Provider>
  );
};
