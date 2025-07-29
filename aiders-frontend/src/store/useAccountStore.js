import { create } from "zustand"

export const useAccountStore = create((set, get) => ({
  accounts: [
    {
      id: 1,
      type: "병원",
      accountId: "hospital001",
      address: "서울시 강남구 테헤란로 123",
      tempPassword: "temp123!",
      passkey: "PK-H001-2024",
    },
    {
      id: 2,
      type: "소방서",
      accountId: "fire001",
      address: "서울시 중구 세종대로 110",
      tempPassword: "temp456!",
      passkey: "PK-F001-2024",
    },
    {
      id: 3,
      type: "구급대원",
      accountId: "amb001",
      vehicleNumber: "서울응급01호",
      tempPassword: "temp789!",
      passkey: "PK-A001-2024",
    },
  ],

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

  deleteAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
    })),
}))