/* boot screen: plays once on a first visit (and after Restart), styled for the current Time Machine era.
   Never on deep links (#ohtani, #blogs...), skipped with reduced motion, and any click, tap or key skips it. */
(function(){
const ls=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
let reboot=false;try{reboot=sessionStorage.getItem('poshakos-reboot')==='1';sessionStorage.removeItem('poshakos-reboot')}catch(e){}
if(!reboot&&(location.hash.length>1||ls('poshakos-booted')))return;
try{localStorage.setItem('poshakos-booted','1')}catch(e){}
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;

const era=['1984','1995','2001','2007','2013'].includes(ls('poshakos-era'))?ls('poshakos-era'):'now';
const P='<span class="pk">P</span>';
const MAC=['.XXXXXXXXXXXXXXXXXX.','X..................X','X.XXXXXXXXXXXXXXXX.X','X.X..............X.X','X.X..............X.X','X.X...X......X...X.X','X.X...X......X...X.X','X.X.........X....X.X','X.X........XX....X.X','X.X..............X.X','X.X...X......X...X.X','X.X....XXXXXX....X.X','X.X..............X.X','X.XXXXXXXXXXXXXXXX.X','X..................X','X..................X','X..XX..............X','X..................X','X........XXXXXXX...X','X..................X','X..................X','XXXXXXXXXXXXXXXXXXXX','X..................X','XXXXXXXXXXXXXXXXXXXX'];
const mac=`<svg class="hm" viewBox="0 0 20 24" shape-rendering="crispEdges" stroke="none"><path fill="#fff" d="M1 1h18v23H1z"/><path fill="#000" d="${MAC.map((r,y)=>[...r].map((c,x)=>c==='X'?`M${x} ${y}h1v1h-1z`:'').join('')).join('')}"/></svg>`;
const B={
  1984:{ms:3000,html:`<div class="b84a">${mac}</div><div class="b84b"><div>Welcome to PoshakOS.</div></div>`},
  1995:{ms:3600,html:`<div class="b95a">${['PoshakOS BIOS v4.95  (C) 1995','','Memory Test: 640K OK','Detecting curiosity........ found','Detecting coffee............ low','Loading BASEBALL.SYS','','Starting PoshakOS 95...'].map((s,i)=>`<p style="animation-delay:${.12+i*.16}s">${s||'&nbsp;'}</p>`).join('')}</div><div class="b95b"><div class="w"><b>Poshak</b><span>OS</span><i>95</i></div><div class="strip"></div></div>`},
  2001:{ms:3000,html:`<div class="b01">${P}<div class="spin">${'<i></i>'.repeat(12)}</div><div class="ok">Starting PoshakOS X</div><div class="bar"><i></i></div></div>`},
  2007:{ms:2800,html:`<div class="b07">${P}<div class="bar"><i></i></div></div>`},
  2013:{ms:2400,html:`<div class="b13">${P}<div class="bar"><i></i></div></div>`},
  now:{ms:2600,html:`<div class="bnow">${P}<div class="bar"><i></i></div><div class="hi">Hi, I’m Poshak.</div></div>`}
}[era];

const css=`
#boot{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;overflow:hidden;cursor:pointer;-webkit-user-select:none;user-select:none;transition:opacity .45s ease}
#boot.out{opacity:0;pointer-events:none}
#boot .skip{position:absolute;left:0;right:0;bottom:calc(22px + env(safe-area-inset-bottom,0px));text-align:center;font:12px/1 Geist,system-ui,sans-serif;opacity:0;animation:bfade .4s .8s forwards}
#boot .pk{display:grid;place-items:center;width:72px;height:72px;border-radius:18px;font:700 42px/1 Geist,Helvetica,Arial,sans-serif}
#boot .bar{width:180px;height:4px;border-radius:2px;overflow:hidden}
#boot .bar i{display:block;height:100%;width:0;border-radius:inherit;animation:bload var(--t) cubic-bezier(.5,0,.3,1) forwards}
@keyframes bfade{to{opacity:1}}@keyframes bin{from{opacity:0;transform:scale(.92)}}@keyframes bload{to{width:100%}}@keyframes bspin{to{transform:rotate(360deg)}}@keyframes bshow{to{visibility:visible}}@keyframes bhide{to{visibility:hidden}}

#boot.e1984{background:#fff repeating-conic-gradient(#000 0 25%,#fff 0 50%) 0 0/2px 2px;color:#000}
#boot.e1984 .skip{font:16px VT323,monospace;color:#000;background:#fff;width:max-content;margin:auto;padding:2px 8px;border:1px solid #000}
.b84a,.b84b{grid-area:1/1}
.b84a .hm{width:60px;stroke:none!important;image-rendering:pixelated;animation:bhide 0s 1.3s forwards}
.b84b{visibility:hidden;animation:bshow 0s 1.3s forwards;background:#fff;border:2px solid #000;box-shadow:3px 3px 0 #000;padding:3px}
.b84b div{border:1px solid #000;padding:22px 46px;font:22px VT323,monospace}

#boot.e1995{background:#000;color:#c0c0c0}
#boot.e1995 .skip{font:16px VT323,monospace;color:#808080}
.b95a,.b95b{grid-area:1/1;align-self:stretch;justify-self:stretch}
.b95a{padding:28px 32px;font:20px/1.25 VT323,monospace;animation:bhide 0s 1.75s forwards}
.b95a p{margin:0;visibility:hidden;animation:bshow 0s forwards}
.b95b{visibility:hidden;animation:bshow 0s 1.75s forwards;background:linear-gradient(#2a6fd6,#6fb2f2 70%,#cfe6ff);display:grid;place-items:center;position:relative}
.b95b .w{display:flex;align-items:baseline;gap:6px;color:#fff;font:italic 700 54px/1 'Arial Black',Arial,sans-serif;text-shadow:3px 3px 0 rgba(0,0,0,.25)}
.b95b .w span{font-weight:400}.b95b .w i{font-size:30px;color:#ffe873}
.b95b .strip{position:absolute;left:0;right:0;bottom:0;height:14px;background:linear-gradient(90deg,#0000a8,#3c8cff,#a8e0ff,#3c8cff,#0000a8) 0 0/50% 100%;animation:bstrip 1s linear infinite}
@keyframes bstrip{to{background-position:100% 0}}

#boot.e2001{background:radial-gradient(circle at 50% 40%,#f2f2f2,#bdbdbd);color:#555}
.b01{display:grid;justify-items:center;gap:22px;animation:bin .5s}
.b01 .pk{background:linear-gradient(#9aa0a8,#5f646b);color:#eee;box-shadow:inset 0 1px 0 #fff8,0 2px 6px #0003}
.b01 .spin{position:relative;width:28px;height:28px;animation:bspin 1s steps(12) infinite}
.b01 .spin i{position:absolute;left:12px;top:0;width:4px;height:8px;border-radius:2px;background:#555}
${[...Array(12)].map((_,i)=>`.b01 .spin i:nth-child(${i+1}){transform:rotate(${i*30}deg);transform-origin:2px 14px;opacity:${(.15+i*.07).toFixed(2)}}`).join('')}
.b01 .ok{font:500 15px 'Lucida Grande',Geist,sans-serif;opacity:0;animation:bfade .4s 1.2s forwards}
.b01 .bar{--t:2.4s;width:200px;height:10px;border-radius:5px;background:#d9d9d9;box-shadow:inset 0 1px 2px #0004}
.b01 .bar i{background:repeating-linear-gradient(-45deg,#3d8de0 0 6px,#6fb4ff 6px 12px),#3d8de0;box-shadow:inset 0 1px 1px #fff9}

#boot.e2007{background:radial-gradient(ellipse at 50% 30%,#4b2a7a,#120a22 70%);color:#c9b8ea}
.b07{display:grid;justify-items:center;gap:56px;animation:bin .6s}
.b07 .pk{background:linear-gradient(#ffffff,#b6a3e6 50%,#7a5cc8 51%,#a58ae8);color:#2a1650;box-shadow:0 0 40px #9a7cff88;-webkit-box-reflect:below 4px linear-gradient(transparent 50%,rgba(255,255,255,.35))}
.b07 .bar{--t:2.2s;width:220px;height:8px;border-radius:4px;background:#ffffff1f;box-shadow:inset 0 1px 2px #0008}
.b07 .bar i{background:linear-gradient(#e2d8ff,#9b7cff 50%,#7a55f0 51%,#b39cff)}

#boot.e2013{background:#fff;color:#8e8e93}
.b13{display:grid;justify-items:center;gap:48px}
.b13 .pk{background:none;color:#000;font-weight:200;font-size:64px;animation:bin .5s}
.b13 .bar{--t:2s;width:150px;height:3px;background:#e5e5ea}.b13 .bar i{background:#000}

#boot.enow{background:#05080f;color:#8b97a8}
.bnow{display:grid;justify-items:center;gap:30px}
.bnow .pk{background:#1b1f27;color:#fff;box-shadow:0 0 0 1px #ffffff1a,0 20px 60px #4aa3ff22;animation:bin .7s cubic-bezier(.2,.8,.2,1)}
.bnow .bar{--t:1.6s;width:140px;height:3px;background:#ffffff1a}.bnow .bar i{background:#fff}
.bnow .hi{font:400 15px Geist,system-ui,sans-serif;color:#c9d3e0;opacity:0;animation:bfade .5s 1.5s forwards}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const el=document.createElement('div');el.id='boot';el.className='e'+era;el.setAttribute('role','presentation');
el.innerHTML=B.html+`<div class="skip">${matchMedia('(hover:none)').matches?'Tap':'Click or press any key'} to skip</div>`;
document.body.appendChild(el);

let done=false;
function end(){if(done)return;done=true;el.classList.add('out');removeEventListener('keydown',key,true);setTimeout(()=>{el.remove();st.remove()},500);}
function key(e){e.preventDefault();e.stopPropagation();end();}
el.addEventListener('pointerdown',end);addEventListener('keydown',key,true);
setTimeout(end,B.ms);
})();
