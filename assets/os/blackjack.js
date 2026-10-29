/* Blackjack: play the house alone, or open a table and send the link so friends can sit down.
   One engine runs both. Solo keeps its state in localStorage. A table is one Firestore doc
   (bjrooms/CODE) and every move is a transaction, so whoever acts also deals the next card
   and plays the dealer when the last hand is done. No server and no host to lose. */
(()=>{
/* same public Firebase web config as the guestbook: the Firestore rules do the protecting */
const FB={apiKey:'AIzaSyDkyIwps3EjWTvO1a3ULoHU_srKcqbpX2Q',projectId:'poshakos'};
const SDK='https://www.gstatic.com/firebasejs/10.12.2/';
const DECKS=6,START=1000,MAX=5,MIN=5,CHIPS=[5,25,100,500],TURN=30000,BETWAIT=25000,NEXTWAIT=10000;
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sfx=f=>{try{blip(f)}catch(e){}};
const say=m=>{try{toast(m)}catch(e){}};
const money=n=>'$'+(Number.isInteger(n)?n.toLocaleString():n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}));
const signed=n=>(n>0?'+':n<0?'−':'')+money(Math.abs(n));

/* ---------------- the game, as plain functions over a state object ---------------- */
const RK=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],SU=['♠︎','♥︎','♦︎','♣︎'];
const pts=c=>Math.min(10,c%13+1);
const hilo=c=>{const p=pts(c);return p>=2&&p<=6?1:p===1||p===10?-1:0;};
function tot(cs){let t=0,a=false;for(const c of cs){t+=pts(c);if(pts(c)===1)a=true;}return a&&t+10<=21?{t:t+10,soft:true}:{t,soft:false};}
const isBJ=h=>h.c.length===2&&!h.sp&&tot(h.c).t===21;
const rnd=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;};
function shuffle(S){
  const d=[];for(let k=0;k<DECKS;k++)for(let i=0;i<52;i++)d.push(i);
  for(let i=d.length-1;i>0;i--){const j=rnd(i+1);[d[i],d[j]]=[d[j],d[i]];}
  S.shoe=d;S.pos=0;S.cut=Math.round(d.length*(.7+rnd(11)/100));S.rc=0;S.shuf=(S.shuf||0)+1;
}
/* the hole card is drawn face down, so it only counts once it's turned over */
function draw(S,show=true){if(S.pos>=S.shoe.length)shuffle(S);const c=S.shoe[S.pos++];if(show)S.rc+=hilo(c);return c;}
function fresh(){const S={round:0,phase:'bet',dealer:{c:[],hole:false},seats:[],turn:null};shuffle(S);return S;}
const seatOf=(S,id)=>S.seats.find(s=>s.id===id);

function join(S,id,name){
  const s=seatOf(S,id);if(s){s.name=name;s.gone=false;s.idle=0;return S;}
  if(S.seats.length>=MAX)return null;
  S.seats.push({id,name,chips:START,bet:25,ready:false,hands:[],hi:0,idle:0,net:0,buy:0});return S;
}
function leave(S,id){
  const s=seatOf(S,id);if(!s)return null;
  if(S.phase==='play'&&s.hands.length){s.gone=true;s.hands.forEach(h=>{h.done=true;});if(S.turn===id)advance(S);}
  else{S.seats=S.seats.filter(x=>x!==s);if(S.phase==='bet')maybeDeal(S);}
  return S;
}
function ready(S,id,bet){
  const s=seatOf(S,id);if(!s)return null;
  if(S.phase==='done')next(S);
  if(S.phase!=='bet'||bet<MIN||bet>s.chips)return null;
  s.bet=bet;s.ready=true;s.idle=0;maybeDeal(S);return S;
}
function unready(S,id){const s=seatOf(S,id);if(!s||S.phase!=='bet')return null;s.ready=false;return S;}
function rebuy(S,id){const s=seatOf(S,id);if(!s||s.chips>=MIN||S.phase==='play'&&s.hands.length)return null;s.chips+=START;s.buy++;return S;}
function maybeDeal(S){const live=S.seats.filter(s=>!s.gone);if(live.length&&live.every(s=>s.ready))deal(S);}
/* anyone who hasn't bet sits this one out; three rounds of that and they lose the seat */
function deal(S){
  S.seats=S.seats.filter(s=>!s.gone&&s.idle<3);
  const P=S.seats.filter(s=>s.ready&&s.bet>=MIN&&s.bet<=s.chips);if(!P.length)return false;
  S.seats.forEach(s=>{s.hands=[];s.hi=0;if(!P.includes(s))s.idle++;});
  if(S.pos>=S.cut)shuffle(S);
  S.round++;S.phase='play';S.dealer={c:[],hole:true};S.turn=null;
  P.forEach(s=>{s.chips-=s.bet;s.hands=[{c:[],b:s.bet}];});
  for(let k=0;k<2;k++){P.forEach(s=>s.hands[0].c.push(draw(S)));S.dealer.c.push(draw(S,k===0));}
  /* the dealer peeks under an ace or a ten */
  const up=pts(S.dealer.c[0]);
  if((up===1||up===10)&&tot(S.dealer.c).t===21){finish(S);return true;}
  P.forEach(s=>{if(isBJ(s.hands[0]))s.hands[0].done=true;});
  advance(S);return true;
}
function advance(S){
  const order=S.seats.filter(s=>s.hands.length);
  for(let i=Math.max(0,order.findIndex(s=>s.id===S.turn));i<order.length;i++){
    const s=order[i],k=s.hands.findIndex(h=>!h.done);
    if(k>=0){S.turn=s.id;s.hi=k;return;}
  }
  S.turn=null;finish(S);
}
function options(S,s){
  const h=s&&s.hands[s.hi];if(!h||h.done||S.phase!=='play'||S.turn!==s.id)return{};
  const two=h.c.length===2,cash=s.chips>=h.b;
  return{hit:true,stand:true,double:two&&cash&&!h.a,split:two&&cash&&!h.a&&pts(h.c[0])===pts(h.c[1])&&s.hands.length<4,surrender:two&&s.hands.length===1};
}
function act(S,id,a){
  const s=seatOf(S,id);if(!options(S,s)[a])return null;const h=s.hands[s.hi];
  if(a==='hit'){h.c.push(draw(S));if(tot(h.c).t>=21)h.done=true;}
  else if(a==='stand')h.done=true;
  else if(a==='double'){s.chips-=h.b;h.b*=2;h.d=1;h.c.push(draw(S));h.done=true;}
  else if(a==='split'){
    /* split aces get one card each and that's it */
    const aces=pts(h.c[0])===1,h2={c:[h.c.pop()],b:h.b,sp:1,a:aces?1:0};
    s.chips-=h.b;h.sp=1;h.a=h2.a;h.c.push(draw(S));h2.c.push(draw(S));s.hands.splice(s.hi+1,0,h2);
    [h,h2].forEach(x=>{if(aces||tot(x.c).t===21)x.done=true;});
  }
  else if(a==='surrender'){h.r='sur';h.n=-h.b/2;s.chips+=h.b/2;s.net+=h.n;h.done=true;}
  advance(S);return S;
}
/* dealer stands on all 17s, blackjack pays 3 to 2 */
function finish(S){
  S.dealer.hole=false;S.rc+=hilo(S.dealer.c[1]);
  const dBJ=tot(S.dealer.c).t===21&&S.dealer.c.length===2;
  const live=S.seats.some(s=>s.hands.some(h=>h.r!=='sur'&&tot(h.c).t<=21&&!isBJ(h)));
  if(live&&!dBJ)while(tot(S.dealer.c).t<17)S.dealer.c.push(draw(S));
  const d=tot(S.dealer.c).t;
  S.seats.forEach(s=>s.hands.forEach(h=>{
    h.done=true;if(h.r==='sur')return;
    const p=tot(h.c).t;let pay=0;
    if(isBJ(h)){h.r=dBJ?'push':'bj';pay=dBJ?h.b:h.b*2.5;}
    else if(p>21)h.r='bust';
    else if(dBJ)h.r='lose';
    else if(d>21||p>d){h.r='win';pay=h.b*2;}
    else if(p===d){h.r='push';pay=h.b;}
    else h.r='lose';
    h.n=pay-h.b;s.chips+=pay;s.net+=h.n;
  }));
  S.seats.forEach(s=>{s.ready=false;});
  S.phase='done';S.turn=null;
}
function next(S){
  if(S.phase!=='done')return null;
  S.phase='bet';S.dealer={c:[],hole:false};S.seats=S.seats.filter(s=>!s.gone);
  S.seats.forEach(s=>{s.hands=[];s.ready=false;});return S;
}

/* basic strategy for 6 decks, dealer stands on 17, double after split, late surrender */
function hint(S,s){
  const o=options(S,s);if(!o.hit)return null;
  const h=s.hands[s.hi],u=pts(S.dealer.c[0]),d=u===1?11:u,{t,soft}=tot(h.c),p=h.c.length===2&&pts(h.c[0])===pts(h.c[1])?pts(h.c[0]):0;
  const dbl=alt=>o.double?'double':alt,up=d===11?'an ace':'a '+d;
  if(o.surrender&&!soft&&p!==8&&(t===16&&d>=9||t===15&&d===10))return['surrender',`Hard ${t} against ${up} loses most often. Give up half.`];
  if(p&&o.split){
    const sp={1:1,8:1,9:[2,3,4,5,6,8,9].includes(d),7:d<=7,6:d<=6,4:d===5||d===6,3:d<=7,2:d<=7}[p];
    if(sp)return['split',p===1?'Always split aces.':p===8?'Always split eights.':`Split ${RK[p-1]}s against ${up}.`];
  }
  if(soft){
    if(t>=20)return['stand',`Soft ${t} is strong. Stand.`];
    if(t===19)return d===6?[dbl('stand'),'Soft 19 against a 6: double if you can.']:['stand','Soft 19. Stand.'];
    if(t===18)return d>=3&&d<=6?[dbl('stand'),`Soft 18 against ${up}: double.`]:d<=8?['stand',`Soft 18 against ${up}: stand.`]:['hit',`Soft 18 against ${up}: hit, you can't bust.`];
    const lo={17:3,16:4,15:4,14:5,13:5}[t]||12;
    return d>=lo&&d<=6?[dbl('hit'),`Soft ${t} against ${up}: double.`]:['hit',`Soft ${t}: hit, you can't bust.`];
  }
  if(t>=17)return['stand',`Hard ${t}. Stand.`];
  if(t>=13)return d<=6?['stand',`${t} against ${up}: let the dealer bust.`]:['hit',`${t} against ${up}: the dealer is likely to make 17 or more. Hit.`];
  if(t===12)return d>=4&&d<=6?['stand',`12 against ${up}: stand.`]:['hit',`12 against ${up}: hit.`];
  if(t===11)return d<=10?[dbl('hit'),`11 against ${up}: double.`]:['hit','11 against an ace: hit.'];
  if(t===10)return d<=9?[dbl('hit'),`10 against ${up}: double.`]:['hit',`10 against ${up}: hit.`];
  if(t===9)return d>=3&&d<=6?[dbl('hit'),`9 against ${up}: double.`]:['hit',`9 against ${up}: hit.`];
  return['hit',`${t}: always hit.`];
}

/* ---------------- tables: Firestore, loaded only when someone opens one ---------------- */
let fs=null;
async function fire(){
  if(fs)return fs;
  const [A,F]=await Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-firestore.js')]);
  const app=A.getApps().find(a=>a.name==='bj')||A.initializeApp({apiKey:FB.apiKey,authDomain:FB.projectId+'.firebaseapp.com',projectId:FB.projectId},'bj');
  return fs={F,db:F.getFirestore(app)};
}
const fireNet={
  async create(code,S){const {F,db}=await fire(),ref=F.doc(db,'bjrooms',code);
    await F.runTransaction(db,async t=>{if((await t.get(ref)).exists())throw new Error('taken');t.set(ref,{s:JSON.stringify(S),v:1,exp:F.Timestamp.fromMillis(Date.now()+2*864e5)});});},
  async listen(code,cb,err){const {F,db}=await fire();
    return F.onSnapshot(F.doc(db,'bjrooms',code),d=>d.exists()?cb(JSON.parse(d.data().s),d.data().v):err({code:'not-found'}),err);},
  async tx(code,fn){const {F,db}=await fire(),ref=F.doc(db,'bjrooms',code);
    return F.runTransaction(db,async t=>{const d=await t.get(ref);if(!d.exists())throw new Error('not-found');
      const v=d.data().v,S=fn(JSON.parse(d.data().s),v);if(!S)return null;
      t.update(ref,{s:JSON.stringify(S),v:v+1,exp:F.Timestamp.fromMillis(Date.now()+2*864e5)});return S;});}
};
const NET=()=>window.BJ_NET||fireNet;
const CODEABC='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode=()=>Array.from({length:6},()=>CODEABC[rnd(CODEABC.length)]).join('');
const myId=(()=>{let id;try{id=sessionStorage.getItem('poshakos-bj-id')}catch(e){}
  if(!id){id=Array.from({length:12},()=>CODEABC[rnd(CODEABC.length)]).join('');try{sessionStorage.setItem('poshakos-bj-id',id)}catch(e){}}return id;})();

/* ---------------- the window ---------------- */
const SOLO='poshakos-bj-solo',STATS='poshakos-bj-stats',NAME='poshakos-bj-name';
let pending=null;
/* table settings, kept per browser */
const PREFS='poshakos-bj-prefs';
/* felt: name, center, edge, rail, printing */
const FELTS={classic:['Classic','#35a066','#0e4e2c','linear-gradient(#6a3820,#43200f 60%,#2c1409)','rgba(240,204,128,.75)'],
  crimson:['Crimson','#c23a4c','#4a0b16','linear-gradient(#3e2a1e,#22150d 60%,#140b06)','rgba(244,210,140,.8)'],
  royal:['Royal blue','#3b6fd4','#0f2459','linear-gradient(#5a3a22,#36200f 60%,#1f1208)','rgba(236,222,170,.8)'],
  monaco:['Monaco','#239a92','#0a3d3b','linear-gradient(#2a2a2a,#121212 60%,#050505)','rgba(232,196,110,.85)'],
  velvet:['Velvet','#7a46bd','#26103f','linear-gradient(#2c1a33,#170c1d 60%,#0b050e)','rgba(234,204,130,.8)'],
  midnight:['Midnight','#36425a','#0c0f16','linear-gradient(#1c1c22,#0c0c10 60%,#040406)','rgba(200,212,232,.7)'],
  neon:['Neon','#1f2238','#06070c','linear-gradient(#141626,#07080e)','#45f3ff']};
const BACKS={blue:['Blue','repeating-linear-gradient(45deg,rgba(255,255,255,.13) 0 3px,transparent 3px 8px),linear-gradient(135deg,#3d6fe0,#7a4ed8)'],
  red:['Red','repeating-linear-gradient(45deg,rgba(255,255,255,.14) 0 3px,transparent 3px 8px),linear-gradient(135deg,#d8394a,#8e1b2a)'],
  black:['Black and gold','repeating-linear-gradient(45deg,rgba(230,190,100,.35) 0 1.5px,transparent 1.5px 9px),repeating-linear-gradient(-45deg,rgba(230,190,100,.35) 0 1.5px,transparent 1.5px 9px),#141414'],
  green:['Green','repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.12) 0 2px,transparent 2px 7px),linear-gradient(135deg,#2a9a5c,#11552f)'],
  sunset:['Sunset','radial-gradient(circle at 50% 78%,#ffd27a 0 16%,transparent 17%),linear-gradient(#ff8a5c,#c4477a 50%,#3d3a8f)']};
/* each felt and back is a set of CSS variables on .bj; eras that restyle the table still win */
{const st=document.createElement('style');
  st.textContent=Object.entries(FELTS).map(([k,[,c,e,r,pr]])=>`.bj[data-felt="${k}"]{--felt:var(--grain),radial-gradient(60% 70% at 50% 30%,${c},${e});--rail:${r};--print:${pr}}`).join('\n')
    +'\n'+Object.entries(BACKS).map(([k,[,b]])=>`.bj[data-back="${k}"]{--back:${b}}`).join('\n')
    +'\n.bj[data-felt="neon"] .bj-t:after{box-shadow:inset 0 -2px 0 #45f3ff,inset 0 -12px 30px rgba(69,243,255,.18),inset 0 30px 60px rgba(0,0,0,.25)}'
    +'\n.bj[data-felt="neon"] .bj-felt text{filter:drop-shadow(0 0 4px #45f3ff)}.bj[data-felt="neon"] .bj-spot{box-shadow:inset 0 0 0 2px #ff4fd8,0 0 12px rgba(255,79,216,.5)}';
  document.head.appendChild(st);}
const SPEEDS={fast:['Quick',450],normal:['Normal',900],slow:['Slow',1500]};
const ACTS=[['hit','Hit','H'],['stand','Stand','S'],['double','Double','D'],['split','Split','P'],['surrender','Surrender','R']];

function wire(w){
  const root=w.querySelector('.bj');
  root.innerHTML=`<div class="bj-bar"><div class="bj-tabs" role="tablist"><button data-mode="solo" role="tab">Solo</button><button data-mode="mp" role="tab">With friends</button></div>
    <span class="bj-room"></span><span class="bj-sp"></span><span class="bj-info"></span><button class="bj-pill" data-x="count" aria-pressed="false" title="Hi-Lo card counting">Count</button><button class="bj-pill bj-gear" data-x="set" aria-label="Table settings" aria-expanded="false"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></div>
    <div class="bj-set" hidden></div>
    <div class="bj-t"><div class="bj-shoe" aria-hidden="true"><i></i></div>
      <div class="bj-dealer"></div><svg class="bj-felt" viewBox="0 0 640 100" aria-hidden="true"><path class="ln" d="M40 4Q320 80 600 4"/><path id="bjarc1" d="M90 24Q320 96 550 24"/><path id="bjarc2" d="M150 58Q320 122 490 58"/>
        <text class="big"><textPath href="#bjarc1" startOffset="50%">BLACKJACK PAYS 3 TO 2</textPath></text><text><textPath href="#bjarc2" startOffset="50%">DEALER STANDS ON ALL 17s</textPath></text></svg><div class="bj-msg" role="status"></div><div class="bj-seats"></div></div>
    <div class="bj-ctl"></div><div class="bj-lobby" hidden></div>`;
  const $=s=>root.querySelector(s),tabs=root.querySelectorAll('[data-mode]');
  const T=$('.bj-t'),dealerEl=$('.bj-dealer'),seatsEl=$('.bj-seats'),msgEl=$('.bj-msg'),ctl=$('.bj-ctl'),lobby=$('.bj-lobby'),info=$('.bj-info'),roomEl=$('.bj-room'),cntB=$('[data-x="count"]');
  let mode='solo',S=null,me=null,ver=0,seen=Date.now(),code=null,unsub=null,busy=false,tip=null,bet=null,counting=LS.get('poshakos-bj-count',false);
  let drawn=new Set(),lastRound=-1,lastHole=false,lastPhase='';
  let rev=null,doneShown=-1,firstPaint=true,revT=0;
  const P=Object.assign({felt:'classic',back:'blue',speed:'normal',totals:true,autohint:false},LS.get(PREFS,{}));
  const setEl=$('.bj-set');
  function applyPrefs(){
    root.dataset.felt=P.felt;root.dataset.back=P.back;root.dataset.totals=P.totals?'on':'off';
    root.style.setProperty('--step',Math.round(SPEEDS[P.speed][1]*.3)+'ms');
  }
  applyPrefs();

  /* ----- solo ----- */
  function loadSolo(){
    let s=LS.get(SOLO,null);
    if(!s||!s.shoe||!s.seats||!s.seats[0]){s=fresh();join(s,'me','You');}
    me='me';return s;
  }
  function saveSolo(){LS.set(SOLO,S);}
  function stats(){
    /* count each finished solo round once */
    if(mode!=='solo'||S.phase!=='done'||S.counted===S.round)return;S.counted=S.round;
    const st=LS.get(STATS,{hands:0,won:0,lost:0,push:0,bj:0,best:START}),s=S.seats[0];
    s.hands.forEach(h=>{st.hands++;if(h.r==='bj'){st.bj++;st.won++;}else if(h.r==='win')st.won++;else if(h.r==='push')st.push++;else st.lost++;});
    st.best=Math.max(st.best,s.chips);LS.set(STATS,st);
  }

  /* ----- one entry point for every move: solo applies it here, tables run it as a transaction ----- */
  async function play(fn,quiet){
    if(mode==='solo'){const r=fn(S);if(!r)return;S=r;stats();saveSolo();tip=null;paint();return;}
    if(busy&&!quiet)return;busy=true;
    try{await NET().tx(code,(st,v)=>fn(st,v));tip=null;}
    catch(e){if(!quiet)say(e&&e.message==='not-found'?'That table closed.':'That didn\'t go through. Try again.');}
    finally{busy=false;}
  }
  const mine=()=>S&&seatOf(S,me);

  /* ----- drawing ----- */
  function card(c,hidden,cls,d){
    if(hidden)return`<div class="bj-k dn${cls}" style="--d:${d}"></div>`;
    const r=RK[c%13],s=SU[Math.floor(c/13)%4],red=Math.floor(c/13)%4===1||Math.floor(c/13)%4===2;
    return`<div class="bj-k${red?' red':''}${cls}" style="--d:${d}"><span class="k-tl"><b>${r}</b><i>${s}</i></span><span class="k-md">${pts(c)===10&&r!=='10'?`<em>${r}</em>`:''}${s}</span></div>`;
  }
  function totLabel(cs,hide,sp){
    if(!cs.length)return'';if(hide)return String(tot([cs[0]]).t);
    const {t,soft}=tot(cs);return t>21?`${t} · bust`:cs.length===2&&t===21&&!sp?'Blackjack':soft&&t<21?`${t-10} / ${t}`:String(t);
  }
  /* a bet as a little stack of chips, biggest at the bottom */
  const DEN=[[500,'c500'],[100,'c100'],[25,'c25'],[5,'c5'],[1,'c1']];
  function stack(n,cls){
    const a=[];let r=n;for(const [v,c] of DEN)while(r>=v&&a.length<9){a.push(c);r-=v;}
    if(r>0&&a.length<9)a.push('c1');
    return`<span class="bj-stack${cls||''}">${a.map((c,i)=>`<i class="${c}" style="--i:${i}"></i>`).join('')}</span>`;
  }
  /* the circle in front of a hand: bet, then the payout or the dealer taking it */
  function spot(h,key){
    if(!h)return'<div class="bj-spot"></div>';
    const fx=h.r&&!drawn.has(key)?' fx':'';if(h.r)drawn.add(key);
    const lost=h.r==='lose'||h.r==='bust'||h.r==='sur',paid=h.r==='win'||h.r==='bj';
    return`<div class="bj-spot">${stack(h.r==='sur'?h.b/2:h.b,lost?' take'+fx:'')}${paid?stack(h.n,' pay'+fx):''}<span class="bj-amt">${money(h.b)}</span></div>`;
  }
  const RES={win:'Win',lose:'Lose',bust:'Bust',push:'Push',bj:'Blackjack',sur:'Surrender'};
  /* the dealer plays one card at a time: show the finished round a step at a time before the result */
  function view(){
    if(S.phase!=='done'||doneShown===S.round)return S;
    if(firstPaint||!S.dealer.c.length){doneShown=S.round;return S;}
    if(!rev||rev.round!==S.round){rev={round:S.round,k:1};clearTimeout(revT);revT=setTimeout(stepRev,SPEEDS[P.speed][1]*.8);}
    const V=JSON.parse(JSON.stringify(S)),n=Math.max(2,rev.k);
    S.dealer.c.forEach((c,i)=>{if(i>=n||i===1&&rev.k<2)V.rc-=hilo(c);});
    V.phase='play';V.turn=null;V.dealer.hole=rev.k<2;V.dealer.c=V.dealer.c.slice(0,n);V.reveal=1;
    V.seats.forEach(s=>s.hands.forEach(h=>{if(h.r==='sur')return;s.chips-=h.n+h.b;s.net-=h.n;delete h.r;delete h.n;}));
    return V;
  }
  function stepRev(){
    if(!w.isConnected||!rev||!S||S.round!==rev.round||S.phase!=='done')return;
    rev.k++;if(rev.k>S.dealer.c.length){doneShown=rev.round;rev=null;}
    else revT=setTimeout(stepRev,SPEEDS[P.speed][1]);
    paint();
  }
  function paint(){
    if(!S)return;
    const real=S;S=view();
    try{paint_();}finally{S=real;firstPaint=false;}
  }
  function paint_(){
    const PL=S.seats.filter(s=>s.hands.length),newRound=S.round!==lastRound;
    if(newRound){drawn=new Set();lastRound=S.round;}
    /* new cards fly in from the shoe; on a fresh deal they go round the table in order */
    let q=0;const d=(key,deal)=>{if(drawn.has(key))return['',0];drawn.add(key);return[' in',deal!=null&&newRound?deal:q++];};
    const flip=lastHole&&!S.dealer.hole&&!newRound;lastHole=S.dealer.hole;
    const dc=S.dealer.c.map((c,k)=>{const [cls,dl]=d('d'+k,k*(PL.length+1)+PL.length);const hid=k===1&&S.dealer.hole;return card(c,hid,cls+(k===1&&flip?' flip':''),dl);}).join('');
    dealerEl.innerHTML=`<div class="bj-cards">${dc||'<div class="bj-k ghost"></div>'}</div><div class="bj-lbl">Dealer${S.dealer.c.length?` <span class="bj-tot">${totLabel(S.dealer.c,S.dealer.hole)}</span>`:''}</div>`;
    const solo=mode==='solo',turnS=S.turn&&seatOf(S,S.turn);
    /* before the deal, show what's being bet: my chips as I click them, everyone else's once they're in */
    {const m=mine();if(m&&m.chips>=MIN&&(bet==null||bet>m.chips))bet=Math.min(m.bet||25,Math.floor(m.chips/MIN)*MIN);}
    const pend=s=>S.phase==='play'?0:s.id===me&&!s.ready?(bet||0):s.ready?s.bet:0;
    seatsEl.innerHTML=S.seats.map((s,j)=>{
      const pi=PL.indexOf(s);
      const hands=s.hands.map((h,k)=>{
        const cs=h.c.map((c,n)=>{const [cls,dl]=d(`${s.id}-${k}-${n}-${c}`,n*(PL.length+1)+pi);return card(c,false,cls,dl);}).join('');
        const on=S.turn===s.id&&s.hi===k&&s.hands.length>1;
        return`<div class="bj-hand${on?' on':''}${h.r?' r-'+h.r:''}"><div class="bj-cards">${cs}</div><div class="bj-under"><span class="bj-tot">${totLabel(h.c,false,h.sp)}</span></div>${spot(h,`r${S.round}-${s.id}-${k}`)}${h.r?`<span class="bj-res">${RES[h.r]}${h.n>0?' '+signed(h.n):''}</span>`:''}</div>`;
      }).join('');
      const status=solo?'':S.phase==='bet'?(s.ready?`<span class="bj-st ok">Bet ${money(s.bet)}</span>`:`<span class="bj-st">Betting…</span>`):(!s.hands.length?'<span class="bj-st">Sitting out</span>':'');
      return`<div class="bj-seat${s.id===me?' me':''}${S.turn===s.id?' turn':''}${s.gone?' gone':''}" data-seat="${j}">
        <div class="bj-hands">${hands||`<div class="bj-hand">${spot(pend(s)?{b:pend(s)}:null)}</div>`}</div>
        <div class="bj-name"><b>${solo?'You':esc(s.name)}${!solo&&s.id===me?' (you)':''}</b><span>${money(s.chips)}${!solo&&s.net?` · ${signed(s.net)}`:''}</span>${status}</div>
        ${!solo&&S.turn===s.id?'<div class="bj-timer"><i></i></div>':''}</div>`;
    }).join('')||'<p class="bj-empty">Nobody\'s sitting yet.</p>';
    seatsEl.classList.toggle('many',S.seats.length>2);
    const my=mine(),bk=`bj${S.round}`;
    if(S.phase==='done'&&my&&my.hands.some(h=>h.r==='bj')&&!drawn.has(bk)){drawn.add(bk);const b=document.createElement('div');b.className='bj-burst';b.innerHTML='<b>Blackjack!</b>';T.appendChild(b);setTimeout(()=>b.remove(),3200);setTimeout(()=>{sfx(988);setTimeout(()=>sfx(1318),110);},700);}
    if(q||newRound&&S.phase==='play')sfx(700);
    message();controls();infoBar();
    lastPhase=S.phase;
  }
  function message(){
    const s=mine();let m='';
    const auto=!tip&&P.autohint&&S.phase==='play'&&S.turn===me&&hint(S,s);
    if(tip||auto)m=`<b>Basic strategy says ${(tip||auto)[0]}.</b> ${(tip||auto)[1]}`;
    else if(S.reveal)m=S.dealer.hole?'Dealer\'s turn…':`Dealer has ${totLabel(S.dealer.c)}…`;
    else if(S.phase==='done'&&s&&s.hands.length){
      const d=tot(S.dealer.c).t,n=s.hands.reduce((a,h)=>a+h.n,0);
      const dl=S.dealer.c.length===2&&d===21?'Dealer has blackjack.':d>21?`Dealer busts with ${d}.`:`Dealer has ${d}.`;
      m=`${dl} ${n>0?`You win ${money(n)}.`:n<0?`You lose ${money(-n)}.`:'Push.'}`;
    }
    else if(S.phase==='done')m=tot(S.dealer.c).t>21?`Dealer busts with ${tot(S.dealer.c).t}.`:`Dealer has ${tot(S.dealer.c).t}.`;
    else if(S.phase==='play'&&S.turn&&S.turn!==me){const t=seatOf(S,S.turn);m=`${esc(t?t.name:'')} is playing…`;}
    else if(S.phase==='play'&&S.turn===me){const s2=mine();m=s2.hands.length>1?`Your move on hand ${s2.hi+1} of ${s2.hands.length}.`:'Your move.';}
    else if(S.phase==='bet'&&mode==='mp'){const w8=S.seats.filter(x=>!x.ready).length;m=!s?'You\'re watching. The table is full.':s.ready?(w8?`Waiting for ${w8} more to bet. Dealing in ${Math.max(0,Math.ceil((BETWAIT-(Date.now()-seen))/1000))}s if they don't.`:'Dealing…'):'Place your bet.';}
    else if(S.phase==='bet')m='Place your bet.';
    msgEl.innerHTML=m;msgEl.classList.toggle('tip',!!(tip||auto));
  }
  function controls(){
    const s=mine();
    if(!s){ctl.innerHTML=mode==='mp'?'<span class="bj-wait">The table is full. You\'ll see every hand from here.</span>':'';return;}
    const o=options(S,s);
    if(S.phase==='play'&&o.hit){
      ctl.innerHTML=`<div class="bj-acts">${ACTS.map(([a,l,k])=>`<button data-a="${a}"${o[a]?'':' disabled'}><span>${l}</span><kbd>${k}</kbd></button>`).join('')}<button class="ghost" data-x="hint"><span>Hint</span><kbd>?</kbd></button></div>`;
      return;
    }
    if(S.phase==='play'){ctl.innerHTML=`<span class="bj-wait">${s.hands.length?'Waiting for the table…':'You\'re in next hand.'}</span>`;return;}
    if(S.phase==='bet'&&s.ready){ctl.innerHTML=`<span class="bj-wait">You bet ${money(s.bet)}.</span><button class="ghost" data-x="unready">Change bet</button>`;return;}
    if(s.chips<MIN){ctl.innerHTML=`<span class="bj-wait">Out of chips.</span><button class="go" data-x="rebuy">Borrow ${money(START)} from the house</button>`;return;}
    if(bet==null||bet>s.chips)bet=Math.min(s.bet||25,Math.floor(s.chips/MIN)*MIN);
    const nx=mode==='mp'&&S.phase==='done'?Math.max(0,Math.ceil((NEXTWAIT-(Date.now()-seen))/1000)):0;
    ctl.innerHTML=`<div class="bj-chips">${CHIPS.map(c=>`<button class="bj-c c${c}" data-c="${c}"${bet+c>s.chips?' disabled':''} aria-label="Add ${c}"><span>${c}</span></button>`).join('')}</div>
      <div class="bj-betbox"><span class="bj-bet"><small>Bet</small>${money(bet)}</span><button class="ghost" data-x="clear"${bet?'':' disabled'}>Clear</button><button class="ghost" data-x="allin" title="Bet everything">All in</button>
      <button class="go" data-x="deal"${bet>=MIN?'':' disabled'}>${mode==='mp'?'Deal me in':'Deal'}</button></div>${nx?`<span class="bj-wait sm">Next hand in ${nx}s</span>`:''}`;
  }
  function infoBar(){
    const left=(S.shoe.length-S.pos)/52,tc=S.rc/Math.max(.5,left);
    cntB.setAttribute('aria-pressed',counting);
    info.innerHTML=counting?`Running <b>${S.rc>0?'+':''}${S.rc}</b> · True <b>${tc>0?'+':''}${tc.toFixed(1)}</b> · ${left.toFixed(1)} decks left`:mode==='solo'?soloLine():'';
    root.querySelector('.bj-shoe i').style.height=Math.max(4,100*(S.shoe.length-S.pos)/S.shoe.length)+'%';
    root.querySelector('.bj-shoe').title=`${S.shoe.length-S.pos} cards left in the shoe`;
  }
  function soloLine(){const st=LS.get(STATS,null);if(!st||!st.hands)return'6 decks · S17 · 3:2';return`${st.hands} hand${st.hands===1?'':'s'} · ${Math.round(100*st.won/st.hands)}% won · best bank ${money(st.best)}`;}

  /* ----- settings ----- */
  function settings(open){
    setEl.hidden=!open;root.querySelector('[data-x="set"]').setAttribute('aria-expanded',open);if(!open)return;
    const sw=(kind,list,cur,bg)=>`<div class="bj-sw">${Object.entries(list).map(([k,v])=>`<button data-${kind}="${k}" aria-pressed="${cur===k}" title="${v[0]}"><i style="background:${bg(v)}"></i><small>${v[0]}</small></button>`).join('')}</div>`;
    const tg=(k,l,on)=>`<label class="bj-tg"><input type="checkbox" data-pref="${k}"${on?' checked':''}><span>${l}</span></label>`;
    setEl.innerHTML=`<div class="bj-set-h"><b>Table settings</b><button data-x="set" aria-label="Close">✕</button></div>
      <h4>Table</h4>${sw('felt',FELTS,P.felt,v=>`radial-gradient(circle at 50% 35%,${v[1]},${v[2]})`)}
      <h4>Card backs</h4>${sw('back',BACKS,P.back,v=>v[1])}
      <h4>Dealer speed</h4><div class="bj-seg">${Object.entries(SPEEDS).map(([k,[l]])=>`<button data-speed="${k}" aria-pressed="${P.speed===k}">${l}</button>`).join('')}</div>
      <h4>Help</h4>${tg('totals','Show hand totals',P.totals)}${tg('autohint','Show the best move on every hand',P.autohint)}${tg('count','Card counting readout (Hi-Lo)',counting)}
      ${mode==='solo'?`<button class="bj-reset" data-x="reset">Reset my bank and stats</button>`:''}`;
  }
  setEl.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    for(const k of ['felt','back','speed'])if(b.dataset[k]){P[k]=b.dataset[k];LS.set(PREFS,P);applyPrefs();settings(true);sfx(760);e.stopPropagation();return;}
  });
  setEl.addEventListener('change',e=>{
    const k=e.target.dataset.pref;if(!k)return;
    if(k==='count'){counting=e.target.checked;LS.set('poshakos-bj-count',counting);if(S)infoBar();return;}
    P[k]=e.target.checked;LS.set(PREFS,P);applyPrefs();if(S)paint();
  });
  root.addEventListener('pointerdown',e=>{if(!setEl.hidden&&!e.target.closest('.bj-set,[data-x="set"]'))settings(false);});

  /* ----- input ----- */
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.mode)return setMode(b.dataset.mode);
    if(b.dataset.a){const a=b.dataset.a;sfx(a==='stand'?520:640);play(st=>act(st,me,a));return;}
    if(b.dataset.c){bet=Math.min((bet||0)+ +b.dataset.c,mine().chips);sfx(880);paint();return;}
    const x=b.dataset.x;
    if(x==='clear'){bet=0;paint();}
    else if(x==='allin'){bet=mine().chips;paint();}
    else if(x==='deal')deal_();
    else if(x==='unready')play(st=>unready(st,me));
    else if(x==='rebuy')play(st=>rebuy(st,me));
    else if(x==='hint'){tip=hint(S,mine());message();}
    else if(x==='count'){counting=!counting;LS.set('poshakos-bj-count',counting);infoBar();if(!setEl.hidden)settings(true);}
    else if(x==='set')settings(setEl.hidden);
    else if(x==='reset'){if(b.dataset.sure){S=fresh();join(S,'me','You');try{localStorage.removeItem(STATS)}catch(e){}saveSolo();bet=null;tip=null;rev=null;doneShown=-1;settings(false);paint();say('Fresh bank: $1,000.');}else{b.dataset.sure=1;b.textContent='Tap again to reset';}}
  });
  function deal_(){const s=mine();if(!s||!(bet>=MIN))return;const b=bet;play(st=>ready(st,me,b));}
  /* on the document, so shortcuts keep working after the button you clicked disappears */
  const onKey=e=>{
    if(!w.isConnected)return document.removeEventListener('keydown',onKey);
    if(e.key==='Escape'&&!setEl.hidden&&w.classList.contains('front')){settings(false);return;}
    if(!w.classList.contains('front')||e.target.closest&&e.target.closest('input,textarea')||e.metaKey||e.ctrlKey||e.altKey||!S||!lobby.hidden)return;
    const k=e.key.toLowerCase(),m={h:'hit',s:'stand',d:'double',p:'split',r:'surrender'}[k];
    if(m&&options(S,mine())[m]){e.preventDefault();play(st=>act(st,me,m));}
    else if(k==='?'&&options(S,mine()).hit){tip=hint(S,mine());message();}
    else if(k==='enter'&&(S.phase==='bet'||S.phase==='done')&&!rev&&mine()&&!mine().ready&&!(e.target.closest&&e.target.closest('button'))){e.preventDefault();deal_();}
  };
  document.addEventListener('keydown',onKey);

  /* ----- tables ----- */
  function setMode(m){
    if(m===mode&&!(m==='mp'&&!code))return;
    tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.mode===m));
    if(m==='solo'){leaveTable();mode='solo';lobby.hidden=true;T.hidden=ctl.hidden=false;S=loadSolo();bet=null;tip=null;roomEl.innerHTML='';paint();return;}
    mode='mp';S=null;showLobby();
  }
  function showLobby(prefill,err){
    T.hidden=ctl.hidden=true;lobby.hidden=false;info.innerHTML='';roomEl.innerHTML='';
    const name=LS.get(NAME,'');
    lobby.innerHTML=`<div class="bj-card"><h3>${prefill?`Join table ${esc(prefill)}`:'Play with friends'}</h3>
      <p>${prefill?'Pick a name and sit down.':'Open a table and send the link. Up to five people play the same shoe against one dealer, each with their own chips.'}</p>
      <label>Your name<input name="nm" maxlength="16" autocomplete="nickname" value="${esc(name)}" placeholder="e.g. Sam"></label>
      ${prefill?`<button class="go" data-l="join">Sit down</button>`:`<button class="go" data-l="open">Open a table</button>
      <div class="bj-or"><span>or join one</span></div><div class="bj-join"><input name="cd" maxlength="6" placeholder="Table code" autocapitalize="characters" spellcheck="false"><button class="ghost" data-l="join">Join</button></div>`}
      <p class="bj-err" role="alert">${err?esc(err):''}</p></div>`;
    const nm=lobby.querySelector('[name=nm]'),cd=lobby.querySelector('[name=cd]');
    const go=async kind=>{
      const n=nm.value.trim().slice(0,16);if(!n){nm.focus();lobby.querySelector('.bj-err').textContent='Pick a name first.';return;}
      LS.set(NAME,n);const c=kind==='open'?null:(prefill||(cd&&cd.value||'').toUpperCase().replace(/[^A-Z0-9]/g,''));
      if(kind==='join'&&!/^[A-Z0-9]{6}$/.test(c||'')){lobby.querySelector('.bj-err').textContent='Table codes are 6 letters and numbers.';return;}
      lobby.querySelectorAll('button').forEach(b=>b.disabled=true);lobby.querySelector('.bj-err').textContent=kind==='open'?'Opening a table…':'Finding the table…';
      try{await(kind==='open'?openTable(n):joinTable(c,n));}
      catch(e){showLobby(prefill,errText(e));}
    };
    lobby.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>go(b.dataset.l));
    lobby.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go(prefill||i===cd?'join':'open');}});
    if(cd)cd.oninput=()=>{cd.value=cd.value.toUpperCase();};
    setTimeout(()=>(name?(cd||lobby.querySelector('.go')):nm).focus(),50);
  }
  function errText(e){
    const c=e&&(e.code||e.message)||'';
    if(/permission/.test(c))return'Tables aren\'t switched on yet. Solo still works.';
    if(/not-found/.test(c))return'No table with that code. It may have closed.';
    if(/full/.test(c))return'That table is full (5 players).';
    if(/unavailable|network|Failed to fetch|import/i.test(c))return'Couldn\'t reach the table server. Check your connection.';
    return'Something went wrong. Try again.';
  }
  async function openTable(name){
    let c,tries=0;const st=fresh();join(st,myId,name);
    for(;;){c=newCode();try{await NET().create(c,st);break;}catch(e){if(e.message!=='taken'||++tries>4)throw e;}}
    await subscribe(c);
    copyLink(true);
  }
  async function joinTable(c,name){
    let full=false;
    await NET().tx(c,st=>{const r=join(st,myId,name);if(!r){full=true;return null;}return r;});
    if(full)throw new Error('full');
    await subscribe(c);
  }
  async function subscribe(c){
    if(unsub)unsub();code=c;me=myId;bet=null;firstPaint=true;
    let first=true;
    unsub=await NET().listen(c,(st,v)=>{
      if(!w.isConnected)return;
      if(v!==ver){seen=Date.now();ver=v;tip=null;}
      S=st;if(first){first=false;lobby.hidden=true;T.hidden=ctl.hidden=false;}
      roomEl.innerHTML=`Table <b>${c}</b><button class="bj-pill" data-r="copy">Copy invite link</button><button class="bj-pill ghost" data-r="leave">Leave</button>`;
      roomEl.querySelector('[data-r=copy]').onclick=()=>copyLink();
      roomEl.querySelector('[data-r=leave]').onclick=()=>{leaveTable();showLobby();};
      paint();
    },e=>{if(!w.isConnected)return;const was=code;stopTable();showLobby(null,was?errText(e):'');});
  }
  function link(){return location.origin+location.pathname+'#bj-'+code;}
  function copyLink(fresh){
    const u=link(),ok=()=>say(fresh?'Table open. Invite link copied, send it to friends.':'Invite link copied.');
    try{navigator.clipboard.writeText(u).then(ok,()=>say('Send friends this link: '+u));}catch(e){say('Send friends this link: '+u);}
  }
  function stopTable(){if(unsub){try{unsub()}catch(e){}}unsub=null;code=null;S=null;ver=0;}
  function leaveTable(){if(!code)return;const c=code;stopTable();NET().tx(c,st=>leave(st,myId)).catch(()=>{});}

  /* the table keeps moving without a host: if nothing changes for a while, any open window nudges it */
  const tick=setInterval(()=>{
    if(!w.isConnected){clearInterval(tick);leaveTable();return;}
    if(mode!=='mp'||!S||busy)return;
    const idle=Date.now()-seen,v0=ver;
    const timer=root.querySelector('.bj-timer i');if(timer)timer.style.width=Math.max(0,100-100*idle/TURN)+'%';
    if(S.phase==='play'&&S.turn&&idle>TURN)play((st,v)=>v===v0&&st.turn?act(st,st.turn,'stand'):null,true);
    else if(S.phase==='bet'&&S.seats.some(s=>s.ready)&&idle>BETWAIT)play((st,v)=>v===v0&&st.phase==='bet'&&deal(st)?st:null,true);
    else if(S.phase==='done'&&idle>NEXTWAIT)play((st,v)=>v===v0?next(st):null,true);
    else if(S.phase==='bet')message();
    else if(S.phase==='done'){const sm=ctl.querySelector('.sm');if(sm)sm.textContent=`Next hand in ${Math.max(0,Math.ceil((NEXTWAIT-idle)/1000))}s`;}
  },1000);

  /* start in whatever the link asked for */
  const want=pending;pending=null;
  if(want){mode='mp';tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.mode==='mp'));const n=LS.get(NAME,'');
    if(n){T.hidden=ctl.hidden=true;lobby.hidden=false;lobby.innerHTML=`<div class="bj-card"><h3>Joining table ${esc(want)}…</h3></div>`;joinTable(want,n).catch(e=>showLobby(want,errText(e)));}
    else showLobby(want);}
  else{tabs[0].setAttribute('aria-selected',true);S=loadSolo();paint();}
  w._bjJoin=c=>{if(code===c)return;leaveTable();pending=null;mode='mp';tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.mode==='mp'));showLobby(c);};
}

/* ---------------- register the app ---------------- */
I.bj='<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="10" height="14.5" rx="1.8" transform="rotate(-10 8.5 12.25)"/><rect x="10" y="3.5" width="10.5" height="15" rx="1.8"/><path d="M15.25 7.5 13.4 12h3.7zM14 10.7h2.5M17.5 15.5h.01"/></svg>';
COLORS.bj='#17673d';
APPS.bj={t:'Blackjack',w:820,h:580,html:()=>'<div class="bj"></div>',init:wire};
PAL_BASE.splice(PAL_BASE.findIndex(x=>x.t==='Solitaire')+1,0,{t:'Blackjack',d:'Play the house, or open a table for friends',ic:I.bj,go:()=>open('bj')});

/* #blackjack opens it, #bj-CODE sits you down at a friend's table */
function route(){
  const h=location.hash,m=/^#bj-([A-Za-z0-9]{6})$/.exec(h);
  if(m){const c=m[1].toUpperCase(),w=wins.bj;if(w&&w._bjJoin){focusWin(w);w._bjJoin(c);}else{pending=c;open('bj');}}
  else if(h==='#blackjack')open('bj');
}
window.addEventListener('hashchange',route);
route();
window.BJ_ENGINE={fresh,join,leave,ready,act,next,deal,hint,tot,options,rebuy};
})();
