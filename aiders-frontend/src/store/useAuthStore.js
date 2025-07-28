import { create } from "zustand"

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  userType: null,
  login: ({ user, accessToken, userType }) => 
    set({ user, accessToken, userType }),
  logout: () => 
    set({ user: null, accessToken: null, userType: null }),
}))