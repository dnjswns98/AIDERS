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

export const fetchWithAuth = async (url, options = {}) => {
  const { useAuthStore } = await import('../store/useAuthStore');
  const { accessToken, refreshAccessToken, logout } = useAuthStore.getState();
  
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
    
    if (response.status === 401 && !isRefreshingToken) {
      const originalRequest = { url, options: defaultOptions };
      
      if (isRefreshingToken) {
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
        
        defaultOptions.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, defaultOptions);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
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
