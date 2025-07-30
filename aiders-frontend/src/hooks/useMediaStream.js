import { useRef, useEffect } from 'react';
import { useWebRtc } from '../context/WebRtcContext';

export const useMediaStream = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const { localStream, remoteStream } = useWebRtc();
  
  // localStream을 비디오 엘리먼트에 연결
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log("Local stream connected to video element");
    }
  }, [localStream]);

  // remoteStream을 비디오 엘리먼트에 연결
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log("Remote stream connected to video element");
    }
  }, [remoteStream]);

  return {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    hasLocalStream: !!localStream,
    hasRemoteStream: !!remoteStream
  };
};
