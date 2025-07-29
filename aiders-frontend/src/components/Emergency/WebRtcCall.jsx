import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWebRtc } from '../../context/WebRtcContext';
import { useLocation } from 'react-router-dom';

export default function WebRtcCall({ sessionName, userName, onLeave }) {
  const { startCall, endCall, setPipMode, localStream, remoteStream } = useWebRtc();
  const location = useLocation();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const localMediaStream = useRef(null);

  const startLocalStream = useCallback(async () => {
    console.log('WebRtcCall: Attempting to get local media stream...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localMediaStream.current = stream;
      startCall(stream, null); // Only local stream for now
      console.log('WebRtcCall: Local media stream started.', stream);
    } catch (error) {
      console.error('WebRtcCall: Error accessing media devices.', error);
      alert('카메라 또는 마이크 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.');
    }
  }, [startCall]);

  const stopLocalStream = useCallback(() => {
    if (localMediaStream.current) {
      localMediaStream.current.getTracks().forEach(track => track.stop());
      localMediaStream.current = null;
    }
  }, []);

  const leaveSession = useCallback(() => {
    console.log('WebRtcCall: Leaving session...');
    stopLocalStream();
    endCall();
    onLeave();
  }, [onLeave, endCall, stopLocalStream]);

  useEffect(() => {
    startLocalStream();
  }, [startLocalStream]);

  useEffect(() => {
    window.addEventListener('beforeunload', leaveSession);

    return () => {
      window.removeEventListener('beforeunload', leaveSession);
    };
  }, [leaveSession]);

  useEffect(() => {
    // PiP 모드 제어: 현재 경로가 /emergency/map이 아닐 때 PiP 모드 활성화
    if (location.pathname !== '/emergency/map') {
      setPipMode(true);
    } else {
      setPipMode(false);
    }
  }, [location.pathname, setPipMode]);

  const toggleFullScreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        elem.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const localVideoElement = document.getElementById('localVideo');
    if (localVideoElement && localStream) {
      localVideoElement.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const remoteVideoElement = document.getElementById('remoteVideo');
    if (remoteVideoElement && remoteStream) {
      remoteVideoElement.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const localVideoElement = document.getElementById('localVideo');
    if (!localVideoElement) return;

    const handleEnterPip = async () => {
      try {
        if (document.pictureInPictureElement) {
          return;
        }
        await localVideoElement.requestPictureInPicture();
        console.log('Entered Picture-in-Picture mode.');
      } catch (error) {
        console.error('Failed to enter Picture-in-Picture mode:', error);
      }
    };

    const handleExitPip = () => {
      console.log('Exited Picture-in-Picture mode.');
      setPipMode(false);
    };

    localVideoElement.addEventListener('enterpictureinpicture', handleEnterPip);
    localVideoElement.addEventListener('leavepictureinpicture', handleExitPip);

    if (location.pathname !== '/emergency/map' && localStream && !document.pictureInPictureElement) {
      handleEnterPip();
    } else if (location.pathname === '/emergency/map' && document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }

    return () => {
      localVideoElement.removeEventListener('enterpictureinpicture', handleEnterPip);
      localVideoElement.removeEventListener('leavepictureinpicture', handleExitPip);
      if (document.pictureInPictureElement === localVideoElement) {
        document.exitPictureInPicture();
      }
    };
  }, [location.pathname, localStream, setPipMode]);

  return (
    <div className="web-rtc-call-container flex flex-col h-full relative bg-gray-800">
      <div className="video-container flex-grow relative rounded-lg overflow-hidden">
        {/* Local Video */}
        <div className="local-video absolute bottom-4 right-4 w-1/4 h-1/4 bg-black rounded-lg overflow-hidden z-20">
          <video 
            id="localVideo"
            autoPlay={true} 
            muted={true} 
            className="w-full h-full object-cover"
            onLoadedMetadata={(e) => console.log('Local video loaded metadata:', e.target.videoWidth, e.target.videoHeight)}
          />
        </div>
        {/* Remote Video */}
        <div className="remote-video w-full h-full bg-black flex items-center justify-center z-10">
          <video 
            id="remoteVideo"
            autoPlay={true} 
            className="w-full h-full object-cover"
            onLoadedMetadata={(e) => console.log('Remote video loaded metadata:', e.target.videoWidth, e.target.videoHeight)}
          />
        </div>
      </div>

      <div className="controls flex justify-center gap-4 mt-4">
        <button
          onClick={leaveSession}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          통화 종료
        </button>
        <button
          onClick={toggleFullScreen}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {isFullScreen ? '전체 화면 종료' : '전체 화면'}
        </button>
      </div>
    </div>
  );
}