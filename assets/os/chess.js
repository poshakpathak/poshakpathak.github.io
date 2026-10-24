/* Chess app: my live ratings from Chess.com and Lichess, pulled from their public APIs */
(()=>{
const CC_USER='googleholyyhell',LI_USER='NeverrEnough',KEY='poshakos-chess',FRESH=10*60*1000;

I.chess='<svg viewBox="0 0 24 24"><path d="M6 21h12M8 21v-2c0-2.2 1.6-3.6 3.4-5.1L8 14.5 6.3 15 5 13l4.4-6.2V4l2.1 2c3.9.2 6.5 3.4 6.5 8.4V21"/><path d="M10.5 9.2h.01"/></svg>';
COLORS.chess='#5d9948';
/* a two-tone board square with a white knight */
const ICON='<svg viewBox="0 0 52 52"><rect width="52" height="52" rx="12" fill="#769656"/><path d="M0 26h26V0h14a12 12 0 0 1 12 12v14H26v26H12A12 12 0 0 1 0 40z" fill="#eeeed2"/><path d="M16 43h21v-4c0-10-3.5-18-11.5-20.5L23 14l-2.6 4.2C15.7 21 12.6 25.4 11.3 30l2.4 3 4.8-2.6c2.7-.2 4.4-1.6 5.6-3.8.4 4.4-3.1 7.3-6.2 10.1-1.2 1.1-1.9 2.6-1.9 4.3z" fill="#fff" stroke="#262421" stroke-width="2" stroke-linejoin="round"/><circle cx="21.6" cy="23" r="1.6" fill="#262421"/></svg>';

const css=document.createElement('style');
css.textContent=`
.chessi svg{display:block;width:50px;height:50px;filter:drop-shadow(0 6px 10px rgba(10,20,40,.3))}
#os.phone .chessi svg{width:46px;height:46px}
#os[data-era="1984"] .chessi svg{filter:grayscale(1) contrast(1.6)}
#os[data-era="1995"] .chessi svg{filter:none}
.chs{padding:22px 24px;display:grid;gap:16px}
.chs .lead{margin:0;color:var(--soft);font-size:14px;line-height:1.5}
.chs .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.chs .cd{background:var(--chip);border-radius:14px;padding:14px 16px;display:grid;gap:10px;align-content:start}
.chs .ch{display:flex;align-items:center;gap:8px;justify-content:space-between}
.chs .ch b{font-size:15px}
.chs .ch a{color:var(--accent);text-decoration:none;font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chs .rt{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.chs .rt div{background:var(--card);border-radius:10px;padding:9px 11px;display:grid;gap:1px}
.chs .rt span{font-size:12px;color:var(--soft)}
.chs .rt strong{font-size:22px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.chs .rt small{font-size:11.5px;color:var(--soft)}
.chs .rec{font-size:13px;color:var(--soft)}
.chs .rec i{font-style:normal;font-weight:600;color:var(--fg)}
.chs .msg{font-size:13px;color:var(--soft);padding:6px 0}
.chs .ft{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12.5px;color:var(--soft)}
.chs .ft button{all:unset;cursor:pointer;font-weight:600;color:var(--accent)}
#os[data-era="1995"] .chs .cd,#os[data-era="1995"] .chs .rt div{border-radius:0;box-shadow:inset -1px -1px #fff,inset 1px 1px #808080}
#os[data-era="1984"] .chs .cd,#os[data-era="1984"] .chs .rt div{border-radius:0;border:1px solid #000;background:#fff}
`;
document.head.appendChild(css);

APPS.chess={t:"Chess",w:640,h:null,html:()=>`<div class="chs">
  <p class="lead">I founded the ULM Chess Club and built a neural chess engine. These are my current ratings, live from Chess.com and Lichess.</p>
  <div class="cards"><div class="cd" id="chcc"></div><div class="cd" id="chli"></div></div>
  <div class="ft"><span id="chup">Loading…</span><button id="chrf">Refresh</button></div>
</div>`};

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=n=>Number(n).toLocaleString('en-US');
const tile=(label,rating,sub)=>`<div><span>${label}</span><strong>${rating}</strong><small>${sub}</small></div>`;
const head=(site,url,user)=>`<div class="ch"><b>${site}</b><a href="${url}" target="_blank" rel="noopener">@${esc(user)} ↗</a></div>`;

/* Chess.com: current and best rating per time control, plus a combined record */
function ccHTML(s){
  const kinds=[['chess_rapid','Rapid'],['chess_blitz','Blitz'],['chess_bullet','Bullet'],['chess_daily','Daily']];
  let w=0,l=0,d=0;
  const tiles=kinds.filter(([k])=>s[k]&&s[k].last).map(([k,n])=>{const x=s[k],r=x.record||{};w+=r.win||0;l+=r.loss||0;d+=r.draw||0;
    return tile(n,num(x.last.rating),x.best?'Best '+num(x.best.rating):(r.win||0)+(r.loss||0)+(r.draw||0)+' games');});
  if(s.tactics&&s.tactics.highest)tiles.push(tile('Puzzles',num(s.tactics.highest.rating),'Highest'));
  return head('Chess.com','https://www.chess.com/member/'+CC_USER,CC_USER)+
    (tiles.length?`<div class="rt">${tiles.join('')}</div><div class="rec"><i>${num(w)}</i> wins · <i>${num(l)}</i> losses · <i>${num(d)}</i> draws</div>`:'<div class="msg">No rated games yet.</div>');
}
/* Lichess: rating and games per variant; a ? marks a provisional rating, like Lichess does */
function liHTML(u){
  const kinds=[['rapid','Rapid'],['blitz','Blitz'],['bullet','Bullet'],['classical','Classical'],['correspondence','Correspondence'],['puzzle','Puzzles']],p=u.perfs||{};
  const tiles=kinds.filter(([k])=>p[k]&&p[k].games).map(([k,n])=>tile(n,num(p[k].rating)+(p[k].prov?'?':''),num(p[k].games)+(k==='puzzle'?' solved':' games')));
  const c=u.count||{};
  return head('Lichess','https://lichess.org/@/'+LI_USER,LI_USER)+
    (tiles.length?`<div class="rt">${tiles.join('')}</div>${c.all?`<div class="rec"><i>${num(c.win||0)}</i> wins · <i>${num(c.loss||0)}</i> losses · <i>${num(c.draw||0)}</i> draws</div>`:''}`:'<div class="msg">No rated games yet.</div>');
}

let cache={};try{cache=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){}};
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago';};
const get=url=>fetch(url,{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();});

function paint(w){
  const cc=w.querySelector('#chcc'),li=w.querySelector('#chli'),up=w.querySelector('#chup');if(!cc)return;
  cc.innerHTML=cache.cc?ccHTML(cache.cc.d):head('Chess.com','https://www.chess.com/member/'+CC_USER,CC_USER)+`<div class="msg">${cache.ccErr?'Couldn’t reach Chess.com right now.':'Loading ratings…'}</div>`;
  li.innerHTML=cache.li?liHTML(cache.li.d):head('Lichess','https://lichess.org/@/'+LI_USER,LI_USER)+`<div class="msg">${cache.liErr?'Couldn’t reach Lichess right now.':'Loading ratings…'}</div>`;
  const t=Math.min(cache.cc?cache.cc.t:Infinity,cache.li?cache.li.t:Infinity);
  up.textContent=isFinite(t)?'Updated '+ago(t):cache.ccErr&&cache.liErr?'Offline':'Loading…';
}
function load(w,force){
  const stale=k=>force||!cache[k]||Date.now()-cache[k].t>FRESH;
  const jobs=[];
  if(stale('cc'))jobs.push(get('https://api.chess.com/pub/player/'+CC_USER+'/stats').then(d=>{cache.cc={t:Date.now(),d};cache.ccErr=0;},()=>{cache.ccErr=1;}));
  if(stale('li'))jobs.push(get('https://lichess.org/api/user/'+LI_USER).then(d=>{cache.li={t:Date.now(),d};cache.liErr=0;},()=>{cache.liErr=1;}));
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
