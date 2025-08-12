// src/store/useAuthStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";

const parseJwtToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      decodeURIComponent(
        atob(tokenParts[1])
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );

    return payload;
  } catch (error) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (fallbackError) {
      return null;
    }
  }
};

const normalizeUserData = (userData, tokenPayload = null) => {
  const userId = tokenPayload?.userId || userData?.userId || null;
  const userKey = tokenPayload?.userKey || userData?.userKey || null;
  
  return {
    ...userData,
    userId: userId,
    userKey: userKey,
    name: userData?.name || '',
    email: userData?.email || '',
    ...(tokenPayload && {
      exp: tokenPayload.exp,
      iat: tokenPayload.iat,
      sub: tokenPayload.sub,
    })
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      userType: null,
      isInitialized: false,
      
      login: ({ user, accessToken, refreshToken, userType }) => {
        try {
          let normalizedUser = user;
          
          if (accessToken) {
            const tokenPayload = parseJwtToken(accessToken);
            if (tokenPayload) {
              console.log("--- Aiders Gemini Debug ---");
              console.log("Login successful. JWT Token Payload:", tokenPayload);
              normalizedUser = normalizeUserData(user, tokenPayload);
            }
          }
          
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          if (normalizedUser) {
            localStorage.setItem('user', JSON.stringify(normalizedUser));
          }
          
          set({ 
            user: normalizedUser, 
            accessToken, 
            refreshToken, 
            userType,
            isInitialized: true
          });
          
        } catch (error) {
          set({ user, accessToken, refreshToken, userType, isInitialized: true });
          
          try {
            if (accessToken) localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (user) localStorage.setItem('user', JSON.stringify(user));
          } catch (storageError) {
          }
        }
      },
      
      logout: async () => {
        const { accessToken } = get();
        
        if (accessToken) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
            } else {
            }
          } catch (error) {
          }
        }
        
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          userType: null,
          isInitialized: false
        });
        
        const keysToRemove = [
          'accessToken',
          'refreshToken', 
          'user',
          'auth-storage'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        if (window.location.pathname !== '/') {
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      },
      
      isAdmin: () => {
        const { userType } = get();
        const result = userType === 'admin';
        return result;
      },
      
      isAuthenticated: () => {
        const { accessToken } = get();
        const result = !!accessToken;
        return result;
      },

      getTokenExpiry: () => {
        const { accessToken } = get();
        if (!accessToken) return null;
        
        const payload = parseJwtToken(accessToken);
        if (!payload || !payload.exp) return null;
        
        const expiryTime = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = now >= expiryTime;
        
        return { expiryTime, isExpired };
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('Refresh token이 없습니다.');
        }

        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/reissue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              refreshToken: refreshToken
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.accessToken) {
            const tokenPayload = parseJwtToken(data.accessToken);
            const currentUser = get().user;
            
            if (tokenPayload && currentUser) {
              const updatedUser = normalizeUserData(currentUser, tokenPayload);
              
              set({ 
                accessToken: data.accessToken, 
                user: updatedUser 
              });
              
              localStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
            } else {
              set({ accessToken: data.accessToken });
              localStorage.setItem('accessToken', data.accessToken);
              
            }
          }
          
          return data.accessToken;
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      initialize: async () => {
        try {
          const currentState = get();
          
          if (currentState.accessToken) {
            
            const localStorageToken = localStorage.getItem('accessToken');
            if (!localStorageToken || localStorageToken !== currentState.accessToken) {
              localStorage.setItem('accessToken', currentState.accessToken);
              if (currentState.refreshToken) {
                localStorage.setItem('refreshToken', currentState.refreshToken);
              }
              if (currentState.user) {
                localStorage.setItem('user', JSON.stringify(currentState.user));
              }
            }
            
            const tokenInfo = get().getTokenExpiry();
            
            if (tokenInfo && !tokenInfo.isExpired) {
              
              const tokenPayload = parseJwtToken(currentState.accessToken);
              if (tokenPayload && currentState.user) {
                const updatedUser = normalizeUserData(currentState.user, tokenPayload);
                set({ 
                  user: updatedUser,
                  isInitialized: true 
                });
                localStorage.setItem('user', JSON.stringify(updatedUser));
              } else {
                set({ isInitialized: true });
              }
              
              return true;
            } else {
              
              try {
                await get().refreshAccessToken();
                set({ isInitialized: true });
                return true;
              } catch (error) {
                set({ isInitialized: true });
                return false;
              }
            }
          } else {
            set({ isInitialized: true });
            return false;
          }
        } catch (error) {
          set({ 
            user: null, 
            accessToken: null, 
            refreshToken: null, 
            userType: null,
            isInitialized: true 
          });
          throw error;
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        
        set({ user: updatedUser });
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
      },

      debugAuthState: () => {
        const state = get();
        const localStorageState = {
          accessToken: !!localStorage.getItem('accessToken'),
          refreshToken: !!localStorage.getItem('refreshToken'),
          user: !!localStorage.getItem('user'),
          authStorage: !!localStorage.getItem('auth-storage')
        };
        
        if (state.accessToken) {
          const tokenInfo = state.getTokenExpiry();
        }
        
        const persistToken = state.accessToken;
        const localStorageToken = localStorage.getItem('accessToken');
        const isSynced = persistToken === localStorageToken;
        
        if (!isSynced) {
        }
        
        return { 
          persistState: state, 
          localStorageState, 
          isSynced 
        };
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userType: state.userType
      }),
      version: 1,
      migrate: (persistedState, version) => {
        return persistedState;
      }
    }
  )
);

if (import.meta.env.DEV) {
  window.debugAuth = () => useAuthStore.getState().debugAuthState();
  
  window.forceLogout = () => {
    useAuthStore.getState().logout();
  };
  
  window.checkTokenSync = () => {
    const state = useAuthStore.getState();
    const persistToken = state.accessToken;
    const localStorageToken = localStorage.getItem('accessToken');
    
    return persistToken === localStorageToken;
  };
  
}

if (import.meta.env.DEV) {
  
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
    }
  } catch (e) {
  }
}