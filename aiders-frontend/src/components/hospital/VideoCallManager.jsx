import { useState, useEffect, useCallback } from 'react';
import { useOpenVidu } from '../../hooks/useOpenVidu';
import { useMediaStream } from '../../hooks/useMediaStream';
import { startVideoCall, endVideoCall } from '../../api/api';
import VideoDisplay from '../webRTC/VideoDisplay';
import CallControls from '../webRTC/CallControls';

const VideoCallManager = ({ 
  selectedAmbulance, 
  hospitalId, 
  onCallStatusChange,
  renderMode = 'full' // 'full' | 'compact'
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // WebRTC 훅들
  const { 
    localVideoRef, 
    remoteVideoRef, 
    hasRemoteStream 
  } = useMediaStream();

  const { joinSession, leaveSession } = useOpenVidu({ 
    sessionId: currentSessionId,
    ambulanceId: -1, // 병원은 음수로 구분
    hospitalId: hospitalId,
    onError: (error) => {
      console.error('WebRTC 오류:', error);
      setError(error.message);
      setIsConnecting(false);
    }
  });

  // 통화 시작
  const handleStartCall = useCallback(async () => {
    if (!selectedAmbulance || !hospitalId) {
      alert('구급차를 선택해주세요.');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // 세션 ID 생성 (구급차 ID 기반)
      const sessionId = `hospital_${hospitalId}_ambulance_${selectedAmbulance.id}_${Date.now()}`;
      
      // 백엔드에 통화 시작 알림
      await startVideoCall({
        hospitalId: hospitalId,
        sessionId: sessionId
      });

      // 세션 상태 업데이트
      setCurrentSessionId(sessionId);
      setIsCallActive(true);

      // 상위 컴포넌트에 상태 알림
      onCallStatusChange?.(true, selectedAmbulance);

      // OpenVidu 세션 참가
      await joinSession();

    } catch (error) {
      console.error('통화 시작 실패:', error);
      setError('통화 연결에 실패했습니다: ' + error.message);
      setIsConnecting(false);
      setIsCallActive(false);
    } finally {
      setIsConnecting(false);
    }
  }, [selectedAmbulance, hospitalId, onCallStatusChange, joinSession]);

  // 통화 종료
  const handleEndCall = useCallback(async () => {
    try {
      if (currentSessionId) {
        await endVideoCall({
          sessionId: currentSessionId
        });
      }

      // OpenVidu 세션 종료
      await leaveSession();

      // 상태 초기화
      setIsCallActive(false);
      setCurrentSessionId(null);
      setError(null);

      // 상위 컴포넌트에 상태 알림
      onCallStatusChange?.(false, null);

    } catch (error) {
      console.error('통화 종료 실패:', error);
      setError('통화 종료 중 오류가 발생했습니다.');
    }
  }, [currentSessionId, leaveSession, onCallStatusChange]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isCallActive) {
        handleEndCall();
      }
    };
  }, [isCallActive, handleEndCall]);

  // 선택된 구급차가 변경되면 기존 통화 종료
  useEffect(() => {
    if (isCallActive && currentSessionId) {
      handleEndCall();
    }
  }, [selectedAmbulance?.id]);

  // 연결 상태 표시
  if (!selectedAmbulance) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: renderMode === 'compact' ? '200px' : '400px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '2px dashed #e5e7eb'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚑</div>
          <p>구급차를 선택해주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: renderMode === 'compact' ? '200px' : '400px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '2px solid #fecaca',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={() => setError(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 통화 중이 아닐 때
  if (!isCallActive) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: renderMode === 'compact' ? '200px' : '400px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '2px solid #bfdbfe',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
          <h3 style={{ 
            fontSize: renderMode === 'compact' ? '14px' : '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {selectedAmbulance.vehicleNumber || selectedAmbulance.carNumber} 
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            marginBottom: '20px' 
          }}>
            화상통화를 시작하시겠습니까?
          </p>
          <button
            onClick={handleStartCall}
            disabled={isConnecting}
            style={{
              padding: renderMode === 'compact' ? '8px 16px' : '12px 24px',
              fontSize: renderMode === 'compact' ? '14px' : '16px',
              backgroundColor: isConnecting ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {isConnecting ? '연결 중...' : '📞 통화 시작'}
          </button>
        </div>
      </div>
    );
  }

  // 통화 중일 때
  return (
    <div style={{
      height: renderMode === 'compact' ? '200px' : '100%',
      backgroundColor: '#000',
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <VideoDisplay 
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        hasRemoteStream={hasRemoteStream}
        compact={renderMode === 'compact'}
      />
      
      {/* 통화 정보 오버레이 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        🚑 {selectedAmbulance.vehicleNumber || selectedAmbulance.carNumber}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          marginTop: '4px',
          fontSize: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%'
          }}></div>
          통화 중
        </div>
      </div>

      {/* 통화 종료 버튼 */}
      <button
        onClick={handleEndCall}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: renderMode === 'compact' ? '32px' : '48px',
          height: renderMode === 'compact' ? '32px' : '48px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          fontSize: renderMode === 'compact' ? '14px' : '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        📞
      </button>

      {/* 전체 화면 모드에서만 하단 컨트롤 표시 */}
      {renderMode === 'full' && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <CallControls 
            onLeave={handleEndCall}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};

export default VideoCallManager;