import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  // 사용자 데이터베이스 (실제로는 서버에서 관리되어야 함)
  users: [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      role: "admin",
      userType: "admin",
      name: "시스템 관리자"
    },
    {
      id: 2,
      username: "hospital001",
      password: "hospital123",
      role: "hospital",
      userType: "hospital",
      name: "서울대병원",
      address: "서울시 종로구"
    },
    {
      id: 3,
      username: "fire001",
      password: "fire123",
      role: "firestation",
      userType: "firestation",
      name: "중부소방서",
      address: "서울시 중구"
    },
    {
      id: 4,
      username: "amb001",
      password: "amb123",
      role: "ambulance",
      userType: "ambulance",
      name: "구급대원",
      vehicleNumber: "서울응급01호"
    }
  ],

  // 사용자 인증 함수
  authenticateUser: (username, password) => {
    const users = get().users;
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  },

  // 사용자 추가 (관리자 기능)
  addUser: (userData) => set((state) => ({
    users: [...state.users, { ...userData, id: Date.now() }]
  })),

  // 사용자 삭제 (관리자 기능)
  deleteUser: (userId) => set((state) => ({
    users: state.users.filter(user => user.id !== userId)
  }))
}));