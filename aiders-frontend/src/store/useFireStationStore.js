import { create } from 'zustand';
import { createDispatch, getDispatchHistory } from '../api/api';

const useFireStationStore = create((set, get) => ({
  dispatchHistory: [],

  fetchDispatchHistory: async () => {
    try {
      const history = await getDispatchHistory();
      set({ dispatchHistory: history });
    } catch (error) {
      console.error('Failed to fetch dispatch history:', error);
    }
  },

  dispatchAmbulance: async (dispatchRequest) => {
    try {
      await createDispatch(dispatchRequest);
      // 배차 성공 후, 배차 기록을 새로고침합니다.
      get().fetchDispatchHistory();
    } catch (error) {
      console.error('Failed to dispatch ambulance:', error);
      throw error; // 에러를 다시 던져 컴포넌트에서 처리할 수 있도록 합니다.
    }
  },
}));

export default useFireStationStore;
