import { create } from "zustand"

export const usePasswordStore = create((set, get) => ({
  loading: false,
  error: null,

  // 비밀번호 재설정 인증
  authenticateForPasswordReset: async (userKey, passwordResetKey) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/password/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userKey: userKey,
          passwordResetKey: passwordResetKey
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      set({ loading: false });
      
      return {
        success: true,
        resetToken: data.resetToken
      };
    } catch (error) {
      console.error('비밀번호 재설정 인증 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 비밀번호 변경
  changePassword: async (resetToken, newPassword) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/password/change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resetToken: resetToken,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      set({ loading: false });
      
      return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.'
      };
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      set({ 
        error: error.message,
        loading: false
      });
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null })
}))