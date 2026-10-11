import {assetUrl} from './assets';
import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,useLocation} from 'react-router-dom';
import type {Dataset} from './model';
import {Shell} from './components';
import {Home} from './home';
import {Explorer} from './explorer';
import {Detail} from './detail';
import {Methodology,Related,Gaps,About} from './pages';
import './styles.css';
function App(){const [data,setData]=useState<Dataset|null>(null),[error,setError]=useState(false);const loc=useLocation();useEffect(()=>{fetch(assetUrl('/data.json')).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(setData).catch(()=>setError(true))},[]);useEffect(()=>{
 /* O GitHub Pages serve os diretórios com barra final, pelo que loc.pathname é
    '/explorar/' e não '/explorar'. Sem esta normalização as rotas sem parâmetros
    caíam no título de reserva «Página» e o explorador não guardava os filtros. */
 const path=loc.pathname.replace(/\/+$/,'')||'/';
 if(path==='/explorar')sessionStorage.setItem('explorer-url',path+loc.search);
 let title='Observatório dos Grupos de Trabalho';
 if(path.startsWith('/grupos/'))title=(data?.groups.find(g=>g.id===path.split('/')[2])?.display_name||'Grupo de trabalho')+' | Observatório';
 else if(path!=='/')title=({'/explorar':'Explorar grupos de trabalho','/metodologia':'Metodologia','/lacunas':'Lacunas da pesquisa','/outras-estruturas':'Outras estruturas','/sobre':'Sobre o projeto'}[path]||'Página')+' | Observatório';
 document.title=title;
},[loc,data]);
 if(error)return <div className="load-state"><h1>Não foi possível carregar os dados.</h1><p>Tente novamente ou descarregue o <a href={assetUrl('/fonte-original.xlsx')}>ficheiro Excel original</a>.</p><button onClick={()=>location.reload()}>Tentar novamente</button></div>;
 if(!data)return <div className="load-state" role="status"><div className="loader"/><p>A carregar o inventário e as fontes…</p></div>;
 return <Shell cutoff={data.cutoff}><Routes><Route path="/" element={<Home data={data}/>}/><Route path="/explorar" element={<Explorer data={data}/>}/><Route path="/grupos/:id" element={<Detail data={data}/>}/><Route path="/metodologia" element={<Methodology data={data}/>}/><Route path="/outras-estruturas" element={<Related data={data}/>}/><Route path="/lacunas" element={<Gaps data={data}/>}/><Route path="/sobre" element={<About data={data}/>}/><Route path="*" element={<div className="page"><h1>Página não encontrada.</h1><a href={assetUrl('/')}>Voltar ao panorama</a></div>}/></Routes></Shell>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL}><App/></BrowserRouter></React.StrictMode>);
