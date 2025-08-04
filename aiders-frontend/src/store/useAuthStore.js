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
      logout: () => 
        set({ user: null, accessToken: null, refreshToken: null, userType: null }),
        
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