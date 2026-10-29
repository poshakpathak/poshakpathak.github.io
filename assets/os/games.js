/* PoshakOS games: a Games folder with Minesweeper and Solitaire (Klondike), Blackjack (blackjack.js), plus a shortcut to Snake in the Terminal.
   Loaded before the main script, which merges GAMES.icons into I and GAMES.apps into APPS.
   Everything here runs lazily, so it can use open, blip, toast and desk from the main script. */
const GAMES=(()=>{
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const osEl=()=>document.getElementById('os');
const isPhone=()=>osEl().classList.contains('phone');
const sfx=f=>{try{blip(f)}catch(e){}};
const say=m=>{try{toast(m)}catch(e){}};
const fmtT=s=>s<60?s+'s':Math.floor(s/60)+':'+String(s%60).padStart(2,'0');

const icons={
  games:'<svg viewBox="0 0 24 24"><path d="M7 7h10a5 5 0 0 1 5 5v1.5a3.5 3.5 0 0 1-6.2 2.2L14.6 14H9.4l-1.2 1.7A3.5 3.5 0 0 1 2 13.5V12a5 5 0 0 1 5-5z"/><path d="M7.5 9.5v3.5M5.75 11.25h3.5M15.5 10.5h.01M17.5 12.5h.01"/></svg>',
  mines:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/><path d="M10.2 10.2h.01"/></svg>',
  sol:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="10.5" height="14.5" rx="2" transform="rotate(-12 8.25 13.25)"/><rect x="9.5" y="3.5" width="11" height="15" rx="2"/><path d="M15 7.8c-1.1 1.4-2.3 2.3-2.3 3.4a1.3 1.3 0 0 0 2.3.8 1.3 1.3 0 0 0 2.3-.8c0-1.1-1.2-2-2.3-3.4zM15 12v2.2"/></svg>'
};

/* little pictures for the Games folder */
const TH=(()=>{
  const ms=['hhh1 2hh','hh11 1fh','h21  1hh','h1   12h','h1    1h'],nc={1:'#2563eb',2:'#16a34a',3:'#dc2626'};
  let m='';ms.forEach((row,r)=>[...row].forEach((ch,c)=>{const x=6+c*12.6,y=6+r*14.6;
    m+=ch==='h'||ch==='f'?`<rect x="${x}" y="${y}" width="11.4" height="13.4" rx="2" fill="#dfe6f0"/>`:`<rect x="${x}" y="${y}" width="11.4" height="13.4" rx="2" fill="#f7f9fc"/>`;
    if(ch==='f')m+=`<path d="M${x+4} ${y+3}v8" stroke="#222" stroke-width="1.3"/><path d="M${x+4.6} ${y+3}l4.6 2.4-4.6 2.4z" fill="#e5312b"/>`;
    if(nc[ch])m+=`<text x="${x+5.7}" y="${y+10.4}" font-size="9.5" font-weight="700" text-anchor="middle" fill="${nc[ch]}" font-family="Geist,system-ui,sans-serif">${ch}</text>`;}));
  const card=(x,y,rot,t,s,red)=>`<g transform="rotate(${rot} ${x+17} ${y+24})"><rect x="${x}" y="${y}" width="34" height="48" rx="4" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width=".6"/><text x="${x+4}" y="${y+11}" font-size="9" font-weight="700" fill="${red?'#d42a2a':'#1a1a1a'}" font-family="Geist,system-ui,sans-serif">${t}</text><text x="${x+17}" y="${y+33}" font-size="17" text-anchor="middle" fill="${red?'#d42a2a':'#1a1a1a'}">${s}</text></g>`;
  return{
    mines:`<svg viewBox="0 0 112 84" style="stroke:none"><rect width="112" height="84" fill="#c9d3e0"/>${m}</svg>`,
    sol:`<svg viewBox="0 0 112 84" style="stroke:none"><rect width="112" height="84" fill="#17673d"/>${card(14,22,-14,'K','♠︎')}${card(39,16,-2,'Q','♥︎',1)}${card(64,20,12,'A','♦︎',1)}</svg>`,
    bj:`<svg viewBox="0 0 112 84" style="stroke:none"><rect width="112" height="84" fill="#17673d"/><ellipse cx="56" cy="92" rx="70" ry="40" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/>${card(24,14,-10,'A','♠︎')}${card(50,12,8,'K','♥︎',1)}<g transform="translate(86 62)"><circle r="11" fill="#d23a3a"/><circle r="11" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 4.6"/><circle r="6.5" fill="#d23a3a" stroke="#fff" stroke-width=".8"/></g></svg>`,
    snake:`<svg viewBox="0 0 112 84" style="stroke:none"><rect width="112" height="84" fill="#0f141c"/><path d="M22 62h30V40h26V26h12" fill="none" stroke="#4ade80" stroke-width="7" stroke-linejoin="round" stroke-linecap="square"/><rect x="86" y="52" width="7" height="7" fill="#f87171"/></svg>`
  };
})();
const ITEMS=[['mines','Minesweeper','Clear the field'],['sol','Solitaire','Klondike, draw 1 or 3'],['bj','Blackjack','Solo or with friends'],['snake','Snake','Plays in the Terminal']];

function playSnake(){
  const w=open('term');
  setTimeout(()=>{const i=w&&w.querySelector('#tin');if(!i||i.disabled)return;i.value='snake';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));},250);
}

/* ---------------- Minesweeper ---------------- */
const LV={beginner:[9,9,10,'Beginner'],intermediate:[16,16,40,'Intermediate'],expert:[30,16,99,'Expert']};
const NB=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const MINE='<svg viewBox="0 0 16 16" class="mn"><path d="M8 1.6v12.8M1.6 8h12.8M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="4.6" fill="currentColor" stroke="none"/><circle cx="6.5" cy="6.5" r="1.3" fill="#fff" stroke="none"/></svg>';
const FLAG='<svg viewBox="0 0 16 16" class="fl" style="stroke:none"><path d="M5.2 2h1.5v10.4H5.2z" fill="currentColor"/><path d="M6.7 2.2 13 5.3 6.7 8.4z" fill="#e5312b" class="fr"/><path d="M3 12.4h7.2V14H3z" fill="currentColor"/></svg>';
const NOPE='<svg viewBox="0 0 16 16" class="no"><path d="M2.5 2.5l11 11M13.5 2.5l-11 11" stroke="#e5312b" stroke-width="2"/></svg>';
const FACE=k=>`<svg viewBox="0 0 24 24" class="face" style="stroke:#1a1a1a;stroke-width:1.3"><circle cx="12" cy="12" r="10" fill="#ffd43b"/>${{
  ok:'<circle cx="8.7" cy="9.6" r="1.25" fill="#1a1a1a" stroke="none"/><circle cx="15.3" cy="9.6" r="1.25" fill="#1a1a1a" stroke="none"/><path d="M7.6 13.8c1.2 2 2.6 3 4.4 3s3.2-1 4.4-3"/>',
  oh:'<circle cx="8.7" cy="9.3" r="1.25" fill="#1a1a1a" stroke="none"/><circle cx="15.3" cy="9.3" r="1.25" fill="#1a1a1a" stroke="none"/><circle cx="12" cy="15.4" r="2.1"/>',
  dead:'<path d="M7.2 8l3 3M10.2 8l-3 3M13.8 8l3 3M16.8 8l-3 3M8 17.2c1.2-1.5 2.5-2.2 4-2.2s2.8.7 4 2.2"/>',
  cool:'<path d="M4.4 9.2h15.2"/><path d="M5.6 9.2h5.6v1.4a2.2 2.2 0 0 1-2.2 2.2H7.8a2.2 2.2 0 0 1-2.2-2.2zM12.8 9.2h5.6v1.4a2.2 2.2 0 0 1-2.2 2.2H15a2.2 2.2 0 0 1-2.2-2.2z" fill="#1a1a1a"/><path d="M8.2 14.8c1.1 1.5 2.4 2.2 3.8 2.2s2.7-.7 3.8-2.2"/>'
}[k]}</svg>`;

function wireMines(w){
  const root=w.querySelector('.ms');
  let lv=LS.get('poshakos-ms-level','beginner');if(!LV[lv])lv='beginner';
  let C,R,M,mine,cnt,shown,flag,flags,left,st,t0,tick,flagMode=false,els=[],press=null;
  root.innerHTML=`<div class="ms-lv" role="group" aria-label="Difficulty">${Object.entries(LV).map(([k,v])=>`<button data-lv="${k}">${v[3]}</button>`).join('')}</div>
    <div class="ms-panel"><div class="ms-head"><span class="ms-led ms-left" aria-label="Mines left">000</span><button class="ms-face" aria-label="New game"></button><span class="ms-led ms-time" aria-label="Seconds">000</span></div><div class="ms-grid" role="grid" aria-label="Minefield"></div></div>
    <div class="ms-foot"><button class="ms-flag" aria-pressed="false">${FLAG}<span>Flag mode</span></button><span class="ms-best"></span></div>
    <p class="ms-tip">Right-click or long-press to flag. Tap a number to clear around it.</p>`;
  const grid=root.querySelector('.ms-grid'),faceB=root.querySelector('.ms-face'),ledL=root.querySelector('.ms-left'),ledT=root.querySelector('.ms-time'),flagB=root.querySelector('.ms-flag'),bestEl=root.querySelector('.ms-best');
  const led=n=>n<0?'-'+String(Math.min(99,-n)).padStart(2,'0'):String(Math.min(999,n)).padStart(3,'0');
  const setFace=k=>{faceB.innerHTML=FACE(k);};
  const alt=i=>((i%C)+Math.floor(i/C))%2?' alt':'';
  const nbrs=i=>{const r=Math.floor(i/C),c=i%C,o=[];for(const[dr,dc]of NB){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<R&&cc>=0&&cc<C)o.push(rr*C+cc);}return o;};
  const showBest=()=>{const b=LS.get('poshakos-ms-best',{})[lv];bestEl.textContent=b!=null?`Best ${fmtT(b)}`:'No best time yet';};
  /* fit the cells to the room we have */
  function size(){
    const gap=parseFloat(getComputedStyle(grid).columnGap)||0,cap=lv==='expert'?26:32;
    const avail=root.clientWidth-28-24;
    root.style.setProperty('--cs',Math.max(14,Math.min(cap,Math.floor((avail-gap*(C-1))/C)))+'px');
  }
  function newGame(){
    clearInterval(tick);[C,R,M]=LV[lv];if(lv==='expert'&&isPhone())[C,R]=[R,C];
    const N=C*R;mine=new Uint8Array(N);cnt=new Uint8Array(N);shown=new Uint8Array(N);flag=new Uint8Array(N);
    flags=0;left=N-M;st='ready';t0=0;
    grid.style.setProperty('--c',C);grid.innerHTML='';els=[];
    const f=document.createDocumentFragment();
    for(let i=0;i<N;i++){const b=document.createElement('button');b.className='ms-c'+alt(i);b.dataset.i=i;b.setAttribute('aria-label','Hidden');els.push(b);f.appendChild(b);}
    grid.appendChild(f);
    root.querySelectorAll('[data-lv]').forEach(b=>b.classList.toggle('on',b.dataset.lv===lv));
    if(!isPhone()&&!w.classList.contains('max'))w.style.width=Math.min(desk.clientWidth-24,Math.max(320,C*(lv==='expert'?28:34)+56))+'px';
    size();ledL.textContent=led(M);ledT.textContent='000';setFace('ok');showBest();
  }
  function place(s){
    const no=new Set([s,...nbrs(s)]),pool=[];for(let i=0;i<C*R;i++)if(!no.has(i))pool.push(i);
    for(let k=0;k<M;k++){const j=k+Math.floor(Math.random()*(pool.length-k));[pool[k],pool[j]]=[pool[j],pool[k]];mine[pool[k]]=1;}
    for(let i=0;i<C*R;i++)cnt[i]=nbrs(i).reduce((a,j)=>a+mine[j],0);
  }
  function paint(i){const b=els[i];
    if(shown[i]){b.className='ms-c o'+alt(i)+(cnt[i]?' n'+cnt[i]:'');b.textContent=cnt[i]||'';b.setAttribute('aria-label',cnt[i]?cnt[i]+' nearby':'Empty');}
    else{b.className='ms-c'+alt(i)+(flag[i]?' f':'');b.innerHTML=flag[i]?FLAG:'';b.setAttribute('aria-label',flag[i]?'Flagged':'Hidden');}
  }
  function uncover(i){
    if(st==='won'||st==='lost'||flag[i]||shown[i])return;
    if(st==='ready'){place(i);st='play';t0=Date.now();tick=setInterval(()=>{if(!w.isConnected)return clearInterval(tick);ledT.textContent=led(Math.floor((Date.now()-t0)/1000));},250);}
    if(mine[i])return lose(i);
    const q=[i];let n=0;
    while(q.length){const j=q.pop();if(shown[j]||flag[j])continue;shown[j]=1;n++;left--;paint(j);if(!cnt[j])for(const k of nbrs(j))if(!shown[k])q.push(k);}
    sfx(n>6?780:620);
    if(!left)win();
  }
  /* a number with all its flags placed clears the rest of its neighbours */
  function chord(i){
    if(!cnt[i])return;const nb=nbrs(i);if(nb.filter(j=>flag[j]).length!==cnt[i])return;
    for(const j of nb)if(!shown[j]&&!flag[j]){uncover(j);if(st!=='play')return;}
  }
  const act=i=>shown[i]?chord(i):uncover(i);
  function toggleFlag(i){
    if(st==='won'||st==='lost'||shown[i])return;
    flag[i]^=1;flags+=flag[i]?1:-1;ledL.textContent=led(M-flags);paint(i);sfx(flag[i]?520:470);
  }
  function lose(i){
    st='lost';clearInterval(tick);setFace('dead');sfx(180);
    for(let j=0;j<C*R;j++){const b=els[j];
      if(mine[j]&&!flag[j]){b.className='ms-c o m'+alt(j)+(j===i?' boom':'');b.innerHTML=MINE;}
      else if(flag[j]&&!mine[j]){b.className='ms-c o m'+alt(j);b.innerHTML=MINE+NOPE;}}
  }
  function win(){
    st='won';clearInterval(tick);setFace('cool');
    for(let j=0;j<C*R;j++)if(mine[j]&&!flag[j]){flag[j]=1;paint(j);}
    ledL.textContent=led(0);
    const t=Math.max(1,Math.round((Date.now()-t0)/1000)),best=LS.get('poshakos-ms-best',{}),nb=best[lv]==null||t<best[lv];
    if(nb){best[lv]=t;LS.set('poshakos-ms-best',best);}
    showBest();sfx(988);setTimeout(()=>sfx(1318),120);
    say(`Cleared ${LV[lv][3].toLowerCase()} in ${fmtT(t)}${nb?' · new best':''}`);
  }
  grid.addEventListener('contextmenu',e=>e.preventDefault());
  grid.addEventListener('pointerdown',e=>{
    const b=e.target.closest('.ms-c');if(!b||st==='won'||st==='lost')return;const i=+b.dataset.i;
    if(e.button===2)return toggleFlag(i);
    if(e.button!==0)return;
    press={i,x:e.clientX,y:e.clientY,lp:false,t:setTimeout(()=>{if(!press)return;press.lp=true;if(!shown[i]){toggleFlag(i);try{navigator.vibrate&&navigator.vibrate(12)}catch(x){}}setFace('ok');},430)};
    if(!shown[i]&&!flag[i]&&!flagMode)setFace('oh');
  });
  const endPress=()=>{if(press){clearTimeout(press.t);press=null;}if(st==='play'||st==='ready')setFace('ok');};
  grid.addEventListener('pointermove',e=>{if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10)endPress();});
  grid.addEventListener('pointercancel',endPress);
  grid.addEventListener('pointerup',e=>{
    if(!press)return;const p=press;endPress();if(p.lp)return;
    const b=document.elementFromPoint(e.clientX,e.clientY);if(!b||!b.closest||b.closest('.ms-c')!==els[p.i])return;
    flagMode&&!shown[p.i]?toggleFlag(p.i):act(p.i);
  });
  /* keyboard: Enter or Space to open, F to flag, arrows to move */
  grid.addEventListener('click',e=>{if(e.detail!==0)return;const b=e.target.closest('.ms-c');if(b)act(+b.dataset.i);});
  grid.addEventListener('keydown',e=>{const b=e.target.closest('.ms-c');if(!b)return;const i=+b.dataset.i;
    if(e.key==='f'||e.key==='F'){e.preventDefault();toggleFlag(i);return;}
    const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-C,ArrowDown:C}[e.key];if(d==null)return;e.preventDefault();
    if((d===-1&&i%C===0)||(d===1&&i%C===C-1))return;const j=i+d;if(j>=0&&j<C*R)els[j].focus();});
  faceB.onclick=()=>{newGame();sfx(660);};
  root.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{lv=b.dataset.lv;LS.set('poshakos-ms-level',lv);newGame();});
  flagB.onclick=()=>{flagMode=!flagMode;flagB.setAttribute('aria-pressed',flagMode);};
  try{new ResizeObserver(()=>{if(C)size();}).observe(root);}catch(e){}
  newGame();
}

/* ---------------- Solitaire (Klondike) ---------------- */
const SUIT=['♠︎','♥︎','♦︎','♣︎'],RANK=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const isRed=c=>c.s===1||c.s===2;

function wireSol(w){
  const root=w.querySelector('.sol');
  root.innerHTML=`<div class="sol-bar"><button data-a="new">New game</button><button data-a="undo">Undo</button><button data-a="draw"></button><span class="sol-st"></span></div><div class="sol-b"></div>`;
  const board=root.querySelector('.sol-b'),stat=root.querySelector('.sol-st'),drawB=root.querySelector('[data-a="draw"]');
  let draw=LS.get('poshakos-sol-draw',1)===3?3:1;
  let S,hist=[],moves=0,t0=0,tick,won=false,finishing=false,fx=null,dg=null,L=null;
  const els={},loc={},pos={},slots={};

  /* the 52 cards and 13 slots are built once; layout() only moves them */
  for(let s=0;s<4;s++)for(let r=1;r<=13;r++){
    const e=document.createElement('div'),id=s*13+r-1;
    e.className='sol-k'+(s===1||s===2?' red':'');e.dataset.id=id;
    e.innerHTML=`<span class="k-tl"><b>${RANK[r]}</b><i>${SUIT[s]}</i></span><span class="k-md">${r>10?`<em>${RANK[r]}</em>`:''}${SUIT[s]}</span><span class="k-br"><b>${RANK[r]}</b><i>${SUIT[s]}</i></span>`;
    els[id]=e;
  }
  ['stock','waste','f0','f1','f2','f3','t0','t1','t2','t3','t4','t5','t6'].forEach(k=>{
    const d=document.createElement('div');d.className='sol-slot'+(k[0]==='f'?' f':'');d.dataset.p=k;
    if(k==='stock')d.innerHTML='<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></svg>';
    slots[k]=d;board.appendChild(d);
  });
  Object.values(els).forEach(e=>board.appendChild(e));

  const pile=(p,i)=>p==='stock'?S.stock:p==='waste'?S.waste:p==='f'?S.f[i]:S.t[i];
  const cardAt=id=>{const l=loc[id];return pile(l.p,l.i)[l.k];};
  const canF=(c,f)=>{const p=S.f[f],t=p[p.length-1];return t?t.s===c.s&&t.r===c.r-1:c.r===1;};
  const canT=(c,t)=>{const p=S.t[t],b=p[p.length-1];return b?b.up&&isRed(b)!==isRed(c)&&b.r===c.r+1:c.r===13;};
  const secs=()=>t0?Math.floor((Date.now()-t0)/1000):0;
  const status=()=>{stat.textContent=`${moves} move${moves===1?'':'s'} · ${fmtT(secs())}`;};
  const start=()=>{if(t0)return;t0=Date.now();tick=setInterval(()=>{if(!w.isConnected)return clearInterval(tick);if(!won)status();},1000);};

  function geom(){
    const W=board.clientWidth,H=board.clientHeight,g=Math.max(5,Math.round(W*.014));
    const cw=Math.max(30,Math.floor(Math.min(100,(W-g*8)/7,(H-g*3)/(1.42*3.3))));
    const ch=Math.round(cw*1.42),ox=Math.round((W-(7*cw+6*g))/2);
    return{W,H,g,cw,ch,x:c=>ox+c*(cw+g),ty:g*2+ch};
  }
  function layout(){
    if(!S)return;L=geom();const G=L;
    board.style.setProperty('--cw',G.cw+'px');board.style.setProperty('--ch',G.ch+'px');
    const sp=(k,x,y)=>{slots[k].style.transform=`translate(${x}px,${y}px)`;};
    sp('stock',G.x(0),G.g);sp('waste',G.x(1),G.g);for(let i=0;i<4;i++)sp('f'+i,G.x(3+i),G.g);for(let i=0;i<7;i++)sp('t'+i,G.x(i),G.ty);
    let z=1;
    const put=(c,x,y,p,i,k)=>{const e=els[c.id];e.classList.toggle('dn',!c.up);e.style.transform=`translate(${x}px,${y}px)`;e.style.zIndex=z++;loc[c.id]={p,i,k};pos[c.id]=[x,y];};
    S.stock.forEach((c,k)=>put(c,G.x(0),G.g,'stock',0,k));
    const vis=draw===3?3:1,n=S.waste.length;
    S.waste.forEach((c,k)=>put(c,G.x(1)+Math.max(0,k-(n-vis))*Math.round(G.cw*.26),G.g,'waste',0,k));
    S.f.forEach((p,i)=>p.forEach((c,k)=>put(c,G.x(3+i),G.g,'f',i,k)));
    S.t.forEach((p,i)=>{
      const dn=p.filter(c=>!c.up).length,up=p.length-dn,dOff=Math.round(G.ch*.12),room=G.H-G.ty-G.ch-G.g;
      let uOff=Math.round(G.ch*.28);if(up>1&&dn*dOff+(up-1)*uOff>room)uOff=Math.max(G.ch*.13,(room-dn*dOff)/(up-1));
      let y=G.ty;p.forEach((c,k)=>{put(c,G.x(i),y,'t',i,k);y+=c.up?uOff:dOff;});
    });
    status();
  }
  function deal(){
    const d=[];for(let s=0;s<4;s++)for(let r=1;r<=13;r++)d.push({id:s*13+r-1,s,r,up:false});
    for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
    S={stock:[],waste:[],f:[[],[],[],[]],t:[[],[],[],[],[],[],[]]};
    for(let i=0;i<7;i++)for(let j=i;j<7;j++)S.t[j].push(d.pop());
    S.t.forEach(p=>{p[p.length-1].up=true;});S.stock=d;
    hist=[];moves=0;t0=0;won=false;finishing=false;clearInterval(tick);stopFx();
    drawB.textContent='Draw '+draw;layout();
  }
  const snap=()=>{hist.push(JSON.stringify({S,moves}));if(hist.length>300)hist.shift();};
  function undo(){if(won||finishing||!hist.length)return;const h=JSON.parse(hist.pop());S=h.S;moves=h.moves;layout();sfx(500);}
  function move(src,dst){
    snap();const a=pile(src.p,src.i),cs=a.splice(src.k);pile(dst.p,dst.i).push(...cs);
    if(src.p==='t'&&a.length&&!a[a.length-1].up)a[a.length-1].up=true;
    moves++;start();sfx(dst.p==='f'?880:640);layout();check();
  }
  function flip(){
    if(won||finishing)return;
    if(!S.stock.length&&!S.waste.length)return;
    snap();
    if(S.stock.length){for(let n=0;n<draw&&S.stock.length;n++){const c=S.stock.pop();c.up=true;S.waste.push(c);}}
    else{S.stock=S.waste.reverse();S.stock.forEach(c=>{c.up=false;});S.waste=[];}
    moves++;start();sfx(560);layout();
  }
  /* tap a card: send it to a foundation if it can go, otherwise to the best tableau pile */
  function auto(id){
    const l=loc[id],a=pile(l.p,l.i),c=a[l.k],top=l.k===a.length-1;
    if(!c.up||(l.p!=='t'&&!top))return false;
    if(top&&l.p!=='f')for(let f=0;f<4;f++)if(canF(c,f)){move(l,{p:'f',i:f});return true;}
    const ts=[0,1,2,3,4,5,6].filter(t=>!(l.p==='t'&&t===l.i));
    for(const t of ts)if(S.t[t].length&&canT(c,t)){move(l,{p:'t',i:t});return true;}
    if(!(l.p==='t'&&l.k===0))for(const t of ts)if(!S.t[t].length&&canT(c,t)){move(l,{p:'t',i:t});return true;}
    return false;
  }
  function shake(id){const e=els[id];e.classList.remove('shake');void e.offsetWidth;e.classList.add('shake');sfx(220);}
  function check(){
    if(S.f.every(p=>p.length===13))return winGame();
    if(!finishing&&!S.stock.length&&!S.waste.length&&S.t.every(p=>p.every(c=>c.up)))finish();
  }
  /* everything is face up: play the rest home */
  function finish(){
    finishing=true;
    const step=()=>{if(!w.isConnected||won){finishing=false;return;}
      for(let t=0;t<7;t++){const a=S.t[t],c=a[a.length-1];if(!c)continue;
        for(let f=0;f<4;f++)if(canF(c,f)){move({p:'t',i:t,k:a.length-1},{p:'f',i:f});setTimeout(step,110);return;}}
      finishing=false;};
    setTimeout(step,250);
  }
  function winGame(){
    won=true;finishing=false;clearInterval(tick);status();
    const n=LS.get('poshakos-sol-wins',0)+1;LS.set('poshakos-sol-wins',n);
    say(`You won in ${moves} moves · ${fmtT(secs())}`);
    setTimeout(celebrate,350);
  }
  /* the 1990 victory: cards bounce off the foundations and leave trails */
  function celebrate(){
    if(!w.isConnected||!won)return;
    const G=L,cv=document.createElement('canvas'),dpr=Math.min(2,window.devicePixelRatio||1);
    cv.className='sol-fx';cv.width=G.W*dpr;cv.height=G.H*dpr;board.appendChild(cv);
    const x=cv.getContext('2d');x.scale(dpr,dpr);
    const mono=osEl().dataset.era==='1984',r=Math.max(3,G.cw*.07);
    const msg=document.createElement('div');msg.className='sol-msg';
    msg.innerHTML=`<b>You won!</b><span>${moves} moves · ${fmtT(secs())} · ${LS.get('poshakos-sol-wins',1)} win${LS.get('poshakos-sol-wins',1)===1?'':'s'} here</span><button>Deal again</button>`;
    board.appendChild(msg);msg.querySelector('button').onclick=()=>{deal();sfx(660);};
    const q=[];for(let k=12;k>=0;k--)for(let f=0;f<4;f++)q.push({f,c:S.f[f][k]});
    const fly=[];let fr=0,raf;
    const paintCard=(c,px,py)=>{
      x.beginPath();x.roundRect?x.roundRect(px,py,G.cw,G.ch,r):x.rect(px,py,G.cw,G.ch);
      x.fillStyle='#fff';x.fill();x.strokeStyle=mono?'#000':'rgba(0,0,0,.45)';x.lineWidth=1;x.stroke();
      x.fillStyle=isRed(c)&&!mono?'#d42a2a':'#111';x.textBaseline='top';x.textAlign='left';
      x.font=`700 ${Math.round(G.cw*.24)}px Geist,system-ui,sans-serif`;x.fillText(RANK[c.r],px+G.cw*.08,py+G.ch*.05);
      x.font=`${Math.round(G.cw*.5)}px system-ui,sans-serif`;x.textAlign='center';x.fillText(SUIT[c.s],px+G.cw/2,py+G.ch*.38);
    };
    const tickFx=()=>{
      if(fr++%9===0&&q.length){const n=q.shift();els[n.c.id].style.visibility='hidden';
        fly.push({c:n.c,x:G.x(3+n.f),y:G.g,vx:(Math.random()<.5?-1:1)*(3+Math.random()*5),vy:-Math.random()*7});}
      for(let i=fly.length-1;i>=0;i--){const p=fly[i];p.vy+=.55;p.x+=p.vx;p.y+=p.vy;
        if(p.y+G.ch>G.H){p.y=G.H-G.ch;p.vy*=-.74;}paintCard(p.c,p.x,p.y);
        if(p.x<-G.cw||p.x>G.W)fly.splice(i,1);}
      if(q.length||fly.length)raf=requestAnimationFrame(tickFx);
    };
    fx={stop(){cancelAnimationFrame(raf);cv.remove();msg.remove();Object.values(els).forEach(e=>{e.style.visibility='';});}};
    cv.addEventListener('pointerdown',()=>{cancelAnimationFrame(raf);});
    tickFx();
  }
  function stopFx(){if(fx){fx.stop();fx=null;}}

  /* pointer: tap to auto-move, drag to place */
  board.addEventListener('pointerdown',e=>{
    if(won||finishing||dg||e.button>0)return;
    const el=e.target.closest('.sol-k'),slot=e.target.closest('.sol-slot');
    if(!el){if(slot&&slot.dataset.p==='stock')flip();return;}
    const id=+el.dataset.id,l=loc[id];
    if(l.p==='stock')return flip();
    const a=pile(l.p,l.i);if(!a[l.k].up||(l.p!=='t'&&l.k!==a.length-1))return;
    e.preventDefault();
    dg={id,l,ids:a.slice(l.k).map(c=>c.id),x0:e.clientX,y0:e.clientY,on:false,pid:e.pointerId};
    try{board.setPointerCapture(e.pointerId);}catch(x){}
  });
  board.addEventListener('pointermove',e=>{
    if(!dg||e.pointerId!==dg.pid)return;const dx=e.clientX-dg.x0,dy=e.clientY-dg.y0;
    if(!dg.on){if(Math.hypot(dx,dy)<6)return;dg.on=true;dg.ids.forEach((i,n)=>{els[i].classList.add('drag');els[i].style.zIndex=1000+n;});}
    dg.ids.forEach(i=>{const p=pos[i];els[i].style.transform=`translate(${p[0]+dx}px,${p[1]+dy}px)`;});
  });
  board.addEventListener('pointerup',e=>{
    if(!dg||e.pointerId!==dg.pid)return;const d=dg;dg=null;
    d.ids.forEach(i=>els[i].classList.remove('drag'));
    if(!d.on){if(!auto(d.id))shake(d.id);return;}
    const p=pos[d.id],cx=p[0]+e.clientX-d.x0+L.cw/2,cy=p[1]+e.clientY-d.y0+L.ch/2,c=cardAt(d.id);
    const col=Math.max(0,Math.min(6,Math.round((cx-L.x(0)-L.cw/2)/(L.cw+L.g))));
    if(cy<L.ty-L.g){if(col>=3&&d.ids.length===1&&d.l.p!=='f'){for(const f of [col-3,0,1,2,3])if(canF(c,f))return move(d.l,{p:'f',i:f});}}
    else if(!(d.l.p==='t'&&d.l.i===col)&&canT(c,col))return move(d.l,{p:'t',i:col});
    layout();
  });
  board.addEventListener('pointercancel',()=>{if(!dg)return;dg.ids.forEach(i=>els[i].classList.remove('drag'));dg=null;layout();});
  root.querySelector('[data-a="new"]').onclick=()=>{deal();sfx(660);};
  root.querySelector('[data-a="undo"]').onclick=undo;
  drawB.onclick=()=>{draw=draw===1?3:1;LS.set('poshakos-sol-draw',draw);deal();};
  w.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();}});
  try{new ResizeObserver(()=>{if(!dg)layout();}).observe(board);}catch(e){window.addEventListener('resize',layout);}
  deal();
}

const apps={
  games:{t:"Games",w:600,h:400,html:()=>`<div class="fpath">${I.folder}Desktop › Games · ${ITEMS.length} items</div><div class="finder">${ITEMS.map(([a,n,s])=>`<button class="fitem" data-g="${a}"><span class="th gm-th">${TH[a]}</span><span>${n}<small>${s}</small></span></button>`).join('')}</div>`,
    init:w=>w.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>b.dataset.g==='snake'?playSnake():open(b.dataset.g))},
  mines:{t:"Minesweeper",w:360,h:null,html:()=>`<div class="ms"></div>`,init:wireMines},
  sol:{t:"Solitaire",w:780,h:600,html:()=>`<div class="sol"></div>`,init:wireSol}
};
return{icons,apps,playSnake};
})();
