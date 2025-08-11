import { create } from "zustand"
import { fetchWithAuth } from "../utils/apiInterceptor"

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,

  fetchAccounts: async (page = 0, size = 15, search = '', role = '') => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: 'id,desc'
      });
      
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseUrl}/api/v1/user/?${params}`;

      const response = await fetchWithAuth(url, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      const transformedAccounts = data.content
        .filter(user => user.role !== 'admin' && user.role !== 'ROLE_ADMIN')
        .map(user => ({
          id: user.id,
          accountId: user.userKey,
          type: getRoleDisplayName(user.role),
          password: user.password,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }));

      const adminCount = data.content.filter(user => 
        user.role === 'admin' || user.role === 'ROLE_ADMIN'
      ).length;
      
      const newState = {
        accounts: transformedAccounts,
        currentPage: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements - adminCount,
        loading: false
      };

      set(newState);

    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false,
        accounts: []
      });
    }
  },

  deleteAccount: async (id) => {
    try {
      const { useAuthStore } = await import('./useAuthStore');
      const { accessToken } = useAuthStore.getState();

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
        totalElements: state.totalElements - 1
      }));

    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      set({ error: error.message });
      throw error;
    }
  },

  registerAmbulance: async (userData) => {
    try {
      const { useAuthStore } = await import('./useAuthStore');
      const { accessToken } = useAuthStore.getState();

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/regist/ambulance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userKey: userData.userKey,
          role: 'ambulance',
          name: userData.name
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ambulance registration error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        return {
          success: true,
          password: '임시패스워드가 생성되었습니다',
          passwordResetKey: '관리자에게 문의하세요'
        };
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      return {
        success: true,
        password: data.password,
        passwordResetKey: data.passwordResetKey
      };
    } catch (error) {
      console.error('구급차 계정 생성 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  registerOrganization: async (userData) => {
    try {
      const { useAuthStore } = await import('./useAuthStore');
      const { accessToken } = useAuthStore.getState();

      const requestBody = {
        userKey: userData.userKey,
        role: userData.role,
        address: userData.address,
        name: userData.name,
        latitude: userData.latitude || 0,
        longitude: userData.longitude || 0
      };


      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/regist/organization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Organization registration error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        return {
          success: true,
          password: '임시패스워드가 생성되었습니다',
          passwordResetKey: '관리자에게 문의하세요'
        };
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      return {
        success: true,
        password: data.password,
        passwordResetKey: data.passwordResetKey
      };
    } catch (error) {
      console.error('기관 계정 생성 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  addAccount: (account) =>
    set((state) => ({
      accounts: [
        ...state.accounts,
        {
          ...account,
          id: Date.now(),
          tempPassword: `temp${Math.random().toString(36).substr(2, 6)}!`,
          passkey: `PK-${account.type.charAt(0)}${String(Date.now()).slice(-3)}-2024`,
        },
      ],
    })),
}))

function getRoleDisplayName(role) {
  switch (role) {
    case 'ROLE_ADMIN':
    case 'admin':
      return '관리자';
    case 'ROLE_HOSPITAL':
    case 'hospital':
      return '병원';
    case 'ROLE_AMBULANCE':
    case 'ambulance':
      return '구급대원';
    case 'ROLE_FIRESTATION':
    case 'firestation':
      return '소방서';
    default:
      return role || '사용자';
  }
}