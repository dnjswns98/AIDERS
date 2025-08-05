import { create } from "zustand"
import { fetchWithAuth } from "../utils/apiInterceptor"

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,

  // 사용자 목록 조회
  fetchAccounts: async (page = 0, size = 15, search = '', role = '') => {
    // console.log('🔍 fetchAccounts 호출:', { page, size, search, role });
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
      // console.log('🌐 API 요청 URL:', url);

      const response = await fetchWithAuth(url, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // console.log('📊 API 응답 데이터:', {
      //   currentPage: data.number,
      //   totalPages: data.totalPages,
      //   totalElements: data.totalElements,
      //   contentLength: data.content?.length
      // });
      
      // 백엔드 응답을 프론트엔드 형식으로 변환 (admin 제외)
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

      // admin 계정을 제외한 실제 계정 수 계산
      const adminCount = data.content.filter(user => 
        user.role === 'admin' || user.role === 'ROLE_ADMIN'
      ).length;
      
      const newState = {
        accounts: transformedAccounts,
        currentPage: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements - adminCount, // 전체에서 admin 수 제외
        loading: false
      };

      // console.log('✅ Store 업데이트:', {
      //   accountsCount: transformedAccounts.length,
      //   currentPage: newState.currentPage,
      //   totalPages: newState.totalPages,
      //   totalElements: newState.totalElements
      // });

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

  // 사용자 삭제
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

      // 삭제 성공 시 목록에서 제거
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
        totalElements: state.totalElements - 1
      }));

      // console.log('사용자 삭제 완료');
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // 구급차 계정 등록
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
      // console.log('Ambulance registration response:', responseText);
      
      // 빈 응답 처리 (백엔드에서 ResponseEntity.ok().build()를 반환하는 경우)
      if (!responseText || responseText.trim() === '') {
        // console.log('빈 응답을 받았습니다. 계정 생성은 성공했지만 패스워드 정보가 없습니다.');
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

      // console.log('구급차 계정 생성 완료:', data);
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

  // 기관 계정 등록 (병원/소방서)
  registerOrganization: async (userData) => {
    try {
      const { useAuthStore } = await import('./useAuthStore');
      const { accessToken } = useAuthStore.getState();

      const requestBody = {
        userKey: userData.userKey,
        role: userData.role, // 'hospital' or 'firestation'
        address: userData.address,
        name: userData.name,
        latitude: userData.latitude || 0,
        longitude: userData.longitude || 0
      };

      // console.log('Organization registration request:', requestBody);

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
      // console.log('Organization registration response:', responseText);
      
      // 빈 응답 처리 (백엔드에서 ResponseEntity.ok().build()를 반환하는 경우)
      if (!responseText || responseText.trim() === '') {
        // console.log('빈 응답을 받았습니다. 계정 생성은 성공했지만 패스워드 정보가 없습니다.');
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

      // console.log('기관 계정 생성 완료:', data);
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

// 역할을 표시용 이름으로 변환하는 함수
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