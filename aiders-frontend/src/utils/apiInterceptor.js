// HTTP 요청 인터셉터 - 자동 토큰 갱신
let isRefreshingToken = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// fetch wrapper with automatic token refresh
export const fetchWithAuth = async (url, options = {}) => {
  const { useAuthStore } = await import('../store/useAuthStore');
  const { accessToken, refreshAccessToken, logout } = useAuthStore.getState();
  
  // 기본 헤더 설정
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers
    },
    ...options
  };

  try {
    let response = await fetch(url, defaultOptions);
    
    // 401 에러 (토큰 만료)인 경우 토큰 갱신 시도
    if (response.status === 401 && !isRefreshingToken) {
      const originalRequest = { url, options: defaultOptions };
      
      if (isRefreshingToken) {
        // 이미 토큰 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.options.headers['Authorization'] = `Bearer ${token}`;
          return fetch(originalRequest.url, originalRequest.options);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshingToken = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        
        // 새 토큰으로 원래 요청 재시도
        defaultOptions.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, defaultOptions);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout(); // 토큰 갱신 실패 시 로그아웃
        throw refreshError;
      } finally {
        isRefreshingToken = false;
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// 사용 예시:
// const response = await fetchWithAuth('/api/v1/user/', { method: 'GET' });