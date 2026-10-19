// MIDNIGHT LAB - Apps Script (Spreadsheet sebagai database)
// 1) Ganti ADMIN_KEY. 2) Deploy > Web app: Execute as "Me", Access "Anyone". 3) Salin URL /exec ke tentang.js & xsx.html
const ADMIN_KEY = 'GANTI_PASSWORD_ADMIN';
const SH = { r: ['Ulasan', ['id','waktu','nama','bintang','komentar','tampil']], m: ['Pesan', ['id','waktu','nama','pesan','dibaca']] };

function sheet_(k){
  const ss = SpreadsheetApp.getActiveSpreadsheet(), [n,h] = SH[k];
  let s = ss.getSheetByName(n);
  if(!s){ s = ss.insertSheet(n); s.appendRow(h); s.setFrozenRows(1); }
  return s;
}
function rows_(k){
  const v = sheet_(k).getDataRange().getValues(), h = v.shift();
  return v.map((r,i)=>{ const o={_row:i+2}; h.forEach((c,j)=>o[c]=r[j]); return o; });
}
function out_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean_(s,n){ return String(s||'').replace(/[<>]/g,'').trim().slice(0,n); }

function doGet(e){
  const p = e.parameter || {};
  if(p.action === 'admin'){
    if(p.key !== ADMIN_KEY) return out_({ok:false,err:'Password salah'});
    return out_({ok:true, ulasan: rows_('r').reverse(), pesan: rows_('m').reverse()});
  }
  const list = rows_('r').filter(x=>x.tampil===true||x.tampil==='TRUE'||x.tampil===1).reverse()
    .map(x=>({nama:x.nama,bintang:x.bintang,komentar:x.komentar,waktu:x.waktu}));
  const avg = list.length ? list.reduce((a,b)=>a+Number(b.bintang),0)/list.length : 0;
  return out_({ok:true, ulasan:list.slice(0,100), rata:Math.round(avg*10)/10, jumlah:list.length});
}

function doPost(e){
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try{
    const d = JSON.parse(e.postData.contents), now = new Date();
    if(d.action === 'ulasan'){
      const nama = clean_(d.nama,30), kom = clean_(d.komentar,500), b = Math.round(Number(d.bintang));
      if(!nama || !kom || !(b>=1 && b<=5)) return out_({ok:false,err:'Data tidak lengkap'});
      sheet_('r').appendRow([Utilities.getUuid().slice(0,8), now, nama, b, kom, true]);
      return out_({ok:true});
    }
    if(d.action === 'pesan'){
      const nama = clean_(d.nama,30), pes = clean_(d.pesan,1000);
      if(!nama || !pes) return out_({ok:false,err:'Data tidak lengkap'});
      sheet_('m').appendRow([Utilities.getUuid().slice(0,8), now, nama, pes, false]);
      return out_({ok:true});
    }
    // aksi admin
    if(d.key !== ADMIN_KEY) return out_({ok:false,err:'Password salah'});
    if(d.action === 'tampil'){ const x = rows_('r').find(r=>r.id===d.id); if(!x) return out_({ok:false,err:'Tidak ditemukan'}); sheet_('r').getRange(x._row,6).setValue(!!d.nilai); return out_({ok:true}); }
    if(d.action === 'dibaca'){ const x = rows_('m').find(r=>r.id===d.id); if(!x) return out_({ok:false,err:'Tidak ditemukan'}); sheet_('m').getRange(x._row,5).setValue(!!d.nilai); return out_({ok:true}); }
    return out_({ok:false,err:'Aksi tidak dikenal'});
  }catch(err){ return out_({ok:false,err:String(err)}); }
  finally{ lock.releaseLock(); }
}
