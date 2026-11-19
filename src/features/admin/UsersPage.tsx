import { useEffect, useState, type FormEvent } from 'react';
import { Check, Info, LockKeyhole, Mail, Plus, Save, ShieldCheck, UserPlus, Users, UserRound, Power, RotateCcw } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import type { AppRole } from '../auth/types/auth.types';
import { createUser, listUsers, updateUser, type ManagedUser } from './users.api';
import '../settings/management.css';
import './UsersPage.css';

const ROLES: AppRole[] = ['ADMIN', 'REVIEWER', 'DEVELOPER'];
const POLICIES: { role: AppRole; description: string }[] = [
  { role: 'ADMIN', description: 'Administra usuarios, aprobaciones y publicación.' },
  { role: 'REVIEWER', description: 'Evalúa y decide revisiones.' },
  { role: 'DEVELOPER', description: 'Registra APIs, carga documentos y solicita revisión.' },
];

export function UsersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ManagedUser[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<AppRole[]>(['DEVELOPER']);
  const [editRoles, setEditRoles] = useState<Record<string, AppRole[]>>({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  function setUsers(users: ManagedUser[]) {
    setItems(users);
    setEditRoles(Object.fromEntries(users.map(u => [u.id, u.roles.map(r => r.role.name)])) as Record<string, AppRole[]>);
  }

  async function load() {
    const users = await listUsers();
    setUsers(users);
  }

  useEffect(() => {
    if (!user?.roles.includes('ADMIN')) return;
    let active = true;
    void listUsers()
      .then(users => { if (active) setUsers(users); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Error de consulta'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, user?.roles.join(',')]);

  function toggle(current: AppRole[], role: AppRole) {
    return current.includes(role) ? current.filter(r => r !== role) : [...current, role];
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      await createUser({ email, displayName: name, password, roles });
      setEmail(''); setName(''); setPassword(''); setRoles(['DEVELOPER']);
      await load();
      setMessage('Usuario creado correctamente.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al crear usuario');
    } finally { setBusy(false); }
  }

  async function update(id: string, data: { roles?: AppRole[]; isActive?: boolean }) {
    setBusy(true); setError(''); setMessage('');
    try {
      await updateUser(id, data);
      await load();
      setMessage('Usuario actualizado.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al actualizar');
    } finally { setBusy(false); }
  }

  if (!user?.roles.includes('ADMIN')) {
    return <div className="management-page"><h1>Acceso denegado</h1><p>Solo ADMIN puede administrar usuarios.</p></div>;
  }

  return (
    <div className="management-page users-page">
      <header className="users-page__heading">
        <div className="users-page__hero-icon"><Users size={27} aria-hidden="true" /></div>
        <div><h1>Administración de usuarios</h1><p>Registro, asignación de roles y activación de cuentas.</p></div>
      </header>

      {error && <p role="alert" className="management-error users-page__alert">{error}</p>}
      {message && <p role="status" className="management-success users-page__alert"><Check size={17} aria-hidden="true" />{message}</p>}

      <div className="users-page__top">
        <form className="users-page__panel users-page__form" onSubmit={event => { void create(event); }}>
          <h2><span className="users-page__icon"><UserPlus size={21} aria-hidden="true" /></span>Nuevo usuario</h2>
          <label>Nombre
            <span className="users-page__input"><UserRound size={17} aria-hidden="true" /><input required minLength={2} value={name} placeholder="Ingrese el nombre completo" onChange={event => setName(event.target.value)} /></span>
          </label>
          <label>Correo
            <span className="users-page__input"><Mail size={17} aria-hidden="true" /><input required type="email" value={email} placeholder="Ingrese el correo electrónico" onChange={event => setEmail(event.target.value)} /></span>
          </label>
          <label>Contraseña inicial (mínimo 12 caracteres)
            <span className="users-page__input"><LockKeyhole size={17} aria-hidden="true" /><input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} placeholder="Ingrese una contraseña segura" onChange={event => setPassword(event.target.value)} /></span>
          </label>
          <fieldset className="users-page__fieldset"><legend>Roles</legend>
            <div className="users-page__role-options">{ROLES.map(role => (
              <label key={role}><input type="checkbox" checked={roles.includes(role)} onChange={() => setRoles(current => toggle(current, role))} />{role}</label>
            ))}</div>
          </fieldset>
          <button type="submit" className="users-page__primary" disabled={busy || roles.length === 0}><Plus size={18} aria-hidden="true" />Crear usuario</button>
        </form>

        <section className="users-page__panel users-page__policies" aria-labelledby="role-policy-title">
          <h2 id="role-policy-title"><span className="users-page__icon"><ShieldCheck size={21} aria-hidden="true" /></span>Política de roles</h2>
          <div className="users-page__policy-list">{POLICIES.map(policy => (
            <div className="users-page__policy" key={policy.role}><strong>{policy.role}</strong><span>{policy.description}</span></div>
          ))}</div>
          <div className="users-page__notice"><Info size={20} aria-hidden="true" /><span>El backend impide la desactivación del último administrador activo y que te quites tu propio acceso de administración.</span></div>
        </section>
      </div>

      <section className="users-page__panel users-page__listing" aria-labelledby="registered-users-title">
        <div className="users-page__listing-header">
          <h2 id="registered-users-title"><span className="users-page__icon"><Users size={21} aria-hidden="true" /></span>Usuarios registrados</h2>
          <span className="users-page__count">{items.length} usuarios cargados</span>
        </div>
        {loading && <p role="status" className="users-page__state">Cargando usuarios...</p>}
        <div className="users-page__table-scroll">
          <table className="users-page__table">
            <thead><tr><th scope="col">Nombre y correo</th><th scope="col">Estado</th><th scope="col">Roles</th><th scope="col">Acciones</th></tr></thead>
            <tbody>
              {items.map(u => {
                const selectedRoles = editRoles[u.id] ?? [];
                const actualRoles = u.roles.map(r => r.role.name);
                const unchanged = ROLES.every(role => selectedRoles.includes(role) === actualRoles.includes(role));
                return <tr key={u.id}>
                  <td><div className="users-page__identity"><strong>{u.displayName}</strong><small>{u.email}</small></div></td>
                  <td><span className={`users-page__status ${u.isActive ? 'users-page__status--active' : 'users-page__status--inactive'}`}><span aria-hidden="true" />{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                  <td><div className="users-page__table-roles">{ROLES.map(role => <label key={role}><input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => setEditRoles(current => ({ ...current, [u.id]: toggle(current[u.id] ?? [], role) }))} />{role}</label>)}</div></td>
                  <td><div className="users-page__actions">
                    <button type="button" className="users-page__save" disabled={busy || selectedRoles.length === 0 || unchanged} onClick={() => { void update(u.id, { roles: selectedRoles }); }}><Save size={15} aria-hidden="true" />Guardar roles</button>
                    <button type="button" className="users-page__secondary" disabled={busy || u.id === user?.id} onClick={() => { void update(u.id, { isActive: !u.isActive }); }}>{u.isActive ? <Power size={15} aria-hidden="true" /> : <RotateCcw size={15} aria-hidden="true" />}{u.isActive ? 'Desactivar' : 'Activar'}</button>
                  </div></td>
                </tr>;
              })}
              {!loading && items.length === 0 && <tr><td colSpan={4} className="users-page__empty">Todavía no hay usuarios registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
