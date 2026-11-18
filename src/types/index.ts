export type UserRole = "ADMIN" | "OWNER" | "TENANT";

export interface IUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isSuspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken?: string;
}

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: T;
}

export interface IApiErrorSource {
  path: string | number;
  message: string;
}

export interface IApiErrorResponse {
  success: false;
  statusCode: number;
  name: string;
  message: string;
  errorSources?: IApiErrorSource[];
}
