import { create } from 'zustand';
import { getWaitingAmbulances } from '../api/api';

const useWaitingAmbulanceStore = create((set, get) => ({
  ambulances: [],
  isLoading: false,
  error: null,

  fetchWaitingAmbulances: async (hospitalId) => {
    set({ isLoading: true, error: null });
    try {
      if (!hospitalId) {
        throw new Error('Hospital ID is required');
      }
      const response = await getWaitingAmbulances(hospitalId);
      set({ ambulances: response || [], isLoading: false });
    } catch (error) {
      console.error('[Store] Error fetching waiting ambulances:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  updateAmbulanceCallStatus: (sessionId, isInCall) => {
    set((state) => ({
      ambulances: state.ambulances.map((ambulance) =>
        ambulance.sessionId === sessionId ? { ...ambulance, isInCall } : ambulance
      ),
    }));
  },

  updateAmbulanceCallStatus: (sessionId, isInCall) => {
    set((state) => ({
      ambulances: state.ambulances.map((ambulance) =>
        ambulance.sessionId === sessionId ? { ...ambulance, isInCall } : ambulance
      ),
    }));
  },
}));

export default useWaitingAmbulanceStore;