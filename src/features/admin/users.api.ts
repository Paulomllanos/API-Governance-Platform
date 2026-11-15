import { httpRequest } from '../../shared/services/http-client';
import type { AppRole } from '../auth/types/auth.types';
export interface ManagedUser { id:string; email:string; displayName:string; isActive:boolean; createdAt:string; roles:{role:{name:AppRole}}[]; }
export const listUsers = () => httpRequest<ManagedUser[]>('/users');
export const createUser = (data:{email:string;displayName:string;password:string;roles:AppRole[]}) => httpRequest<ManagedUser>('/users',{method:'POST',body:JSON.stringify(data)});
export const updateUser = (id:string,data:{roles?:AppRole[];isActive?:boolean}) => httpRequest<ManagedUser>(`/users/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(data)});
