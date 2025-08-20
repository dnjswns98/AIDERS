import { create } from 'zustand';

const useWebRtcStore = create((set) => ({
  isCallActive: false,
  callInfo: null, // { sessionId, ambulanceNumber, hospitalId, patientName, ktas }
  isPipMode: false,
  localStream: null,
  subscriber: null,
  session: null,
  publisher: null,



  // 화상 통화 시작 액션
  startCall: (info) => set({ 
    isCallActive: true, 
    callInfo: info,
    isPipMode: false, 
  }),

  // 화상 통화 종료 액션
  endCall: () => {
    console.log("[WebRtcStore] endCall 호출 - 모든 상태 초기화");
    set({
      isCallActive: false,
      callInfo: null,
      isPipMode: false,
      localStream: null,
      subscriber: null,
      session: null,
      publisher: null,
    });
  },

  // PIP 모드 설정 액션
  setPipMode: (isPip) => set({ isPipMode: isPip }),

  setLocalStream: (stream) => set({ localStream: stream }),
  setSubscriber: (subscriber) => set({ subscriber: subscriber }),
  setSession: (session) => set({ session }),
  setPublisher: (publisher) => set({ publisher }),



}));

export default useWebRtcStore;