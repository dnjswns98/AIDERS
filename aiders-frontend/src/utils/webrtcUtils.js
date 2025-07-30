// WebRTC 관련 유틸리티 함수들
export const webrtcUtils = {
  // 브라우저 지원 체크
  isWebRTCSupported: () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  // 미디어 권한 체크
  checkMediaPermissions: async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' });
      return permissions.state;
    } catch (error) {
      console.warn('Permission API not supported', error);
      return 'unknown';
    }
  },

  // 에러 타입별 메시지 생성
  getErrorMessage: (error) => {
    const errorMessages = {
      'CAMERA_ACCESS_DENIED': '카메라 또는 마이크 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.',
      'CONNECTION_FAILED': '세션 연결에 실패했습니다. 네트워크 상태를 확인해주세요.',
      'TOKEN_INVALID': '인증 토큰이 유효하지 않습니다. 페이지를 새로고침해주세요.',
      'GENERAL_ERROR': 'WebRTC 연결 중 오류가 발생했습니다.'
    };
    
    return errorMessages[error.type] || errorMessages['GENERAL_ERROR'];
  },

  // 디바이스 정보 가져오기
  getDeviceInfo: async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        cameras: devices.filter(device => device.kind === 'videoinput'),
        microphones: devices.filter(device => device.kind === 'audioinput'),
        speakers: devices.filter(device => device.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return { cameras: [], microphones: [], speakers: [] };
    }
  }
};
