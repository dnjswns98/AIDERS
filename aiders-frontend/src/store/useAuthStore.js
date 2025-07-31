import { create } from "zustand"

// 임시 admin 계정 정보
const TEMP_ADMIN_ACCOUNTS = [
  { userKey: 'admin', password: 'admin123', userType: 'admin', name: '시스템 관리자' },
  { userKey: 'superadmin', password: 'super123', userType: 'admin', name: '최고 관리자' }
];

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  userType: null,
  
  // API 로그인 (기존)
  login: ({ user, accessToken, userType }) => 
    set({ user, accessToken, userType }),
    
  // 임시 admin 로그인
  loginAdmin: (userKey, password) => {
    const adminAccount = TEMP_ADMIN_ACCOUNTS.find(
      account => account.userKey === userKey && account.password === password
    );
    
    if (adminAccount) {
      set({
        user: { userKey: adminAccount.userKey, name: adminAccount.name },
        accessToken: 'temp-admin-token-' + Date.now(),
        userType: adminAccount.userType
      });
      return true;
    }
    return false;
  },
  
  // 로그아웃
  logout: () => 
    set({ user: null, accessToken: null, userType: null }),
    
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
}))