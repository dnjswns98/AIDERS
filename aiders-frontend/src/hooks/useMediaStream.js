import { useRef, useEffect } from 'react';
import { useWebRtc } from '../context/WebRtcContext';

export const useMediaStream = () => {
  const { localStream, subscriber } = useWebRtc();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (subscriber && remoteVideoRef.current) {
      subscriber.addVideoElement(remoteVideoRef.current);
    }
    // subscriber가 null이 되면 비디오 소스도 제거
    else if (!subscriber && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [subscriber]);

  return {
    localVideoRef,
    remoteVideoRef,
    hasRemoteStream: !!subscriber,
  };
};