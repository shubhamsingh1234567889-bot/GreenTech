import React, { useState } from 'react'
import { Leaf, Search, Wind, Factory, Recycle, Zap, Salad, ShieldCheck, Globe2, Activity, ArrowUpRight, Menu } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''
const modules = [
  {id:'carbon', title:'Carbon Ledger', sub:'Scope 1 · 2 · 3', icon:Factory},
  {id:'claims', title:'Claim Review', sub:'Evidence triage', icon:ShieldCheck},
  {id:'waste', title:'Byproduct Exchange', sub:'Waste → resource', icon:Recycle},
  {id:'energy', title:'Energy Balancer', sub:'Renewables + storage', icon:Zap},
  {id:'food', title:'Food Rescue', sub:'Surplus coordination', icon:Salad},
]
async function request(path, options={}) {
  const r = await fetch(`${API}${path}`, {headers:{'Content-Type':'application/json'}, ...options})
  const data = await r.json()
  if (!r.ok) throw new Error(data.detail || 'Request failed')
  return data
}
function Result({data}) { return data && <pre className="result">{JSON.stringify(data,null,2)}</pre> }
export default function App(){
  const [tab,setTab]=useState('carbon'), [result,setResult]=useState(null), [error,setError]=useState(''), [busy,setBusy]=useState(false)
  const [city,setCity]=useState('Delhi'), [globalQ,setGlobalQ]=useState('solar panel recycling facilities in India')
  const [form,setForm]=useState({electricity_kwh:1200,fuel_litres:80,travel_km:350,supplier_emissions_kg:250})
  const [claim,setClaim]=useState('Our product is 100% sustainable'), [evidence,setEvidence]=useState('Annual sustainability report\nSupplier emissions spreadsheet')
  const [waste,setWaste]=useState({material:'spent grain',quantity_kg:500,city:'Delhi',notes:''})
  const [energy,setEnergy]=useState({solar_kw:45,wind_kw:12,demand_kw:50,storage_kwh:8})
  const [food,setFood]=useState({food_type:'Prepared meals',quantity_kg:25,available_hours:5,city:'Delhi'})
  const [aqi,setAqi]=useState(null)
  const active=modules.find(m=>m.id===tab)
  const run=async(path,body)=>{setBusy(true);setError('');setResult(null);try{setResult(await request(path,{method:'POST',body:JSON.stringify(body)}))}catch(e){setError(e.message)}finally{setBusy(false)}}
  const searchAqi=async()=>{setBusy(true);setError('');setAqi(null);try{setAqi(await request(`/api/aqi?city=${encodeURIComponent(city)}`))}catch(e){setError(e.message)}finally{setBusy(false)}}
  const globalSearch=async()=>{setBusy(true);setError('');try{setResult(await request(`/api/global-search?q=${encodeURIComponent(globalQ)}`))}catch(e){setError(e.message)}finally{setBusy(false)}}
  const field=(obj,setObj,key,label,type='number')=><label className="field">{label}<input type={type} value={obj[key]} onChange={e=>setObj({...obj,[key]:type==='number'?Number(e.target.value):e.target.value})}/></label>
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Leaf size={22}/></div><div><b>greenpulse</b><small>IMPACT INTELLIGENCE</small></div></div>
      <div className="side-label">WORKSPACE</div>
      {modules.map(m=><button key={m.id} className={`nav ${tab===m.id?'selected':''}`} onClick={()=>{setTab(m.id);setResult(null);setError('')}}><m.icon size={18}/><span>{m.title}</span><ArrowUpRight size={14}/></button>)}
      <div className="side-label tools-label">LIVE DATA</div>
      <button className={`nav ${tab==='global'?'selected':''}`} onClick={()=>setTab('global')}><Globe2 size={18}/>Global Explorer</button>
      <button className={`nav ${tab==='aqi'?'selected':''}`} onClick={()=>setTab('aqi')}><Wind size={18}/>City air quality</button>
      <div className="sidebar-bottom"><div className="pulse"></div><span>Demo environment</span><small>API connections optional</small></div>
    </aside>
    <main className="main">
      <header><div className="crumb">PLATFORM / <b>{tab==='global'?'GLOBAL EXPLORER':tab==='aqi'?'AIR QUALITY':active?.title.toUpperCase()}</b></div><div className="header-right"><span className="live-dot"></span> SYSTEM ONLINE <div className="avatar">GP</div></div></header>
      <section className="hero"><div><div className="eyebrow"><span></span> SUSTAINABILITY OPERATIONS, CONNECTED</div><h1>Make every resource<br/><em>count.</em></h1><p>One workspace to measure impact, validate evidence and turn waste into opportunity.</p></div><div className="hero-art"><div className="orbit o1"></div><div className="orbit o2"></div><div className="planet"><Leaf size={58}/></div><span className="orbit-tag tag1">DATA</span><span className="orbit-tag tag2">IMPACT</span></div></section>
      <section className="stats"><div><small>CORE WORKFLOWS</small><b>05</b><span>Connected modules</span></div><div><small>DATA COVERAGE</small><b>3 scopes</b><span>Scope 1 · 2 · 3</span></div><div><small>LIVE INTEGRATIONS</small><b>02</b><span>Maps search + AQI adapters</span></div><div><small>MISSION</small><b>Net positive</b><span>Better decisions, less waste</span></div></section>
      <section className="workspace">
        <div className="section-head"><div><div className="eyebrow">YOUR TOOLKIT</div><h2>{tab==='global'?'Explore the globe':tab==='aqi'?'Air quality intelligence':active?.title}</h2><p>{tab==='global'?'Search for places, facilities, suppliers and sustainability information.':tab==='aqi'?'Look up air pollution readings for a city you choose.':active?.sub}</p></div><span className="module-count">MODULE 0{modules.findIndex(m=>m.id===tab)+1>0?modules.findIndex(m=>m.id===tab)+1:'—'} / 05</span></div>
        {tab==='carbon'&&<div className="panel"><h3>Organizational emissions estimate</h3><p className="muted">Enter activity data to get an illustrative Scope 1, 2 and 3 breakdown.</p><div className="form-grid">{field(form,setForm,'electricity_kwh','Electricity (kWh)')}{field(form,setForm,'fuel_litres','Fuel (litres)')}{field(form,setForm,'travel_km','Business travel (km)')}{field(form,setForm,'supplier_emissions_kg','Supplier emissions (kg CO₂e)')}</div><button className="primary" onClick={()=>run('/api/carbon/estimate',form)} disabled={busy}>Calculate emissions <ArrowUpRight size={16}/></button></div>}
        {tab==='claims'&&<div className="panel"><h3>Review a sustainability claim</h3><p className="muted">Collect evidence and identify what needs independent verification.</p><label className="field full">Company claim<textarea value={claim} onChange={e=>setClaim(e.target.value)}/></label><label className="field full">Evidence items (one per line)<textarea value={evidence} onChange={e=>setEvidence(e.target.value)}/></label><button className="primary" onClick={()=>run('/api/claims/review',{claim,evidence:evidence.split('\n').filter(Boolean)})} disabled={busy}>Review evidence <ShieldCheck size={16}/></button><p className="fine">Evidence triage only — not a fraud detector or certification.</p></div>}
        {tab==='waste'&&<div className="panel"><h3>Find a second life for a byproduct</h3><p className="muted">Match materials with possible industrial users.</p><div className="form-grid">{field(waste,setWaste,'material','Material','text')}{field(waste,setWaste,'quantity_kg','Quantity (kg)')}{field(waste,setWaste,'city','City','text')}{field(waste,setWaste,'notes','Material notes','text')}</div><button className="primary" onClick={()=>run('/api/waste/match',waste)} disabled={busy}>Find matches <Recycle size={16}/></button></div>}
        {tab==='energy'&&<div className="panel"><h3>Balance renewable supply and demand</h3><p className="muted">A simplified one-hour planning scenario.</p><div className="form-grid">{field(energy,setEnergy,'solar_kw','Solar generation (kW)')}{field(energy,setEnergy,'wind_kw','Wind generation (kW)')}{field(energy,setEnergy,'demand_kw','Demand (kW)')}{field(energy,setEnergy,'storage_kwh','Available storage (kWh)')}</div><button className="primary" onClick={()=>run('/api/energy/optimize',energy)} disabled={busy}>Optimize scenario <Zap size={16}/></button></div>}
        {tab==='food'&&<div className="panel"><h3>Coordinate surplus food rescue</h3><p className="muted">Create a demo surplus listing and see suggested next steps.</p><div className="form-grid">{field(food,setFood,'food_type','Food type','text')}{field(food,setFood,'quantity_kg','Quantity (kg)')}{field(food,setFood,'available_hours','Available for (hours)')}{field(food,setFood,'city','City','text')}</div><button className="primary" onClick={()=>run('/api/food/surplus',food)} disabled={busy}>Assess surplus <Salad size={16}/></button></div>}
        {tab==='global'&&<div className="panel"><h3>Global search & discovery</h3><p className="muted">Use TinyFish to search across the web or globe for places and sustainability data once your API adapter is configured.</p><label className="field full">What are you looking for?<div className="searchbox"><Search size={18}/><input value={globalQ} onChange={e=>setGlobalQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&globalSearch()}/><button onClick={globalSearch} disabled={busy}>Search</button></div></label><div className="hint"><Globe2 size={18}/> Example: “solar panel recycling companies near Mumbai”</div><p className="fine">TinyFish key stays on the backend. Add its documented endpoint and request schema; see API_INTEGRATION.md.</p></div>}
        {tab==='aqi'&&<div className="panel"><h3>City air quality lookup</h3><p className="muted">Search a city to retrieve OpenWeather's air pollution index and pollutant concentrations.</p><label className="field full">City, country<div className="searchbox"><Wind size={18}/><input value={city} onChange={e=>setCity(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchAqi()}/><button onClick={searchAqi} disabled={busy}>Check AQI</button></div></label><p className="fine">OpenWeather uses a 1–5 index; it is not the same scale as India's CPCB AQI.</p></div>}
        {busy&&<div className="loading">Working on your request…</div>}{error&&<div className="error">{error}</div>}
        {result&&<div className="output"><div className="output-head">RESULT <span>JSON RESPONSE</span></div><Result data={result}/></div>}
        {aqi&&<div className="aqi-card"><div><small>{aqi.city}, {aqi.country}</small><h3>{aqi.aqi_label}</h3><p>OpenWeather index · {aqi.aqi_index_1_to_5}/5</p></div><div className="aqi-number">{aqi.aqi_index_1_to_5}<small>/5</small></div><div className="pollutants">{Object.entries(aqi.pollutants_ug_m3||{}).map(([k,v])=><div key={k}><small>{k.toUpperCase()}</small><b>{v}</b><span>µg/m³</span></div>)}</div></div>}
      </section>
      <footer><span>GREENPULSE © 2026</span><span>BUILT FOR A LOWER-IMPACT FUTURE <Leaf size={13}/></span></footer>
    </main>
  </div>
}
