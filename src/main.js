import { worlds, events, filters } from './data/worlds.js';
import { materials } from './data/materials.js';
import { generateScenario, loadScenario, runScenario } from './simulation/engine.js';
import './style.css';

const app = document.querySelector('#app');
const state = { selected: worlds[0], filter: 'All worlds', query: '', material: null, event: null, environment: worlds[0].environment, intensity: 58, scale: 0, time: '1×', running: false, active: 'World', activeEvent: false, sound: false, result: null };
try { state.saved = JSON.parse(localStorage.getItem('elsewhere-scenarios') || '[]').slice(0, 16); } catch { state.saved = []; }
function materialForWorld(w){const map={silk:'Spider silk',mycelium:'Mycelium + fiber',bone:'Bone lattice',glass:'Laminated glass',wood:'Cross-laminated wood',chitin:'Cellular composite',vertical:'Structural steel',span:'Structural steel',aftershock:'Reinforced concrete',tideline:'Reinforced concrete'};return map[w.id]||'Mixed / realistic';}
state.material = materialForWorld(state.selected);
state.event = state.selected.event;

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const opts = (items, value) => items.map(x => `<option ${x === value ? 'selected' : ''}>${esc(x)}</option>`).join('');
const stat = (icon, label, value) => `<div class="stat"><span class="stat-icon">${icon}</span><div><span class="stat-label">${label}</span><strong>${value}</strong></div></div>`;

function render() {
  const w = state.selected;
  const eventSequence = state.event.split(' → ').filter(Boolean);
  const visible = worlds.filter(x => (state.filter === 'All worlds' || x.category === state.filter) && `${x.name} ${x.subtitle} ${x.tags.join(' ')}`.toLowerCase().includes(state.query.toLowerCase()));
  app.innerHTML = `
    <header class="topbar"><a class="brand" href="#"><span class="brand-mark">e</span><span>elsewhere<span class="brand-sub">REALITY, IN MOTION</span></span></a><div class="top-center"><span class="live-dot"></span> SIMULATION UNIVERSE <span class="top-divider"></span><span>01 <i>/</i> ∞</span></div><div class="top-actions"><button class="icon-button sound-toggle" title="Toggle sound"><span>⌁</span></button><button class="avatar">B</button></div></header>
    <main class="layout">
      <section class="experience">
        <div class="scene-wrap" style="--tone:${w.palette[0]}"><canvas id="scene" style="transform:scale(${[1,1.35,1.7,2][state.scale]})"></canvas><div class="scene-grain"></div><div class="scene-vignette"></div>
          <div class="scene-top"><span class="eyebrow"><span class="live-dot"></span> WORLD PREVIEW</span><span class="scene-counter">${String(worlds.indexOf(w)+1).padStart(2,'0')} <i>/</i> ${String(worlds.length).padStart(2,'0')}</span></div>
          <div class="scene-caption"><span class="caption-line"></span><span>${esc(w.subtitle)}</span></div>
          <div class="scene-bottom"><div class="world-identity"><span class="world-glyph">${w.icon}</span><div><p class="eyebrow">${w.category.toUpperCase()} <span class="muted">/ ${w.stats.scale.toUpperCase()}</span></p><h1>${esc(w.name)}</h1></div></div><button class="enter-button" id="enter-world"><span>Enter this world</span><b>↗</b></button></div>
          <div class="scene-controls"><button class="scene-ctrl" id="view-scale"><span>⊙</span><span>${['WORLD','BUILDING','MATERIAL','FIBER'][state.scale]}</span></button><span class="scene-ctrl-sep"></span><button class="scene-ctrl" id="random-world"><span>⤨</span><span>Surprise me</span></button>${state.result?`<span class="scene-ctrl-sep"></span><button class="inspect-launch" id="inspect-results">◉ &nbsp; INSPECT CONSEQUENCES</button>`:''}<span class="scene-hint">DRAG TO LOOK AROUND <span>↔</span></span></div>
        </div>
        <div class="explore-strip"><div class="strip-intro"><span class="eyebrow">A UNIVERSE OF POSSIBILITIES</span><span class="strip-count">${String(worlds.length).padStart(2,'0')} WORLDS${state.saved.length?` · ${String(state.saved.length).padStart(2,'0')} SAVED`:''}</span></div><div class="category-row">${filters.map(f=>`<button class="filter-chip ${state.filter===f?'active':''}" data-filter="${f}">${f}</button>`).join('')}</div></div>
        <div class="library-head"><div><span class="eyebrow">THE LIBRARY</span><h2>Find your <em>elsewhere.</em></h2></div><label class="searchbox"><span>⌕</span><input id="search" placeholder="Search worlds" value="${esc(state.query)}"><kbd>⌘ K</kbd></label></div>
        <div class="world-grid">${visible.map((world,i)=>`<button class="world-card ${state.selected.id===world.id?'selected':''}" data-world="${world.id}" style="--c1:${world.palette[0]};--c2:${world.palette[1]};--c3:${world.palette[2]};--delay:${i*35}ms"><span class="card-art"><canvas data-card="${world.id}"></canvas><span class="card-glyph">${world.icon}</span><span class="card-open">↗</span><span class="card-index">${String(worlds.indexOf(world)+1).padStart(2,'0')}</span></span><span class="card-info"><span class="eyebrow">${world.category.toUpperCase()} <span class="muted">· ${world.stats.structures} OBJECTS</span></span><strong>${world.name}</strong><span class="card-subtitle">${world.subtitle}</span></span></button>`).join('') || `<div class="empty-state">No worlds found. Try another search.</div>`}</div>
        ${state.saved.length?`<div class="saved-head"><div><span class="eyebrow">YOUR EXPERIMENTS</span><span class="saved-note">Saved rules, ready to re-enter</span></div><span class="eyebrow">${String(state.saved.length).padStart(2,'0')} CONFIGURATIONS</span></div><div class="saved-grid">${state.saved.map((s,i)=>`<div class="saved-card" data-saved="${i}" tabindex="0" role="button"><span class="saved-sigil">${worlds.find(w=>w.id===s.worldId)?.icon||'✳'}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.material)} · ${esc(s.event)}</small></span><button class="saved-delete" data-delete-saved="${i}" aria-label="Remove saved configuration">×</button></div>`).join('')}</div>`:''}
        <div class="library-footer"><span>REALITIES ARE CONFIGURABLE.</span><span>THE LIBRARY IS ALWAYS GROWING <i>✳</i></span></div>
      </section>
      <aside class="control-rail"><div class="rail-header"><div><span class="eyebrow">WORLD BUILDER <span class="tiny-live"></span></span><h2>Change the <em>rules.</em></h2></div><button class="reset-button" id="reset">↺</button></div>
        <div class="rail-tabs">${['World','Materials','Events'].map(x=>`<button data-tab="${x}" class="rail-tab ${state.active===x?'active':''}">${x}<span>${x==='World'?'01':x==='Materials'?'04':'03'}</span></button>`).join('')}</div>
        <div class="rule-stack">
          <div class="rule-heading"><span class="rule-number">01</span><div><strong>Material world</strong><small>The matter everything is made of</small></div><span class="rule-check">✓</span></div>
          <label class="select-wrap"><span class="select-icon">◈</span><select id="material-select">${opts(materials.map(m=>m.name),state.material)}</select><span class="select-chevron">⌄</span></label>
          <div class="material-meter"><span>${(materials.find(x=>x.name===state.material)||materials[0]).family}</span><div class="meter"><i style="width:${(materials.find(x=>x.name===state.material)||materials[0]).stiffness}%"></i></div><span>STIFFNESS</span></div>
          <div class="rule-heading rule-next"><span class="rule-number">02</span><div><strong>Environment</strong><small>Conditions inside this world</small></div><span class="rule-check">✓</span></div>
          <div class="environment-grid"><button class="env-pill active" id="environment"><span>◌</span><span><small>ATMOSPHERE</small>${esc(state.environment.split('·')[0].trim())}</span><b>⌄</b></button><button class="env-pill" id="temperature"><span>☼</span><span><small>TEMPERATURE</small>${esc(state.environment.split('·')[1]?.trim()||'20°C')}</span><b>⌄</b></button></div>
          <div class="rule-heading rule-next"><span class="rule-number">03</span><div><strong>Event sequence</strong><small>Stack events. See what emerges.</small></div><button class="add-event" id="add-event">+</button></div>
          <div class="event-chain">${eventSequence.map((ev,i)=>`${i?'<span class="chain-arrow">↓</span>':''}<span class="chain-node ${i===eventSequence.length-1?'active':''}"><i>${String(i+1).padStart(2,'0')}</i>${esc(ev)}</span>`).join('')}<button class="chain-add" id="chain-add">+ Add an event</button></div>
          <div class="intensity-row"><span>Event intensity</span><span id="intensity-label">${state.intensity}<small>%</small></span></div><input class="intensity" id="intensity" type="range" min="5" max="100" value="${state.intensity}" style="--range:${state.intensity}%">
        </div>
        <div class="time-panel"><div class="time-head"><span class="eyebrow">TIME, YOURS TO BEND</span><button class="time-live ${state.running?'on':''}" id="time-toggle"><span></span>${state.running?'RUNNING':'PAUSED'}</button></div><div class="time-controls"><button id="slower">−</button><div class="time-current"><strong>${state.time}</strong><small>SIMULATION SPEED</small></div><button id="faster">+</button></div><div class="time-presets">${['⏸','0.25×','1×','10×','100×'].map(t=>`<button data-time="${t}" class="${state.time===t?'active':''}">${t}</button>`).join('')}</div></div>
        <div class="rail-bottom"><div class="presence-indicator"><span></span> PREVIEW READY <small>WEBXR</small></div><button class="save-recipe" id="save-recipe">＋ Save these rules</button><button class="build-button" id="build-world"><span>${state.activeEvent?'Rebuild this world':'Build this world'}</span><b>↗</b></button><div class="rail-footnote">${worlds.length} REALITIES <span>·</span> ∞ POSSIBLE COMBINATIONS</div></div>
      </aside>
    </main>
    <div class="toast" id="toast"><span>✳</span><span class="toast-copy"></span></div>
    <div class="modal-backdrop" id="event-modal"><div class="event-modal"><button class="modal-close" id="modal-close">×</button><span class="eyebrow">ADD TO THE SEQUENCE</span><h2>What happens <em>next?</em></h2><p>Events change shared material states. Order matters.</p><div class="event-options">${events.map((e,i)=>`<button data-add-event="${esc(e)}"><span>${['⌁','≈','✳','☼','❋','◉','◌','⌯','⟳','⌇','⊙','⌛','⌁'][i]}</span>${esc(e)}<b>↗</b></button>`).join('')}</div></div></div>
    ${state.result?`<div class="modal-backdrop" id="inspection-modal"><div class="event-modal inspection-modal"><button class="modal-close" id="inspection-close">×</button><span class="eyebrow">AFTER-EVENT INSPECTION · ${esc(state.result.simulatedObjects)} NEARBY ELEMENTS</span><h2>What the world <em>remembered.</em></h2><p>${esc(state.result.events.join(' → '))} · ${state.result.objectPopulation} structures represented with ${state.result.systemsActive.length} shared systems</p><div class="inspection-metrics">${[['DAMAGE',state.result.metrics.damage],['INTERNAL STRESS',state.result.metrics.stress],['MOISTURE',state.result.metrics.moisture],['CORROSION',state.result.metrics.corrosion]].map(([label,value])=>`<div class="inspection-metric"><span>${label}</span><strong>${Math.round(value)}<small>%</small></strong><i><b style="width:${Math.min(100,value)}%"></b></i></div>`).join('')}</div><div class="inspection-insights">${state.result.insights.map((line,i)=>`<div class="insight"><span>0${i+1}</span><p>${esc(line)}</p></div>`).join('')}</div><div class="lod-note">SIMULATION LOD <span>NEAR ${state.result.lod.near}</span><span>ACTIVE ${state.result.lod.active}</span><span>FAR ${state.result.lod.far}</span></div></div></div>`:''}
    <div class="immersive-hud" id="immersive-hud"><div><span class="eyebrow">ELSEWHERE / LIVE SIMULATION</span><strong id="hud-world">${esc(w.name)}</strong></div><button id="exit-immersive">EXIT IMMERSIVE ↗</button></div>`;
  drawMain(); drawCards(); bind();
}

function drawLandscape(canvas, world, big=false, frame=0) {
  if (!canvas) return;
  const dpr = Math.min(devicePixelRatio||1, 1.6), rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width, big?700:180), height = Math.max(rect.height, big?360:110);
  canvas.width=width*dpr; canvas.height=height*dpr; const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
  const W=width,H=height, p=world.palette;
  const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#080c10');sky.addColorStop(.43,p[2]);sky.addColorStop(1,p[0]);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  const glow=ctx.createRadialGradient(W*.53,H*.56,1,W*.53,H*.56,W*.53);glow.addColorStop(0,p[1]+'65');glow.addColorStop(1,p[1]+'00');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  const macroScale=big&&state.scale>=2;
  const skyline= world.id==='silk'||world.id==='mycelium'||world.id==='bone'||world.id==='chitin';
  if(macroScale){
    ctx.save();
    const base=H*.53;
    const fiber=world.id==='silk'||state.material.toLowerCase().includes('silk')||state.material.toLowerCase().includes('fiber');
    if(fiber){ctx.strokeStyle=p[1]+'aa';ctx.lineWidth=big?2:1;ctx.shadowColor=p[0];ctx.shadowBlur=18;for(let i=0;i<13;i++){ctx.beginPath();ctx.moveTo(W*.52,H*.51);ctx.bezierCurveTo(W*(.2+i*.05),H*(.12+(i%4)*.08),W*(.75-i*.025),H*(.35+(i%5)*.05),W*(.1+(i*47%87)/100),H*(.82+(i%3)*.035));ctx.stroke();}}
    else{for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse(W*.52,H*.56,W*(.09+i*.048),H*(.13+i*.042),-.16,0,Math.PI*2);ctx.strokeStyle=i%2?p[1]+'88':p[0]+'9c';ctx.lineWidth=i===4?3:1.1;ctx.shadowColor=p[0];ctx.shadowBlur=14;ctx.stroke();}for(let i=0;i<22;i++){let x=(i*71%W),y=(i*43%H);ctx.fillStyle=p[1]+'45';ctx.beginPath();ctx.arc(x,y,2+(i%4),0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  }
  else if (skyline) {
    ctx.save();ctx.globalAlpha=.42;ctx.strokeStyle=p[1];ctx.lineWidth=big?1.4:1;ctx.shadowColor=p[0];ctx.shadowBlur=big?12:4;
    const nodes=[];const count=big?31:17;for(let i=0;i<count;i++){const x=(i/(count-1))*W,y=H*(.27+Math.abs(Math.sin(i*3.7+1))*.44);nodes.push([x,y]);}
    for(let i=0;i<count;i++){let [x,y]=nodes[i];ctx.beginPath();ctx.moveTo(W/2,H*.95);ctx.quadraticCurveTo((x+W/2)/2,y-20,x,y);ctx.stroke(); if(i>0&&i%2===0){ctx.beginPath();ctx.moveTo(...nodes[i-1]);ctx.quadraticCurveTo(x,H*.34,...nodes[i]);ctx.stroke();} }
    ctx.restore();
  } else if(world.id==='micro'||world.id==='laboratory'||world.id==='alien') {
    ctx.save();ctx.strokeStyle=p[1]+'9c';ctx.lineWidth=big?2:1;ctx.shadowColor=p[0];ctx.shadowBlur=big?14:5;
    let rings=big?8:5;for(let r=0;r<rings;r++){ctx.beginPath();ctx.ellipse(W*.52,H*.62,(W*.09+r*W*.042),H*(.08+r*.052),-.14,0,Math.PI*2);ctx.stroke();}ctx.restore();
  } else {
    const buildings=big?31:17, ground=H*.79;
    for(let i=0;i<buildings;i++){const step=W/buildings,x=i*step-step*.1,bw=step*(.52+((i*17)%9)/20);let variation=(Math.sin(i*13.4)+1)*.5;let bh=H*(.18+variation*.43);if(world.id==='whiteout')bh*=.78;if(world.id==='tunnel')bh*=.55;
      let grad=ctx.createLinearGradient(x,ground-bh,x+bw,ground);grad.addColorStop(0,'#131a1d');grad.addColorStop(1,'#101518');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x,ground-bh);ctx.lineTo(x+bw,ground-bh*.96);ctx.lineTo(x+bw,ground);ctx.closePath();ctx.fill();
      ctx.fillStyle=p[1]+'58';const rows=Math.floor(bh/(big?13:8)),cols=2;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if((i+c*2+r)%4===0){ctx.globalAlpha=.28+((i+r+frame)%4)*.08;ctx.fillRect(x+bw*(.2+c*.35),ground-bh+5+r*(big?12:7),big?2.5:1.3,big?4:2.5);}ctx.globalAlpha=1;
    }
    ctx.fillStyle='#111719';ctx.beginPath();ctx.moveTo(0,ground);ctx.lineTo(W*.34,ground-H*.055);ctx.lineTo(W*.65,ground-H*.055);ctx.lineTo(W,ground);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
    ctx.strokeStyle=p[1]+'60';ctx.lineWidth=1;for(let i=0;i<10;i++){let x=(i/9)*W;ctx.beginPath();ctx.moveTo(W*.5,ground-H*.05);ctx.lineTo(x,H);ctx.stroke();}ctx.beginPath();ctx.moveTo(0,ground+H*.11);ctx.lineTo(W,ground+H*.11);ctx.stroke();ctx.beginPath();ctx.moveTo(0,ground+H*.24);ctx.lineTo(W,ground+H*.24);ctx.stroke();
  }
  if(big&&state.activeEvent){
    const ev=state.event.toLowerCase();ctx.save();ctx.globalAlpha=.48+Math.sin(frame*.055)*.1;ctx.lineWidth=big?2:1;ctx.shadowBlur=16;
    if(ev.includes('fire')||ev.includes('heat')){let heat=ctx.createRadialGradient(W*.52,H*.8,1,W*.52,H*.8,H*.85);heat.addColorStop(0,'#ffb44a66');heat.addColorStop(1,'#f56b3c00');ctx.fillStyle=heat;ctx.fillRect(0,0,W,H);}
    else if(ev.includes('flood')||ev.includes('water')||ev.includes('rain')){ctx.strokeStyle='#9bd8dd';ctx.shadowColor='#70d3de';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(W*.53,H*.89,W*(.16+i*.1),H*(.03+i*.012),0,Math.PI,Math.PI*2);ctx.stroke();}}
    else {ctx.strokeStyle=ev.includes('wind')?'#d2e2d0':'#e5cc9d';ctx.shadowColor=ev.includes('wind')?'#b7e7d9':'#f6c884';ctx.beginPath();ctx.moveTo(W*.56,H*.45);ctx.lineTo(W*.53,H*.53);ctx.lineTo(W*.58,H*.59);ctx.lineTo(W*.55,H*.65);ctx.lineTo(W*.61,H*.71);ctx.stroke();if(ev.includes('wind'))for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(W*.12,H*(.28+i*.11));ctx.quadraticCurveTo(W*.5,H*(.18+i*.12),W*.91,H*(.27+i*.11));ctx.stroke();}}
    ctx.restore();
  }
  const particles=big?62:18;for(let i=0;i<particles;i++){let x=((i*83+frame*.26)%W), y=(i*47%Math.max(H,1));ctx.fillStyle=p[i%3]||p[0];ctx.globalAlpha=.15+((i%5)/15);ctx.beginPath();ctx.arc(x,y,big?1.3:.7,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  const vignette=ctx.createRadialGradient(W/2,H*.5,H*.2,W/2,H*.5,H*.8);vignette.addColorStop(.4,'transparent');vignette.addColorStop(1,'#080b0de8');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
}
let frame=0;
let ambientContext=null,ambientGain=null;
let xrExperience=null;
function startAmbient(){try{if(!ambientContext){const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;ambientContext=new AudioContextClass();const buffer=ambientContext.createBuffer(1,ambientContext.sampleRate*2,ambientContext.sampleRate);const channel=buffer.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=(Math.random()*2-1)*.22;const source=ambientContext.createBufferSource();source.buffer=buffer;source.loop=true;const filter=ambientContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1250;ambientGain=ambientContext.createGain();ambientGain.gain.value=0;source.connect(filter);filter.connect(ambientGain);ambientGain.connect(ambientContext.destination);source.start();}ambientContext.resume();ambientGain.gain.setTargetAtTime(.022,ambientContext.currentTime,.6);}catch{}}
function drawMain(){drawLandscape(document.querySelector('#scene'),state.selected,true,frame++);}
function drawCards(){document.querySelectorAll('canvas[data-card]').forEach(c=>{let w=worlds.find(a=>a.id===c.dataset.card);drawLandscape(c,w,false,frame);});}
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{drawMain();drawCards()},100)});

let toastTimer;
function toast(msg){const t=document.querySelector('#toast');if(!t)return;t.querySelector('.toast-copy').textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400);}
function invalidateResult(){state.result=null;document.querySelector('#inspect-results')?.remove();}
function chooseWorld(id){state.selected=worlds.find(x=>x.id===id)||worlds[0];state.event=state.selected.event;state.material=materialForWorld(state.selected);state.environment=state.selected.environment;state.activeEvent=false;state.result=null;render();}
function bind(){
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;render();});
  document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{chooseWorld(b.dataset.world);document.querySelector('.scene-wrap').scrollIntoView({behavior:'smooth',block:'nearest'});});
  document.querySelectorAll('[data-saved]').forEach(b=>{const load=()=>{const s=state.saved[Number(b.dataset.saved)];const w=worlds.find(x=>x.id===s.worldId);if(w){state.selected=w;state.material=s.material;state.environment=s.environment;state.event=s.event;state.intensity=s.intensity;state.time=s.time;state.result=null;state.activeEvent=false;render();toast('Saved experiment loaded');}};b.onclick=load;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();load();}};});
  document.querySelectorAll('[data-delete-saved]').forEach(b=>b.onclick=e=>{e.stopPropagation();state.saved.splice(Number(b.dataset.deleteSaved),1);localStorage.setItem('elsewhere-scenarios',JSON.stringify(state.saved));render();toast('Saved experiment removed');});
  const search=document.querySelector('#search');search.oninput=()=>{state.query=search.value;const pos=search.selectionStart;render();const n=document.querySelector('#search');n.focus();n.setSelectionRange(pos,pos);};
  document.querySelector('#material-select').onchange=e=>{state.material=e.target.value;invalidateResult();let m=materials.find(x=>x.name===state.material);document.querySelector('.material-meter span:first-child').textContent=m.family;document.querySelector('.material-meter i').style.width=m.stiffness+'%';toast(`${m.name} is now shaping this world`);};
  document.querySelector('#intensity').oninput=e=>{state.intensity=+e.target.value;invalidateResult();document.querySelector('#intensity-label').innerHTML=`${state.intensity}<small>%</small>`;e.target.style.setProperty('--range',state.intensity+'%');document.querySelector('.scene-wrap').style.setProperty('--event-intensity',state.intensity/100);};
  document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{state.time=b.dataset.time;invalidateResult();render();});
  document.querySelector('#time-toggle').onclick=()=>{state.running=!state.running;render();toast(state.running?'Simulation time is moving':'Simulation paused');};
  document.querySelector('#slower').onclick=()=>{let ix=['⏸','0.25×','1×','10×','100×'].indexOf(state.time);state.time=['⏸','0.25×','1×','10×','100×'][Math.max(0,ix-1)];invalidateResult();render();};
  document.querySelector('#faster').onclick=()=>{let ix=['⏸','0.25×','1×','10×','100×'].indexOf(state.time);state.time=['⏸','0.25×','1×','10×','100×'][Math.min(4,ix+1)];invalidateResult();render();};
  document.querySelector('#random-world').onclick=()=>{const generated=generateScenario(worlds);state.selected=generated.world;state.material=generated.scenario.layers.material;state.environment=generated.scenario.layers.environment;state.event=generated.scenario.layers.events.join(' → ');state.intensity=generated.scenario.layers.rules.intensity;state.activeEvent=false;state.result=null;render();toast('A new world, material, climate, and event chain are ready');};
  document.querySelector('#view-scale').onclick=()=>{state.scale=(state.scale+1)%4;let el=document.querySelector('#view-scale span:nth-child(2)');el.textContent=['WORLD','BUILDING','MATERIAL','FIBER'][state.scale];document.querySelector('#scene').style.transform=`scale(${[1,1.35,1.7,2][state.scale]})`;drawMain();toast(['World scale','Building scale','Material scale','Fiber scale'][state.scale]);};
  document.querySelector('#build-world').onclick=()=>{const scenario=loadScenario(state.selected,{material:state.material,event:state.event,environment:state.environment,intensity:state.intensity,timeScale:state.time});state.result=runScenario(scenario);state.activeEvent=true;state.running=true;render();toast(`${state.event.split(' → ')[0]} changed ${state.result.simulatedObjects} nearby material states`);};
  document.querySelector('#save-recipe').onclick=()=>{const name=`${state.selected.name} / ${state.material}`;const saved={name,worldId:state.selected.id,material:state.material,environment:state.environment,event:state.event,intensity:state.intensity,time:state.time};state.saved=[saved,...state.saved.filter(x=>JSON.stringify(x)!==JSON.stringify(saved))].slice(0,16);localStorage.setItem('elsewhere-scenarios',JSON.stringify(state.saved));render();toast('Experiment saved to your library');};
  document.querySelector('#reset').onclick=()=>{state.material=materialForWorld(state.selected);state.event=state.selected.event;state.environment=state.selected.environment;state.intensity=58;state.scale=0;state.time='1×';state.running=false;state.activeEvent=false;state.result=null;render();toast('Rules restored to this world’s starting conditions');};
  document.querySelector('#add-event').onclick=()=>document.querySelector('#event-modal').classList.add('open');document.querySelector('#chain-add').onclick=()=>document.querySelector('#event-modal').classList.add('open');
  document.querySelector('#modal-close').onclick=()=>document.querySelector('#event-modal').classList.remove('open');
  if(document.querySelector('#inspection-close')){document.querySelector('#inspect-results').onclick=()=>document.querySelector('#inspection-modal').classList.add('open');document.querySelector('#inspection-close').onclick=()=>document.querySelector('#inspection-modal').classList.remove('open');document.querySelector('#inspection-modal').onclick=e=>{if(e.target.id==='inspection-modal')e.currentTarget.classList.remove('open');};}
  document.querySelector('#event-modal').onclick=e=>{if(e.target.id==='event-modal')e.currentTarget.classList.remove('open');};
  document.querySelectorAll('[data-add-event]').forEach(b=>b.onclick=()=>{state.event=`${state.event} → ${b.dataset.addEvent}`;state.activeEvent=false;invalidateResult();document.querySelector('#event-modal').classList.remove('open');render();toast(`${b.dataset.addEvent} added to the event sequence`);});
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.active=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(t=>t.classList.toggle('active',t===b));if(b.dataset.tab==='Events')document.querySelector('#event-modal').classList.add('open');else if(b.dataset.tab==='Materials')document.querySelector('#material-select').focus();else document.querySelector('.rule-stack').scrollIntoView({behavior:'smooth',block:'nearest'});});
  document.querySelector('#environment').onclick=()=>{const climates=['Dry','Humid','Saturated','Frozen','Salt air','Windy','Arid','Controlled'];const current=state.environment.split('·')[0].trim();const next=climates[(climates.indexOf(current)+1)%climates.length];const temp=state.environment.split('·')[1]?.trim()||'22°C';state.environment=`${next} · ${temp}`;invalidateResult();render();toast(`Atmosphere changed to ${next.toLowerCase()}`);};
  document.querySelector('#temperature').onclick=()=>{const temps=['12°C','20°C','29°C','36°C','43°C','−18°C'];const current=state.environment.split('·')[1]?.trim();const next=temps[(temps.indexOf(current)+1)%temps.length];state.environment=`${state.environment.split('·')[0].trim()} · ${next}`;invalidateResult();render();toast(`Temperature set to ${next}`);};
  document.querySelector('.sound-toggle').onclick=e=>{state.sound=!state.sound;e.currentTarget.classList.toggle('muted-sound',!state.sound);if(state.sound)startAmbient();else if(ambientGain)ambientGain.gain.setTargetAtTime(0,ambientContext.currentTime,.18);toast(state.sound?'Soft ambient noise on':'Ambient sound muted');};
  document.querySelector('#enter-world').onclick=enterPreview;
  document.querySelector('#exit-immersive').onclick=()=>{if(xrExperience)xrExperience.stop();else if(document.fullscreenElement)document.exitFullscreen();document.querySelector('#immersive-hud').classList.remove('visible');};
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.querySelector('#immersive-hud')?.classList.remove('visible');});
  document.querySelector('#scene').onpointerdown=e=>{let x=e.clientX;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.onpointermove=m=>{if(Math.abs(m.clientX-x)>35){e.currentTarget.style.filter=`hue-rotate(${(m.clientX-x)*.12}deg)`;}};e.currentTarget.onpointerup=()=>{e.currentTarget.onpointermove=null;};};
}
async function enterPreview(){const hud=document.querySelector('#immersive-hud');document.querySelector('#hud-world').textContent=state.selected.name;if(navigator.xr){let sessionPromise;try{sessionPromise=navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});const {enterWorld}=await import('./xr/stage.js');xrExperience=await enterWorld(state.selected,{material:state.material,event:state.event,intensity:state.intensity,environment:state.environment},sessionPromise);}catch{xrExperience=null;}}if(xrExperience){hud.classList.add('visible');toast('Immersive world opened · point and select to teleport or grab');return;}hud.classList.add('visible');try{await document.documentElement.requestFullscreen?.();}catch{}toast('Preview opened · immersive VR needs a supported WebXR headset and secure browser');}

window.addEventListener('elsewhere-xr-message',e=>toast(e.detail));
window.addEventListener('elsewhere-xr-ended',()=>{xrExperience=null;document.querySelector('#immersive-hud')?.classList.remove('visible');});
render();
setInterval(()=>{if(document.visibilityState==='visible'){frame++;drawMain();}},160);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector('#search').focus();}if(e.key==='Escape')document.querySelector('#event-modal').classList.remove('open');});
