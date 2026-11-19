import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { fetchNotifications,markNotificationRead,type NotificationsResponse } from './notifications.api';
import './notification-bell.css';
export function NotificationBell(){
  const navigate=useNavigate();const [open,setOpen]=useState(false);const [data,setData]=useState<NotificationsResponse>({unread:0,items:[]});const [error,setError]=useState('');const [loading,setLoading]=useState(false);
  async function load(){setLoading(true);try{setData(await fetchNotifications());setError('')}catch(e){setError(e instanceof Error?e.message:'No se pudieron consultar las notificaciones')}finally{setLoading(false)}}
  useEffect(()=>{void load();const interval=window.setInterval(()=>{void load()},60000);return()=>window.clearInterval(interval)},[]);
  async function openItem(id:string,url:string){try{await markNotificationRead(id);setOpen(false);navigate(url);void load()}catch(e){setError(e instanceof Error?e.message:'No se pudo marcar la notificación')}}
  return <div className="agp-bell"><button type="button" className="topbar-icon-button" aria-label="Notificaciones" aria-expanded={open} onClick={()=>{setOpen(v=>!v);if(!open)void load()}}><Bell size={18}/>{data.unread>0&&<span className="agp-bell-counter">{data.unread>99?'99+':data.unread}</span>}</button>
    {open&&<div className="agp-bell-menu" role="region" aria-label="Notificaciones recientes"><div className="agp-bell-heading"><strong>Notificaciones</strong><button type="button" onClick={()=>setOpen(false)}>Cerrar</button></div>{loading&&<p>Actualizando...</p>}{error&&<p role="alert">{error}</p>}{data.items.length===0&&<p>Sin notificaciones recientes.</p>}{data.items.map(item=><button type="button" key={item.id} className={item.read?'agp-bell-read':'agp-bell-unread'} onClick={()=>{void openItem(item.id,item.url)}}><strong>{item.title}</strong><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString('es-CL')}</small></button>)}</div>}
  </div>
}
