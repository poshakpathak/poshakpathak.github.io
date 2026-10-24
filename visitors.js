/* Visitor map: a dot-matrix world with a glow wherever people visit from.
   GoatCounter counts visits (no cookies, country and state only), and a daily
   GitHub Action saves the totals to visitors.json, which this reads. */
(()=>{
/* land on a 2° grid from 84°N to 58°S, one hex string per row (generated from Natural Earth) */
const LAND=["0000000000001f001ffc0000000000000000000000000","000000000031dfbfffffe000000004a00040000000000","00000000021ef0ffffff0000f0000000003c000000000","000000030023c3ffffff8000200000000007000000000","00000000a82fc007ffff00000000030003ffc001c8000","0000000e88f7f003fffa0000000004007ffffcc000000","80180001fc37fe00fffa00000000041defffffeffd801","00fffafe76dcaf00fff800001ff021ec7ffffffffffff","e07fffffffff83c1ff8000007ffebffdfffffffffffff","31fffffffffd1f80f801e000f9ebfffffffffffffffff","00fffffffff8034078000003e7fffffffffffffffffff","01fdffffffe01e0038000003e7ffffffffffffffff2f0","007807ffffe01e4000000086e3ffffffffffffff80200","001002fffff80fe000000180c7fffffffffffffe00e00","0000017fffff9ff80000038207fffffffffffffe00e00","0000007fffffdffc000006c7ffffffffffffffff40800","0000003ffffffffc000000ffffffffffffffffff40000","00000007ffffffc60000007fffffffffffffffff00000","0000000fffffffc10000007ffffbeffffffffffe40000","0000000fffffff600000007f7f97cffffffffffc00000","0000000ffffffe00000007f19f03cffffffffff8c0000","0000000ffffff800000003c26f7fe7ffffffffe000000","0000000ffffff000000007c025ffc7fffffff84080000","00000007fffff0000000018345ffe7fffffffe6300000","00000003fffff000000001fe022ffffffffffc4f00000","00000001ffffc000000003ff000ffffffffffc1800000","00000000ffff8000000007ffef7ffffffffffe0000000","000000003fc04000000007ffffdfdffffffffe0000000","000000005f80400000001fffffefe7fffffffc0000000","000000002f80000000001fffffe7f01ffffff80000000","000000000780c00000003ffffff7ff0ffffff20000000","000000000786100000003ffffffbfe07f8ff000000000","0000000003cc030000003ffffff9fe01f07e800000000","0000000000fc000000003ffffffdf801e05f020000000","00000000000f000000007ffffffde001c01f020000000","000000000003000000003ffffffe8001c01f820000000","000000000001070000003fffffff3000c013008000000","000000000000aff000001fffffffe0008012000000000","0000000000001ff800000fffffffe0002000008000000","0000000000001fff00000607ffffc000002c180000000","0000000000001fff80000001ffff80000014380000000","0000000000003fff80000001ffff0000001cfa0000000","0000000000003fffe0000003fffe0000000c781800000","0000000000003ffffc000001fffc00000006742b80000","0000000000007fffff000000fffc000000020001e0000","0000000000003fffff800000fffc00000001e001f0800","0000000000001fffff000000fffc000000000880d0200","0000000000001ffffe0000007ffc00000000000000000","0000000000000ffffe000000fffc20000000001c40000","0000000000000ffffc000000fffc20000000007c60040","00000000000003fffc000000fff8e000000001ffe0000","00000000000001fffc000000fff0e000000001ffe0000","00000000000001fffc0000007ff0c00000000ffff8080","00000000000001fff00000007ff0c00000001ffff8000","00000000000001ffc00000007fe0c00000001ffffc000","00000000000001ffc00000003fc0000000001ffffe000","00000000000003ff800000003fc0000000001ffffe000","00000000000003ff000000001f80000000000ffffe000","00000000000003ff000000001f00000000000f07fc000","00000000000003f8000000000000000000000803f8000","00000000000007fc000000000000000000000000f8004","00000000000007e000000000000000000000000000006","00000000000007a00000000000000000000000003000c","00000000000003c000000000000000000000000010018","000000000000078000000000000000000000000000030","000000000000078000000000000000000000000000000","0000000000000f0000000000000000080000000000000","000000000000060000000000000000000000000000000","000000000000030000000000000000000000000000000","000000000000000000000000000000000000000000000","000000000000000000000000000000000000000000000"];
/* centroid [lon,lat] of each country's largest landmass, and of each US state */
const CEN={"ZW":[29.9,-19],"ZM":[27.8,-13.5],"YE":[47.5,15.9],"VN":[106.3,16.5],"VE":[-66.2,7.1],"VA":[12.4,41.9],"VU":[166.8,-15.2],"UZ":[63.3,41.8],"UY":[-56,-32.8],"FM":[158.2,6.9],"MH":[171.2,7.1],"MP":[145.7,15.2],"VI":[-64.8,17.7],"GU":[144.8,13.4],"AS":[-170.7,-14.3],"PR":[-66.5,18.2],"US":[-98.8,39.9],"GS":[-36.7,-54.4],"IO":[72.4,-7.3],"SH":[-5.7,-16],"PN":[-128.3,-24.4],"AI":[-63.1,18.2],"FK":[-58.8,-51.7],"KY":[-81.3,19.3],"BM":[-64.8,32.3],"VG":[-64.6,18.4],"TC":[-71.7,21.8],"MS":[-62.2,16.7],"JE":[-2.1,49.2],"GG":[-2.6,49.5],"IM":[-4.5,54.2],"GB":[-2.4,53.8],"AE":[54.3,23.9],"UA":[31.3,49.2],"UG":[32.4,1.3],"TM":[59.4,39.1],"TR":[35.4,39.1],"TN":[9.6,34.1],"TT":[-61.3,10.4],"TO":[-175.2,-21.2],"TG":[1,8.5],"TL":[125.9,-8.8],"TH":[101,15.1],"TZ":[34.8,-6.3],"TJ":[71,38.5],"TW":[121,23.7],"SY":[38.5,35],"CH":[8.2,46.8],"SE":[16.2,62.4],"SZ":[31.5,-26.6],"SR":[-55.9,4.1],"SS":[30.3,7.3],"SD":[29.9,16],"LK":[80.7,7.6],"ES":[-3.6,40.4],"KR":[127.9,36.5],"ZA":[25.2,-29],"SO":[45.7,4.7],"SB":[160.2,-9.6],"SK":[19.5,48.7],"SI":[14.8,46.1],"SG":[103.8,1.4],"SL":[-11.8,8.6],"SC":[55.5,-4.7],"RS":[20.8,44.2],"SN":[-14.5,14.4],"SA":[44.7,24.1],"ST":[6.6,0.2],"SM":[12.5,43.9],"WS":[-172.4,-13.6],"VC":[-61.2,13.3],"LC":[-61,13.9],"KN":[-62.7,17.3],"RW":[29.9,-2],"RU":[95.5,65.9],"RO":[25,45.8],"QA":[51.2,25.3],"PT":[-8,39.7],"PL":[19.4,52.1],"PH":[121.4,15.9],"PE":[-74.4,-9.1],"PY":[-58.4,-23.2],"PG":[144.2,-6.6],"PA":[-80.1,8.5],"PW":[134.6,7.5],"PK":[69.2,29.9],"OM":[56.1,20.6],"NO":[12.2,63.8],"KP":[127.2,40.1],"NG":[8.1,9.6],"NE":[9.3,17.4],"NI":[-85,12.8],"NZ":[170.6,-43.9],"NU":[-169.9,-19],"CK":[-159.8,-21.2],"NL":[5.6,52.3],"AW":[-70,12.5],"CW":[-69,12.2],"NP":[83.9,28.3],"NR":[166.9,-0.5],"NA":[17.2,-22.1],"MZ":[35.6,-17.2],"MA":[-8.7,29.8],"EH":[-12.3,24.2],"ME":[19.2,42.8],"MN":[103.1,47],"MD":[28.5,47.2],"MC":[7.4,43.8],"MX":[-102.2,23.9],"MU":[57.6,-20.3],"MR":[-10.4,20.2],"MT":[14.4,35.9],"ML":[-3.6,17.3],"MV":[73.5,4.2],"MY":[114.7,3.6],"MW":[34.3,-13.2],"MG":[46.7,-19.3],"MK":[21.7,41.6],"LU":[6.1,49.8],"LT":[23.9,55.3],"LI":[9.5,47.1],"LY":[18.1,27],"LR":[-9.3,6.5],"LS":[28.2,-29.6],"LB":[35.9,33.9],"LV":[24.9,56.9],"LA":[103.8,18.5],"KG":[74.5,41.5],"KW":[47.6,29.3],"KI":[-157.4,1.9],"KE":[37.8,0.6],"KZ":[67.2,48.4],"JO":[36.8,31.2],"JP":[137.9,36.6],"JM":[-77.3,18.2],"IT":[12.3,43.5],"IL":[35,31.5],"PS":[35.2,31.9],"IE":[-8.1,53.2],"IQ":[43.8,33],"IR":[54.4,32.5],"ID":[114,-0.2],"IN":[79.5,22.8],"IS":[-18.6,65],"HU":[19.4,47.2],"HN":[-86.6,14.8],"HT":[-72.7,18.9],"GY":[-59,4.8],"GW":[-14.9,12.1],"GN":[-10.9,10.4],"GT":[-90.4,15.7],"GD":[-61.7,12.1],"GR":[22.6,39.5],"GH":[-1.2,7.9],"DE":[10.4,51],"GE":[43.5,42.2],"GM":[-15.4,13.5],"GA":[11.8,-0.6],"FR":[2.5,46.6],"PM":[-56.3,46.9],"WF":[-178.1,-14.3],"MF":[-63.1,18.1],"BL":[-62.8,17.9],"PF":[-149.4,-17.7],"NC":[165.5,-21.3],"TF":[69.5,-49.3],"AX":[19.9,60.2],"FI":[26.2,64.3],"FJ":[178,-17.8],"ET":[39.6,8.6],"EE":[25.8,58.7],"ER":[38.8,15.4],"GQ":[10.5,1.6],"SV":[-88.9,13.7],"EG":[29.9,26.5],"EC":[-78.4,-1.4],"DO":[-70.5,18.9],"DM":[-61.4,15.4],"DJ":[42.6,11.7],"GL":[-41.8,73.1],"FO":[-6.9,62.2],"DK":[9.3,56.2],"CZ":[15.3,49.7],"CY":[33,34.9],"CU":[-78.9,21.6],"HR":[16.4,45.2],"CI":[-5.6,7.6],"CR":[-84.2,10],"CD":[23.6,-2.9],"CG":[15.2,-0.8],"KM":[43.3,-11.7],"CO":[-73.1,3.9],"CN":[103.3,36.8],"MO":[113.5,22.2],"HK":[114.1,22.4],"CL":[-70.9,-34.4],"TD":[18.6,15.3],"CF":[20.5,6.6],"CV":[-23.6,15.1],"CA":[-99,58.6],"CM":[12.7,5.7],"KH":[104.9,12.7],"MM":[96.5,21.1],"BI":[29.9,-3.4],"BF":[-1.8,12.3],"BG":[25.2,42.8],"BN":[114.6,4.5],"BR":[-53.2,-10.7],"BW":[23.8,-22.2],"BA":[17.8,44.2],"BO":[-64.7,-16.7],"BT":[90.4,27.4],"BJ":[2.3,9.6],"BZ":[-88.7,17.2],"BE":[4.6,50.6],"BY":[28,53.5],"BB":[-59.6,13.2],"BD":[90.2,23.9],"BH":[50.5,26],"BS":[-78,24.7],"AZ":[47.7,40.3],"AT":[14.1,47.6],"AU":[123.6,-12.4],"HM":[73.5,-53.1],"NF":[167.9,-29.1],"AM":[44.9,40.3],"AR":[-64.7,-34.5],"AG":[-61.8,17.1],"AO":[17.6,-12.3],"AD":[1.6,42.5],"DZ":[2.6,28.1],"AL":[20.1,41.1],"AF":[65.9,33.8],"AQ":[83,-84.7],"SX":[-63.1,18.1]};
const STATES={"Alabama":[-86.8,32.8],"Alaska":[-152.3,64.2],"Arizona":[-111.7,34.3],"Arkansas":[-92.4,34.9],"California":[-119.5,37.2],"Colorado":[-105.5,39.0],"Connecticut":[-72.7,41.6],"Delaware":[-75.5,39.0],"District of Columbia":[-77.0,38.9],"Florida":[-81.7,28.1],"Georgia":[-83.4,32.7],"Hawaii":[-157.5,20.8],"Idaho":[-114.6,44.4],"Illinois":[-89.2,40.0],"Indiana":[-86.3,39.9],"Iowa":[-93.5,42.1],"Kansas":[-98.4,38.5],"Kentucky":[-85.3,37.5],"Louisiana":[-92.0,31.0],"Maine":[-69.2,45.4],"Maryland":[-76.8,39.0],"Massachusetts":[-71.8,42.3],"Michigan":[-84.7,43.6],"Minnesota":[-94.3,46.3],"Mississippi":[-89.7,32.7],"Missouri":[-92.5,38.4],"Montana":[-109.6,47.0],"Nebraska":[-99.8,41.5],"Nevada":[-116.6,39.3],"New Hampshire":[-71.6,43.7],"New Jersey":[-74.7,40.2],"New Mexico":[-106.1,34.4],"New York":[-75.5,42.9],"North Carolina":[-79.4,35.6],"North Dakota":[-100.5,47.5],"Ohio":[-82.8,40.3],"Oklahoma":[-97.5,35.6],"Oregon":[-120.6,43.9],"Pennsylvania":[-77.6,40.9],"Rhode Island":[-71.5,41.7],"South Carolina":[-80.9,33.9],"South Dakota":[-100.2,44.4],"Tennessee":[-86.4,35.9],"Texas":[-99.3,31.5],"Utah":[-111.7,39.3],"Vermont":[-72.7,44.1],"Virginia":[-78.8,37.5],"Washington":[-120.5,47.4],"West Virginia":[-80.6,38.6],"Wisconsin":[-89.8,44.6],"Wyoming":[-107.5,43.0],"Puerto Rico":[-66.5,18.2]};
const HOME=[-92.1,32.5],COLS=180,ROWS=LAND.length,TOP=84;

const css=document.createElement('style');
css.textContent=`
.vmi{display:block;width:52px;height:52px;filter:drop-shadow(0 6px 10px rgba(10,20,40,.3))}
#os.phone .vmi{width:46px;height:46px}
#os .win[data-app="visitors"] .bd{background:#0b1626!important;color:#e8eef7!important;overflow:auto}
.vm{padding:18px 20px 20px}
.vm h2{margin:0;font-size:21px;color:#fff}.vm .sub{margin:3px 0 14px;font-size:13.5px;opacity:.65}
.vmc{position:relative}.vmc canvas{display:block;width:100%}
.vmt{position:absolute;pointer-events:none;background:rgba(255,255,255,.95);color:#111;font-size:12.5px;font-weight:600;padding:5px 9px;border-radius:7px;transform:translate(-50%,calc(-100% - 10px));white-space:nowrap;opacity:0;transition:opacity .12s}
.vml{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.vml span{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:5px 11px;font-size:13px}
.vml span b{font-weight:600;margin-left:6px;opacity:.6}
.vm .ft{margin:14px 0 0;font-size:12px;opacity:.5}
#os[data-era="1984"] .win[data-app="visitors"] .bd,#os[data-era="1984"] .vmi{filter:grayscale(1) contrast(1.3)}`;
document.head.appendChild(css);

const GLOBE='<svg class="vmi" viewBox="0 0 52 52"><defs><radialGradient id="vmg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#2b4e86"/><stop offset="1" stop-color="#0b1626"/></radialGradient></defs><circle cx="26" cy="26" r="24" fill="url(#vmg)"/><g fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1"><ellipse cx="26" cy="26" rx="10" ry="24"/><path d="M2 26h48M5 15h42M5 37h42M26 2v48"/></g><circle cx="17" cy="20" r="3" fill="#ffb86b"/><circle cx="33" cy="17" r="2.2" fill="#ffb86b"/><circle cx="36" cy="33" r="2.6" fill="#ffb86b"/><circle cx="21" cy="35" r="1.8" fill="#ffb86b"/></svg>';
I.visitors='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/></svg>';
APPS.visitors={t:'Visitor map',w:880,h:620,html:()=>{queueMicrotask(wireWin);return `<div class="vm">
  <h2>Where visitors come from</h2><p class="sub" id="vms">Loading…</p>
  <div class="vmc"><canvas aria-label="World map of visitors"></canvas><div class="vmt"></div></div>
  <div class="vml" id="vml"></div>
  <p class="ft" id="vmf">Counted with GoatCounter: no cookies, no tracking, only country and state.</p></div>`;}};

const flag=c=>/^[A-Z]{2}$/.test(c)?String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0))):'';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let data=null;
const load=()=>data?Promise.resolve(data):fetch('visitors.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({})).then(d=>data=d);

/* places to draw: US visits go on their states when we know them */
function places(d){
  const out=[],us=d.us||[];let usLeft=0;
  for(const [code,name,n] of d.countries||[]){
    if(code==='US'&&us.length){usLeft=n-us.reduce((s,x)=>s+x[1],0);continue;}
    if(CEN[code])out.push({lon:CEN[code][0],lat:CEN[code][1],n,label:`${flag(code)} ${name}`});
  }
  for(const [name,n] of us)if(STATES[name])out.push({lon:STATES[name][0],lat:STATES[name][1],n,label:`${flag('US')} ${name}`});
  if(usLeft>0)out.push({lon:CEN.US[0],lat:CEN.US[1],n:usLeft,label:`${flag('US')} United States`});
  return out.sort((a,b)=>a.n-b.n);
}

function wireWin(){
  const w=wins.visitors;if(!w)return;
  const cv=w.querySelector('canvas'),tip=w.querySelector('.vmt'),ctx=cv.getContext('2d');
  let pts=[],W=0,H=0,cell=0,raf=0;const bg=document.createElement('canvas');
  const xy=(lon,lat)=>[(lon+180)/360*W,(TOP-lat)/(ROWS*2)*H];
  function size(){const r=window.devicePixelRatio||1;W=cv.clientWidth;H=W*ROWS/COLS;cv.style.height=H+'px';cv.width=W*r;cv.height=H*r;ctx.setTransform(r,0,0,r,0,0);cell=W/COLS;
    /* the land dots never change, so draw them once per size */
    bg.width=cv.width;bg.height=cv.height;const b=bg.getContext('2d');b.setTransform(r,0,0,r,0,0);b.fillStyle='rgba(190,210,240,.2)';
    for(let y=0;y<ROWS;y++)for(let c=0;c<COLS;c++)if(parseInt(LAND[y][c>>2],16)&(8>>(c&3))){b.beginPath();b.arc((c+.5)*cell,(y+.5)*cell,cell*.3,0,7);b.fill();}}
  function draw(t){
    if(!wins.visitors){cancelAnimationFrame(raf);return;}
    ctx.clearRect(0,0,W,H);ctx.drawImage(bg,0,0,W,H);
    const max=Math.max(1,...pts.map(p=>p.n));
    for(const p of pts){const [x,y]=xy(p.lon,p.lat),rad=cell*(.55+1.6*Math.sqrt(p.n/max));p.x=x;p.y=y;p.r=rad;
      const ph=((t/1000+p.lon/40)%2.4)/2.4;
      ctx.strokeStyle=`rgba(255,184,107,${.5*(1-ph)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,rad+ph*cell*2.6,0,7);ctx.stroke();
      ctx.fillStyle='rgba(255,184,107,.25)';ctx.beginPath();ctx.arc(x,y,rad*1.9,0,7);ctx.fill();
      ctx.fillStyle='#ffb86b';ctx.beginPath();ctx.arc(x,y,rad,0,7);ctx.fill();}
    const [hx,hy]=xy(...HOME);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hx,hy,cell*.45,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(hx,hy,cell*.95,0,7);ctx.stroke();
    raf=requestAnimationFrame(draw);
  }
  cv.addEventListener('pointermove',e=>{const b=cv.getBoundingClientRect(),mx=e.clientX-b.left,my=e.clientY-b.top;
    let hit=null;for(const p of pts)if(Math.hypot(p.x-mx,p.y-my)<p.r+6)hit=p;
    const [hx,hy]=xy(...HOME),home=Math.hypot(hx-mx,hy-my)<cell*1.2;
    if(hit||home){tip.textContent=hit?`${hit.label} · ${hit.n.toLocaleString()} visit${hit.n===1?'':'s'}`:'Home base · Monroe, Louisiana';tip.style.left=(hit?hit.x:hx)+'px';tip.style.top=((hit?hit.y-hit.r:hy))+'px';tip.style.opacity=1;}
    else tip.style.opacity=0;});
  cv.addEventListener('pointerleave',()=>tip.style.opacity=0);
  new ResizeObserver(size).observe(cv);size();raf=requestAnimationFrame(draw);
  load().then(d=>{
    pts=places(d);
    const tot=d.total||0,nc=(d.countries||[]).length;
    w.querySelector('#vms').textContent=tot?`${tot.toLocaleString()} visits from ${nc} ${nc===1?'country':'countries'} so far. The white dot is home.`:'The map just started counting. Check back soon. The white dot is home.';
    w.querySelector('#vml').innerHTML=[...pts].reverse().slice(0,10).map(p=>`<span>${esc(p.label)}<b>${p.n.toLocaleString()}</b></span>`).join('');
    if(d.updated)w.querySelector('#vmf').textContent=`Updated ${new Date(d.updated).toLocaleDateString(undefined,{month:'short',day:'numeric'})}. Counted with GoatCounter: no cookies, no tracking, only country and state.`;
  });
}

const di=document.getElementById('dicons');
di.insertAdjacentHTML('beforeend',`<button class="folder appi" data-a="visitors"><span class="fi">${GLOBE}</span><b>Visitors</b></button>`);
di.lastElementChild.onclick=()=>open('visitors');
PAL_BASE.push({t:'Visitor map',d:'Where in the world people visit from',ic:I.visitors,go:()=>open('visitors')});
if(location.hash==='#visitors')open('visitors');
})();
