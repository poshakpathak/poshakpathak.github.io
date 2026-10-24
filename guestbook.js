/* Guestbook: anyone can leave a sticky note, no sign-in. Notes go to Firestore
   unapproved, and the rules (firestore.rules) only let visitors read approved ones,
   so nothing shows up until I approve it at /#guestbook-admin. */
(()=>{
/* public Firebase web config: safe to ship, the Firestore rules do the protecting */
const FB={apiKey:'AIzaSyDkyIwps3EjWTvO1a3ULoHU_srKcqbpX2Q',projectId:'poshakos'};
const OWNER='poshakcodes@gmail.com',SDK='https://www.gstatic.com/firebasejs/10.12.2/';
const DB=()=>`https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;
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
.gbf .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.gbf .msg{font-size:13px;font-weight:600}
.gba{display:grid;gap:10px;margin-bottom:20px}
.gba .bar{display:flex;gap:10px;align-items:center;font-size:13px}
.gba button,.gbn .act button{all:unset;cursor:pointer;font-size:12.5px;font-weight:600;padding:5px 11px;border-radius:999px;background:#2b2620;color:#fff}
.gba button.ghost,.gbn .act button.ghost{background:rgba(0,0,0,.08);color:#2b2620}
.gbn .act{display:flex;gap:6px;flex-wrap:wrap}
.gbn.pending{outline:2px dashed rgba(0,0,0,.35);outline-offset:3px}
.gb [hidden]{display:none!important}
.gbh{grid-column:1/-1;margin:12px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:.06em;opacity:.6}
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
    <input class="hp" name="website" tabindex="-1" aria-hidden="true" placeholder="Leave this empty">
    <div class="row">${Object.keys(COLS).map((c,i)=>`<button type="button" class="sw" data-c="${c}" style="background:${COLS[c]}" aria-label="${c} note" aria-pressed="${!i}"></button>`).join('')}<span class="cnt">0/280</span></div>
    <div class="row"><button class="go" type="submit" disabled>Stick it on the desktop</button><span class="msg" role="status"></span></div>
    <small>No sign-in needed. I read every note and pin it here once I've approved it, usually within a day.</small>
  </form>
  <div class="gba" id="gba" hidden></div>
  <div class="gbw" id="gbw"><p class="gbe">Loading notes…</p></div></div>`;}};

let notes=null,loading=null;
const val=f=>f&&(f.stringValue??f.timestampValue??f.booleanValue);
const parse=d=>({id:d.name.split('/').pop(),name:String(val(d.fields.name)||'').slice(0,40),text:String(val(d.fields.text)||'').slice(0,280),
  color:COLS[val(d.fields.color)]||COLS.yellow,date:new Date(val(d.fields.created)||d.createTime),approved:!!val(d.fields.approved)});
function load(){
  if(notes)return Promise.resolve(notes);
  if(!FB.projectId)return Promise.resolve([]);
  if(loading)return loading;
  try{const c=JSON.parse(sessionStorage.getItem('gb')||'null');if(c&&Date.now()-c.t<3e5){notes=c.n.map(n=>({...n,date:new Date(n.date)}));return Promise.resolve(notes);}}catch(e){}
  /* plain REST, so visitors don't download the Firebase SDK */
  return loading=fetch(`${DB()}:runQuery?key=${FB.apiKey}`,{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({structuredQuery:{from:[{collectionId:'guestbook'}],where:{fieldFilter:{field:{fieldPath:'approved'},op:'EQUAL',value:{booleanValue:true}}},limit:200}})})
    .then(r=>{if(!r.ok)throw new Error(r.status);return r.json();})
    .then(a=>{notes=a.filter(x=>x.document).map(x=>parse(x.document)).filter(n=>n.text).sort((x,y)=>y.date-x.date);try{sessionStorage.setItem('gb',JSON.stringify({t:Date.now(),n:notes}))}catch(e){}return notes;})
    .finally(()=>{loading=null;});
}
function post(name,text,color){
  const id=Array.from(crypto.getRandomValues(new Uint8Array(20)),b=>'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b%62]).join('');
  const doc=`projects/${FB.projectId}/databases/(default)/documents/guestbook/${id}`;
  return fetch(`${DB()}:commit?key=${FB.apiKey}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({writes:[{
    update:{name:doc,fields:{name:{stringValue:name},text:{stringValue:text},color:{stringValue:color},approved:{booleanValue:false}}},
    updateTransforms:[{fieldPath:'created',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:false}}]})})
    .then(r=>{if(!r.ok)throw new Error(r.status);});
}
const fmt=d=>d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
const card=n=>`<div class="gbn" style="background:${n.color}"><p>${esc(n.text)}</p><div><b>${esc(n.name)}</b><br><small>${fmt(n.date)}</small></div></div>`;

function wireWin(){
  const w=wins.guestbook;if(!w)return;
  const f=w.querySelector('.gbf'),go=f.querySelector('.go'),cnt=f.querySelector('.cnt');let color='yellow';
  const upd=()=>{cnt.textContent=f.m.value.length+'/280';go.disabled=!(f.n.value.trim()&&f.m.value.trim());};
  f.addEventListener('input',upd);
  f.querySelectorAll('.sw').forEach(b=>b.onclick=()=>{color=b.dataset.c;f.querySelectorAll('.sw').forEach(x=>x.setAttribute('aria-pressed',x===b));});
  const msg=f.querySelector('.msg'),opened=Date.now();
  if(!FB.projectId){go.textContent='Opening soon';f.querySelectorAll('input,textarea').forEach(x=>x.disabled=true);}
  f.onsubmit=e=>{e.preventDefault();if(go.disabled||!FB.projectId)return;
    let last=0;try{last=+localStorage.getItem('gbpost')||0}catch(e){}
    if(Date.now()-last<6e4){msg.textContent='One note a minute, please.';return;}
    const done=()=>{f.reset();upd();msg.textContent='Thanks! It shows up once I approve it.';try{localStorage.setItem('gbpost',Date.now())}catch(e){}};
    /* bots fill the hidden field or submit instantly: pretend it worked and drop it */
    if(f.website.value||Date.now()-opened<3000)return done();
    go.disabled=true;msg.textContent='Posting…';
    post(f.n.value.trim(),f.m.value.trim(),color).then(done).catch(()=>{msg.textContent='That didn\'t go through. Try again in a bit.';upd();});};
  if(location.hash==='#guestbook-admin')return admin(w);
  const g=w.querySelector('#gbw');
  load().then(a=>{g.innerHTML=a.length?a.map(card).join(''):'<p class="gbe">No notes yet. Be the first!</p>';})
    .catch(()=>{g.innerHTML='<p class="gbe">Couldn\'t load notes right now. Try again in a bit.</p>';});
}

/* owner view at /#guestbook-admin: sign in with Google, approve or delete notes */
async function admin(w){
  const box=w.querySelector('#gba'),g=w.querySelector('#gbw');box.hidden=false;w.querySelector('.gbf').hidden=true;
  if(!FB.projectId){box.innerHTML='<p class="gbe">Add the Firebase config to guestbook.js first.</p>';return;}
  box.innerHTML='<p class="gbe">Loading…</p>';
  const [A,U,F]=await Promise.all(['firebase-app.js','firebase-auth.js','firebase-firestore-lite.js'].map(x=>import(SDK+x)));
  const app=A.getApps()[0]||A.initializeApp({apiKey:FB.apiKey,authDomain:FB.projectId+'.firebaseapp.com',projectId:FB.projectId});
  const auth=U.getAuth(app),db=F.getFirestore(app);
  U.onAuthStateChanged(auth,async u=>{
    if(!u||u.email!==OWNER){
      box.innerHTML=`<div class="bar">${u?`Signed in as ${esc(u.email)}, which can't moderate.`:'Sign in to moderate notes.'}<button>${u?'Switch account':'Sign in with Google'}</button></div>`;
      box.querySelector('button').onclick=()=>U.signInWithPopup(auth,new U.GoogleAuthProvider()).catch(e=>toast(e.message));g.innerHTML='';return;}
    box.innerHTML=`<div class="bar">Signed in as ${esc(u.email)}<button class="ghost">Sign out</button></div>`;
    box.querySelector('button').onclick=()=>U.signOut(auth);
    const draw=async()=>{
      const all=(await F.getDocs(F.collection(db,'guestbook'))).docs.map(d=>{const x=d.data();return {id:d.id,name:x.name,text:x.text,color:COLS[x.color]||COLS.yellow,date:x.created?x.created.toDate():new Date(),approved:x.approved};}).sort((a,b)=>b.date-a.date);
      const row=n=>card(n).replace('class="gbn"',`class="gbn${n.approved?'':' pending'}" data-id="${n.id}"`).replace(/<\/div>$/,`<div class="act">${n.approved?'<button class="ghost" data-do="hide">Unpublish</button>':'<button data-do="ok">Approve</button>'}<button class="ghost" data-do="del">Delete</button></div></div>`);
      const p=all.filter(n=>!n.approved),a=all.filter(n=>n.approved);
      g.innerHTML=`<p class="gbh">Waiting for approval · ${p.length}</p>${p.map(row).join('')||'<p class="gbe">Nothing waiting.</p>'}<p class="gbh">On the desktop · ${a.length}</p>${a.map(row).join('')}`;
      g.querySelectorAll('[data-do]').forEach(b=>b.onclick=async()=>{const id=b.closest('[data-id]').dataset.id,ref=F.doc(db,'guestbook',id);
        b.disabled=true;try{b.dataset.do==='del'?await F.deleteDoc(ref):await F.updateDoc(ref,{approved:b.dataset.do==='ok'});}catch(e){toast(e.message);}
        notes=null;try{sessionStorage.removeItem('gb')}catch(e){}draw();});
    };
    draw().catch(e=>{g.innerHTML=`<p class="gbe">${esc(e.message)}</p>`;});
  });
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
if(/^#guestbook(-admin)?$/.test(location.hash))open('guestbook');
})();
