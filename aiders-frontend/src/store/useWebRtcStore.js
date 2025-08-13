import { create } from 'zustand';

const useWebRtcStore = create((set) => ({
  isCallActive: false,
  callInfo: null, // { sessionId, ambulanceNumber, hospitalId, patientName, ktas }
  isPipMode: false,

  // 화상 통화 시작 액션
  startCall: (info) => set({ isCallActive: true, callInfo: info }),

  // 화상 통화 종료 액션
  endCall: () => set({ isCallActive: false, callInfo: null }),

  // PIP 모드 설정 액션
  setPipMode: (isPip) => set({ isPipMode: isPip }),
}));

export default useWebRtcStore;