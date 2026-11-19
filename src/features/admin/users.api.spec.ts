import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUser, listUsers, updateUser } from './users.api';
import { searchAll } from '../search/search.api';
import { markNotificationRead } from '../notifications/notifications.api';
import { updateProfile } from '../settings/settings.api';
import { httpRequest } from '../../shared/services/http-client';
vi.mock('../../shared/services/http-client',()=>({httpRequest:vi.fn()}));
const requestMock=vi.mocked(httpRequest);
beforeEach(()=>requestMock.mockReset());
describe('Servicios funcionales 7.7.23',()=>{
  it('ADM-FE-01: listado de usuarios consulta /users',async()=>{requestMock.mockResolvedValueOnce([]);await listUsers();expect(requestMock).toHaveBeenCalledWith('/users')});
  it('ADM-FE-02: creación usa POST con roles',async()=>{requestMock.mockResolvedValueOnce({});const data={email:'qa@example.test',displayName:'QA',password:'TestPassword-42!',roles:['REVIEWER' as const]};await createUser(data);expect(requestMock).toHaveBeenCalledWith('/users',{method:'POST',body:JSON.stringify(data)})});
  it('ADM-FE-03: cambio de rol usa PATCH',async()=>{requestMock.mockResolvedValueOnce({});await updateUser('user-01',{roles:['ADMIN']});expect(requestMock).toHaveBeenCalledWith('/users/user-01',{method:'PATCH',body:JSON.stringify({roles:['ADMIN']})})});
  it('ADM-FE-04: búsqueda codifica caracteres',async()=>{requestMock.mockResolvedValueOnce({});await searchAll('clientes & ventas');expect(requestMock).toHaveBeenCalledWith('/search?q=clientes%20%26%20ventas')});
  it('ADM-FE-05: marcar notificación leída',async()=>{requestMock.mockResolvedValueOnce({});await markNotificationRead('transition-01');expect(requestMock).toHaveBeenCalledWith('/notifications/transition-01/read',{method:'PATCH'})});
  it('ADM-FE-06: actualización perfil usa PATCH',async()=>{requestMock.mockResolvedValueOnce({});await updateProfile({displayName:'Nombre'});expect(requestMock).toHaveBeenCalledWith('/profile',{method:'PATCH',body:JSON.stringify({displayName:'Nombre'})})});
});
