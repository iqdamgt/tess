// =====================================================================
// CUTSCENE AKHIR - MIDNIGHT LAB..
// Tiga panggung 3D tambahan (dimuat SETELAH cutscene3d.js):
//   'jalan' : Wandih naik Vespa merah di jalan hutan malam hari (monolog)
//   'rumah' : Wandih sampai, belok ke jalan masuk garasi & parkir; rumahnya (kuning, tengah) diapit 2 tetangga (kiri putih, kanan biru) (BERHASIL)
//   'tidur' : Wandih berbaring di kasur, selimut dinamis (gambar sendiri), tangan di dada, efek Zzz (SELESAI)
// Tokoh Wandih di sini memakai rangka bersendi (siku & lutut) supaya pose motor dan tidur realistis.
// Kalau ada error, adegan otomatis kembali ke tampilan lama (sv) lewat mekanisme cutscene3d.js.
// =====================================================================
(function(){
'use strict';
if(typeof THREE==='undefined'||!window.CUT3D||!CUT3D.api)return;
const A=CUT3D.api,PI=Math.PI,V3=THREE.Vector3,Q=THREE.Quaternion,F=A.F;
const LM=A.LM,BM=A.BM,bx=A.bx,cvTex=A.cvTex;
const MOTOR=(typeof CUT_SND!=='undefined'&&CUT_SND.motor)||'motor.wav';
const BLANKET=(typeof BLANKET_URL!=='undefined'&&BLANKET_URL)||'';
const rng=seed=>{let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>{s=s*16807%2147483647;return(s-1)/2147483646}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,sstep=k=>{k=clamp(k,0,1);return k*k*(3-2*k)};
const X=new V3(1,0,0),DOWN=new V3(0,-1,0);

// ---------- rangka Wandih bersendi (siku & lutut) ----------
function halfUV(g,w,h,d,half){const W=2*d+2*w,H=d+h,hh=h/2,uv=g.attributes.uv,R=[[0,d,d,h],[d+w,d,d,h],[d,0,w,d],[d+w,0,w,d],[2*d+w,d,w,h],[d,d,w,h]];
 R.forEach((r,k)=>{let x=r[0],y=r[1],rw=r[2],rh=r[3];if(k!==2&&k!==3){y=d+half*hh;rh=hh}
  const u0=x/W,u1=(x+rw)/W,vT=1-y/H,vB=1-(y+rh)/H;let p=[[u0,vT],[u1,vT],[u0,vB],[u1,vB]];if(k===2)p=[[u1,vB],[u0,vB],[u1,vT],[u0,vT]];
  p.forEach((q,i)=>uv.setXY(k*4+i,q[0],q[1]))});uv.needsUpdate=true}
function mkJ(){
 const hasS=typeof skinM==='function',hasB=typeof bg==='function';
 const sm=(u,c)=>hasS?skinM(u||'',c):LM(c,0x1c1c1c);
 const gT=hasB?bg(.46,.7,.23,F.badan,8,12,4):new THREE.BoxGeometry(.46,.7,.23);
 let gH,mH;if(F.kepala&&hasB){gH=bg(.46,.46,.46,F.kepala,8,8,8);mH=sm(F.kepala,0xe0b48c)}else{gH=new THREE.BoxGeometry(.46,.46,.46);mH=LM(0xe0b48c,0x302820)}
 const root=new THREE.Group(),P=new THREE.Group(),H=new THREE.Group();root.add(P);
 const tm=new THREE.Mesh(gT,sm(F.badan,0xe4e8ee));tm.position.y=.35;P.add(tm);
 H.position.y=.7;P.add(H);const hm=new THREE.Mesh(gH,mH);hm.position.y=.23;H.add(hm);
 const limb=(url,col)=>{const m=sm(url,col),g=new THREE.Group(),gu=new THREE.BoxGeometry(.23,.35,.23),gl=new THREE.BoxGeometry(.23,.35,.23);
  if(url&&hasB){halfUV(gu,4,12,4,0);halfUV(gl,4,12,4,1)}
  const mu=new THREE.Mesh(gu,m);mu.position.y=-.175;g.add(mu);
  const k=new THREE.Group();k.position.y=-.35;g.add(k);const ml=new THREE.Mesh(gl,m);ml.position.y=-.175;k.add(ml);root.add(g);return{g:g,k:k}};
 return{root:root,P:P,H:H,arms:[limb(F.tanganKiri,0xe0b48c),limb(F.tanganKanan,0xe0b48c)],legs:[limb(F.kakiKiri,0x3d4452),limb(F.kakiKanan,0x3d4452)]}}
// IK dua tulang (panjang atas = bawah = .35). s=bahu/pinggul, t=target tangan/kaki, pole=arah tekukan siku/lutut. Semua koordinat dunia.
function setLimb(l,s,t,pole){
 const u=t.clone().sub(s);let d=Math.min(u.length(),.699);if(d<.06)d=.06;u.normalize();
 const a=d/2,h=Math.sqrt(Math.max(0,.1225-a*a)),pp=pole.clone();pp.addScaledVector(u,-pp.dot(u));if(pp.lengthSq()<1e-6)pp.set(0,0,1);pp.normalize();
 const e=s.clone().addScaledVector(u,a).addScaledVector(pp,h),w=s.clone().addScaledVector(u,d);
 const q1=new Q().setFromUnitVectors(DOWN,e.clone().sub(s).normalize()),q2=new Q().setFromUnitVectors(DOWN,w.clone().sub(e).normalize());
 l.g.position.copy(s);l.g.quaternion.copy(q1);l.k.quaternion.copy(q1.clone().invert().multiply(q2))}
function limbSet(l,s,c){
 if(c.t)setLimb(l,s,c.t,c.p);
 else{l.g.position.copy(s);l.g.quaternion.copy(c.q).multiply(new Q().setFromAxisAngle(X,c.a));l.k.quaternion.setFromAxisAngle(X,c.b)}}
// o: {pel:V3 (pinggul), q:Quaternion badan, hx,hy,hz:kepala, arm:[fn(bahu)->cfg,fn],leg:[fn(pinggul)->cfg,fn]}  cfg = {t,p} (IK) atau {q,a,b} (engsel)
function pose(W,o){
 const P=W.P;P.position.copy(o.pel);P.quaternion.copy(o.q);P.updateMatrix();const m=P.matrix;
 W.H.position.set(0,.7,o.hz||0);W.H.rotation.set(o.hx||0,o.hy||0,0);
 for(let i=0;i<2;i++){const sh=new V3(i?.345:-.345,.7,0).applyMatrix4(m),hp=new V3(i?.115:-.115,0,0).applyMatrix4(m);
  limbSet(W.arms[i],sh,o.arm[i](sh));limbSet(W.legs[i],hp,o.leg[i](hp))}}
const qYaw=a=>new Q().setFromAxisAngle(new V3(0,1,0),a),qX=a=>new Q().setFromAxisAngle(X,a);

// ---------- Vespa merah (depan = -Z) ----------
function mkVespa(){
 const g=new THREE.Group();g.rotation.order='YXZ';
 const RED=LM(0xc4161c,0x300506),CH=LM(0xd8dce0,0x303236),BK=LM(0x16161a,0x050506),TIRE=LM(0x0c0c0e,0),CRM=LM(0xe8c06a,0x302008);
 const B=(par,w,h,d,m,x,y,z)=>bx(par,w,h,d,m,x,y,z);
 // bodi
 B(g,.4,.04,.56,RED,0,.18,-.14);B(g,.012,.02,.5,CH,-.2,.205,-.14);B(g,.012,.02,.5,CH,.2,.205,-.14);
 B(g,.34,.3,.3,RED,0,.42,.5);B(g,.33,.22,.62,RED,0,.5,.31);B(g,.36,.13,.3,RED,0,.3,.56);
 B(g,.34,.07,.55,BK,0,.625,.175);B(g,.3,.03,.5,LM(0x2a2a30,0x08080a),0,.66,.175);
 B(g,.2,.12,.06,LM(0xff2a2a,0x801010),0,.55,.67);B(g,.08,.08,.3,CH,.2,.24,.5);
 const sh=B(g,.36,.75,.05,RED,0,.56,-.36);sh.rotation.x=.15;
 B(g,.09,.5,.05,RED,0,.45,-.52).rotation.x=.12;
 // kemudi + roda depan (berputar saat belok): pivot di (0,0,-.45)
 const steer=new THREE.Group();steer.position.set(0,0,-.45);g.add(steer);
 B(steer,.64,.035,.035,CH,0,1.02,.05);B(steer,.11,.05,.05,BK,-.31,1.02,.05);B(steer,.11,.05,.05,BK,.31,1.02,.05);
 B(steer,.26,.2,.2,RED,0,.97,.08);B(steer,.04,.5,.04,CH,0,.78,-.0);
 const lamp=B(steer,.18,.14,.05,BM(0xfff2c8),0,.96,-.05);B(steer,.22,.18,.06,CH,0,.96,-.02);
 B(steer,.015,.16,.015,CH,-.3,1.1,.03);B(steer,.015,.16,.015,CH,.3,1.1,.03);B(steer,.1,.065,.014,LM(0xbfd0e6,0x20242a),-.3,1.2,.03);B(steer,.1,.065,.014,LM(0xbfd0e6,0x20242a),.3,1.2,.03);
 B(steer,.04,.4,.04,CH,-.07,.42,-.15);B(steer,.04,.4,.04,CH,.07,.42,-.15);B(steer,.14,.045,.3,RED,0,.45,-.15);
 const mkWheel=z=>{const w=new THREE.Group();w.position.set(0,.19,z);
  const t=new THREE.CylinderGeometry(.19,.19,.09,18);t.rotateZ(PI/2);w.add(new THREE.Mesh(t,TIRE));
  const r=new THREE.CylinderGeometry(.125,.125,.095,12);r.rotateZ(PI/2);w.add(new THREE.Mesh(r,CH));
  for(let i=0;i<3;i++){const s=bx(w,.1,.02,.23,BK,0,0,0);s.rotation.x=i*PI/3}return w};
 const fw=mkWheel(-.15);steer.add(fw);const rw=mkWheel(.58);g.add(rw);
 return{g:g,steer:steer,fw:fw,rw:rw}}
const wpt=(V,x,y,z)=>V.g.localToWorld(new V3(x,y,z));

// ---------- pose duduk di Vespa (pinggul di jok, tangan lurus ke stang, lutut bengkok, kaki di papan pijak) ----------
function seatedOpts(V,t,vib){
 V.g.updateMatrixWorld(true);const sq=new Q().setFromRotationMatrix(V.g.matrixWorld),lean=.12;
 const hip=wpt(V,0,.775+(vib?Math.sin(t*47)*.002:0),.15),gr=[V.steer.localToWorld(new V3(-.31,1.02,.05)),V.steer.localToWorld(new V3(.31,1.02,.05))],
  fo=[wpt(V,-.17,.215,-.06),wpt(V,.17,.215,-.06)],dr=(x,y,z)=>new V3(x,y,z).applyQuaternion(sq);
 return{pel:hip,q:sq.clone().multiply(qX(-lean)),hx:lean+Math.sin(t*.8)*.02,hy:Math.sin(t*.5)*.08,
  arm:[0,1].map(i=>sh=>({t:gr[i],p:dr(i?.7:-.7,-.9,.1)})),leg:[0,1].map(i=>hp=>({t:fo[i],p:dr(i?.25:-.25,.35,-1)})),sq:sq,gr:gr,fo:fo,dr:dr,hip:hip}}

// =====================================================================
// PANGGUNG 'jalan' - jalan hutan malam, tiang lampu tiap 10 m
// =====================================================================
const PER=80,SPD=9;let RD=null,WANDIH=null,VESPA=null;
function sharedActors(){if(!WANDIH){WANDIH=mkJ();const nk=bx(WANDIH.H,.26,.24,.26,LM(0xe0b48c,0x302010),0,-.04,.17);nk.visible=false;WANDIH.neck=nk}if(!VESPA)VESPA=mkVespa();WANDIH.neck.visible=false}
function envRoad(){
 if(RD)return RD;
 const sc=new THREE.Scene(),fogC=0x06090f;sc.background=new THREE.Color(fogC);sc.fog=new THREE.Fog(fogC,7,62);
 sc.add(new THREE.AmbientLight(0x35466e,.8));const mo=new THREE.DirectionalLight(0x8aa4e0,.55);mo.position.set(-12,22,10);sc.add(mo);
 const gp=new THREE.Mesh(new THREE.PlaneGeometry(400,500),LM(0x16281a,0x050a06));gp.rotation.x=-PI/2;gp.position.y=-.01;sc.add(gp);
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(8,500),LM(0x2c2a22,0x0a0908));sh.rotation.x=-PI/2;sh.position.y=.004;sc.add(sh);
 const rd=new THREE.Mesh(new THREE.PlaneGeometry(5.2,500),LM(0x2a2c32,0x0a0a0c));rd.rotation.x=-PI/2;rd.position.y=.01;sc.add(rd);
 // langit: bintang + bulan
 const r0=rng(5),sp=[];for(let i=0;i<220;i++){const a=r0()*PI*2,e=.15+r0()*1.2,R=190;sp.push(Math.cos(a)*Math.cos(e)*R,Math.sin(e)*R*.9+10,Math.sin(a)*Math.cos(e)*R)}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
 const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false}));sc.add(stars);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(6,16,12),new THREE.MeshBasicMaterial({color:0xeaf0ff,fog:false}));moon.position.set(-70,60,-150);sc.add(moon);
 // bahan & geometri bersama
 const G={trunk:new THREE.CylinderGeometry(.12,.2,2.6,6),c1:new THREE.ConeGeometry(1.45,3.2,7),c2:new THREE.ConeGeometry(1.05,2.6,7),bush:new THREE.SphereGeometry(.7,6,5),
  pole:new THREE.CylinderGeometry(.08,.11,5.4,6),arm:new THREE.BoxGeometry(1.3,.08,.08),head:new THREE.BoxGeometry(.5,.1,.26),bulb:new THREE.SphereGeometry(.13,8,6),
  pool:new THREE.CircleGeometry(3,20),beam:new THREE.ConeGeometry(2.4,5.2,16,1,true),dash:new THREE.BoxGeometry(.12,.012,2),edge:new THREE.BoxGeometry(.08,.012,PER)};
 G.trunk.translate(0,1.3,0);G.c1.translate(0,3.6,0);G.c2.translate(0,5.4,0);G.bush.translate(0,.3,0);G.pole.translate(0,2.7,0);G.arm.translate(-.6,5.4,0);G.head.translate(-1.15,5.32,0);G.bulb.translate(-1.15,5.22,0);
 G.pool.rotateX(-PI/2);G.pool.translate(-1.15,.03,0);G.beam.translate(-1.15,2.6,0);
 const M={trunk:LM(0x3a2a1e,0x080604),leaf:LM(0x1a3a22,0x040a05),leaf2:LM(0x214a2a,0x050c06),bush:LM(0x224528,0x050c06),pole:LM(0x4a4e56,0x0c0d10),bulb:new THREE.MeshBasicMaterial({color:0xffe6a8}),
  pool:new THREE.MeshBasicMaterial({color:0xffb060,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false}),
  beam:new THREE.MeshBasicMaterial({color:0xffc880,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
  dash:new THREE.MeshBasicMaterial({color:0xd8d8c0}),edge:new THREE.MeshBasicMaterial({color:0x9a9a90})};
 const poleZ=[];for(let i=0;i<8;i++)poleZ.push(-5-10*i); // tiang tiap 10 m
 const chunks=[];
 for(let k=0;k<3;k++){
  const ch=new THREE.Group(),r=rng(11),d=new THREE.Object3D(),NT=130,NB=170;
  const mk=(geo,mat,n)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.frustumCulled=false;ch.add(m);return m};
  const tr=mk(G.trunk,M.trunk,NT),c1=mk(G.c1,M.leaf,NT),c2=mk(G.c2,M.leaf2,NT),bu=mk(G.bush,M.bush,NB);
  for(let i=0;i<NT;i++){const sd=i%2?1:-1,x=sd*(4.8+Math.pow(r(),1.5)*26),z=-r()*PER,s=.8+r()*.9;d.position.set(x,0,z);d.rotation.set(0,r()*6.28,0);d.scale.set(s,s*(.9+r()*.4),s);d.updateMatrix();tr.setMatrixAt(i,d.matrix);c1.setMatrixAt(i,d.matrix);c2.setMatrixAt(i,d.matrix)}
  for(let i=0;i<NB;i++){const sd=i%2?1:-1,x=sd*(3.4+r()*10),z=-r()*PER,s=.5+r()*.8;d.position.set(x,0,z);d.rotation.set(0,r()*6.28,0);d.scale.set(s*(1+r()*.5),s*.8,s);d.updateMatrix();bu.setMatrixAt(i,d.matrix)}
  const np=poleZ.length,pm=mk(G.pole,M.pole,np),am=mk(G.arm,M.pole,np),hm=mk(G.head,M.pole,np),bm=mk(G.bulb,M.bulb,np),plm=mk(G.pool,M.pool,np),bem=mk(G.beam,M.beam,np);
  for(let i=0;i<np;i++){d.position.set(3.3,0,poleZ[i]);d.rotation.set(0,0,0);d.scale.set(1,1,1);d.updateMatrix();[pm,am,hm,bm,plm,bem].forEach(m=>m.setMatrixAt(i,d.matrix))}
  const dm=mk(G.dash,M.dash,16);for(let i=0;i<16;i++){d.position.set(0,.012,-2.5-5*i);d.updateMatrix();dm.setMatrixAt(i,d.matrix)}
  for(const sx of[-2.45,2.45]){const e=new THREE.Mesh(G.edge,M.edge);e.position.set(sx,.012,-PER/2);ch.add(e)}
  sc.add(ch);chunks.push(ch)}
 const lights=[];for(let i=0;i<4;i++){const l=new THREE.PointLight(0xffc070,1.25,15);sc.add(l);lights.push(l)}
 const sh0={p:[2.4,1.25,-.2],l:[0,.95,.1],f:44},sh1={p:[.9,1.75,3.3],l:[0,1.15,-2],f:48},sh2={p:[-1.5,.95,-3.4],l:[0,1.1,0],f:46},sh3={p:[2.9,2.7,2.3],l:[0,.8,-.6],f:46},sh4={p:[1.1,1.5,2.7],l:[0,1.0,-10],f:50};
 RD={scene:sc,chunks:chunks,lights:lights,poleZ:poleZ,shots:{kiri:sh0,belakang:sh1,depan:sh2,atas:sh3,sorot:sh4},d:0};
 return RD}
function stJalan(){
 sharedActors();const E=envRoad(),sc=E.scene;A.setScene(sc);
 sc.add(WANDIH.root);sc.add(VESPA.g);VESPA.g.position.set(0,0,0);VESPA.g.rotation.set(0,0,0);VESPA.steer.rotation.set(0,0,0);E.d=0;
 // hantu di pinggir jalan: El Kalla (kiri) dan Oni (kanan) muncul samar di pinggir jalan, Wandih menoleh, sosok hilang. Dipicu field hantu:'K'/'O' di cerita.js (hdelay = jeda detik)
 const GK={K:A.RIG.K,O:A.RIG.O},GA={K:A.addActor('KALLA',A.RIG.K,0,-90,[0,0]),O:A.addActor('ONI',A.RIG.O,0,-90,[0,0])};
 sc.add(A.RIG.K.root);sc.add(A.RIG.O.root);
 for(const k in GA){GA[k].vis=false;GA[k].anim='melayang';A.ghostOp(GK[k],0)}
 let want=null,ev=null,turn=0;
 return{shots:E.shots,
  leave:function(){for(const k in GK){A.ghostOp(GK[k],0);S.add(GK[k].root)}},
  tick:function(t,dt){
   E.d+=SPD*dt;const m=E.d%PER;E.chunks.forEach((c,k)=>{c.position.z=m+PER-k*PER});
   VESPA.fw.rotation.x-=dt*26;VESPA.rw.rotation.x-=dt*26;
   VESPA.g.rotation.z=Math.sin(t*.6)*.012;VESPA.g.position.y=Math.abs(Math.sin(t*23))*.004;VESPA.steer.rotation.y=Math.sin(t*.45)*.05;
   // --- hantu di pinggir jalan
   if(want&&!ev){ev={w:want.who,side:want.side,u:-want.delay};want=null}
   let go=0,tt=0;
   if(ev){ev.u+=dt;const u=ev.u,g=GA[ev.w];
    if(u>0&&u<1.25)go=.55*sstep(u/.45);        // muncul samar, lalu hilang tiba-tiba saat Wandih menoleh
    if(u>.5&&u<2.2)tt=-ev.side*.85;            // Wandih menoleh ke arah sosok, lalu kembali ke depan
    g.x=ev.side*4.2;g.z=-17+SPD*Math.max(0,u); // diam di tepi jalan, ikut bergeser bersama pemandangan
    if(u>2.6)ev=null}
   for(const k in GA){const on=!!(ev&&ev.w===k&&go>0);A.ghostOp(GK[k],on?go:0);GA[k].vis=on}
   turn+=(tt-turn)*Math.min(1,dt*7);
   const po=seatedOpts(VESPA,t,true);po.hy+=turn;pose(WANDIH,po);
   // lampu jalan: 4 tiang terdekat diberi cahaya
   const L=[];E.chunks.forEach(c=>E.poleZ.forEach(z=>L.push(c.position.z+z)));L.sort((a,b)=>Math.abs(a)-Math.abs(b));
   E.lights.forEach((l,i)=>l.position.set(2.15,5,L[i]));
   // kamera ikut bergoyang halus
   const s=E.shots;s.kiri.p[1]=1.25+Math.sin(t*.5)*.05;s.belakang.p[0]=.9+Math.sin(t*.4)*.35;s.depan.p[0]=-1.5+Math.sin(t*.35)*.3;s.atas.p[2]=2.3+Math.sin(t*.3)*.5;s.sorot.p[0]=1.1+Math.sin(t*.4)*.2},
  onScene:function(s){want=s.hantu?{who:s.hantu,side:s.hantu==='K'?-1:1,delay:s.hdelay||.7}:null;ev=null}}}

// =====================================================================
// PANGGUNG 'rumah' - Wandih tiba & parkir di jalan masuk garasi; 3 rumah sejajar: tetangga kiri, rumah Wandih (tengah), tetangga kanan
// =====================================================================
let HM=null;
function stoneTex(){return cvTex(128,128,(g,w,h)=>{g.fillStyle='#4d463f';g.fillRect(0,0,w,h);const r=rng(3),pal=['#9a8f82','#7c7266','#a89c8c','#6e655b','#b0a495','#8b8074'];
 for(let y=0;y<h;y+=16){let x=-((y/16)%2)*12;while(x<w){const bw=18+(r()*22|0);g.fillStyle=pal[r()*pal.length|0];g.fillRect(x+1,y+1,bw-2,14);x+=bw}}})}
function tileTex(){return cvTex(128,128,(g,w,h)=>{g.fillStyle='#6b2e14';g.fillRect(0,0,w,h);const r=rng(9),pal=['#c4622d','#b5552a','#d0703a','#a94b24','#cc6a33'];
 for(let y=0;y<h;y+=16){const o=(y/16)%2?16:0;for(let x=-16;x<w;x+=32){g.fillStyle=pal[r()*pal.length|0];g.fillRect(x+o+1,y+1,30,14)}}})}
function rep(t,rx,ry,emi){const c=t.clone();c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(rx,ry);c.needsUpdate=true;return new THREE.MeshLambertMaterial({map:c,emissive:emi||0x0c0b09})}
function gable(par,cx,cy,cz,span,len,rise,along,tm,wm){ // atap pelana: along='x' (bubungan searah x) / 'z'
 const ov=.35,ang=Math.atan2(rise,span/2),sl=Math.hypot(span/2+ov,rise+ov*Math.tan(ang)),eh=ov*Math.tan(ang);
 for(const sd of[-1,1]){const m=new THREE.Mesh(new THREE.BoxGeometry(along==='x'?len+ov*2:sl,.12,along==='x'?sl:len+ov*2),tm);
  const hx=sd*(span/4+ov/2),hy=cy+rise/2-eh/2;
  if(along==='x'){m.position.set(cx,hy,cz+hx);m.rotation.x=sd*ang}else{m.position.set(cx+hx,hy,cz);m.rotation.z=-sd*ang}par.add(m)}
 const sh=new THREE.Shape();sh.moveTo(-span/2,0);sh.lineTo(span/2,0);sh.lineTo(0,rise);sh.lineTo(-span/2,0);
 for(const sd of[-1,1]){const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),wm);
  if(along==='x'){m.rotation.y=PI/2;m.position.set(cx+sd*len/2,cy,cz)}else{m.position.set(cx,cy,cz+sd*len/2)}par.add(m)}}
function win(par,x,y,z,w,h,ry,gc){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;par.add(g);const GR=LM(0x4f7a2a,0x0c1406);
 bx(g,w+.16,h+.16,.08,GR,0,0,0);bx(g,w,h,.09,BM(gc||0xffd890),0,0,0);bx(g,w,.05,.11,GR,0,0,0);bx(g,.05,h,.11,GR,0,0,0);bx(g,w+.3,.07,.22,LM(0xb0a698,0x14120f),0,-h/2-.1,.05);return g}
function fenceRun(par,x0,z0,x1,z1,col,pk,thin){
 const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),g=new THREE.Group();g.position.set(x0,0,z0);g.rotation.y=Math.atan2(-dz,dx);par.add(g);
 const m=LM(col,0x0a0604);bx(g,len,.07,.045,m,len/2,.3,0);bx(g,len,.07,.045,m,len/2,.75,0);
 const np=Math.max(2,Math.round(len/1.6)+1);for(let i=0;i<np;i++)bx(g,.11,1.05,.11,m,len*i/(np-1),.52,0);
 const gap=pk?.17:.12,n=Math.floor(len/gap),im=new THREE.InstancedMesh(new THREE.BoxGeometry(thin?.025:.09,pk?.9:.95,.03),m,n),d=new THREE.Object3D();
 for(let i=0;i<n;i++){d.position.set(gap*(i+.5),.47,.04);d.updateMatrix();im.setMatrixAt(i,d.matrix)}im.frustumCulled=false;g.add(im);return g}
function mkTree(par,x,z,s,leaf){const m=LM(0x3a2a1e,0x080604);bx(par,.28*s,2*s,.28*s,m,x,s,z);
 const l=new THREE.Mesh(new THREE.SphereGeometry(1.2*s,8,6),LM(leaf||0x1f4a2a,0x050c06));l.position.set(x,2.5*s,z);l.scale.y=.85;par.add(l)}
function mkBush(par,x,z,s,col){const b=new THREE.Mesh(new THREE.SphereGeometry(.55*s,7,5),LM(col||0x24502c,0x050c06));b.position.set(x,.35*s,z);b.scale.y=.75;par.add(b)}
function pad(par,w,d,x,z,col){bx(par,w,.04,d,col||0x8a8d92,x,.04,z)}
// ---------- TIGA RUMAH: kiri = tetangga (putih, genteng merah), tengah = rumah Wandih (kuning, atap teal), kanan = tetangga (biru, teras) ----------
// Rumah Wandih: pintu di x=X1, muka dinding utama di z=ZM (menghadap +z). Jalan masuk garasi di x=GX, Vespa berhenti di z=ZP.
const X1=-4,ZM=-12.4,GX=-8.7,ZP=-10.3,OW=1.1,DH=2.15,DW=OW+.02;
const dbl=m=>{m.side=THREE.DoubleSide;return m};
const mb=(par,w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);par.add(m);return m};
const blk=(par,tex,emi,w,h,d,x,y0,z)=>mb(par,w,h,d,x,y0+h/2,z,rep(tex,w/1.2,h/1.2,emi));
function sidingTex(base){return cvTex(128,128,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const r=rng(7);
 for(let y=0;y<h;y+=16){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,y,w,2);g.fillStyle='rgba(255,255,255,.07)';g.fillRect(0,y+2,w,3);if(r()<.5){g.fillStyle='rgba(0,0,0,.05)';g.fillRect(0,y+5,w,10)}}})}
function plainTex(base){return cvTex(64,64,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const r=rng(4);for(let i=0;i<60;i++){g.fillStyle=r()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.06)';g.fillRect(r()*w|0,r()*h|0,3,3)}})}
function boardTex(base){return cvTex(128,128,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let x=0;x<w;x+=10){g.fillStyle='rgba(0,0,0,.24)';g.fillRect(x,0,2,h)}})}
function shingleTex(base,alt){return cvTex(128,128,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const r=rng(5);
 for(let y=0;y<h;y+=16){const o=(y/16)%2?12:0;for(let x=-12;x<w;x+=24){g.fillStyle=r()<.5?alt:base;g.fillRect(x+o+1,y+1,22,14)}g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,y+14,w,2)}})}
function brickTex(){return cvTex(64,64,(g,w,h)=>{g.fillStyle='#4a2a22';g.fillRect(0,0,w,h);const r=rng(8),pal=['#a8382c','#b84634','#983026','#b03c2e'];
 for(let y=0;y<h;y+=8){let x=-((y/8)%2)*8;while(x<w){g.fillStyle=pal[r()*pal.length|0];g.fillRect(x+1,y+1,14,6);x+=16}}})}
function latticeTex(){return cvTex(64,64,(g,w,h)=>{g.fillStyle='#d8d8dc';g.fillRect(0,0,w,h);g.strokeStyle='#8a8a92';g.lineWidth=3;
 for(let i=-h;i<w+h;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i,h);g.lineTo(i+h,0);g.stroke()}})}
function winB(par,x,y,z,w,h,fc,gc,sh){ // jendela berbingkai (+ daun jendela opsional), menempel di dinding bidang z
 const fr=LM(fc,0x1a1206);
 mb(par,w+.16,h+.16,.06,x,y,z,fr);mb(par,w,h,.07,x,y,z,BM(gc));mb(par,w,.05,.09,x,y,z,fr);mb(par,.05,h,.09,x,y,z,fr);
 mb(par,w+.3,.06,.18,x,y-h/2-.1,z+.04,LM(0xd8d4c8,0x16150f));
 if(sh){const sm=LM(sh,0x1c1604);mb(par,.3,h+.1,.05,x-w/2-.3,y,z+.02,sm);mb(par,.3,h+.1,.05,x+w/2+.3,y,z+.02,sm)}}
function stone(par,x,z,r,rot){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.05,10),LM(0x8c8d94,0x101014));m.scale.z=.7;m.rotation.y=rot||0;m.position.set(x,.03,z);par.add(m)}
function mkPine(par,x,z,s){const m=LM(0x3a2a1e,0x080604);mb(par,.3*s,1.4*s,.3*s,x,.7*s,z,m);
 for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.ConeGeometry((1.5-i*.28)*s,2.2*s,7),LM(i%2?0x143a22:0x1a4a2a,0x040c06));c.position.set(x,(1.9+i*1.2)*s,z);par.add(c)}}

// ---- RUMAH WANDIH (tengah): kuning, atap teal 2 dormer, garasi kiri, sayap kanan, pintu merah ----
// Pintu: daun pintu duduk DI DALAM ketebalan dinding (rata muka dinding), kusen putih menutup tepi, lorong di belakangnya
// tertutup rapat -> dari sudut kamera mana pun tidak ada celah yang memperlihatkan bagian dalam rumah.
function houseWandih(sc){
 const H=new THREE.Group();H.position.set(X1,0,ZM);sc.add(H);
 const YW=sidingTex('#e8dca4'),EM=0x2e2a12,TR=()=>rep(shingleTex('#24505e','#2f6678'),3,2,0x050d10),GE=()=>dbl(rep(YW,.83,.83,EM));
 // badan utama: dinding kiri + kanan + ambang atas (bukaan pintu OW x DH di tengah), tebal 6
 blk(H,YW,EM,(6-OW)/2,3,6,-(OW/2+(6-OW)/4),0,-3);blk(H,YW,EM,(6-OW)/2,3,6,OW/2+(6-OW)/4,0,-3);blk(H,YW,EM,OW,3-DH,6,0,DH,-3);
 gable(H,0,3,-3,6,6,2.6,'x',TR(),GE());
 for(const sx of[-1.8,1.8]){ // dormer
  blk(H,YW,EM,1.3,1.3,1.2,sx,3.55,-1.5);gable(H,sx,4.85,-1.5,1.3,1.2,.5,'z',TR(),GE());winB(H,sx,4.25,-.9,.6,.75,0xd98a1f,0xffd890)}
 mb(H,.7,1.8,.7,2.2,6.0,-2.9,rep(brickTex(),.7,1.8,0x2a0c08));mb(H,.86,.12,.86,2.2,6.95,-2.9,LM(0x6a645a,0x0e0e0c)); // cerobong
 for(const sx of[-1.8,1.8])winB(H,sx,1.6,0,1.1,1.3,0xe08a1c,0xffd890,0xc9a21e);                                      // jendela + daun jendela
 // garasi (kiri, agak mundur) + pintu garasi abu-abu
 blk(H,YW,EM,3.4,2.55,5,-4.7,0,-3.7);
 mb(H,2.5,2.0,.06,-4.7,1.0,-1.17,LM(0xd4d8dc,0x1a1c1e));for(let i=1;i<5;i++)mb(H,2.5,.03,.08,-4.7,i*.4,-1.16,LM(0x6a6e74,0x08090a));
 mb(H,2.64,.08,.1,-4.7,2.04,-1.15,LM(0xf0ead8,0x1c1b16));
 {const m=mb(H,3.9,.12,5.4,-4.75,2.8,-3.7,TR());m.rotation.z=.142}
 // sayap kanan: panel kisi-kisi + pintu oranye
 blk(H,YW,EM,2.8,2.45,4.6,4.4,0,-2.9);
 for(const lx of[3.7,5.15])mb(H,.9,1.7,.04,lx,1.0,-.58,rep(latticeTex(),2,4,0x1c1c20));
 mb(H,.8,1.9,.06,4.45,.95,-.57,LM(0xe8981c,0x2a1804));
 {const m=mb(H,3.2,.12,4.9,4.4,2.7,-2.9,TR());m.rotation.z=-.18}
 // teras depan: lantai datar, kusen putih, kanopi segitiga coklat, lampu dinding
 mb(H,1.8,.03,1.0,0,.02,.5,LM(0xa8a8a0,0x0c0c0a));
 const TRIM=LM(0xf2ecdc,0x201f1a);
 mb(H,.1,DH+.1,.05,-OW/2-.05,(DH+.1)/2,.015,TRIM);mb(H,.1,DH+.1,.05,OW/2+.05,(DH+.1)/2,.015,TRIM);mb(H,OW+.2,.1,.05,0,DH+.05,.015,TRIM);
 gable(H,0,2.25,.48,1.5,1.0,.38,'z',LM(0x6b3a18,0x140a04),dbl(LM(0x6b3a18,0x140a04)));
 mb(H,.14,.26,.14,.95,1.85,.07,BM(0xffe0a0));mb(H,.2,.05,.2,.95,2.0,.07,LM(0x222222));
 // pintu merah (engsel di kiri, membuka ke dalam). Daun: z lokal -.05..+.05 di dalam bukaan, lebih lebar .01 tiap sisi (menyatu dengan dinding)
 const DOOR=new THREE.Group();DOOR.position.set(-OW/2-.01,0,-.055);H.add(DOOR);
 const R1=LM(0xc4362c,0x2a0a08),R2=LM(0xa82a22,0x200806);
 mb(DOOR,DW,DH,.1,DW/2,DH/2,0,R1);
 for(const py of[.65,1.65])mb(DOOR,.78,.8,.12,DW/2,py,.005,R2);
 mb(DOOR,.08,.08,.14,DW-.12,1.05,.1,LM(0xc8a24a,0x201808));
 // lorong di belakang pintu (gelap, tertutup penuh)
 const DK1=LM(0x24180e,0x0c0804),DK2=LM(0x1a110a,0x080503);
 mb(H,.02,DH,2.1,-OW/2+.01,DH/2,-1.15,DK1);mb(H,.02,DH,2.1,OW/2-.01,DH/2,-1.15,DK1);
 mb(H,OW,.02,2.1,0,DH-.01,-1.15,DK2);mb(H,OW,.02,2.1,0,.03,-1.15,LM(0x4a3a2a,0x14100a));
 mb(H,OW,DH,.02,0,DH/2,-2.19,DK2);mb(H,OW,DH,3.8,0,DH/2,-4.1,DK2);
 const INL=new THREE.PointLight(0xffc880,0,5);INL.position.set(0,1.7,-1.0);H.add(INL);
 return{door:DOOR,inL:INL}}

// ---- RUMAH TETANGGA KIRI: putih, atap genteng merah, gable krem papan vertikal, pintu kuning ----
function houseLeft(sc,X0,ZL){
 const H=new THREE.Group();H.position.set(X0,0,ZL);sc.add(H);
 const WH=plainTex('#ece8e0'),EM=0x24242a,BD=boardTex('#efe3c0'),TL=()=>rep(tileTex(),4,2,0x1a0a04),YF=0xd8b030,GL=0xffe29a;
 blk(H,WH,EM,3.4,2.5,5.2,-2.7,0,-3.2);blk(H,WH,EM,5.4,2.5,5.4,1.7,0,-2.7);
 gable(H,-2.7,2.5,-3.2,5.2,3.4,1.3,'x',TL(),dbl(rep(WH,.83,.83,EM)));
 gable(H,1.7,2.5,-2.7,5.4,5.4,2.3,'z',TL(),dbl(rep(BD,.5,.5,0x201c10)));
 winB(H,-3.6,1.5,-.6,.9,1.0,YF,GL);winB(H,-1.9,1.5,-.6,.9,1.0,YF,GL);winB(H,.35,1.5,0,.5,1.0,YF,GL);winB(H,3.3,1.45,0,1.3,1.0,YF,GL);
 const WT=LM(0xf0ece4,0x22221e);
 mb(H,1.0,2.0,.08,1.7,1.24,.04,LM(0xe8c43a,0x302808));mb(H,.08,.08,.1,2.05,1.2,.1,LM(0xc8a24a,0x201808));
 mb(H,1.2,.1,.1,1.7,2.28,.05,WT);mb(H,.1,2.1,.1,1.05,1.29,.05,WT);mb(H,.1,2.1,.1,2.35,1.29,.05,WT);
 mb(H,1.5,.24,.45,1.7,.12,.225,WT);mb(H,1.7,.16,.4,1.7,.08,.65,WT);mb(H,1.9,.08,.4,1.7,.04,1.05,WT);
 mkBush(sc,X0-1.2,ZL+.6,1.0);mkBush(sc,X0+3.9,ZL+.5,1.0);
 for(let i=0;i<6;i++)stone(sc,X0+1.7+Math.sin(i*1.3)*.2,ZL+1.6+i*1.1,.5,i*.7)}

// ---- RUMAH TETANGGA KANAN: biru, teras berpagar putih, atap teras coklat, tangga ----
function houseRight(sc,X2,ZR){
 const H=new THREE.Group();H.position.set(X2,0,ZR);sc.add(H);
 const BL=sidingTex('#7894c6'),EM=0x0e1626,WC=LM(0xe6e8ec,0x1c1d20),WT=LM(0xf2f2f2,0x222226);
 mb(H,6.8,.8,6,0,.4,-3,WC);                                                         // lantai teras / pondasi beton putih
 blk(H,BL,EM,6.4,2.8,4,0,.8,-4);
 gable(H,0,3.6,-4,6.4,4,2.0,'z',rep(shingleTex('#7d838c','#8b919a'),3,2,0x0a0c0e),dbl(rep(BL,.83,.83,EM)));
 {const m=mb(H,7.4,.1,2.4,0,3.15,-.825,LM(0xc59058,0x241608));m.rotation.x=.169}   // atap teras
 for(const x of[-3.25,-.6,.6,3.25])mb(H,.14,2.15,.14,x,1.875,.1,WT);
 for(const s of[[-3.25,-.6],[.6,3.25]]){const len=s[1]-s[0],cx=(s[0]+s[1])/2;mb(H,len,.07,.08,cx,1.75,.1,WT);mb(H,len,.06,.08,cx,.95,.1,WT);
  for(let i=0,n=Math.floor(len/.17);i<n;i++)mb(H,.035,.78,.035,s[0]+.08+i*.17,1.3,.1,LM(0x2a3f6a,0x080c14))}
 mb(H,1.2,.267,.45,0,.133,.675,WC);mb(H,1.2,.533,.45,0,.267,.225,WC);               // tangga 3 anak tangga
 mb(H,.95,2.1,.06,1.9,1.85,-1.97,WT);mb(H,.7,.8,.07,1.9,2.45,-1.965,LM(0xdcdcdc,0x1a1a1c));mb(H,.7,.8,.07,1.9,1.45,-1.965,LM(0xdcdcdc,0x1a1a1c));
 winB(H,-1.7,2.4,-2.0,1.9,1.4,0xf0f0f0,0xfff0c0);winB(H,0,4.5,-2.0,.9,1.1,0xf0f0f0,0xffe9b8);
 mb(H,.8,1.9,.8,-2.2,5.2,-4.7,LM(0x8e9096,0x101012));
 fenceRun(sc,X2-4.1,-4.9,X2+4.8,-4.9,0xe8e8ec,1,0);fenceRun(sc,X2+4.8,-4.9,X2+4.8,-15,0xe8e8ec,1,0);
 mkBush(sc,X2+3.9,ZR+1.8,2.0,0x276233);mkPine(sc,X2+3.2,-17,1.1);mkPine(sc,X2+5.4,-15.5,1.0);mkPine(sc,X2-2.2,-19,1.2)}

function envHome(){
 if(HM)return HM;
 const sc=new THREE.Scene(),fogC=0x070b16;sc.background=new THREE.Color(fogC);sc.fog=new THREE.Fog(fogC,18,95);
 sc.add(new THREE.AmbientLight(0x3a4a78,.85));const mo=new THREE.DirectionalLight(0x93aee8,.7);mo.position.set(-8,20,22);sc.add(mo);
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(260,200),LM(0x1a2e1e,0x060c07));gr.rotation.x=-PI/2;sc.add(gr);
 // jalan, trotoar
 bx(sc,200,.04,5.2,0x25272c,0,.02,0);bx(sc,200,.08,2,0x74777e,0,.04,-3.6);bx(sc,200,.1,.15,0x8e9197,0,.05,-2.55);bx(sc,200,.08,2,0x74777e,0,.04,3.6);
 {const dm=new THREE.InstancedMesh(new THREE.BoxGeometry(2,.012,.12),new THREE.MeshBasicMaterial({color:0xd8d8c0}),40),d=new THREE.Object3D();for(let i=0;i<40;i++){d.position.set(-98+i*5,.045,0);d.updateMatrix();dm.setMatrixAt(i,d.matrix)}dm.frustumCulled=false;sc.add(dm)}
 const sk=new THREE.BufferGeometry(),r0=rng(21),sp=[];for(let i=0;i<200;i++){const a=r0()*PI*2,e=.2+r0()*1.1;sp.push(Math.cos(a)*Math.cos(e)*180,Math.sin(e)*150+10,Math.sin(a)*Math.cos(e)*180-60)}
 sk.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));sc.add(new THREE.Points(sk,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false})));
 // ---- TIGA RUMAH sejajar: kiri (tetangga putih), tengah (rumah Wandih), kanan (tetangga biru) ----
 const D1=houseWandih(sc);houseLeft(sc,-17.1,-12.0);houseRight(sc,7.8,-11.6);
 // jalan masuk garasi (aspal beton) + apron di atas trotoar, jalur batu ke pintu, semak depan, kotak pos, pohon besar
 bx(sc,3.6,.11,2.3,0x6f7278,GX,.045,-3.65);bx(sc,3.6,.07,9.0,0x777a80,GX,.035,-9.1);
 for(let i=0;i<7;i++){const k=i/6;stone(sc,lerp(-1.5,X1+.1,k)+Math.sin(i*1.7)*.15,lerp(-5.2,ZM+1.1,k),.5,i*.6)}
 stone(sc,-4.9,-11.1,.45,.4);stone(sc,-4.4,-11.55,.45,-.3);
 mkBush(sc,X1-2.9,ZM+.5,1.2);mkBush(sc,X1-2.0,ZM+.5,1.2);mkBush(sc,X1+1.9,ZM+.6,1.3);mkBush(sc,X1+3.0,ZM+.55,1.2);
 bx(sc,.1,.9,.1,0x5a3820,-1.2,.45,-5.2);bx(sc,.32,.22,.22,0x2a3a6a,-1.2,.95,-5.2);
 mkTree(sc,-11.7,-8.6,1.5,0x24562f);
 // pohon latar belakang
 for(let i=0;i<26;i++){const r=rng(40+i),x=-34+i*2.8+r()*2,z=-24-r()*14;mkTree(sc,x,z,1.5+r()*1.5,i%3?0x16341e:0x1e4228)}
 // lampu jalan (trotoar) + lampu teras
 const lamp=x=>{bx(sc,.14,5.2,.14,0x4a4e56,x,2.6,-2.9);bx(sc,1.1,.09,.09,0x4a4e56,x+.5,5.2,-2.9);bx(sc,.45,.1,.24,0x4a4e56,x+1,5.15,-2.9);bx(sc,.28,.08,.2,BM(0xffe6a8),x+1,5.08,-2.9)};
 lamp(-16);lamp(-2);lamp(16);
 const L1=new THREE.PointLight(0xffc070,1.15,17);L1.position.set(-15,4.9,-2.9);sc.add(L1);
 const L2=new THREE.PointLight(0xffc070,1.15,17);L2.position.set(-1,4.9,-2.9);sc.add(L2);
 const L3=new THREE.PointLight(0xffd8a0,.9,9);L3.position.set(X1,2.4,ZM+1.2);sc.add(L3);
 const L4=new THREE.PointLight(0xffd8a0,.6,10);L4.position.set(7.8,3.0,-9.6);sc.add(L4);
 HM={scene:sc,shots:{jalan:{p:[-17,1.6,4.6],l:[-12,.9,-1.3],f:46},lebar:{p:[X1+.5,4.0,10.5],l:[X1+.2,2.1,ZM],f:62},wandih:{p:[-6.4,1.7,-4.3],l:[GX-.5,1.1,ZP-.4],f:44},pintu:{p:[X1+2.0,1.7,ZM+2.1],l:[X1,1.1,ZM-.4],f:46}},door:D1.door,inL:D1.inL};
 return HM}
// lintasan: lurus di jalan -> belok kiri ke jalan masuk garasi (x=GX) -> lurus ke depan garasi, berhenti di z=ZP
function buildPath(){
 const pts=[],add=(x,z)=>pts.push([x,z]);
 for(let x=-26;x<GX-3-.01;x+=.5)add(x,-1.3);
 for(let a=0;a<=90;a+=5){const r=a*PI/180;add(GX-3+3*Math.sin(r),-4.3+3*Math.cos(r))}
 for(let z=-4.7;z>ZP+.01;z-=.4)add(GX,z);add(GX,ZP);
 const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 return{pts:pts,cum:cum,L:cum[cum.length-1],at:function(s){s=clamp(s,0,this.L);let i=1;while(i<cum.length-1&&cum[i]<s)i++;const k=(s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),a=pts[i-1],b=pts[i],j=Math.min(pts.length-1,i+1),c=pts[Math.max(0,i-2)];
  const fx=pts[j][0]-c[0],fz=pts[j][1]-c[1];return{x:lerp(a[0],b[0],k),z:lerp(a[1],b[1],k),yaw:Math.atan2(-fx,-fz)}}}}
function stRumah(){
 sharedActors();const E=envHome();A.setScene(E.scene);E.scene.add(WANDIH.root);E.scene.add(VESPA.g);
 const PA=buildPath(),V=5.5,D=3.5,s1=PA.L-D,t1=s1/V,Tb=2*D/V,tEnd=t1+Tb,tDis=tEnd+.6,DIS=1.5,tWalk=tDis+DIS+.9;
 let off=false,yawPrev=null,roll=0,wheel=0,stSm=0,td=null,hS=null;const DIN=ZM-1.5,WS=1.3;
 const park=PA.at(PA.L);
 // rute jalan kaki: turun di kiri Vespa -> maju melewati depan Vespa -> menyeberang halaman -> lurus ke pintu
 const stand=[[park.x-.6,park.z+.12],[park.x-.7,park.z-1.75],[X1-1.2,ZM+2.2],[X1,ZM+.43]],segL=[];let WL=0;
 for(let i=1;i<stand.length;i++){const l=Math.hypot(stand[i][0]-stand[i-1][0],stand[i][1]-stand[i-1][1]);segL.push(l);WL+=l}
 const SE=stand[stand.length-1],tArrive=()=>tWalk+WL/WS;
 const shJ=E.shots.jalan,shL=E.shots.lebar,shW=E.shots.wandih;
 return{shots:E.shots,
  tick:function(t,dt){
   let s,v;if(t<t1){s=V*t;v=V}else if(t<tEnd){const k=t-t1;s=s1+V*k-V*k*k/(2*Tb);v=V*(1-k/Tb)}else{s=PA.L;v=0}
   const p=PA.at(s);VESPA.g.position.set(p.x,0,p.z);
   let dy=0;if(yawPrev!==null){dy=Math.atan2(Math.sin(p.yaw-yawPrev),Math.cos(p.yaw-yawPrev))/Math.max(dt,.001)}yawPrev=p.yaw;
   roll+=(clamp(dy*.1,-.2,.2)-roll)*Math.min(1,dt*6);stSm+=(clamp(dy*.16,-.4,.4)-stSm)*Math.min(1,dt*8);
   VESPA.g.rotation.set(0,p.yaw,roll);VESPA.steer.rotation.y=stSm;wheel+=v/.19*dt*.5;VESPA.fw.rotation.x=-wheel;VESPA.rw.rotation.x=-wheel;
   if(!off&&t>=tEnd){off=true;A.ambStop(MOTOR)}
   let ang=0,rel=-1;if(td!==null&&t>=td){rel=t-td;ang=rel<3.1?1.66*sstep((rel-.7)/1):1.66*(1-sstep((rel-3.1)/1))}
   E.door.rotation.y=ang;E.door.updateMatrixWorld(true);E.inL.intensity=1.3*clamp(ang/1.2,0,1);
   const so=seatedOpts(VESPA,t,v>.1);
   if(t<tDis){pose(WANDIH,so)}
   else{ // turun dari motor lalu berjalan ke pintu rumah
    const u=sstep((t-tDis)/DIS),yaw=p.yaw,sq=so.sq;
    const gpos=[wpt(VESPA,-.715,0,.12),wpt(VESPA,-.485,0,.12)],spos=wpt(VESPA,-.6,.7,.12);
    if(t<tDis+DIS){
     const pel=so.hip.clone().lerp(spos,u);pel.y+=.1*Math.sin(PI*u);
     pose(WANDIH,{pel:pel,q:sq.clone().multiply(qX(-.12*(1-u))),hx:.12*(1-u),hy:0,
      arm:[0,1].map(i=>sh=>({t:so.gr[i].clone().lerp(sh.clone().add(new V3(0,-.69,0)),u),p:so.dr(i?.7:-.7,-.9,.1)})),
      leg:[0,1].map(i=>hp=>({t:so.fo[i].clone().lerp(gpos[i],u).add(new V3(0,i?.28*Math.sin(PI*u):0,0)),p:so.dr(i?.25:-.25,.35,-1)}))})}
    else{
     const wt=Math.max(0,t-tWalk);let d=Math.min(wt*WS,WL),px,pz,hd;
     let acc=0,si=0;while(si<segL.length-1&&d>acc+segL[si])acc+=segL[si++];
     const kk=segL[si]>0?clamp((d-acc)/segL[si],0,1):1,sa=stand[si],sb=stand[si+1];
     px=lerp(sa[0],sb[0],kk);pz=lerp(sa[1],sb[1],kk);hd=Math.atan2(-(sb[0]-sa[0]),-(sb[1]-sa[1]));
     let mv=wt>0&&d<WL-.01,sw=mv?Math.sin(wt*WS*4.2):0;
     const sx0=wpt(VESPA,-.6,0,.12);let bx0=wt>0?px:sx0.x,bz0=wt>0?pz:sx0.z;
     const hT=rel>=0?0:(wt>0?hd:yaw);if(hS===null)hS=hT;else hS+=Math.atan2(Math.sin(hT-hS),Math.cos(hT-hS))*Math.min(1,(dt||.016)*7); // hadap berputar halus
     const yq2=qYaw(hS);
     let armF=i=>()=>({q:yq2,a:(i?1:-1)*sw*.55,b:-.12*mv});
     if(rel>=0){ // buka pintu, masuk, pintu menutup (tanpa suara)
      const wk=clamp((rel-1.5)/1.1,0,1);bx0=SE[0];bz0=lerp(SE[1],DIN,sstep(wk));mv=wk>0&&wk<1;sw=mv?Math.sin((rel-1.5)*5.5):0;
      const reach=sstep(rel/.6)*(1-sstep((rel-1.1)/.4)),knob=E.door.localToWorld(new V3(DW-.12,1.05,.14));
      armF=i=>sh=>{const idle=sh.clone().add(new V3(0,-.66,(i?1:-1)*sw*.25));return{t:i?idle.lerp(knob,reach):idle,p:new V3(i?.7:-.7,-.9,.1)}}}
     const yq3=yq2;
     pose(WANDIH,{pel:new V3(bx0,.7+Math.abs(sw)*.03,bz0),q:yq3,hx:0,hy:0,
      arm:[0,1].map(armF),
      leg:[0,1].map(i=>()=>({q:yq3,a:(i?-1:1)*sw*.6,b:Math.max(0,(i?sw:-sw))*.7}))})}}
   // kamera
   const sx=VESPA.g.position.x,sz=VESPA.g.position.z;
   shJ.p[0]=sx-6.5;shJ.p[2]=4.6;shJ.l[0]=sx+.8;shJ.l[2]=sz;
   shW.l[0]=GX-.5+(t>tWalk?Math.min(3,(t-tWalk)*.7):0);shW.l[2]=ZP-.4;
   shL.p[0]=X1+.5+Math.sin(t*.15)*.8},
  onScene:function(sc){if(sc&&sc.door&&td===null)td=Math.max(A.T(),tArrive())}}}

// =====================================================================
// PANGGUNG 'tidur' - kamar malam, Wandih berbaring, selimut dinamis, Zzz
// =====================================================================
let BD=null;const BT=.44;
function blanketTexture(){
 const c=document.createElement('canvas');c.width=512;c.height=480;const g=c.getContext('2d');g.fillStyle='#3b5a9a';g.fillRect(0,0,512,480);
 g.fillStyle='rgba(255,255,255,.18)';for(let x=0;x<512;x+=64)g.fillRect(x,0,18,480);for(let y=0;y<480;y+=64)g.fillRect(0,y,512,18);
 g.strokeStyle='#d9a441';g.lineWidth=5;g.strokeRect(14,14,484,452);
 const t=new THREE.CanvasTexture(c);return t}
function bodyTop(x,z){ // tinggi permukaan tubuh (relatif ke permukaan kasur) untuk selimut: badan+kaki selebar .46, tinggi .23; jari kaki sedikit menonjol
 const dw=.2;let h=0;
 const part=(hx,z0,z1,ht)=>{const dx=Math.max(Math.abs(x)-hx,0),dz=Math.max(z0-z,z-z1,0),k=1-Math.hypot(dx,dz)/dw;if(k>0)h=Math.max(h,ht*sstep(k))};
 const u=sstep((z+.15)/.45);part(.23+.15*u,-.95,.45,.23+.17*u);part(.2,-.95,-.75,.27);return h}
function hang(a,edge,r){ // lengkung selimut yang menggantung di tepi kasur: a=jarak sepanjang kain, return {p:posisi, dy:turun}
 const a0=edge-r;if(a<=a0)return{p:a,dy:0};const q=PI*r/2;
 if(a<=a0+q){const th=(a-a0)/r;return{p:a0+r*Math.sin(th),dy:-r*(1-Math.cos(th))}}
 return{p:edge,dy:-r-(a-a0-q)}}
function buildBlanket(){
 const W=1.5,LZ=1.75,nx=70,nz=80,zTop=.4,bedHalf=.615,zEdge=zTop+1.365,pos=[],uv=[],idx=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const xp=(i/nx-.5)*W,zp=j/nz*LZ,sg=xp<0?-1:1,ax=Math.abs(xp),zn=zTop-zp,pr=bodyTop(xp,zn);
  const hx=hang(ax,bedHalf,.06),hz=hang(zp,zEdge-zTop,.06);
  const wr=(.010*Math.sin(zp*11+xp*4)+.006*Math.sin(xp*17-zp*5))*(.4+pr*3)+.014*Math.max(0,1-zp/.12);
  pos.push(sg*hx.p,pr+.014+wr+hx.dy+hz.dy,zTop-hz.p);uv.push(i/nx,1-j/nz)}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const tex=blanketTexture(),m=new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide,emissive:0x0c0e14});
 if(BLANKET){new THREE.TextureLoader().load(BLANKET,t=>{t.anisotropy=4;m.map=t;m.needsUpdate=true},undefined,()=>{})}
 const mesh=new THREE.Mesh(g,m);mesh.position.y=BT;return mesh}
function zTex(){return cvTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#dfe8ff';g.font='bold 54px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('Z',32,34)})}
function envBed(){
 if(BD)return BD;
 const sc=new THREE.Scene(),bgc=0x080b16;sc.background=new THREE.Color(bgc);
 sc.add(new THREE.AmbientLight(0x2c3a62,.8));
 const mo=new THREE.DirectionalLight(0x7f9be0,.6);mo.position.set(-10,6,0);sc.add(mo);
 const lamp=new THREE.PointLight(0xffb870,.9,6);lamp.position.set(.95,1.0,.8);sc.add(lamp);
 const fill=new THREE.PointLight(0x6a80c0,.55,8);fill.position.set(.3,2.3,-.2);sc.add(fill);
 const room=new THREE.Mesh(new THREE.BoxGeometry(5.6,2.8,4.6),new THREE.MeshLambertMaterial({color:0x2e3552,emissive:0x0a0c14,side:THREE.BackSide}));room.position.set(0,1.4,-.3);sc.add(room);
 bx(sc,5.6,.06,4.6,LM(0x4a3524,0x0c0804),0,.03,-.3);
 const WD=LM(0x5a3b22,0x0c0804);
 bx(sc,1.3,.28,2.34,WD,0,.14,0);bx(sc,1.2,.16,2.2,LM(0xd9dde8,0x14161c),0,.36,0);bx(sc,1.3,.95,.08,WD,0,.72,1.2);bx(sc,1.3,.5,.06,WD,0,.5,-1.17);
 bx(sc,.45,.5,.4,WD,.98,.25,.85);bx(sc,.1,.22,.1,0xd0d0d0,.98,.61,.85);const sh=new THREE.Mesh(new THREE.ConeGeometry(.16,.2,10,1,true),LM(0xffd9a0,0x806030));sh.material.side=THREE.DoubleSide;sh.position.set(.98,.78,.85);sc.add(sh);
 // jendela + bulan + tirai (dinding kiri)
 bx(sc,.06,1.2,1.4,0x2a1c10,-2.78,1.6,-.3);const wn=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.1),new THREE.MeshBasicMaterial({color:0x1e3270}));wn.rotation.y=PI/2;wn.position.set(-2.74,1.6,-.3);sc.add(wn);
 const mn=new THREE.Mesh(new THREE.CircleGeometry(.14,16),new THREE.MeshBasicMaterial({color:0xeaf0ff}));mn.rotation.y=PI/2;mn.position.set(-2.73,1.85,-.55);sc.add(mn);
 bx(sc,.05,1.3,.4,LM(0x6a2a3a,0x120608),-2.7,1.6,.55);bx(sc,.05,1.3,.4,LM(0x6a2a3a,0x120608),-2.7,1.6,-1.15);
 // bantal (elipsoid)
 const blanket=buildBlanket();sc.add(blanket);
 // efek Zzz
 const zs=[];for(let i=0;i<3;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:zTex(),transparent:true,depthWrite:false,fog:false}));sp.visible=false;sc.add(sp);zs.push(sp)}
 BD={scene:sc,blanket:blanket,zs:zs,shots:{samping:{p:[1.95,1.55,-.55],l:[0,.7,.2],f:46},kaki:{p:[-.7,1.35,-2.15],l:[0,.6,.35],f:46},atas:{p:[.55,2.5,-.3],l:[0,.5,.15],f:46}}};
 return BD}
function stTidur(){
 sharedActors();const E=envBed();A.setScene(E.scene);E.scene.add(WANDIH.root);
 const qLie=qX(PI/2),pel=new V3(0,BT+.115,-.25);
 return{shots:E.shots,
  tick:function(t,dt){
   const br=Math.sin(t*1.3),d=Math.sin(t*.9);
   pose(WANDIH,{pel:pel,q:qLie,hz:-.075,hx:0,hy:.12+Math.sin(t*.4)*.02,
    arm:[0,1].map(i=>()=>({t:new V3(i?.07:-.07,.70+.006*br,.25),p:new V3(i?.8:-.8,-.3,-.45)})),
    leg:[0,1].map(i=>()=>({q:qLie.clone().multiply(new Q().setFromAxisAngle(new V3(0,0,1),i?-.07:.07)),a:0,b:0}))});
   // Zzz melayang naik dari kepala
   E.zs.forEach((z,i)=>{const life=3.6,k=((t+i*life/3)%life)/life,a=Math.sin(PI*k);z.visible=true;z.material.opacity=a*.9;
    z.position.set(.05+k*.55,1.25+k*.75,.7+k*.35);const s=.14+k*.3;z.scale.set(s,s,1)});
   const sh=E.shots;sh.samping.p[2]=-.55+Math.sin(t*.25)*.25;sh.kaki.p[0]=-.7+Math.sin(t*.2)*.2;sh.atas.p[0]=.55+Math.sin(t*.22)*.25},
  onScene:function(){}}}

CUT3D.add('jalan',stJalan);CUT3D.add('rumah',stRumah);CUT3D.add('tidur',stTidur);
})();
