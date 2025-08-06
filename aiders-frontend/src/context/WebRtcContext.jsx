import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

/**
 * WebRTC Context 정의
 * - 화상통화 상태, 스트림, 함수들을 전역으로 관리
 * - Provider 밖에서 사용할 때 에러 방지용 기본값 설정
 */
const WebRtcContext = createContext({
  isCallActive: false,        // 통화 활성화 상태
  isPipMode: false,          // Picture-in-Picture 모드 상태
  localStream: null,         // 내 카메라/마이크 스트림
  remoteStream: null,        // 상대방 카메라/마이크 스트림
  setLocalStream: () => {},  // 내 스트림 설정 함수
  setRemoteStream: () => {}, // 상대방 스트림 설정 함수
  startCall: () => {},       // 통화 시작 함수
  endCall: () => {},         // 통화 종료 함수
  togglePipMode: () => {},   // PiP 모드 토글 함수
  remoteVideoRef: null,      // 상대방 비디오 엘리먼트 ref
  localVideoRef: null,       // 내 비디오 엘리먼트 ref
  debugStreams: () => {},    // 🔥 디버깅용 함수 추가
  testRemoteStream: () => {},// 🔥 Remote 스트림 테스트 함수
});

/**
 * WebRTC Hook - Context 사용을 위한 커스텀 훅
 * Provider 밖에서 사용하면 에러 던짐 (안전장치)
 */
export const useWebRtc = () => {
  const context = useContext(WebRtcContext);
  if (context === undefined) {
    throw new Error('useWebRtc must be used within a WebRtcProvider');
  }
  return context;
};

/**
 * WebRTC Provider - 실제 상태 관리와 로직이 들어있는 컴포넌트
 */
export const WebRtcProvider = ({ children }) => {
  // ========== 상태 관리 ==========
  const [isCallActive, setIsCallActive] = useState(false);    // 통화 중인지 여부
  const [isPipMode, setIsPipMode] = useState(false);          // PiP 모드 활성화 여부
  const [localStream, setLocalStream] = useState(null);       // 내 비디오/오디오 스트림
  const [remoteStream, setRemoteStream] = useState(null);     // 상대방 비디오/오디오 스트림

  // ========== 비디오 엘리먼트 참조 ==========
  /**
   * useRef로 비디오 엘리먼트 직접 참조
   * - React 상태로 관리하면 리렌더링 때마다 새로 생성되므로 ref 사용
   * - 컴포넌트에서 이 ref들을 video 태그에 연결해서 스트림 출력
   */
  const remoteVideoRef = useRef(null);  // 상대방 비디오 태그 참조
  const localVideoRef = useRef(null);   // 내 비디오 태그 참조

  // ========== 🔥 초기 상태 로깅 (컴포넌트 마운트 시) ==========
  useEffect(() => {
    console.log('🚀 WebRtcProvider 초기화됨!');
    console.log('📊 초기 상태:');
    console.log('- isCallActive:', false);
    console.log('- localStream:', null);
    console.log('- remoteStream:', null);
    console.log('- localVideoRef:', localVideoRef.current);
    console.log('- remoteVideoRef:', remoteVideoRef.current);
    
    return () => {
      console.log('🛑 WebRtcProvider 언마운트됨');
    };
  }, []); // 마운트/언마운트 시에만 실행

  // ========== 스트림 ↔ 비디오 엘리먼트 자동 연결 ==========
  /**
   * localStream이 변경될 때마다 내 비디오 엘리먼트에 자동 연결
   * - localStream이 null이면 비디오 끔
   * - localStream이 MediaStream이면 비디오에 연결해서 내 화면 출력
   * 🔥 추가: 상세한 local 스트림 정보 콘솔 출력 + 타이밍 로깅
   */
  useEffect(() => {
    console.log('🔄 [LOCAL] useEffect 실행됨 - localStream 변경 감지');
    console.log('📅 실행 시간:', new Date().toLocaleTimeString());
    
    // 비디오 엘리먼트에 스트림 연결
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
      console.log('📺 localVideoRef에 스트림 연결:', !!localStream);
    } else {
      console.log('⚠️  localVideoRef.current가 null임');
    }
    
    // 🔥 항상 상세한 local 스트림 정보 출력
    console.log('=== LOCAL STREAM 상태 분석 ===');
    if (localStream) {
      console.log('🎥 LOCAL STREAM 연결됨!');
      console.log('____local!!:', localStream);
      console.log('🆔 스트림 ID:', localStream.id);
      console.log('✅ 스트림 활성 상태:', localStream.active);
      console.log('📹 비디오 트랙 개수:', localStream.getVideoTracks().length);
      console.log('🎤 오디오 트랙 개수:', localStream.getAudioTracks().length);
      
      // 각 트랙 상세 정보
      localStream.getVideoTracks().forEach((track, index) => {
        console.log(`📹 비디오 트랙 ${index}:`, track.label, track.enabled, track.readyState);
      });
      localStream.getAudioTracks().forEach((track, index) => {
        console.log(`🎤 오디오 트랙 ${index}:`, track.label, track.enabled, track.readyState);
      });
    } else {
      console.log('❌ LOCAL STREAM 없음');
      console.log('____local!!:', localStream);
      console.log('타입:', typeof localStream);
      console.log('null인가?:', localStream === null);
      console.log('undefined인가?:', localStream === undefined);
    }
    console.log('==============================');
  }, [localStream]);

  /**
   * remoteStream이 변경될 때마다 상대방 비디오 엘리먼트에 자동 연결
   * - remoteStream이 null이면 상대방 비디오 검은 화면
   * - remoteStream이 MediaStream이면 상대방 화면 출력
   * 🔥 추가: 상세한 remote 스트림 정보 콘솔 출력 + 강화된 디버깅
   */
  useEffect(() => {
    console.log('🔄 [REMOTE] useEffect 실행됨 - remoteStream 변경 감지');
    console.log('📅 실행 시간:', new Date().toLocaleTimeString());
    console.log('🔍 현재 remoteStream 값:', remoteStream);
    
    // 비디오 엘리먼트에 스트림 연결
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
      console.log('📺 remoteVideoRef에 스트림 연결:', !!remoteStream);
    } else {
      console.log('⚠️  remoteVideoRef.current가 null임');
    }
    
    // 🔥 무조건 상세한 remote 스트림 정보 출력
    console.log('=== REMOTE STREAM 상태 분석 ===');
    if (remoteStream) {
      console.log('🎥 REMOTE STREAM 연결됨!');
      console.log('____remote!!!!:', remoteStream);
      console.log('🆔 스트림 ID:', remoteStream.id);
      console.log('✅ 스트림 활성 상태:', remoteStream.active);
      console.log('📹 상대방 비디오 트랙 개수:', remoteStream.getVideoTracks().length);
      console.log('🎤 상대방 오디오 트랙 개수:', remoteStream.getAudioTracks().length);
      
      // 각 트랙 상세 정보
      remoteStream.getVideoTracks().forEach((track, index) => {
        console.log(`📹 상대방 비디오 트랙 ${index}:`, track.label, track.enabled, track.readyState);
      });
      remoteStream.getAudioTracks().forEach((track, index) => {
        console.log(`🎤 상대방 오디오 트랙 ${index}:`, track.label, track.enabled, track.readyState);
      });
    } else {
      console.log('⏳ REMOTE STREAM 없음 (대기중)');
      console.log('____remote!!!!:', remoteStream);
      console.log('타입:', typeof remoteStream);
      console.log('null인가?:', remoteStream === null);
      console.log('undefined인가?:', remoteStream === undefined);
      console.log('📭 아직 상대방 연결 안됨');
    }
    console.log('==============================');
  }, [remoteStream]);

  // ========== 스트림 관리 함수들 ==========
  /**
   * 내 스트림만 설정하는 함수
   * - peer 연결이나 다른 로직과 독립적으로 내 스트림만 관리
   * - stream이 있으면 통화 활성화, 없으면 비활성화
   * 🔥 추가: 더 상세한 로깅 + 호출자 추적
   */
  const handleSetLocalStream = useCallback((stream) => {
    console.log('🚨🚨🚨 handleSetLocalStream 호출됨! 🚨🚨🚨');
    console.log('📅 호출 시간:', new Date().toLocaleTimeString());
    console.log('🔧 handleSetLocalStream 호출됨');
    console.log('📥 받은 stream 파라미터:', stream);
    console.log('📊 이전 localStream:', localStream);
    
    // 스택 트레이스로 호출자 확인
    console.trace('📍 호출자 추적:');
    
    setLocalStream(stream);
    setIsCallActive(!!stream);  // stream이 있으면 true, 없으면 false
    
    if (stream) {
      console.log('✅ 내 스트림 설정 완료, 통화 활성화');
      console.log('🎯 setIsCallActive(true) 호출됨');
    } else {
      console.log('❌ 내 스트림 해제, 통화 비활성화');
      console.log('🎯 setIsCallActive(false) 호출됨');
    }
  }, [localStream]);

  /**
   * 상대방 스트림만 설정하는 함수
   * - peer 연결에서 ontrack 이벤트로 받은 스트림을 여기서 설정
   * - 통화 상태는 건드리지 않고 remoteStream만 업데이트
   * 🔥 추가: 더 상세한 로깅 + 호출자 추적
   */
  const handleSetRemoteStream = useCallback((stream) => {
    console.log('🚨🚨🚨 handleSetRemoteStream 호출됨! 🚨🚨🚨');
    console.log('📅 호출 시간:', new Date().toLocaleTimeString());
    console.log('🔧 handleSetRemoteStream 호출됨');
    console.log('📥 받은 stream 파라미터:', stream);
    console.log('📊 이전 remoteStream:', remoteStream);
    
    // 스택 트레이스로 호출자 확인
    console.trace('📍 호출자 추적:');
    
    setRemoteStream(stream);
    
    if (stream) {
      console.log('✅ 상대방 스트림 설정 완료');
      console.log('🎯 setRemoteStream() 완료, useEffect 트리거될 예정');
    } else {
      console.log('❌ 상대방 스트림 해제');
    }
  }, [remoteStream]);

  // ========== 통화 제어 함수들 ==========
  /**
   * 통화 시작 함수
   * - 사용자가 "통화 시작" 버튼을 눌렀을 때 호출
   * - getUserMedia로 내 카메라/마이크 권한 받아서 localStream 생성
   * - 성공하면 내 비디오 바로 나옴, 실패하면 권한 에러 처리
   * 
   * 🔥 핵심: 이 함수는 내 스트림만 처리하고, 상대방 스트림은 건드리지 않음!
   * 🔥 추가: 더 상세한 로깅과 스트림 정보 출력 + 타이밍 체크
   */
  const startCall = useCallback(async () => {
    const startTime = performance.now();
    console.log('🚀🚀🚀 통화 시작 버튼 클릭됨! 🚀🚀🚀');
    console.log('📅 시작 시간:', new Date().toLocaleTimeString());
    console.log('Starting call - requesting camera/mic access...');
    
    try {
      console.log('📱 getUserMedia 요청 시작...');
      
      // 카메라와 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,   // 비디오 활성화
        audio: true    // 오디오 활성화
      });
      
      const getMediaTime = performance.now();
      console.log(`⏱️  getUserMedia 소요 시간: ${(getMediaTime - startTime).toFixed(2)}ms`);
      
      console.log('🎉🎉🎉 카메라/마이크 권한 획득 성공! 🎉🎉🎉');
      console.log('Camera/mic access granted:', stream);
      
      // 🔥 스트림 세부 정보 출력 (네가 원하는 부분)
      console.log('📊 획득한 스트림 정보:');
      console.log('- 스트림 ID:', stream.id);
      console.log('- 비디오 트랙 수:', stream.getVideoTracks().length);
      console.log('- 오디오 트랙 수:', stream.getAudioTracks().length);
      console.log('- 활성 상태:', stream.active);
      console.log('- 스트림 객체:', stream, remoteStream);
      
      // 각 트랙의 설정 정보도 출력
      stream.getVideoTracks().forEach((track, index) => {
        const settings = track.getSettings();
        console.log(`📹 비디오 트랙 ${index} 설정:`, settings);
      });
      
      console.log('🔄 setLocalStream() 호출 예정...');
      
      // 내 스트림 설정 (이때 useEffect가 자동으로 비디오에 연결)
      setLocalStream(stream);
      setIsCallActive(true);
      
      const endTime = performance.now();
      console.log(`⏱️  전체 startCall 소요 시간: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('✅✅✅ 내 화면 출력 시작! localStream 설정 완료 ✅✅✅');
      
    } catch (error) {
      console.error('❌❌❌ 카메라/마이크 권한 실패! ❌❌❌');
      console.error('에러 타입:', error.name);
      console.error('에러 메시지:', error.message);
      console.error('Camera/mic access failed:', error);
      alert('카메라/마이크 권한이 필요합니다.');
      setIsCallActive(false);
    }
  }, []);

  /**
   * 통화 종료 함수
   * - 모든 스트림 정리하고 상태 초기화
   * - 스트림의 모든 트랙을 stop()으로 완전히 종료해서 카메라/마이크 해제
   * 🔥 추가: 더 상세한 정리 과정 로깅
   */
  const endCall = useCallback(() => {
    console.log('🛑🛑🛑 통화 종료 시작... 🛑🛑🛑');
    console.log('📅 종료 시간:', new Date().toLocaleTimeString());
    console.log('Ending call - cleaning up streams...');
    
    // 내 스트림의 모든 트랙 종료 (카메라/마이크 완전 해제)
    if (localStream) {
      console.log('🎥 내 스트림 트랙들 정리 중...');
      console.log('정리할 트랙 수:', localStream.getTracks().length);
      localStream.getTracks().forEach((track, index) => {
        console.log(`Track ${index} 정지 중... (${track.kind}: ${track.label})`);
        track.stop();
        console.log(`Local track stopped: ${track.kind} (${track.label})`);
      });
    } else {
      console.log('⚠️  localStream이 없어서 트랙 정리 생략');
    }
    
    // 상대방 스트림도 정리 (보통 자동으로 정리되지만 명시적으로)
    if (remoteStream) {
      console.log('📺 상대방 스트림 트랙들 정리 중...');
      console.log('정리할 상대방 트랙 수:', remoteStream.getTracks().length);
      remoteStream.getTracks().forEach((track, index) => {
        console.log(`Remote Track ${index} 정지 중... (${track.kind}: ${track.label})`);
        track.stop();
        console.log(`Remote track stopped: ${track.kind} (${track.label})`);
      });
    } else {
      console.log('⚠️  remoteStream이 없어서 트랙 정리 생략');
    }
    
    // 모든 상태 초기화
    console.log('🔄 모든 상태 초기화 중...');
    setIsCallActive(false);
    setIsPipMode(false);
    setLocalStream(null);
    setRemoteStream(null);
    
    console.log('✅✅✅ 통화 종료 완료, 모든 상태 초기화됨 ✅✅✅');
  }, [localStream, remoteStream]);

  /**
   * Picture-in-Picture 모드 토글
   * - 작은 창으로 비디오를 띄우는 기능
   * - 브라우저 API 지원 여부에 따라 동작
   */
  const togglePipMode = useCallback((enabled) => {
    console.log(`🔄 PiP 모드 토글: ${enabled ? '활성화' : '비활성화'}`);
    console.log(`Toggling PiP mode: ${enabled}`);
    setIsPipMode(enabled);
  }, []);

  // ========== 🔥 디버깅 함수들 (추가) ==========
  /**
   * 현재 스트림 상태를 모두 출력하는 디버깅 함수
   */
  const debugStreams = useCallback(() => {
    console.log('🐛🐛🐛 DEBUG: 전체 스트림 상태 체크 🐛🐛🐛');
    console.log('📅 체크 시간:', new Date().toLocaleTimeString());
    console.log('=' .repeat(50));
    
    console.log('📊 Context 상태:');
    console.log('- isCallActive:', isCallActive);
    console.log('- isPipMode:', isPipMode);
    
    console.log('🎥 Local Stream:');
    console.log('- localStream:', localStream);
    console.log('- localStream 타입:', typeof localStream);
    console.log('- localStream null?:', localStream === null);
    console.log('- localVideoRef.current:', localVideoRef.current);
    console.log('- localVideoRef.current?.srcObject:', localVideoRef.current?.srcObject);
    
    console.log('📺 Remote Stream:');
    console.log('- remoteStream:', remoteStream);
    console.log('- remoteStream 타입:', typeof remoteStream);
    console.log('- remoteStream null?:', remoteStream === null);
    console.log('- remoteStream undefined?:', remoteStream === undefined);
    console.log('- remoteVideoRef.current:', remoteVideoRef.current);
    console.log('- remoteVideoRef.current?.srcObject:', remoteVideoRef.current?.srcObject);
    
    console.log('=' .repeat(50));
  }, [isCallActive, isPipMode, localStream, remoteStream]);

  /**
   * 테스트용 가짜 remote 스트림 생성 함수
   */
  const testRemoteStream = useCallback(() => {
    console.log('🧪🧪🧪 테스트: 가짜 remote 스트림 생성 🧪🧪🧪');
    
    try {
      // 가짜 MediaStream 생성 (실제로는 빈 스트림)
      const fakeStream = new MediaStream();
      
      // 가짜 비디오 트랙 추가 (실제 비디오 없음)
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      // 빨간색 배경에 텍스트 그리기
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.fillText('FAKE REMOTE STREAM', 150, 240);
      
      // 캔버스를 MediaStream으로 변환
      const canvasStream = canvas.captureStream(30);
      canvasStream.getTracks().forEach(track => {
        fakeStream.addTrack(track);
      });
      
      console.log('✅ 가짜 remote 스트림 생성됨:', fakeStream);
      console.log('📊 가짜 스트림 정보:');
      console.log('- ID:', fakeStream.id);
      console.log('- 트랙 수:', fakeStream.getTracks().length);
      console.log('- 활성:', fakeStream.active);
      
      // setRemoteStream 호출해서 테스트
      handleSetRemoteStream(fakeStream);
      
    } catch (error) {
      console.error('❌ 가짜 스트림 생성 실패:', error);
    }
  }, [handleSetRemoteStream]);

  // ========== Context Value 구성 ==========
  /**
   * 하위 컴포넌트들이 사용할 수 있는 모든 값과 함수들
   * - 상태: isCallActive, isPipMode, localStream, remoteStream
   * - 함수: setLocalStream, setRemoteStream, startCall, endCall, togglePipMode
   * - ref: remoteVideoRef, localVideoRef (비디오 태그 연결용)
   * 🔥 디버깅 함수들 추가
   */
  const value = {
    isCallActive,
    isPipMode,
    localStream,
    remoteStream,
    setLocalStream: handleSetLocalStream,      // 외부에서 내 스트림 설정할 때 사용
    setRemoteStream: handleSetRemoteStream,    // peer 연결에서 상대방 스트림 받았을 때 사용
    startCall,                                 // 통화 시작 버튼에서 사용
    endCall,                                   // 통화 종료 버튼에서 사용
    togglePipMode,                             // PiP 토글 버튼에서 사용
    remoteVideoRef,                            // 상대방 비디오 태그에 ref={remoteVideoRef}로 연결
    localVideoRef,                             // 내 비디오 태그에 ref={localVideoRef}로 연결
    debugStreams,                              // 🔥 디버깅용 - 전체 상태 출력
    testRemoteStream,                          // 🔥 테스트용 - 가짜 remote 스트림 생성
  };

  return (
    <WebRtcContext.Provider value={value}>
      {children}
    </WebRtcContext.Provider>
  );
};
