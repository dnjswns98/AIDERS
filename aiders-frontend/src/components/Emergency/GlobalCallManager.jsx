import React from 'react';
import useWebRtcStore from '../../store/useWebRtcStore';
import WebRtcCall from '../webRTC/WebRtcCall';

const GlobalCallManager = () => {
  const { isCallActive, callInfo, isPipMode, endCall } = useWebRtcStore();

  if (!isCallActive || !callInfo) {
    return null; // 통화 중이 아닐 때는 아무것도 표시하지 않음
  }

  // PIP 모드일 때 스타일
  const pipStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '320px',
    height: '240px',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid white',
  };

  return (
    <div style={isPipMode ? pipStyle : { width: '100%', height: '100%' }}>
      <WebRtcCall
        sessionId={String(callInfo.sessionId)}
        ambulanceNumber={callInfo.ambulanceNumber}
        hospitalId={callInfo.hospitalId}
        patientName={callInfo.patientName}
        ktas={callInfo.ktas}
        onLeave={endCall} // 통화 종료 시 전역 상태 업데이트
      />
    </div>
  );
};

export default GlobalCallManager;