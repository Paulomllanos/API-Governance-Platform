import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import type { AppRole } from '../auth/types/auth.types';
import { createUser, listUsers, updateUser, type ManagedUser } from './users.api';
import '../settings/management.css';

const ROLES:AppRole[]=['ADMIN','REVIEWER','DEVELOPER'];
export function UsersPage(){
  const {user}=useAuth();
  const [items,setItems]=useState<ManagedUser[]>([]);
  const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');
  const [roles,setRoles]=useState<AppRole[]>(['DEVELOPER']);
  const [editRoles,setEditRoles]=useState<Record<string,AppRole[]>>({});
  const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  async function load(){ const users=await listUsers();setItems(users);setEditRoles(Object.fromEntries(users.map(u=>[u.id,u.roles.map(r=>r.role.name)])) as Record<string,AppRole[]>); }
  useEffect(()=>{let active=true;void listUsers().then(users=>{if(active){setItems(users);setEditRoles(Object.fromEntries(users.map(u=>[u.id,u.roles.map(r=>r.role.name)])) as Record<string,AppRole[]>);}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Error de consulta')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  function toggle(list:AppRole[],role:AppRole){return list.includes(role)?list.filter(r=>r!==role):[...list,role]}
  async function create(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setMessage('');try{await createUser({email,displayName:name,password,roles});setEmail('');setName('');setPassword('');setRoles(['DEVELOPER']);await load();setMessage('Usuario creado correctamente.')}catch(e){setError(e instanceof Error?e.message:'Error al crear usuario')}finally{setBusy(false)}}
  async function update(id:string,data:{roles?:AppRole[];isActive?:boolean}){setBusy(true);setError('');setMessage('');try{await updateUser(id,data);await load();setMessage('Usuario actualizado.')}catch(e){setError(e instanceof Error?e.message:'Error al actualizar')}finally{setBusy(false)}}
  if(!user?.roles.includes('ADMIN'))return <div className="management-page"><h1>Acceso denegado</h1><p>Solo ADMIN puede administrar usuarios.</p></div>;
  return <div className="management-page"><h1>Administración de usuarios</h1><p>Registro, asignación de roles y activación de cuentas.</p>
    {error&&<p role="alert" className="management-error">{error}</p>}{message&&<p role="status" className="management-success">{message}</p>}
    <div className="management-grid"><form className="management-card" onSubmit={e=>{void create(e)}}><h2>Nuevo usuario</h2>
      <label>Nombre<input required minLength={2} value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Correo<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label>Contraseña inicial (mínimo 12 caracteres)<input required type="password" minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <fieldset><legend>Roles</legend><div className="management-roles">{ROLES.map(role=><label key={role}><input type="checkbox" checked={roles.includes(role)} onChange={()=>setRoles(current=>toggle(current,role))}/>{role}</label>)}</div></fieldset>
      <button type="submit" disabled={busy||roles.length===0}>Crear usuario</button>
    </form><div className="management-card"><h2>Política de roles</h2><p><strong>ADMIN:</strong> administra usuarios, aprobaciones y publicación.</p><p><strong>REVIEWER:</strong> evalúa y decide revisiones.</p><p><strong>DEVELOPER:</strong> registra APIs, carga documentos y solicita revisión.</p><p>El backend impide la desactivación del último administrador activo y que te quites tu propio acceso de administración.</p></div></div>
    <h2 style={{marginTop:28}}>Usuarios registrados</h2>{loading&&<p role="status">Cargando usuarios...</p>}
    <div className="management-table-wrap"><table className="management-table"><thead><tr><th>Nombre y correo</th><th>Estado</th><th>Roles</th><th>Acciones</th></tr></thead><tbody>{items.map(u=><tr key={u.id}>
      <td><strong>{u.displayName}</strong><div>{u.email}</div></td><td>{u.isActive?'Activo':'Inactivo'}</td>
      <td><div className="management-roles">{ROLES.map(role=><label key={role}><input type="checkbox" checked={(editRoles[u.id]??[]).includes(role)} onChange={()=>setEditRoles(current=>({...current,[u.id]:toggle(current[u.id]??[],role)}))}/>{role}</label>)}</div></td>
      <td><div className="management-actions"><button disabled={busy||(editRoles[u.id]??[]).length===0} onClick={()=>{void update(u.id,{roles:editRoles[u.id]})}}>Guardar roles</button><button disabled={busy||u.id===user?.id} onClick={()=>{void update(u.id,{isActive:!u.isActive})}}>{u.isActive?'Desactivar':'Activar'}</button></div></td>
    </tr>)}</tbody></table></div>
  </div>;
}
