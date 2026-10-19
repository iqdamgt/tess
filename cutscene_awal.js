// =====================================================================
// CUTSCENE AWAL - MIDNIGHT LAB..
// Dua panggung 3D tambahan untuk cerita pembuka (dimuat SETELAH cutscene_akhir.js):
//   'kelas' : ruang kelas sore hari (SMK: Wandih tertidur, LANGGANAN TERBAWAH: papan peringkat, REMEDIAL: Guru memberi tugas)
//   'teman' : flashback di ruang pertama lab (yang sama dengan game). Tiga teman Wandih beravatar berekspresi
//             (senang, lelah, takut) menginap, lalu diganggu El Kalla dan kapok.
// Field tambahan di cerita.js: board ('ajar' | 'rank' | 'remedial'), stamp, zzz, paper (kelas);
//   flick, ghost, walk (teman). Selebihnya sama seperti cutscene3d.js (cam, anim, expr, at, go, look, spd, fx).
// Ekspresi wajah: normal, senang, lelah, takut, marah. Kalau ada error, adegan kembali ke tampilan lama (sv).
// =====================================================================
(function(){
'use strict';
if(typeof THREE==='undefined'||!window.CUT3D||!CUT3D.api||!CUT3D.api.addActor)return;
const A=CUT3D.api,PI=Math.PI,LM=A.LM,BM=A.BM,bx=A.bx,ANIM=A.ANIM;

// ---------- animasi baru (duduk di kursi: pinggul turun, paha lurus ke depan) ----------
const seat=fn=>t=>{const o=fn(t);o.by=(o.by||0)-.12;o.llx=1.5;o.lrx=1.5;return o};
ANIM.duduk=seat(t=>({alx:.92,arx:.92,alz:-.05,arz:.05,hx:Math.sin(t*1.1)*.02}));
ANIM.ketik=seat(t=>({alx:.92+Math.sin(t*11)*.05,arx:.92+Math.sin(t*11+2)*.05,alz:-.04,arz:.04,hx:-.12+Math.sin(t*.8)*.03,hy:Math.sin(t*.5)*.05}));
ANIM.ketik2=seat(t=>({alx:.92+Math.sin(t*9+1)*.06,arx:.92+Math.sin(t*9+3)*.06,alz:-.04,arz:.04,hx:-.1,hy:Math.sin(t*.7+1)*.06}));
ANIM.ngobrol=seat(t=>({alx:.92,arx:.55+Math.sin(t*5)*.3,arz:.35,hy:-.55+Math.sin(t*2.3)*.12,hx:Math.sin(t*5)*.05,by:Math.abs(Math.sin(t*4))*.01}));
ANIM.tertawa=seat(t=>({alx:.92,arx:.92,hx:.25+Math.sin(t*14)*.12,by:Math.abs(Math.sin(t*14))*.03,lean:Math.sin(t*14)*.03}));
ANIM.dudukTakut=seat(ANIM.takut);
ANIM.dudukKaget=seat(ANIM.kaget);
ANIM.tidurDuduk=seat(t=>({alx:.92,arx:.92,alz:.2,arz:-.2,hx:-.95+Math.sin(t*1.2)*.05,lean:.03}));
ANIM.tulis=t=>({arx:2.45+Math.sin(t*5)*.12,alx:.05,alz:-.05,arz:.1,hy:-.1,hx:.1});
ANIM.tolak=t=>({alx:.95,arx:.95,alz:.75,arz:-.75,hx:-.1,lean:-.05,by:Math.sin(t*1.4)*.004});
// berlari panik: kaki & lengan mengayun cepat, badan condong ke depan, kepala menoleh ke belakang (dipakai saat anim:'lari' dan tokoh sedang berjalan lewat go)
ANIM.lari=t=>{const s=Math.sin(t*11),c=Math.abs(Math.sin(t*5.5));return{llx:s*1,lrx:-s*1,alx:-s*1.1,arx:s*1.1,alz:-.25-c*.15,arz:.25+c*.15,lean:.2,hx:.12,hy:Math.sin(t*3.3)*.45,by:Math.abs(s)*.07,sx:Math.sin(t*37)*.01}};
// bersorak merayakan kelulusan: dua tangan terangkat, melompat kecil
ANIM.rayakan=t=>({alx:2.7+Math.sin(t*6)*.15,arx:2.7+Math.sin(t*6+1)*.15,alz:-.3,arz:.3,by:Math.abs(Math.sin(t*5))*.08,hx:-.1,hy:Math.sin(t*2)*.15});
ANIM.lelah=t=>({hx:-.55+Math.sin(t*1.5)*.03,lean:.08,alz:-.05,arz:.05,by:Math.sin(t*1.8)*.006});

const txt=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
const zTex=()=>txt(64,64,(g,w,h)=>{g.fillStyle='#dfe8ff';g.font='bold 54px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('Z',32,34)});
const sstep=k=>{k=Math.max(0,Math.min(1,k));return k*k*(3-2*k)};

// =====================================================================
// PANGGUNG 'kelas'
// =====================================================================
let KL=null,paperMesh=null,raporMesh=null;
function boardTex(kind){
 return txt(1840,560,(g,w,h)=>{
  g.fillStyle='#2f4a3b';g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<40;i++)g.fillRect(Math.random()*w,Math.random()*h,260,6);
  g.textBaseline='top';g.fillStyle='#ecf2e4';
  if(kind==='ajar'){
   g.font='bold 96px sans-serif';g.fillText('RPL - Pemrograman Dasar',70,40);
   g.font='64px sans-serif';g.fillText('Tugas: kumpulkan hari ini!',70,190);
   g.fillStyle='#bcd6c4';g.font='52px monospace';
   ['for (i = 0; i < 10; i++) {','   cetak(i);','}'].forEach((l,i)=>g.fillText(l,70,300+i*68))}
  else if(kind==='rank'){
   g.font='bold 84px sans-serif';g.fillText('PERINGKAT KELAS',70,28);
   g.font='56px sans-serif';g.fillStyle='#d8e4d0';
   [['1.  Miow ok','98'],['2.  Josep','95'],['3.  Ilham','94'],['...','']].forEach((r,i)=>{g.fillText(r[0],70,150+i*74);g.fillText(r[1],720,150+i*74)});
   g.fillText('35. Rendra',70,150+4*74);g.fillText('41',720,150+4*74);
   g.fillStyle='#ffd24a';g.font='bold 62px sans-serif';g.fillText('36. WANDIH',70,150+5*74-2);g.fillText('12',720,150+5*74-2);
   g.fillRect(40,150+5*74+62,780,5);
   g.fillStyle='#ff8a7a';g.font='bold 56px sans-serif';g.fillText('← paling bawah',860,150+5*74)}
  else if(kind==='rapor'){
   g.font='bold 84px sans-serif';g.fillText('KETERANGAN RAPOR',70,28);
   g.font='bold 64px sans-serif';g.fillStyle='#d8e4d0';g.fillText('Nama : WANDIH',70,140);
   ['Tahun ke-1','Tahun ke-2','Tahun ke-3'].forEach((l,i)=>{g.font='60px sans-serif';g.fillStyle='#d8e4d0';g.fillText(l,70,230+i*90);g.font='bold 60px sans-serif';g.fillStyle='#ff8a7a';g.fillText('TIDAK NAIK KELAS',520,230+i*90)})}
  else if(kind==='lulus'){
   g.font='bold 170px sans-serif';g.fillStyle='#ffd24a';g.fillText('SELAMAT! LULUS',150,40);
   g.font='64px sans-serif';g.fillStyle='#ecf2e4';g.fillText('Teman-teman seangkatan sudah lulus.',190,300);
   g.fillStyle='#ff9a8a';g.fillText('Wandih: masih di kelas yang sama.',190,400)}
  else{
   g.font='bold 210px sans-serif';g.fillStyle='#ff9a8a';g.fillText('REMEDIAL',150,60);
   g.font='72px sans-serif';g.fillStyle='#ecf2e4';g.fillText('Kumpulkan besok pagi!',190,340)}
  g.strokeStyle='#caa46a';g.lineWidth=18;g.strokeRect(9,9,w-18,h-18)})}
function envKelas(){
 if(KL)return KL;
 const sc=new THREE.Scene();sc.background=new THREE.Color(0x2a2230);
 sc.add(new THREE.AmbientLight(0x9a8a7a,.9));
 const sun=new THREE.DirectionalLight(0xffb070,.85);sun.position.set(-8,5,2);sc.add(sun);
 const pl=new THREE.PointLight(0xfff0d0,.7,13);pl.position.set(0,3,0);sc.add(pl);
 const WL=LM(0xd9cfae,0x14120c);
 bx(sc,8.6,.1,9.4,LM(0x7a5638,0x120a06),0,-.05,0);bx(sc,8.6,.1,9.4,LM(0xcfcbbf,0x14140f),0,3.25,0);
 bx(sc,8.6,3.3,.1,WL,0,1.6,-4.7);bx(sc,8.6,3.3,.1,WL,0,1.6,4.7);bx(sc,.1,3.3,9.4,WL,-4.3,1.6,0);bx(sc,.1,3.3,9.4,WL,4.3,1.6,0);
 // jendela sore (dinding kiri) + pintu (dinding kanan)
 for(const z of[-2.8,-.5,1.8,4.0].slice(0,3)){bx(sc,.08,1.4,1.4,0x5a4028,-4.22,1.9,z);const w=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2),BM(0xf6b066));w.rotation.y=PI/2;w.position.set(-4.17,1.9,z);sc.add(w);bx(sc,.05,1.3,.04,0x5a4028,-4.15,1.9,z);bx(sc,.05,.04,1.3,0x5a4028,-4.15,1.9,z)}
 const door=new THREE.Group();door.position.set(4.22,0,2.7);sc.add(door);bx(door,.08,2.3,1.0,0x4a3320,0,1.15,.5);bx(door,.05,.1,.1,0xc8a24a,-.05,1.1,.85);
 const dark=bx(sc,.02,2.3,1.0,BM(0x000000),4.235,1.15,3.2);dark.visible=false;
 // papan tulis (3 isi, ditukar lewat field board) + stempel
 bx(sc,4.9,1.55,.06,0x4a3320,0,1.75,-4.62);
 const bd={};['ajar','rank','remedial','rapor','lulus'].forEach(k=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4.7,1.43),new THREE.MeshLambertMaterial({map:boardTex(k),emissive:0x1a1a1a}));m.position.set(0,1.75,-4.58);m.visible=false;sc.add(m);bd[k]=m});
 const stamp=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.55),new THREE.MeshBasicMaterial({map:txt(600,220,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#d02a2a';g.lineWidth=14;g.strokeRect(12,12,w-24,h-24);g.fillStyle='#d02a2a';g.font='bold 120px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('TERBAWAH',w/2,h/2+6)}),transparent:true}));
 stamp.position.set(1.55,1.95,-4.55);stamp.rotation.z=.18;stamp.visible=false;sc.add(stamp);
 // meja guru + meja murid (4 x 4) + kursi
 bx(sc,1.5,.06,.7,0x5a3c22,-2.4,.78,-3.5);bx(sc,.05,.76,.65,0x4a3018,-3.12,.38,-3.5);bx(sc,.05,.76,.65,0x4a3018,-1.68,.38,-3.5);bx(sc,.45,.04,.45,0x8a6a40,-2.4,.45,-2.9);bx(sc,.45,.34,.03,0x8a6a40,-2.4,.72,-2.68);
 const WD=LM(0xa7794a,0x100a06),FR=LM(0x5a5a62,0x08080a),CH=LM(0x8a6a40,0x0c0804);
 for(const x of[-2.4,-.8,.8,2.4])for(const z of[-1.4,.1,1.6,3.1]){
  bx(sc,1.0,.05,.55,WD,x,.74,z);bx(sc,.04,.72,.5,FR,x-.45,.36,z);bx(sc,.04,.72,.5,FR,x+.45,.36,z);
  const zc=z+.62;bx(sc,.42,.04,.42,CH,x,.45,zc);bx(sc,.42,.34,.03,CH,x,.72,zc+.21);
  for(const dx of[-.17,.17])for(const dz of[-.17,.17])bx(sc,.03,.43,.03,FR,x+dx,.22,zc+dz)}
 // meja Wandih: kertas tugas yang tidak disentuh + tas
 bx(sc,.3,.012,.22,0xf0ecd8,2.3,.77,3.0);bx(sc,.02,.02,.2,0xd8c040,2.7,.775,3.05);bx(sc,.4,.5,.2,LM(0x2a3a5a,0x080c14),3.3,.25,3.9);
 // lampu plafon
 for(const z of[-2.5,0,2.5])bx(sc,2.4,.04,.2,BM(0xfff6dc),0,3.18,z);
 // Zzz
 const zs=[];for(let i=0;i<3;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:zTex(),transparent:true,depthWrite:false,fog:false}));sp.visible=false;sc.add(sp);zs.push(sp)}
 KL={scene:sc,bd:bd,stamp:stamp,zs:zs,door:door,dark:dark,shots:{
  keluar:{p:[-1.0,1.7,-2.5],l:[3.0,1.2,2.5],f:50,d:[.3,0,.3]},
  lebar:{p:[-3.6,2.5,4.3],l:[.8,1.0,-.2],f:56,d:[.3,0,-.2]},
  wandih:{p:[1.55,1.55,1.5],l:[2.4,1.05,3.65],f:40,d:[.1,0,.1]},
  papan:{p:[.2,1.6,.5],l:[.2,1.6,-4.4],f:46,d:[0,0,-.9]},
  dua:{p:[0,1.55,-.1],l:[0,1.35,-2.1],f:42,d:[0,0,-.2]},
  lulus:{p:[1.7,2.2,3.9],l:[-.1,1.35,-3.4],f:50,d:[.2,0,-.3]}}};
 return KL}
function stKelas(){
 const E=envKelas(),W=A.RIG.W,G=A.RIG.G;
 A.setScene(E.scene);E.scene.add(W.root);E.scene.add(G.root);
 if(!paperMesh){paperMesh=new THREE.Mesh(new THREE.BoxGeometry(.22,.012,.3),LM(0xf1edd9,0x2a2820))}
 G.armR.add(paperMesh);paperMesh.position.set(0,-.76,-.1);paperMesh.visible=false;
 if(!raporMesh){raporMesh=new THREE.Mesh(new THREE.BoxGeometry(.22,.02,.3),LM(0xb3211f,0x300808))}
 G.armR.add(raporMesh);raporMesh.position.set(0,-.76,-.1);raporMesh.visible=false;
 A.addActor('WANDIH',W,2.4,3.7,[2.4,-9]);A.addActor('GURU',G,0,-3.7,[0,-9]);
 // teman-teman yang lulus lebih dulu (topi toga), hanya tampil di adegan dengan field lulus
 const fr=friends();fr.forEach((r,i)=>{if(!r.cap){const c=new THREE.Group();bx(c,.56,.05,.56,0x15151c,0,.49,0);bx(c,.2,.05,.2,0x15151c,0,.455,0);bx(c,.04,.14,.04,0xd8b040,.24,.40,.24);r.head.add(c);r.cap=c}r.cap.visible=false;E.scene.add(r.root);
  const a=A.addActor('T'+(i+1),r,-1.4+i*1.4,-3.3,[0,9]);a.vis=false});
 let dr=0;
 return{shots:E.shots,
  tick:function(t,dt){const s=A.sc()||{};
   {const ac0=A.actors();fr.forEach((r,i)=>{const a=ac0['T'+(i+1)];if(a)a.vis=!!s.lulus;r.cap.visible=!!s.lulus})}
   E.zs.forEach((z,i)=>{z.visible=!!s.zzz;if(!s.zzz)return;const life=3.4,k=((t+i*life/3)%life)/life,a=Math.sin(PI*k);
    z.material.opacity=a*.9;z.position.set(2.62+k*.45,1.7+k*.7,3.5);const sz=.14+k*.3;z.scale.set(sz,sz,1)});
   // pintu kelas terbuka saat Guru dan Wandih keluar
   let near=false;const ac=A.actors();for(const n in ac){const a=ac[n];if(a.x>3.3&&a.z>2.5&&a.vis)near=true;if(a.x>4.5)a.vis=false}
   const tg=near?1.4:0;dr+=Math.sign(tg-dr)*Math.min(Math.abs(tg-dr),(tg?4:2)*dt);E.door.rotation.y=dr;E.dark.visible=dr>.05;
   if(E.stamp.visible&&s.stamp){const u=Math.min(1,(t-E.st0)*5);E.stamp.scale.setScalar(1+(1-sstep(u))*.9)}},
  leave:function(){S.add(W.root);S.add(G.root);G.armR.remove(paperMesh);G.armR.remove(raporMesh);fr.forEach(r=>{r.cap.visible=false;S.add(r.root)});E.stamp.visible=false;for(const k in E.bd)E.bd[k].visible=false;E.zs.forEach(z=>z.visible=false);E.door.rotation.y=0;E.dark.visible=false},
  onScene:function(s){
   for(const k in E.bd)E.bd[k].visible=(k===s.board);
   const was=E.stamp.visible;E.stamp.visible=!!s.stamp;if(s.stamp&&!was)E.st0=A.T();
   paperMesh.visible=!!s.paper;raporMesh.visible=!!s.rapor}}}

// =====================================================================
// PANGGUNG 'teman' - flashback tiga teman menginap di ruang pertama lab
// =====================================================================
let FR3=null;
function friends(){
 if(FR3)return FR3;
 const mk=o=>{const hs=A.headSet({skin:o.skin,hair:o.hair,long:o.long,glass:o.glass}),sh=LM(o.shirt,0x101018),pa=LM(o.pants,0x050508);
  const r=A.mkRig({mT:sh,mAL:sh,mAR:sh,mLL:pa,mLR:pa,hand:LM(o.skin,0x181008),mH:hs.mH,setExpr:hs.setExpr});
  r.root.visible=false;r.root.userData.cutRoot=true;S.add(r.root);return r};
 FR3=[mk({skin:'#e8c19a',hair:'#2a1a0e',shirt:0x3a6ea5,pants:0x2a2f3a,glass:true}),
      mk({skin:'#c99a72',hair:'#16100c',shirt:0xc0507a,pants:0x30303c,long:true}),
      mk({skin:'#f0d2b2',hair:'#7a4a22',shirt:0x4a8a5a,pants:0x3a3226})];
 return FR3}
function stTeman(){
 A.worldEnter();
 const {AMB,CL1,CL2,RIG}=A,fr=friends(),Z=[5.15,6.0,6.85];
 if(AMB){AMB.color.setHex(0x1a2a3a);AMB.intensity=.5}
 CL1.color.setHex(0x9ec0ff);CL1.distance=5.5;CL1.intensity=.9;CL1.position.set(.3,1.7,6.0);
 CL2.color.setHex(0xff2020);CL2.distance=6;CL2.intensity=0;CL2.position.set(2.0,1.4,6.0);
 const T=[0,1,2].map(i=>{const a=A.addActor('T'+(i+1),fr[i],1.25,Z[i],[-9,Z[i]]);a.anim='ketik';return a});
 const gh=[['KALLA',RIG.K,5.7],['ONI',RIG.O,6.3]].map(g=>{const a=A.addActor(g[0],g[1],2.7,g[2],[-9,g[2]]);a.vis=false;a.anim='melayang';return a});
 const scr=Z.map(z=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.46,.28),BM(0x5aa0ff));m.rotation.y=PI/2;m.position.set(.33,1.0,z);m.userData.cutRoot=true;S.add(m);return m});
 let dr=0,gi=-1,wasOff=false;const fade=[0,0];
 let stepA=null; // suara langkah lari berulang (langkah.mp3), hanya selama teman-teman bergerak di scene walk
 const stepSet=on=>{try{if(on){if(!stepA){stepA=new Audio((typeof SND!=='undefined'&&SND.langkah)||'langkah.mp3');stepA.loop=true;stepA.volume=.8;stepA.playbackRate=1.6}if(stepA.paused)stepA.play().catch(()=>{})}else if(stepA&&!stepA.paused)stepA.pause()}catch(e){}};
 return{
  shots:{
   lebar:{p:[-3.8,2.1,3.6],l:[1.2,1.15,6.0],f:56,d:[.3,0,.1]},
   dekat:{p:[-2.0,1.55,6.0],l:[1.25,1.25,6.0],f:40,d:[.2,0,0]},
   pintu:{p:[-2.75,1.7,13.9],l:[-2.75,1.25,8.5],f:52,d:[0,0,-.3]}},
  tick:function(t,dt){const s=A.sc()||{},p=t%3.2,off=!!s.flick&&((p>1&&p<1.25)||(p>1.45&&p<1.9)||(p>2.1&&p<2.2));
   ls.forEach(l=>{l.intensity=off?.01:.3});
   if(AMB)AMB.intensity=off?.12:.5;
   CL1.intensity=off?.1:.9;scr.forEach(m=>{m.visible=!off});
   // El Kalla dan Oni samar di belakang teman-teman, bergantian tiap lampu padam, makin dekat
   if(s.ghost&&off&&!wasOff)gi++;wasOff=off;if(!s.ghost)gi=-1;
   let gl=0;
   gh.forEach((g,i)=>{const on=!!s.ghost&&gi>=0&&(gi%2)===i,o=on?(off?.55:.16):0;
    fade[i]+=((o)-fade[i])*Math.min(1,dt*14);A.ghostOp(i?RIG.O:RIG.K,fade[i]);g.vis=fade[i]>.01;
    g.x=2.7-Math.min(.5,t*.08);g.z=(i?6.3:5.7)+Math.sin(t*.9+i)*.15;gl=Math.max(gl,fade[i]);
    if(g.vis)CL2.position.set(g.x-.6,1.4,g.z)});
   CL2.intensity=gl;
   // pintu belakang terbuka saat teman-teman keluar
   let near=false,all=true;T.forEach(a=>{if(a.x<-3.9&&a.z>11.9)near=true;if(a.x<-5.75)a.vis=false;if(a.vis)all=false});
   const tgt=s.walk&&near&&!all?1.4:0;dr+=Math.sign(tgt-dr)*Math.min(Math.abs(tgt-dr),(tgt?4:2)*dt);A.setDoor(dr);A.BLACK.visible=dr>.05;
   stepSet(!!s.walk&&T.some(a=>a.vis&&a.path&&a.path.length))},
  leave:function(){stepSet(false);stepA=null;fr.forEach(r=>{r.root.visible=false});scr.forEach(m=>S.remove(m));A.ghostOp(RIG.K,0);A.ghostOp(RIG.O,0);A.setDoor(0);A.BLACK.visible=false},
  onScene:function(){}}}

CUT3D.add('kelas',stKelas);CUT3D.add('teman',stTeman);
setTimeout(()=>{try{R.compile(envKelas().scene,A.CC)}catch(e){}},4500); // kompilasi shader kelas lebih awal
})();
