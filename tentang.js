// Halaman TENTANG: latar belakang, ulasan bintang, kirim pesan ke admin
const API_URL = 'https://script.google.com/macros/s/AKfycbxi-7yiFMUMLEDie2yW4-l1u4z2cqonet-vOzI41iV34QraZQAZGR9pNOZ0MYDorotYVw/exec';
(function(){
const $=id=>document.getElementById(id);
const esc=(t,el)=>{el.textContent=t;return el};
let bintang=0,last=0;
function api(o){return fetch(API_URL,{method:'POST',body:JSON.stringify(o)}).then(r=>r.json())}
function msg(el,t,ok){el.textContent=t;el.style.color=ok?'#7d7':'#e66'}
function tgl(t){const d=new Date(t);return isNaN(d)?'':d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}
function stars(n){return '\u2605'.repeat(n)+'\u2606'.repeat(5-n)}
function load(){
  const L=$('rv_list');L.textContent='Memuat ulasan...';
  fetch(API_URL).then(r=>r.json()).then(d=>{
    if(!d.ok)throw 0;L.textContent='';
    $('rv_avg').textContent=d.jumlah?stars(Math.round(d.rata))+'  '+d.rata.toFixed(1)+' / 5 ('+d.jumlah+' ulasan)':'Belum ada ulasan. Jadilah yang pertama!';
    d.ulasan.forEach(u=>{const c=document.createElement('div');c.className='rvc';
      const h=document.createElement('div');h.className='rvh';
      h.appendChild(esc(u.nama,document.createElement('b')));
      h.appendChild(esc(' '+stars(Number(u.bintang)),document.createElement('span')));
      h.appendChild(esc(' '+tgl(u.waktu),document.createElement('small')));
      c.appendChild(h);c.appendChild(esc(u.komentar,document.createElement('p')));L.appendChild(c)});
  }).catch(()=>{L.textContent='Ulasan belum bisa dimuat.'});
}
$('abb').onclick=()=>{$('ov').style.display='none';$('ab').style.display='flex';load()};
$('abx').onclick=()=>{$('ab').style.display='none';$('ov').style.display='flex'};
const sp=$('rv_st');
for(let i=1;i<=5;i++){const s=document.createElement('span');s.textContent='\u2605';s.onclick=()=>{bintang=i;[...sp.children].forEach((x,j)=>x.classList.toggle('on',j<i))};sp.appendChild(s)}
$('rv_go').onclick=()=>{
  const n=$('rv_n').value.trim(),k=$('rv_k').value.trim(),m=$('rv_m');
  if($('rv_hp').value)return;
  if(!n||!k||!bintang)return msg(m,'Isi nama, pilih bintang, dan tulis komentar.');
  if(Date.now()-last<15000)return msg(m,'Tunggu sebentar sebelum mengirim lagi.');
  msg(m,'Mengirim...',1);$('rv_go').disabled=true;
  api({action:'ulasan',nama:n,bintang:bintang,komentar:k}).then(d=>{
    if(!d.ok)throw d.err;last=Date.now();msg(m,'Terima kasih atas ulasanmu!',1);
    $('rv_k').value='';bintang=0;[...sp.children].forEach(x=>x.classList.remove('on'));load();
  }).catch(e=>msg(m,'Gagal mengirim: '+(e||'cek koneksi'))).finally(()=>{$('rv_go').disabled=false});
};
})();
