import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { fetchProfile, updateProfile, changePassword } from './settings.api';
import './management.css';

export function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [name,setName]=useState(user?.name??'');
  const [email,setEmail]=useState(user?.email??'');
  const [current,setCurrent]=useState('');
  const [oldPassword,setOldPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{let active=true; void fetchProfile().then(p=>{if(active){setName(p.displayName);setEmail(p.email)}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'No se pudo cargar el perfil')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setMessage('');try { await updateProfile({displayName:name,email,currentPassword:current||undefined});await refreshUser();setCurrent('');setMessage('Perfil actualizado.'); } catch(e){setError(e instanceof Error?e.message:'Error al guardar')}finally{setBusy(false)}}
  async function password(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setMessage('');try{await changePassword({currentPassword:oldPassword,newPassword});setOldPassword('');setNewPassword('');await logout();window.location.assign('/login');}catch(e){setError(e instanceof Error?e.message:'No se pudo modificar la contraseña')}finally{setBusy(false)}}
  return <div className="management-page"><h1>Configuración de la cuenta</h1><p>Administra tus datos personales y la seguridad de acceso.</p>
    {user?.roles.includes('ADMIN')&&<p><Link to="/app/settings/users">Administración de usuarios y roles →</Link></p>}
    {loading&&<p role="status">Cargando perfil...</p>}{error&&<p role="alert" className="management-error">{error}</p>}{message&&<p role="status" className="management-success">{message}</p>}
    <div className="management-grid"><form className="management-card" onSubmit={e=>{void save(e)}}><h2>Mi perfil</h2><label>Nombre completo<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label><label>Correo electrónico<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña actual (obligatoria para cambiar correo)<input type="password" autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)}/></label><button disabled={busy||loading} type="submit">Guardar perfil</button></form>
    <form className="management-card" onSubmit={e=>{void password(e)}}><h2>Cambiar contraseña</h2><label>Contraseña actual<input required type="password" autoComplete="current-password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)}/></label><label>Nueva contraseña (12 a 128 caracteres)<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label><p>Después del cambio cerrarás sesión en este navegador.</p><button disabled={busy||loading} type="submit">Cambiar contraseña</button></form></div>
  </div>;
}
