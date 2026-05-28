export type UserRole = 'ADMIN' | 'KITCHEN' | 'FLOOR';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ManagedUser extends AuthUser {
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
  timestamp: string;
}

export interface MeResponse {
  user: AuthUser;
  timestamp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UsersResponse {
  users: ManagedUser[];
  timestamp: string;
}

export interface UserMutationResponse {
  user: ManagedUser;
  timestamp: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface ResetUserPasswordPayload {
  password: string;
}
