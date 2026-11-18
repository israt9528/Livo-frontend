"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUser, UserRole } from "@/types";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, accessToken: string) => void;
  updateUser: (user: Partial<IUser>) => void;
  logout: () => void;
}

const setSessionCookies = (token: string, role: UserRole) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `livo_access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `livo_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const clearSessionCookies = () => {
  if (typeof document === "undefined") return;
  document.cookie = "livo_access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "livo_user_role=; path=/; max-age=0; SameSite=Lax";
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        setSessionCookies(accessToken, user.role);
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      logout: () => {
        clearSessionCookies();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "livo-auth-storage",
    },
  ),
);
