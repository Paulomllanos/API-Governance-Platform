import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchAll, type SearchResponse } from './search.api';
import './global-search.css';

export function GlobalSearch(){
  const navigate=useNavigate();
  const [q,setQ]=useState('');const [data,setData]=useState<SearchResponse|null>(null);
  const [error,setError]=useState('');const [loading,setLoading]=useState(false);const [open,setOpen]=useState(false);
  useEffect(()=>{const query=q.trim();if(query.length<2){setData(null);setLoading(false);setError('');return}let active=true;setLoading(true);const timeout=window.setTimeout(()=>{void searchAll(query).then(response=>{if(active){setData(response);setError('')}}).catch(e=>{if(active){setData(null);setError(e instanceof Error?e.message:'Búsqueda no disponible')}}).finally(()=>{if(active)setLoading(false)})},300);return()=>{active=false;window.clearTimeout(timeout)}},[q]);
  function go(url:string){setOpen(false);setQ('');setData(null);navigate(url)}
  return <div className="agp-global-search" onKeyDown={event=>{if(event.key==='Escape')setOpen(false)}}>
    <div className="topbar-search"><Search size={17}/><input type="search" aria-label="Buscar" placeholder="Buscar APIs, evaluaciones, hallazgos..." value={q} onFocus={()=>setOpen(true)} onChange={e=>{setQ(e.target.value);setOpen(true)}}/></div>
    {open&&q.trim().length>=2&&<div className="agp-search-results" role="region" aria-label="Resultados de búsqueda">
      {loading&&<p>Buscando...</p>}{error&&<p role="alert">{error}</p>}
      {data&&(['apis','evaluations','findings'] as const).map(group=><section key={group}><h3>{{apis:'APIs',evaluations:'Evaluaciones',findings:'Hallazgos'}[group]}</h3>{data[group].length?data[group].map(item=><button key={item.id} type="button" onClick={()=>go(item.url)}><strong>{item.title}</strong><small>{item.description}</small></button>):<p>Sin resultados</p>}</section>)}
      <button className="agp-search-close" onClick={()=>setOpen(false)} type="button">Cerrar resultados</button>
    </div>}
  </div>
}
