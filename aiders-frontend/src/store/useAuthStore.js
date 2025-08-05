import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      userType: null,
      
      // API 로그인
      login: ({ user, accessToken, refreshToken, userType }) => 
        set({ user, accessToken, refreshToken, userType }),
      
      // 로그아웃
      logout: async () => {
        const { accessToken } = get();
        
        // API 호출로 서버에서 refresh token 제거
        if (accessToken) {
          try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            console.log('서버 로그아웃 완료');
          } catch (error) {
            console.error('서버 로그아웃 실패:', error);
            // 서버 로그아웃 실패해도 클라이언트 로그아웃은 진행
          }
        }
        
        // 클라이언트 상태 초기화
        set({ user: null, accessToken: null, refreshToken: null, userType: null });
      },
        
      // 현재 사용자가 admin인지 확인
      isAdmin: () => {
        const { userType } = get();
        return userType === 'admin';
      },
      
      // 로그인 여부 확인
      isAuthenticated: () => {
        const { accessToken } = get();
        return !!accessToken;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);