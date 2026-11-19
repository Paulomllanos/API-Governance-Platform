
export type AppRole =
  | 'ADMIN'
  | 'REVIEWER'
  | 'DEVELOPER';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  roles: AppRole[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUser;
}
