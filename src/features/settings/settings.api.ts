import { httpRequest } from '../../shared/services/http-client';
import type { AppRole } from '../auth/types/auth.types';
export interface PublicProfile { id: string; displayName: string; email: string; isActive: boolean; roles: {role:{name: AppRole}}[]; }
export const fetchProfile = () => httpRequest<PublicProfile>('/profile');
export const updateProfile = (data: { displayName?: string; email?: string; currentPassword?: string }) => httpRequest<PublicProfile>('/profile', { method: 'PATCH', body: JSON.stringify(data) });
export const changePassword = (data: {currentPassword:string; newPassword:string}) => httpRequest<{message:string}>('/profile/change-password', {method:'POST',body: JSON.stringify(data)});
