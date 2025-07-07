import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isAuthenticated: boolean;
  adminId: number | null;
  adminEmail: string | null;
  login: (adminId: number, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      adminId: null,
      adminEmail: null,
      
      login: (adminId: number, email: string) => {
        set({
          isAuthenticated: true,
          adminId,
          adminEmail: email
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          adminId: null,
          adminEmail: null
        });
      }
    }),
    {
      name: 'grocery-auth'
    }
  )
);
