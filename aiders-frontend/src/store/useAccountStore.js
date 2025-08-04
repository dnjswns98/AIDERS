import { create } from "zustand"

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,

  // 사용자 목록 조회
  fetchAccounts: async (page = 0, size = 15, search = '', role = '') => {
    set({ loading: true, error: null });
    
    try {
      // useAuthStore에서 accessToken 가져오기
      const { useAuthStore } = await import('./useAuthStore');
      const { accessToken } = useAuthStore.getState();
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: 'id,desc'
      });
      
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const response = await fetch(`http://localhost:8080/api/v1/user/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformedAccounts = data.content.map(user => ({
        id: user.id,
        accountId: user.userKey,
        type: getRoleDisplayName(user.role),
        password: user.password,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      set({
        accounts: transformedAccounts,
        currentPage: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        loading: false
      });

    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      set({ 
        error: error.message,
        loading: false,
        accounts: []
      });
    }
  },

  // 사용자 삭제
  deleteAccount: async (id) => {
    try {
      const { useAuthStore } = await import('./useAuthStore');
      const { accessToken } = useAuthStore.getState();

      const response = await fetch(`http://localhost:8080/api/v1/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 삭제 성공 시 목록에서 제거
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
        totalElements: state.totalElements - 1
      }));

      console.log('사용자 삭제 완료');
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      set({ error: error.message });
      throw error;
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

// 역할을 표시용 이름으로 변환하는 함수
function getRoleDisplayName(role) {
  switch (role) {
    case 'ROLE_ADMIN':
      return '관리자';
    case 'ROLE_HOSPITAL':
      return '병원';
    case 'ROLE_AMBULANCE':
      return '구급대원';
    case 'ROLE_FIRESTATION':
      return '소방서';
    default:
      return '사용자';
  }
}