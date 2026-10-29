/* Chess app: my live ratings from Chess.com and Lichess, pulled from their public APIs */
(()=>{
const CC_USER='googleholyyhell',LI_USER='NeverrEnough',KEY='poshakos-chess2',FRESH=10*60*1000;

I.chess='<svg viewBox="0 0 24 24"><path d="M6 21h12M8 21v-2c0-2.2 1.6-3.6 3.4-5.1L8 14.5 6.3 15 5 13l4.4-6.2V4l2.1 2c3.9.2 6.5 3.4 6.5 8.4V21"/><path d="M10.5 9.2h.01"/></svg>';
COLORS.chess='#5d9948';
/* a two-tone board square with a white knight */
const ICON='<svg viewBox="0 0 52 52"><rect width="52" height="52" rx="12" fill="#769656"/><path d="M0 26h26V0h14a12 12 0 0 1 12 12v14H26v26H12A12 12 0 0 1 0 40z" fill="#eeeed2"/><path d="M16 43h21v-4c0-10-3.5-18-11.5-20.5L23 14l-2.6 4.2C15.7 21 12.6 25.4 11.3 30l2.4 3 4.8-2.6c2.7-.2 4.4-1.6 5.6-3.8.4 4.4-3.1 7.3-6.2 10.1-1.2 1.1-1.9 2.6-1.9 4.3z" fill="#fff" stroke="#262421" stroke-width="2" stroke-linejoin="round"/><circle cx="21.6" cy="23" r="1.6" fill="#262421"/></svg>';
/* site marks (from Simple Icons) */
const CC_LOGO='<svg viewBox="0 0 24 24"><path fill="#81b64c" d="M12 0a3.85 3.85 0 0 0-3.875 3.846A3.84 3.84 0 0 0 9.73 6.969l-2.79 1.85c0 .622.144 1.114.434 1.649H9.83c-.014.245-.014.549-.014.925 0 .025.003.048.006.071-.064 1.353-.507 3.472-3.62 5.842-.816.625-1.423 1.495-1.806 2.533a.33.33 0 0 0-.045.084 8.124 8.124 0 0 0-.39 2.516c0 .1.216 1.561 8.038 1.561s8.038-1.46 8.038-1.561c0-2.227-.824-4.048-2.24-5.133-4.034-3.08-3.586-5.74-3.644-6.838h2.458c.29-.535.434-1.027.434-1.649l-2.79-1.836a3.86 3.86 0 0 0 1.604-3.123A3.873 3.873 0 0 0 13.445.275c-.004-.002-.01.004-.015.004A3.76 3.76 0 0 0 12 0Z"/></svg>';
const LI_LOGO='<svg viewBox="0 0 24 24"><path fill="#fff" d="M10.457 6.161a.237.237 0 0 0-.296.165c-.8 2.785 2.819 5.579 5.214 7.428.653.504 1.216.939 1.591 1.292 1.745 1.642 2.564 2.851 2.733 3.178a.24.24 0 0 0 .275.122c.047-.013 4.726-1.3 3.934-4.574a.257.257 0 0 0-.023-.06L18.204 3.407 18.93.295a.24.24 0 0 0-.262-.293c-1.7.201-3.115.435-4.5 1.425-4.844-.323-8.718.9-11.213 3.539C.334 7.737-.246 11.515.085 14.128c.763 5.655 5.191 8.631 9.081 9.532.993.229 1.974.34 2.923.34 3.344 0 6.297-1.381 7.946-3.85a.24.24 0 0 0-.372-.3c-3.411 3.527-9.002 4.134-13.296 1.444-4.485-2.81-6.202-8.41-3.91-12.749C4.741 4.221 8.801 2.362 13.888 3.31c.056.01.115 0 .165-.029l.335-.197c.926-.546 1.961-1.157 2.873-1.279l-.694 1.993a.243.243 0 0 0 .02.202l6.082 10.192c-.193 2.028-1.706 2.506-2.226 2.611-.287-.645-.814-1.364-2.306-2.803-.422-.407-1.21-.941-2.124-1.56-2.364-1.601-5.937-4.02-5.391-5.984a.239.239 0 0 0-.165-.295z"/></svg>';
/* one icon per time control, colored the way Chess.com colors them */
const FMT={
  bullet:['#d4a44c','<svg viewBox="0 0 24 24"><path d="M5 19 15.5 8.5a4.2 4.2 0 0 1 6 0L21 9a4.2 4.2 0 0 1 0 6l-.5.5a4.2 4.2 0 0 1-6 0L19 19z" fill="currentColor"/><path d="M3 21l3-3M3 16l2-2M8 21l2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'],
  blitz:['#f7c631','<svg viewBox="0 0 24 24"><path d="M13.5 2 4 14h7l-1.5 8L20 10h-7z" fill="currentColor"/></svg>'],
  rapid:['#81b64c','<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 9v4.5l3 2M10 2h4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'],
  classical:['#5aa8e0','<svg viewBox="0 0 24 24"><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'],
  daily:['#f2a33a','<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'],
  puzzle:['#e8763c','<svg viewBox="0 0 24 24"><path d="M10 3a2 2 0 0 1 4 0v2h4a1 1 0 0 1 1 1v4h-1.5a2 2 0 0 0 0 4H19v4a1 1 0 0 1-1 1h-4v-1.5a2 2 0 0 0-4 0V21H6a1 1 0 0 1-1-1v-4h1.5a2 2 0 0 0 0-4H5V6a1 1 0 0 1 1-1h4z" fill="currentColor"/></svg>']
};
FMT.correspondence=FMT.daily;

const css=document.createElement('style');
css.textContent=`
.chessi svg{display:block;width:50px;height:50px;filter:drop-shadow(0 6px 10px rgba(10,20,40,.3))}
#os.phone .chessi svg{width:46px;height:46px}
#os[data-era="1984"] .chessi svg{filter:grayscale(1) contrast(1.6)}
#os[data-era="1995"] .chessi svg{filter:none}
.chs{display:grid;gap:16px;padding:0 24px 22px;align-content:start}
.chs .strip{height:10px;margin:0 -24px;background:repeating-conic-gradient(#769656 0 25%,#eeeed2 0 50%) 0 0/20px 20px;opacity:.9}
.chs .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;align-items:start}
.chs .cd{background:var(--chip);border-radius:16px;overflow:hidden;display:grid}
.chs .ch{display:flex;align-items:center;gap:10px;padding:12px 14px;color:#fff}
.chs .ch.cc{background:linear-gradient(135deg,#3a3734,#262421)}
.chs .ch.li{background:linear-gradient(135deg,#2b2925,#161512)}
.chs .ch .lg{width:30px;height:30px;flex:none;display:grid;place-items:center}
.chs .ch .lg svg{width:28px;height:28px}
.chs .ch .av{width:30px;height:30px;border-radius:7px;object-fit:cover;flex:none;margin-left:auto;box-shadow:0 0 0 2px rgba(255,255,255,.15)}
.chs .ch .nm{display:grid;min-width:0;line-height:1.2}
.chs .ch .nm b{font-size:15.5px;letter-spacing:-.01em}
.chs .ch .nm b i{font-style:normal;color:#81b64c}
.chs .ch .nm a{color:rgba(255,255,255,.72);text-decoration:none;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chs .ch .nm a:hover{color:#fff}
.chs .inn{padding:12px 14px 14px;display:grid;gap:10px;align-content:start}
.chs .meta{font-size:12px;color:var(--soft)}
.chs .rt{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.chs .ct{position:relative;background:var(--card);border-radius:11px;padding:9px 11px 8px;display:grid;gap:1px;overflow:hidden;min-height:70px}
.chs .ct.main{grid-column:1/-1}
.chs .ct .lb{display:flex;align-items:center;gap:6px;position:relative;font-size:12px;color:var(--soft);font-weight:500}
.chs .ct .lb svg{width:15px;height:15px;color:var(--fc)}
.chs .ct strong{font-size:22px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.01em;position:relative}
.chs .ct.main strong{font-size:30px}
.chs .ct small{font-size:11.5px;color:var(--soft);position:relative}
.chs .dl{font-size:12px;font-weight:600;margin-left:auto}
.chs .dl.up{color:#3d9a3a}.chs .dl.dn{color:#d0473b}
.chs .sp{position:absolute;right:10px;top:28px;width:44%;height:26px;opacity:.85;pointer-events:none}
.chs .ct.main .sp{width:50%;height:30px}
.chs .sp path{fill:none;stroke:var(--fc);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
.chs .sp path.a{stroke:none;fill:var(--fc);opacity:.12}
.chs .wdl{display:grid;gap:5px}
.chs .bar{display:flex;height:7px;border-radius:99px;overflow:hidden;background:var(--line)}
.chs .bar i:nth-child(1){background:#5aa64a}.chs .bar i:nth-child(2){background:#a7adb5}.chs .bar i:nth-child(3){background:#d0473b}
.chs .wdl div{display:flex;justify-content:space-between;font-size:12px;color:var(--soft)}
.chs .wdl b{color:var(--fg);font-weight:600;font-variant-numeric:tabular-nums}
.chs .msg{font-size:13px;color:var(--soft);padding:6px 0}
.chs .sk{height:70px;border-radius:11px;background:linear-gradient(90deg,var(--card) 30%,var(--chip) 50%,var(--card) 70%) 0 0/300% 100%;animation:chsk 1.2s linear infinite}
@keyframes chsk{to{background-position:-150% 0}}
.chs .ft{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12.5px;color:var(--soft)}
.chs .ft button{all:unset;cursor:pointer;font-weight:600;color:var(--accent)}
#os[data-era="1995"] .chs .cd,#os[data-era="1995"] .chs .ct{border-radius:0;box-shadow:inset -1px -1px #fff,inset 1px 1px #808080}
#os[data-era="1995"] .chs .ch{background:linear-gradient(90deg,#000080,#1084d0)}
#os[data-era="1984"] .chs .cd,#os[data-era="1984"] .chs .ct{border-radius:0;border:1px solid #000;background:#fff}
#os[data-era="1984"] .chs .ch{background:#000}
#os[data-era="1984"] .chs .ch .nm b i,#os[data-era="1984"] .chs .dl{color:inherit}
#os[data-era="1984"] .chs .strip,#os[data-era="1984"] .chs .lg,#os[data-era="1984"] .chs .av,#os[data-era="1984"] .chs .ct svg,#os[data-era="1984"] .chs .bar{filter:grayscale(1)}
`;
document.head.appendChild(css);

APPS.chess={t:"Chess",w:760,h:null,html:()=>`<div class="chs"><div class="strip"></div>
  <div class="cards"><div class="cd" id="chcc"></div><div class="cd" id="chli"></div></div>
  <div class="ft"><span id="chup">Loading…</span><button id="chrf">Refresh</button></div>
</div>`};

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=n=>Number(n).toLocaleString('en-US');
const mon=t=>new Date(t).toLocaleDateString('en-US',{month:'short',year:'numeric'});
const delta=d=>d?`<span class="dl ${d>0?'up':'dn'}">${d>0?'▲':'▼'} ${Math.abs(d)}</span>`:'';
/* a small area chart of a list of ratings */
function spark(v){
  if(!v||v.length<2)return '';
  const lo=Math.min(...v),hi=Math.max(...v),r=hi-lo||1,n=v.length-1;
  const pts=v.map((y,i)=>`${(i/n*100).toFixed(1)},${(28-(y-lo)/r*26).toFixed(1)}`);
  return `<svg class="sp" viewBox="0 0 100 30" preserveAspectRatio="none"><path class="a" d="M0,30L${pts.join('L')}L100,30Z"/><path d="M${pts.join('L')}"/></svg>`;
}
const tile=(k,label,rating,sub,o={})=>`<div class="ct${o.main?' main':''}" style="--fc:${FMT[k][0]}">${o.sp||''}<span class="lb">${FMT[k][1]}${label}${delta(o.d)}</span><strong>${rating}</strong><small>${sub}</small></div>`;
const head=(cls,logo,name,url,user,av)=>`<div class="ch ${cls}"><span class="lg">${logo}</span><span class="nm"><b>${name}</b><a href="${url}" target="_blank" rel="noopener">@${esc(user)} ↗</a></span>${av?`<img class="av" src="${esc(av)}" alt="" loading="lazy" onerror="this.remove()">`:''}</div>`;
const ccHead=p=>head('cc',CC_LOGO,'Chess<i>.com</i>','https://www.chess.com/member/'+CC_USER,CC_USER,p&&p.avatar);
const liHead=()=>head('li',LI_LOGO,'lichess.org','https://lichess.org/@/'+LI_USER,LI_USER);
function wdl(w,d,l){const t=w+d+l;if(!t)return '';const p=x=>(x/t*100).toFixed(1)+'%';
  return `<div class="wdl"><span class="bar"><i style="width:${p(w)}"></i><i style="width:${p(d)}"></i><i style="width:${p(l)}"></i></span><div><span><b>${num(w)}</b> won</span><span><b>${num(d)}</b> drawn</span><span><b>${num(l)}</b> lost</span><span><b>${Math.round(w/t*100)}%</b> wins</span></div></div>`;}

/* Chess.com: current and peak rating per time control, plus a combined record */
function ccHTML({s,p}){
  const kinds=[['chess_rapid','rapid','Rapid'],['chess_blitz','blitz','Blitz'],['chess_bullet','bullet','Bullet'],['chess_daily','daily','Daily']];
  let w=0,l=0,d=0;
  const rows=kinds.filter(([k])=>s[k]&&s[k].last).map(([k,f,n])=>{const x=s[k],r=x.record||{},g=(r.win||0)+(r.loss||0)+(r.draw||0);w+=r.win||0;l+=r.loss||0;d+=r.draw||0;return {f,n,x,g};}).sort((a,b)=>b.g-a.g);
  const tz=s.tactics&&s.tactics.highest,odd=(rows.length+(tz?1:0))%2===1;
  const tiles=rows.map(({f,n,x,g},i)=>tile(f,n,num(x.last.rating),(x.best?`Peak ${num(x.best.rating)} · ${mon(x.best.date*1000)}`:num(g)+' games'),{main:i===0&&odd}));
  if(tz)tiles.push(tile('puzzle','Puzzles',num(s.tactics.highest.rating),'Highest'+(s.tactics.highest.date?' · '+mon(s.tactics.highest.date*1000):'')));
  const meta=p&&p.joined?`<div class="meta">Member since ${mon(p.joined*1000)}${p.league?' · '+esc(p.league)+' league':''}</div>`:'';
  return ccHead(p)+`<div class="inn">${meta}`+(tiles.length?`<div class="rt">${tiles.join('')}</div>${wdl(w,d,l)}`:'<div class="msg">No rated games yet.</div>')+'</div>';
}
/* Lichess: rating, recent change and a trend line per variant; a ? marks a provisional rating, like Lichess does */
function liHTML({u,h}){
  const kinds=[['rapid','rapid','Rapid','Rapid'],['blitz','blitz','Blitz','Blitz'],['bullet','bullet','Bullet','Bullet'],['classical','classical','Classical','Classical'],['correspondence','correspondence','Correspondence','Correspondence'],['puzzle','puzzle','Puzzles','Puzzles']],p=u.perfs||{};
  const hist={};(h||[]).forEach(x=>{hist[x.name]=(x.points||[]).map(q=>({t:Date.UTC(q[0],q[1],q[2]),r:q[3]}));});
  const yr=Date.now()-365*864e5;
  const rows=kinds.filter(([k])=>p[k]&&p[k].games).map(([k,f,n,hn])=>({k,f,n,x:p[k],pts:hist[hn]||[]}));
  const games=rows.filter(r=>r.k!=='puzzle').sort((a,b)=>b.x.games-a.x.games),puz=rows.filter(r=>r.k==='puzzle');
  const ordered=[...games,...puz];
  const tiles=ordered.map((r,i)=>{const pk=r.pts.reduce((m,q)=>q.r>m.r?q:m,{r:0});
    const recent=r.pts.filter(q=>q.t>=yr).map(q=>q.r),line=recent.length>1?recent:r.pts.slice(-30).map(q=>q.r);
    const sub=(pk.r>r.x.rating?`Peak ${num(pk.r)} · `:'')+num(r.x.games)+(r.k==='puzzle'?' solved':' games');
    return tile(r.f,r.n,num(r.x.rating)+(r.x.prov?'?':''),sub,{d:r.x.prog,sp:spark(line),main:i===0&&ordered.length%2===1});});
  const c=u.count||{},pt=u.playTime&&u.playTime.total;
  const meta=u.createdAt?`<div class="meta">Member since ${mon(u.createdAt)}${pt?` · ${num(Math.round(pt/3600))} hours played`:''}</div>`:'';
  return liHead()+`<div class="inn">${meta}`+(tiles.length?`<div class="rt">${tiles.join('')}</div>${c.all?wdl(c.win||0,c.draw||0,c.loss||0):''}`:'<div class="msg">No rated games yet.</div>')+'</div>';
}

let cache={};try{cache=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){}};
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago';};
const get=url=>fetch(url,{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();});
const soft=pr=>pr.catch(()=>null);
const skel='<div class="inn"><div class="rt"><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div></div></div>';

function paint(w){
  const cc=w.querySelector('#chcc'),li=w.querySelector('#chli'),up=w.querySelector('#chup');if(!cc)return;
  cc.innerHTML=cache.cc?ccHTML(cache.cc.d):ccHead()+(cache.ccErr?'<div class="inn"><div class="msg">Couldn’t reach Chess.com right now.</div></div>':skel);
  li.innerHTML=cache.li?liHTML(cache.li.d):liHead()+(cache.liErr?'<div class="inn"><div class="msg">Couldn’t reach Lichess right now.</div></div>':skel);
  const t=Math.min(cache.cc?cache.cc.t:Infinity,cache.li?cache.li.t:Infinity);
  up.textContent=isFinite(t)?'Updated '+ago(t):cache.ccErr&&cache.liErr?'Offline':'Loading…';
}
function load(w,force){
  const stale=k=>force||!cache[k]||Date.now()-cache[k].t>FRESH;
  const jobs=[];
  if(stale('cc'))jobs.push(Promise.all([get('https://api.chess.com/pub/player/'+CC_USER+'/stats'),soft(get('https://api.chess.com/pub/player/'+CC_USER))])
    .then(([s,p])=>{cache.cc={t:Date.now(),d:{s,p}};cache.ccErr=0;},()=>{cache.ccErr=1;}));
  if(stale('li'))jobs.push(Promise.all([get('https://lichess.org/api/user/'+LI_USER),soft(get('https://lichess.org/api/user/'+LI_USER+'/rating-history'))])
    .then(([u,h])=>{cache.li={t:Date.now(),d:{u,h}};cache.liErr=0;},()=>{cache.liErr=1;}));
  paint(w);
  Promise.all(jobs).then(()=>{save();paint(w);});
}
function openChess(){const w=open('chess');if(!w.dataset.wired){w.dataset.wired=1;w.querySelector('#chrf').onclick=()=>load(w,true);}load(w);return w;}

/* desktop icon, search palette entry, and #chess deep link */
const di=document.getElementById('dicons'),b=document.createElement('button');
b.className='folder appi';b.dataset.a='chess';b.innerHTML=`<span class="fi"><span class="chessi">${ICON}</span></span><b>Chess</b>`;
b.onclick=openChess;di.appendChild(b);
PAL_BASE.splice(PAL_BASE.length-1,0,{t:'Chess',d:'My live Chess.com and Lichess ratings',ic:I.chess,go:openChess});
if(location.hash==='#chess')openChess();
})();
