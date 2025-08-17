import { useRef, useEffect } from 'react';
import { useWebRtc } from '../context/WebRtcContext';

export const useMediaStream = () => {
  const { localStream, remoteStream } = useWebRtc();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    // remoteStream이 null이 되면 비디오 소스도 제거
    else if (!remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStream]);

  return {
    localVideoRef,
    remoteVideoRef,
    hasRemoteStream: !!remoteStream,
  };
};