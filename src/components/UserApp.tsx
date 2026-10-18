import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppConfig } from '../types';
import { ArrowRight, ExternalLink, Facebook, Headphones, Heart, Instagram, Menu, Music2, Radio, Share2, Volume2, X } from 'lucide-react';

type RadioInfo = { title?: string; art?: string };
const PLAYER='https://sp.aljania.com/cp/widgets/player/single/?p=8120';
const fallbackCover='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="#1d223b"/><stop offset="1" stop-color="#070914"/></linearGradient></defs><rect width="640" height="640" fill="url(#a)"/><circle cx="320" cy="320" r="210" stroke="#fa2047" stroke-width="2" fill="none" opacity=".4"/><circle cx="320" cy="320" r="160" stroke="#fa2047" stroke-width="1" fill="none" opacity=".3"/><text x="320" y="316" font-family="Arial" font-weight="900" font-size="112" text-anchor="middle" fill="white">JCM</text><text x="320" y="386" font-family="Arial" font-weight="900" font-size="75" text-anchor="middle" fill="#fa2047">RADIO</text></svg>');
function safeUrl(value?:string){try {if(!value)return '';const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}}
export default function UserApp(){
 const [config,setConfig]=useState<AppConfig|null>(null);
 const [info,setInfo]=useState<RadioInfo|null>(null);
 const [metadataError,setMetadataError]=useState(false);
 const [menuOpen,setMenuOpen]=useState(false);
 const [splashDismissed,setSplashDismissed]=useState(false);
 useEffect(()=>onSnapshot(doc(db,'config','main'),snap=>{if(snap.exists())setConfig(snap.data() as AppConfig)},err=>console.warn('Configuración no disponible',err)),[]);
 useEffect(()=>{let active=true;const fetchInfo=async()=>{try{const result=await fetch('/api/radio-info',{cache:'no-store'});if(!result.ok)throw Error('metadata');const data=await result.json();if(active){setInfo(data);setMetadataError(false)}}catch{if(active)setMetadataError(true)}};void fetchInfo();const timer=setInterval(fetchInfo,30000);return()=>{active=false;clearInterval(timer)}},[]);
 const socials=config?.socialLinks;
 const items=[{title:'Instagram',href:safeUrl(socials?.instagram),icon:<Instagram size={20}/>},{title:'Facebook',href:safeUrl(socials?.facebook),icon:<Facebook size={20}/>},{title:'TikTok',href:safeUrl(socials?.tiktok),icon:<Music2 size={20}/>}].filter(i=>i.href);
 async function share(){const url=window.location.href;try{if(navigator.share)await navigator.share({title:'JCM Radio',text:'Escuchá JCM Radio en vivo',url});else if(navigator.clipboard){await navigator.clipboard.writeText(url);window.alert('Enlace copiado')}else window.prompt('Copiá este enlace',url)}catch(e){if((e as Error).name!=='AbortError')console.warn(e)}}
 const whatsapp=socials?.whatsapp?.replace(/\D/g,'');
 return <div className="jcm-root">
   <header className="jcm-header">
     <a className="jcm-logo" href="#inicio" aria-label="JCM Radio - Inicio"><span>JCM<span className="jcm-red">RADIO</span><span className="jcm-logo-play">▶</span></span><small>LA RADIO QUE TE ACOMPAÑA</small></a>
     <nav className={menuOpen?'jcm-nav jcm-nav-open':'jcm-nav'} aria-label="Navegación principal"><a onClick={()=>setMenuOpen(false)} href="#inicio">Inicio</a><a onClick={()=>setMenuOpen(false)} href="#escuchar">En vivo</a><a onClick={()=>setMenuOpen(false)} href="#comunidad">Comunidad</a>{safeUrl(config?.tvLink)&&<a onClick={()=>setMenuOpen(false)} href={safeUrl(config?.tvLink)} target="_blank" rel="noopener noreferrer">TV</a>}</nav>
     <div className="jcm-header-actions"><div className="jcm-socials">{items.map(i=><a key={i.title} href={i.href} target="_blank" rel="noopener noreferrer" aria-label={i.title}>{i.icon}</a>)}</div><a className="jcm-btn jcm-btn-red jcm-header-listen" href="#escuchar"><Radio size={18}/> ESCUCHAR AHORA</a><button className="jcm-mobile-menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?'Cerrar menú':'Abrir menú'} aria-expanded={menuOpen}>{menuOpen?<X/>:<Menu/>}</button></div>
   </header>
   <main id="inicio">
      <section className="jcm-hero">
       <div className="jcm-hero-art" aria-hidden="true"><div className="jcm-mic-body"><div className="jcm-mic-head"/><div className="jcm-mic-arm"/></div><span className="jcm-on-air">ON AIR</span><div className="jcm-eq">{Array.from({length:27},(_,i)=><i key={i} style={{height:(16+(i*37)%86)+'%'}}/>)}</div></div>
       <div className="jcm-hero-content">
         <span className="jcm-pill"><span className="jcm-live-dot"/> RADIO ONLINE 24/7</span>
         <h1><span>JCM <em>RADIO</em></span><br/>LA RADIO QUE<br/>TE ACOMPAÑA</h1>
         <p>Música, entretenimiento y buena compañía en un solo lugar. Conectados con vos, estés donde estés.</p>
         <div className="jcm-cta"><a href="#escuchar" className="jcm-btn jcm-btn-red"><Volume2 size={20}/> ESCUCHAR AHORA</a><button className="jcm-btn jcm-btn-outline" onClick={()=>void share()}><Share2 size={19}/> COMPARTIR RADIO</button></div>
       </div>
       <div id="escuchar" className="jcm-player">
        <div className="jcm-player-top"><img src={safeUrl(info?.art)||fallbackCover} onError={e=>{e.currentTarget.src=fallbackCover}} alt="Portada JCM Radio"/><div className="jcm-player-titles"><strong>JCM RADIO</strong><span>{info?.title||'Transmitiendo en vivo'}</span><small>{metadataError?'Escuchá desde el reproductor':'La radio que te acompaña'}</small></div><span className="jcm-live-label"><span className="jcm-live-dot"/> EN VIVO</span></div>
        <iframe title="Reproductor oficial JCM Radio" src={PLAYER} scrolling="no" allow="autoplay" className="jcm-iframe"/>
        <div className="jcm-player-bottom"><span>Presioná Play para escuchar</span><a href={PLAYER} target="_blank" rel="noopener noreferrer">Abrir player <ExternalLink size={13}/></a></div>
       </div>
      </section>
      <section className="jcm-features" aria-label="Nuestra radio"><div><span className="jcm-feature-icon purple"><Music2/></span><p><strong>MÚSICA</strong><small>Para todos los gustos</small></p></div><div><span className="jcm-feature-icon blue"><Headphones/></span><p><strong>ENTRETENIMIENTO</strong><small>Siempre con vos</small></p></div><div><span className="jcm-feature-icon cyan"><Radio/></span><p><strong>EN VIVO</strong><small>Conectados 24/7</small></p></div><div><span className="jcm-feature-icon red"><Heart/></span><p><strong>COMUNIDAD</strong><small>Más que una radio</small></p></div></section>
      <section id="comunidad" className="jcm-community"><div className="jcm-section-heading"><span/><h2>SIEMPRE CONECTADOS</h2></div><p>Seguinos en nuestras redes, compartí la radio con tus amigos y viví la música con nosotros.</p><div className="jcm-community-actions"><button onClick={()=>void share()} className="jcm-btn jcm-btn-outline"><Share2 size={18}/> Compartir JCM Radio <ArrowRight size={16}/></button>{whatsapp&&<a className="jcm-btn jcm-btn-red" href={'https://wa.me/'+whatsapp} target="_blank" rel="noopener noreferrer">Escribinos por WhatsApp <ArrowRight size={16}/></a>}</div></section>
   </main>
   <footer className="jcm-footer"><div className="jcm-logo"><span>JCM<span className="jcm-red">RADIO</span></span><small>LA RADIO QUE TE ACOMPAÑA</small></div><div className="jcm-socials">{items.map(i=><a key={i.title} href={i.href} target="_blank" rel="noopener noreferrer" aria-label={i.title}>{i.icon}</a>)}</div><a href={import.meta.env.BASE_URL + "admin"} className="jcm-admin">Panel de control</a></footer>
   {Boolean(config?.splashAd?.enabled&&safeUrl(config.splashAd.imageUrl)&&!splashDismissed)&&<div role="dialog" aria-modal="true" aria-label="Anuncio de JCM Radio" className="jcm-splash"><img src={safeUrl(config?.splashAd?.imageUrl)} alt="Anuncio de JCM Radio"/><button className="jcm-btn jcm-btn-red" onClick={()=>setSplashDismissed(true)}>Entrar a la radio</button></div>}
 </div>
}