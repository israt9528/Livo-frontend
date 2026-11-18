import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import type { IApiErrorResponse } from "@/types";

export class ApiClientError extends Error {
  public statusCode: number;
  public errorSources?: Array<{ path: string | number; message: string }>;

  constructor(
    message: string,
    statusCode = 500,
    errorSources?: Array<{ path: string | number; message: string }>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errorSources = errorSources;
  }
}

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://livo-k21s.onrender.com/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<IApiErrorResponse>) => {
    const statusCode = error.response?.status || 500;
    const data = error.response?.data;
    const message =
      data?.message || error.message || "An unexpected error occurred";

    if (statusCode === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(
      new ApiClientError(message, statusCode, data?.errorSources),
    );
  },
);
