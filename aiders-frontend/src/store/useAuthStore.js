// src/store/useAuthStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 🔥 JWT 토큰에서 한글 데이터 안전하게 파싱하는 함수
const parseJwtToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      console.warn('[Auth] JWT 토큰이 유효하지 않음:', token);
      return null;
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('[Auth] JWT 토큰 형식이 잘못됨:', token.substring(0, 20) + '...');
      return null;
    }

    // 🔥 한글 처리를 위한 UTF-8 디코딩
    const payload = JSON.parse(
      decodeURIComponent(
        atob(tokenParts[1])
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );

    console.log('[Auth] JWT 토큰 파싱 성공 (한글 처리됨):', payload);
    return payload;
  } catch (error) {
    console.error('[Auth] JWT 토큰 파싱 실패:', error);
    
    // 🔥 fallback: 기본 atob 시도
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[Auth] JWT 토큰 fallback 파싱 성공:', payload);
      return payload;
    } catch (fallbackError) {
      console.error('[Auth] JWT 토큰 fallback 파싱도 실패:', fallbackError);
      return null;
    }
  }
};

// 🔥 사용자 정보 구조 정규화 함수
const normalizeUserData = (userData, tokenPayload = null) => {
  // tokenPayload에서 추가 정보 추출
  const userId = tokenPayload?.userId || userData?.userId || null;
  const userKey = tokenPayload?.userKey || userData?.userKey || null;
  
  return {
    ...userData,
    userId: userId,
    userKey: userKey,
    // 기타 사용자 정보
    name: userData?.name || '',
    email: userData?.email || '',
    // JWT payload에서 가져올 수 있는 추가 정보들
    ...(tokenPayload && {
      exp: tokenPayload.exp, // 만료 시간
      iat: tokenPayload.iat, // 발급 시간
      sub: tokenPayload.sub, // subject (주로 사용자 ID)
    })
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 🔥 상태 정의
      user: null,
      accessToken: null,
      refreshToken: null,
      userType: null,
      isInitialized: false, // 🔥 초기화 상태 추가
      
      // 🔥 API 로그인 - JWT 토큰 파싱 및 한글 처리 포함 + localStorage 직접 저장 추가
      login: ({ user, accessToken, refreshToken, userType }) => {
        try {
          console.log('[Auth] 로그인 처리 시작');
          console.log('[Auth] 받은 데이터:', { user, userType });
          console.log('[Auth] accessToken:', accessToken?.substring(0, 30) + '...');
          
          // 🔥 JWT 토큰에서 추가 정보 추출
          let normalizedUser = user;
          
          if (accessToken) {
            const tokenPayload = parseJwtToken(accessToken);
            if (tokenPayload) {
              // 🔥 토큰 payload와 user 데이터 병합
              normalizedUser = normalizeUserData(user, tokenPayload);
              console.log('[Auth] JWT 토큰에서 추출한 사용자 정보:', normalizedUser);
            }
          }
          
          // 🔥 핵심 추가: persist 저장과 별도로 localStorage에 직접 저장
          // 이렇게 해야 api.js 인터셉터가 토큰을 확실하게 찾을 수 있음
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            console.log('[Auth] ✅ localStorage에 accessToken 직접 저장 완료');
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
            console.log('[Auth] ✅ localStorage에 refreshToken 직접 저장 완료');
          }
          if (normalizedUser) {
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            console.log('[Auth] ✅ localStorage에 user 직접 저장 완료');
          }
          
          // 🔥 persist 저장 (기존 방식)
          set({ 
            user: normalizedUser, 
            accessToken, 
            refreshToken, 
            userType,
            isInitialized: true
          });
          
          // 🔥 저장 완료 확인 로그
          console.log('[Auth] 로그인 저장 완료 확인:');
          console.log('- persist 저장소 업데이트 완료');
          console.log('- localStorage 직접 저장:', {
            accessToken: !!localStorage.getItem('accessToken'),
            refreshToken: !!localStorage.getItem('refreshToken'),
            user: !!localStorage.getItem('user')
          });
          
          console.log('[Auth] 🎉 로그인 처리 완료');
          console.log('[Auth] 최종 사용자 정보:', normalizedUser);
          
        } catch (error) {
          console.error('[Auth] 로그인 처리 중 에러:', error);
          // 에러가 발생해도 기본 로그인은 진행
          set({ user, accessToken, refreshToken, userType, isInitialized: true });
          
          // 에러 시에도 localStorage 직접 저장 시도
          try {
            if (accessToken) localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (user) localStorage.setItem('user', JSON.stringify(user));
            console.log('[Auth] 에러 발생했지만 localStorage 저장은 완료');
          } catch (storageError) {
            console.error('[Auth] localStorage 저장마저 실패:', storageError);
          }
        }
      },
      
      // 🔥 로그아웃 - 서버 API 호출 포함 + 모든 저장소 완전 삭제
      logout: async () => {
        const { accessToken } = get();
        
        console.log('[Auth] 로그아웃 처리 시작');
        
        // 🔥 서버에 로그아웃 요청 (refresh token 무효화)
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
              console.log('[Auth] ✅ 서버 로그아웃 완료');
            } else {
              console.warn('[Auth] ⚠️ 서버 로그아웃 실패:', response.status, response.statusText);
            }
          } catch (error) {
            console.error('[Auth] 💥 서버 로그아웃 요청 실패:', error);
            // 서버 로그아웃 실패해도 클라이언트 로그아웃은 계속 진행
          }
        }
        
        // 🔥 클라이언트 상태 완전 초기화
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          userType: null,
          isInitialized: false
        });
        
        // 🔥 핵심 추가: localStorage에서 모든 관련 데이터 완전 삭제
        const keysToRemove = [
          'accessToken',
          'refreshToken', 
          'user',
          'auth-storage' // persist 데이터까지 삭제
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`[Auth] 🗑️ localStorage에서 ${key} 삭제 완료`);
        });
        
        console.log('[Auth] 🧹 클라이언트 로그아웃 및 데이터 삭제 완료');
        
        // 🔥 삭제 완료 확인
        console.log('[Auth] 삭제 후 상태 확인:', {
          accessToken: !!localStorage.getItem('accessToken'),
          refreshToken: !!localStorage.getItem('refreshToken'),
          user: !!localStorage.getItem('user'),
          authStorage: !!localStorage.getItem('auth-storage')
        });
        
        // 🔥 페이지를 로그인 페이지로 이동 (필요시)
        if (window.location.pathname !== '/') {
          console.log('[Auth] 🔄 로그인 페이지로 리다이렉트');
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      },
      
      // 🔥 현재 사용자가 admin인지 확인
      isAdmin: () => {
        const { userType } = get();
        const result = userType === 'admin';
        console.log('[Auth] 👑 관리자 권한 체크:', result, '(userType:', userType, ')');
        return result;
      },
      
      // 🔥 로그인 여부 확인
      isAuthenticated: () => {
        const { accessToken } = get();
        const result = !!accessToken;
        console.log('[Auth] 🔐 인증 상태 체크:', result, '(token 존재:', !!accessToken, ')');
        return result;
      },

      // 🔥 토큰 만료 시간 확인
      getTokenExpiry: () => {
        const { accessToken } = get();
        if (!accessToken) return null;
        
        const payload = parseJwtToken(accessToken);
        if (!payload || !payload.exp) return null;
        
        const expiryTime = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = now >= expiryTime;
        
        console.log('[Auth] ⏰ 토큰 만료 정보:', {
          expiryTime: expiryTime.toLocaleString(),
          isExpired,
          remainingMinutes: Math.floor((expiryTime - now) / 60000)
        });
        
        return { expiryTime, isExpired };
      },

      // 🔥 토큰 갱신 - localStorage 동기화 포함
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        console.log('[Auth] 🔄 토큰 갱신 시작');
        
        if (!refreshToken) {
          console.error('[Auth] 💥 Refresh token이 없음');
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
            console.error('[Auth] 💥 토큰 갱신 HTTP 에러:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('[Auth] 📨 토큰 갱신 응답:', data);
          
          // 🔥 새로운 access token으로 사용자 정보 업데이트
          if (data.accessToken) {
            const tokenPayload = parseJwtToken(data.accessToken);
            const currentUser = get().user;
            
            if (tokenPayload && currentUser) {
              const updatedUser = normalizeUserData(currentUser, tokenPayload);
              
              // 🔥 persist 업데이트
              set({ 
                accessToken: data.accessToken, 
                user: updatedUser 
              });
              
              // 🔥 localStorage 직접 업데이트도 함께
              localStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              console.log('[Auth] ✅ 토큰 갱신 시 persist + localStorage 모두 업데이트 완료');
            } else {
              // persist만 업데이트
              set({ accessToken: data.accessToken });
              // localStorage도 업데이트
              localStorage.setItem('accessToken', data.accessToken);
              
              console.log('[Auth] ✅ 토큰만 갱신 완료');
            }
          }
          
          console.log('[Auth] 🎉 토큰 갱신 완료');
          return data.accessToken;
        } catch (error) {
          console.error('[Auth] 💥 토큰 갱신 실패:', error);
          // 🔥 갱신 실패 시 로그아웃
          console.log('[Auth] 🚨 토큰 갱신 실패로 인한 자동 로그아웃');
          get().logout();
          throw error;
        }
      },

      // 🔥 앱 초기화 함수 - localStorage에서 토큰 복원
      initialize: async () => {
        try {
          console.log('[Auth] 🚀 앱 초기화 시작 - 저장된 인증 정보 복원');
          
          const currentState = get();
          console.log('[Auth] 현재 persist 상태:', {
            hasUser: !!currentState.user,
            hasAccessToken: !!currentState.accessToken,
            hasRefreshToken: !!currentState.refreshToken,
            userType: currentState.userType
          });
          
          // 🔥 persist에서 복원된 데이터가 있는지 확인
          if (currentState.accessToken) {
            console.log('[Auth] 🔍 저장된 토큰 발견, 유효성 검사 중...');
            
            // 🔥 localStorage와 persist 동기화 확인
            const localStorageToken = localStorage.getItem('accessToken');
            if (!localStorageToken || localStorageToken !== currentState.accessToken) {
              console.log('[Auth] 🔄 localStorage와 persist 동기화 중...');
              localStorage.setItem('accessToken', currentState.accessToken);
              if (currentState.refreshToken) {
                localStorage.setItem('refreshToken', currentState.refreshToken);
              }
              if (currentState.user) {
                localStorage.setItem('user', JSON.stringify(currentState.user));
              }
              console.log('[Auth] ✅ localStorage와 persist 동기화 완료');
            }
            
            // 🔥 토큰 만료 확인
            const tokenInfo = get().getTokenExpiry();
            
            if (tokenInfo && !tokenInfo.isExpired) {
              console.log('[Auth] ✅ 토큰이 유효함, 초기화 완료');
              
              // 🔥 토큰에서 최신 사용자 정보 업데이트
              const tokenPayload = parseJwtToken(currentState.accessToken);
              if (tokenPayload && currentState.user) {
                const updatedUser = normalizeUserData(currentState.user, tokenPayload);
                set({ 
                  user: updatedUser,
                  isInitialized: true 
                });
                // localStorage도 업데이트
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('[Auth] 👤 사용자 정보 업데이트됨:', updatedUser);
              } else {
                set({ isInitialized: true });
              }
              
              return true;
            } else {
              console.log('[Auth] ⏰ 토큰 만료됨, 갱신 시도...');
              
              try {
                await get().refreshAccessToken();
                console.log('[Auth] 🔄 토큰 갱신 성공, 초기화 완료');
                set({ isInitialized: true });
                return true;
              } catch (error) {
                console.error('[Auth] 💥 토큰 갱신 실패, 로그아웃 처리');
                set({ isInitialized: true });
                return false;
              }
            }
          } else {
            console.log('[Auth] 📭 저장된 토큰 없음, 비로그인 상태로 초기화');
            set({ isInitialized: true });
            return false;
          }
        } catch (error) {
          console.error('[Auth] 💥 초기화 중 예상치 못한 에러:', error);
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

      // 🔥 사용자 정보 업데이트 - localStorage 동기화 포함
      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        
        console.log('[Auth] 👤 사용자 정보 업데이트:', updatedUser);
        
        // persist 업데이트
        set({ user: updatedUser });
        
        // localStorage 동기화
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('[Auth] ✅ 사용자 정보 persist + localStorage 동기화 완료');
      },

      // 🔥 디버깅용 함수 - localStorage 상태까지 포함
      debugAuthState: () => {
        const state = get();
        const localStorageState = {
          accessToken: !!localStorage.getItem('accessToken'),
          refreshToken: !!localStorage.getItem('refreshToken'),
          user: !!localStorage.getItem('user'),
          authStorage: !!localStorage.getItem('auth-storage')
        };
        
        console.log('=== Auth Store 디버깅 정보 (완전판) ===');
        console.log('🏪 Persist 상태:');
        console.log('  isInitialized:', state.isInitialized);
        console.log('  isAuthenticated:', state.isAuthenticated());
        console.log('  isAdmin:', state.isAdmin());
        console.log('  user:', state.user);
        console.log('  userType:', state.userType);
        console.log('  hasAccessToken:', !!state.accessToken);
        console.log('  hasRefreshToken:', !!state.refreshToken);
        
        console.log('💾 LocalStorage 상태:');
        console.log('  accessToken 존재:', localStorageState.accessToken);
        console.log('  refreshToken 존재:', localStorageState.refreshToken);
        console.log('  user 존재:', localStorageState.user);
        console.log('  auth-storage 존재:', localStorageState.authStorage);
        
        if (state.accessToken) {
          const tokenInfo = state.getTokenExpiry();
          console.log('⏰ 토큰 정보:');
          console.log('  만료시간:', tokenInfo?.expiryTime);
          console.log('  만료여부:', tokenInfo?.isExpired);
          console.log('  남은시간(분):', tokenInfo?.remainingMinutes);
        }
        
        // 🔥 동기화 상태 확인
        const persistToken = state.accessToken;
        const localStorageToken = localStorage.getItem('accessToken');
        const isSynced = persistToken === localStorageToken;
        
        console.log('🔄 동기화 상태:');
        console.log('  persist ↔ localStorage 동기화:', isSynced ? '✅ 일치' : '❌ 불일치');
        
        if (!isSynced) {
          console.log('  persist 토큰 (일부):', persistToken?.substring(0, 30) + '...');
          console.log('  localStorage 토큰 (일부):', localStorageToken?.substring(0, 30) + '...');
        }
        
        console.log('=======================================');
        return { 
          persistState: state, 
          localStorageState, 
          isSynced 
        };
      }
    }),
    {
      name: 'auth-storage',
      // 🔥 persist 설정 최적화
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userType: state.userType
        // isInitialized는 persist에서 제외 (앱 시작시마다 false로 시작)
      }),
      version: 1, // 🔥 스키마 버전 관리
      migrate: (persistedState, version) => {
        console.log('[Auth] persist 마이그레이션:', version);
        return persistedState;
      }
    }
  )
);

// 🔥 전역에서 디버깅 함수 사용 가능하게 (개발 환경에서만)
if (import.meta.env.DEV) {
  window.debugAuth = () => useAuthStore.getState().debugAuthState();
  console.log('[Auth] 개발 모드: window.debugAuth() 함수 사용 가능');
  
  // 🔥 추가 디버깅 함수들
  window.forceLogout = () => {
    useAuthStore.getState().logout();
    console.log('[Debug] 강제 로그아웃 실행됨');
  };
  
  window.checkTokenSync = () => {
    const state = useAuthStore.getState();
    const persistToken = state.accessToken;
    const localStorageToken = localStorage.getItem('accessToken');
    
    console.log('=== 토큰 동기화 상태 체크 ===');
    console.log('persist 토큰:', persistToken?.substring(0, 30) + '...');
    console.log('localStorage 토큰:', localStorageToken?.substring(0, 30) + '...');
    console.log('동기화 상태:', persistToken === localStorageToken ? '✅ 일치' : '❌ 불일치');
    
    return persistToken === localStorageToken;
  };
  
  console.log('[Auth] 추가 디버깅 함수: window.forceLogout(), window.checkTokenSync()');
}

// 🔥 모듈 로드 시점에서 상태 체크 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('[Auth] 모듈 로드 시점 상태 체크:');
  console.log('- localStorage accessToken:', !!localStorage.getItem('accessToken'));
  console.log('- localStorage auth-storage:', !!localStorage.getItem('auth-storage'));
  
  // persist 데이터 확인
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      console.log('- persist accessToken:', !!parsed.state?.accessToken);
      console.log('- persist user:', !!parsed.state?.user);
    }
  } catch (e) {
    console.log('- persist 데이터 파싱 실패');
  }
}
