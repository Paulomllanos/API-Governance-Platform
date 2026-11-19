/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useAuth } from '../auth/context/AuthContext';
import { listUsers, createUser } from './users.api';
import { UsersPage } from './UsersPage';
vi.mock('../auth/context/AuthContext',()=>({useAuth:vi.fn()}));
vi.mock('./users.api',()=>({listUsers:vi.fn(),createUser:vi.fn(),updateUser:vi.fn()}));
const mockedAuth=vi.mocked(useAuth);
const mockedList=vi.mocked(listUsers);
const mockedCreate=vi.mocked(createUser);
const admin={id:'qa-admin',name:'QA Admin',email:'qa@example.test',role:'Administrador',roles:['ADMIN' as const]};
function setUser(roles:('ADMIN'|'DEVELOPER')[]){mockedAuth.mockReturnValue({user:{...admin,roles},isAuthenticated:true,isInitializing:false,login:vi.fn(),logout:vi.fn(),refreshUser:vi.fn()})}
afterEach(()=>{cleanup();vi.clearAllMocks()});
describe('Administración de usuarios',()=>{
  it('UI-ADM-01: ADMIN visualiza formulario de registro',async()=>{
    setUser(['ADMIN']);mockedList.mockResolvedValue([]);
    render(<UsersPage/>);
    expect(await screen.findByRole('heading',{name:'Nuevo usuario'})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Crear usuario'})).toBeInTheDocument();
  });
  it('UI-ADM-02: un usuario sin ADMIN no accede al formulario',()=>{
    setUser(['DEVELOPER']);render(<UsersPage/>);
    expect(screen.getByRole('heading',{name:'Acceso denegado'})).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Crear usuario'})).not.toBeInTheDocument();
  });
  it('UI-ADM-03: registra usuario con rol DEVELOPER',async()=>{
    setUser(['ADMIN']);mockedList.mockResolvedValue([]);mockedCreate.mockResolvedValue({} as Awaited<ReturnType<typeof createUser>>);
    render(<UsersPage/>);
    await screen.findByRole('heading',{name:'Nuevo usuario'});
    fireEvent.change(screen.getByLabelText('Nombre'),{target:{value:'Usuario Demo'}});
    fireEvent.change(screen.getByLabelText('Correo'),{target:{value:'demo@example.test'}});
    fireEvent.change(screen.getByLabelText(/Contraseña inicial/),{target:{value:'PasswordTemporal-123!'}});
    fireEvent.click(screen.getByRole('button',{name:'Crear usuario'}));
    expect(await screen.findByText('Usuario creado correctamente.')).toBeInTheDocument();
    expect(mockedCreate).toHaveBeenCalledWith({email:'demo@example.test',displayName:'Usuario Demo',password:'PasswordTemporal-123!',roles:['DEVELOPER']});
  });
});
