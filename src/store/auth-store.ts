"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "ADMIN" | "OWNER" | "TENANT";

export interface AuthUser {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setSession: (user: AuthUser, token: string | null) => void;
  clearSession: () => void;
}

function writeAuthCookies(user: AuthUser, token: string | null) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `livo_role=${encodeURIComponent(user.role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (token) {
    document.cookie = `livo_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "livo_role=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "livo_token=; path=/; max-age=0; SameSite=Lax";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => {
        if (typeof window !== "undefined" && token) {
          localStorage.setItem("accessToken", token);
        }
        writeAuthCookies(user, token);
        set({ user, token });
      },
      clearSession: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        clearAuthCookies();
        set({ user: null, token: null });
      },
    }),
    {
      name: "livo-auth-storage",
    },
  ),
);

export function getRoleDashboardPath(role?: UserRole | string | null): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/dashboard/admin";
    case "OWNER":
      return "/dashboard/owner";
    case "TENANT":
    default:
      return "/dashboard/tenant";
  }
}
