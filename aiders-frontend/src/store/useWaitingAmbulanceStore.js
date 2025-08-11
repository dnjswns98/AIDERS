import { create } from 'zustand';
import { getWaitingAmbulances, getAmbulancePatientDetail } from '../api/api';

const useWaitingAmbulanceStore = create((set, get) => ({
  ambulances: [],
  selectedPatientDetail: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,

  fetchWaitingAmbulances: async (hospitalId) => {
    set({ isLoading: true, error: null });
    try {
      if (!hospitalId) {
        throw new Error('Hospital ID is required');
      }
      const response = await getWaitingAmbulances(hospitalId);
      const uniqueAmbulances = response && Array.isArray(response) 
        ? Array.from(new Map(response.map(item => [item.sessionId || item.ambulanceId, item])).values())
        : [];
      set({ ambulances: uniqueAmbulances, isLoading: false });
    } catch (error) {
      console.error('[Store] Error fetching waiting ambulances:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPatientDetail: async function(hospitalId, ambulanceId, retries = 2) { // Use a named function for recursion
    if (retries === 2) { // Set loading state only on the first attempt
      set({ isLoadingDetail: true, error: null });
    }
    try {
      if (!hospitalId || !ambulanceId) {
        throw new Error('Hospital ID and Ambulance ID are required');
      }
      const response = await getAmbulancePatientDetail(hospitalId, ambulanceId);
      set({ selectedPatientDetail: response, isLoadingDetail: false });
      return response;
    } catch (error) {
      if (error.response?.status === 404 && retries > 0) {
        console.warn(`[Store] fetchPatientDetail failed with 404. Retrying... (${retries} retries left)`)
        // Wait for 300ms before retrying
        await new Promise(resolve => setTimeout(resolve, 300));
        return get().fetchPatientDetail(hospitalId, ambulanceId, retries - 1);
      }
      console.error('[Store] Error fetching patient detail:', error);
      set({ error: error.message, isLoadingDetail: false, selectedPatientDetail: null });
      return null;
    }
  },

  clearPatientDetail: () => {
    set({ selectedPatientDetail: null });
  },

  updateAmbulanceCallStatus: (sessionId, isInCall) => {
    set((state) => ({
      ambulances: state.ambulances.map((ambulance) =>
        (ambulance.sessionId === sessionId || ambulance.ambulanceId === sessionId)
          ? { ...ambulance, isInCall }
          : ambulance
      ),
    }));
  },
}));

export default useWaitingAmbulanceStore;