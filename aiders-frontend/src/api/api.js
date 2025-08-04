import axios from 'axios';

const API_BASE_URL = '/api/v1';

// Ambulance API


export const updateAmbulanceStatus = async (ambulanceId, status) => {
  try {
    // 백엔드에 ambulanceId를 직접 전달하는 엔드포인트가 없으므로,
    // 현재 로그인된 구급차의 상태를 변경하는 것으로 가정합니다.
    // 실제 백엔드 API에 따라 이 부분은 수정되어야 합니다.
    let endpoint = '';
    if (status === 'wait') {
      endpoint = '/ambulance/transfer/wait';
    } else if (status === 'transfer') {
      endpoint = '/ambulance/transfer';
    } else {
      throw new Error('Invalid ambulance status');
    }
    const response = await axios.post(`${API_BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating ambulance status to ${status}:`, error);
    throw error;
  }
};

// Patient API
export const saveRequiredPatientInfo = async (patientInfo) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/patient/required`, patientInfo);
    return response.data;
  } catch (error) {
    console.error('Error saving required patient info:', error);
    throw error;
  }
};

export const saveOptionalPatientInfo = async (patientInfo) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/patient/optional`, patientInfo);
    return response.data;
  } catch (error) {
    console.error('Error saving optional patient info:', error);
    throw error;
  }
};

export const getPatientInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patient/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient info:', error);
    throw error;
  }
};

// Dispatch API (Fire Station related)
export const createDispatch = async (dispatchRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/dispatch/`, dispatchRequest);
    return response.data;
  } catch (error) {
    console.error('Error creating dispatch:', error);
    throw error;
  }
};

export const getDispatchHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dispatch/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dispatch history:', error);
    throw error;
  }
};

// Hospital API
export const updateHospitalDepartment = async (departmentUpdate) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/hospital/department`, departmentUpdate);
    return response.data;
  } catch (error) {
    console.error('Error updating hospital department:', error);
    throw error;
  }
};



export const createAmbulanceToken = async (request) => {
  try {
    // 데이터 검증 및 변환
    const sanitizedRequest = {
      sessionId: request.sessionId ||  '', 
      ambulanceId: Number(request.ambulanceId) || 0,
      hospitalId: Number(request.hospitalId) || 0,
      ktas: Number(request.ktas) || 0,
      patientName: request.patientName || ''
    };

    console.log('전송할 데이터:', sanitizedRequest);
    
    const response = await axios.post(
      // const response = await axios.post(`${API_BASE_URL}/video-call/ambulance/token`, request);
      `http://localhost:8080/api/video-call/ambulance/token`, 
      sanitizedRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('서버 응답:', error.response?.data);
    console.error('상태 코드:', error.response?.status);
    throw error;
  }
};



export const getHospitalToken = async (sessionId, hospitalId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/video-call/hospital/token`, { params: { sessionId,hospitalId } });
    return response.data;
  } catch (error) {
    console.error('Error getting hospital token:', error);
    throw error;
  }
};

export const startVideoCall = async (request) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/video-call/start-call`, request);
    return response.data;
  } catch (error) {
    console.error('Error starting video call:', error);
    throw error;
  }
};

export const endVideoCall = async (request) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/video-call/end-call`, request);
    return response.data;
  } catch (error) {
    console.error('Error ending video call:', error);
    throw error;
  }
};

export const completeTransport = async (sessionId, hospitalId) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/video-call/session/${sessionId}/complete`, { params: { hospitalId } });
    return response.data;
  } catch (error) {
    console.error('Error completing transport:', error);
    throw error;
  }
};
