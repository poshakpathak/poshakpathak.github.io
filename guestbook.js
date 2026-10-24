/* Guestbook: visitors leave sticky notes. Notes are GitHub issues on this repo,
   and only the ones I label "guestbook" show up, so nothing appears until I approve it. */
(()=>{
const REPO='poshakpathak/poshakpathak.github.io',LABEL='guestbook',MAIL='poshakcodes@gmail.com';
const COLS={yellow:'#ffe884',pink:'#ffc2d6',blue:'#bfe1ff',green:'#c9f2b9'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const css=document.createElement('style');
css.textContent=`
.gbi{display:block;width:52px;height:52px;position:relative;filter:drop-shadow(0 6px 10px rgba(10,20,40,.3))}
.gbi i{position:absolute;inset:0;border-radius:3px;background:#ffe884;transform:rotate(-6deg)}
.gbi i+i{background:#ffc2d6;transform:rotate(4deg) translate(3px,-2px)}
.gbi i+i+i{background:#fff3a8;transform:none;background-image:repeating-linear-gradient(transparent 0 13px,rgba(120,90,20,.25) 13px 14px);background-position:0 8px}
#os.phone .gbi{width:46px;height:46px}
#os[data-era="1984"] .gbi,#os[data-era="1984"] .gbs{filter:grayscale(1) contrast(1.4)}
#os .win[data-app="guestbook"] .bd{background:#f4efe6!important;color:#2b2620!important}
.gb{padding:20px 22px 26px}
.gb h2{margin:0;font-size:22px}.gb .sub{margin:4px 0 16px;opacity:.7;font-size:14px}
.gbf{display:grid;gap:10px;background:#fffdf8;border:1px solid rgba(0,0,0,.08);border-radius:12px;padding:14px;margin-bottom:20px}
.gbf input,.gbf textarea{font:inherit;font-size:14px;padding:9px 11px;border:1px solid rgba(0,0,0,.15);border-radius:8px;background:#fff;color:#222;resize:vertical}
.gbf textarea{min-height:70px}
.gbf .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.gbf .sw{all:unset;cursor:pointer;width:24px;height:24px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}
.gbf .sw[aria-pressed="true"]{box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 0 0 2px #fffdf8,0 0 0 4px #2b2620}
.gbf .cnt{margin-left:auto;font-size:12px;opacity:.55}
.gbf .go{all:unset;cursor:pointer;background:#2b2620;color:#fff;font-size:14px;font-weight:600;padding:9px 16px;border-radius:999px}
.gbf .go[disabled]{opacity:.4;cursor:default}
.gbf .alt{font-size:13px;color:inherit;opacity:.7}
.gbf small{font-size:12px;opacity:.6;line-height:1.4}
.gbw{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px}
.gbn{position:relative;padding:14px 14px 12px;min-height:110px;border-radius:2px;box-shadow:0 8px 16px rgba(40,30,10,.16),0 1px 2px rgba(40,30,10,.2);font-size:14px;line-height:1.45;color:#2b2620;display:flex;flex-direction:column;gap:8px;word-break:break-word}
.gbn p{margin:0;white-space:pre-wrap;flex:1}
.gbn b{font-size:13px}.gbn small{opacity:.6;font-size:11.5px}
.gbn:nth-child(3n+1){transform:rotate(-1.4deg)}.gbn:nth-child(3n+2){transform:rotate(1deg)}
.gbe{opacity:.65;font-size:14px;grid-column:1/-1}
.gbs{position:absolute;z-index:3;width:168px;padding:12px 13px 10px;border-radius:2px;box-shadow:0 10px 20px rgba(10,20,40,.28);font:14px/1.4 "Segoe Print","Bradley Hand","Marker Felt","Comic Sans MS",cursive;color:#2b2620;cursor:pointer;transition:transform .2s;animation:gbin .5s both}
.gbs p{margin:0 0 6px;max-height:7.2em;overflow:hidden}
.gbs b{font:600 12px var(--font,system-ui)}
.gbs .x{all:unset;position:absolute;top:2px;right:6px;font:14px system-ui;opacity:0;cursor:pointer}
.gbs:hover .x{opacity:.5}.gbs:hover{transform:rotate(0) scale(1.03)!important}
.gbs:after{content:"";position:absolute;top:-9px;left:50%;width:56px;height:18px;margin-left:-28px;background:rgba(255,255,255,.55);transform:rotate(-3deg)}
@keyframes gbin{from{opacity:0;translate:0 -14px}}
#os.phone .gbs,#os[data-era="1995"] .gbs{display:none}
@media (max-width:1000px){.gbs{display:none}}`;
document.head.appendChild(css);

I.guestbook='<svg viewBox="0 0 24 24"><path d="M5 3h14v12l-6 6H5z"/><path d="M13 21v-6h6M8 8h8M8 12h5"/></svg>';
APPS.guestbook={t:'Guestbook',w:720,h:620,html:()=>{queueMicrotask(wireWin);return `<div class="gb">
  <h2>Guestbook</h2><p class="sub">Leave a note on my desktop. Say hi, tell me where you're from, recommend a book.</p>
  <form class="gbf" autocomplete="off">
    <input name="n" maxlength="40" placeholder="Your name" aria-label="Your name" required>
    <textarea name="m" maxlength="280" placeholder="Your note" aria-label="Your note" required></textarea>
    <div class="row">${Object.keys(COLS).map((c,i)=>`<button type="button" class="sw" data-c="${c}" style="background:${COLS[c]}" aria-label="${c} note" aria-pressed="${!i}"></button>`).join('')}<span class="cnt">0/280</span></div>
    <div class="row"><button class="go" type="submit" disabled>Post with GitHub</button><a class="alt" href="#" data-mail>No GitHub? Email it to me</a></div>
    <small>Posting opens a GitHub issue with your note filled in. I read every note and pin it here once I've approved it, usually within a day.</small>
  </form>
  <div class="gbw" id="gbw"><p class="gbe">Loading notes…</p></div></div>`;}};

let notes=null,loading=null;
function parse(it){
  let body=(it.body||'').replace(/<!--[\s\S]*?-->/g,'').replace(/\r/g,'');
  const cm=body.match(/(?:^|\n)\s*color:\s*(\w+)\s*$/i);
  if(cm)body=body.slice(0,cm.index);
  body=body.replace(/\n-{3,}\s*$/,'').trim();
  const name=(it.title||'').replace(/^guestbook\s*:?\s*/i,'').trim()||it.user.login;
  return {name:name.slice(0,40),text:body.slice(0,280),color:COLS[(cm&&cm[1].toLowerCase())]||COLS.yellow,date:new Date(it.created_at),login:it.user.login};
}
function load(){
  if(notes)return Promise.resolve(notes);
  if(loading)return loading;
  try{const c=JSON.parse(sessionStorage.getItem('gb')||'null');if(c&&Date.now()-c.t<6e5){notes=c.n.map(n=>({...n,date:new Date(n.date)}));return Promise.resolve(notes);}}catch(e){}
  return loading=fetch(`https://api.github.com/repos/${REPO}/issues?labels=${LABEL}&state=all&per_page=60&sort=created&direction=desc`,{headers:{Accept:'application/vnd.github+json'}})
    .then(r=>{if(!r.ok)throw new Error(r.status);return r.json();})
    .then(a=>{notes=a.filter(x=>!x.pull_request).map(parse).filter(n=>n.text);try{sessionStorage.setItem('gb',JSON.stringify({t:Date.now(),n:notes}))}catch(e){}return notes;})
    .finally(()=>{loading=null;});
}
const fmt=d=>d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
const card=n=>`<div class="gbn" style="background:${n.color}"><p>${esc(n.text)}</p><div><b>${esc(n.name)}</b><br><small>${fmt(n.date)}</small></div></div>`;

function wireWin(){
  const w=wins.guestbook;if(!w)return;
  const f=w.querySelector('.gbf'),go=f.querySelector('.go'),cnt=f.querySelector('.cnt');let color='yellow';
  const upd=()=>{cnt.textContent=f.m.value.length+'/280';go.disabled=!(f.n.value.trim()&&f.m.value.trim());};
  f.addEventListener('input',upd);
  f.querySelectorAll('.sw').forEach(b=>b.onclick=()=>{color=b.dataset.c;f.querySelectorAll('.sw').forEach(x=>x.setAttribute('aria-pressed',x===b));});
  f.onsubmit=e=>{e.preventDefault();if(go.disabled)return;
    const t='Guestbook: '+f.n.value.trim(),b=f.m.value.trim()+'\n\n---\ncolor: '+color;
    /* the page's own open() shadows window.open, so follow a link instead */
    const a=document.createElement('a');a.href=`https://github.com/${REPO}/issues/new?title=${encodeURIComponent(t)}&body=${encodeURIComponent(b)}`;a.target='_blank';a.rel='noopener';a.click();
    if(typeof toast==='function')toast('Thanks! Your note shows up once I approve it');};
  f.querySelector('[data-mail]').onclick=e=>{e.preventDefault();
    location.href=`mailto:${MAIL}?subject=${encodeURIComponent('Guestbook note from '+(f.n.value.trim()||'a visitor'))}&body=${encodeURIComponent(f.m.value.trim()+'\n\ncolor: '+color)}`;};
  const g=w.querySelector('#gbw');
  load().then(a=>{g.innerHTML=a.length?a.map(card).join(''):'<p class="gbe">No notes yet. Be the first!</p>';})
    .catch(()=>{g.innerHTML='<p class="gbe">Couldn\'t load notes right now. Try again in a bit.</p>';});
}

/* desktop icon */
const di=document.getElementById('dicons');
di.insertAdjacentHTML('beforeend','<button class="folder appi" data-a="guestbook"><span class="fi"><span class="gbi"><i></i><i></i><i></i></span></span><b>Guestbook</b></button>');
di.lastElementChild.onclick=()=>open('guestbook');
PAL_BASE.push({t:'Guestbook',d:'Read notes from visitors or leave your own',ic:I.guestbook,go:()=>open('guestbook')});

/* the three newest notes stuck to the desktop, top left */
let hidden=[];try{hidden=JSON.parse(sessionStorage.getItem('gbhide')||'[]')}catch(e){}
load().then(a=>{
  a.filter(n=>!hidden.includes(+n.date)).slice(0,3).forEach((n,i)=>{
    const s=document.createElement('div');s.className='gbs';s.style.background=n.color;
    s.style.left=(28+i*14)+'px';s.style.top=(30+i*150)+'px';s.style.transform=`rotate(${[-4,3,-2][i]}deg)`;s.style.animationDelay=(.6+i*.15)+'s';
    s.title='Open the guestbook';s.innerHTML=`<button class="x" aria-label="Hide note">×</button><p>${esc(n.text)}</p><b>— ${esc(n.name)}</b>`;
    s.onclick=()=>open('guestbook');
    s.querySelector('.x').onclick=e=>{e.stopPropagation();s.remove();hidden.push(+n.date);try{sessionStorage.setItem('gbhide',JSON.stringify(hidden))}catch(e){}};
    desk.insertBefore(s,di);
  });
}).catch(()=>{});
if(location.hash==='#guestbook')open('guestbook');
})();
