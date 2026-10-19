# MIDNIGHT LAB..

Game horor 3D berbasis browser bertema edukasi. Kamu terjebak semalaman di lab komputer sekolah, harus menjawab soal-soal mata pelajaran pilihanmu (RPL, B. Indonesia, B. Inggris, Sejarah, Matematika), dan menghindari dua hantu bernama **El Kalla** dan **Oni**.

> Seluruh karakter, cerita, dan kejadian adalah fiksi. Game ini dibuat untuk hiburan dan pembelajaran, dan tidak menggambarkan institusi atau tempat tertentu.

Dibuat oleh Iqdham, Kevin, Arif.

## Cerita (Single Player)
Wandih adalah siswa SMK yang malas dan tiga kali tidak naik kelas. Karena menolak mengerjakan remedial, gurunya menghukumnya menjaga lab komputer semalaman dan mengerjakan semua soal di lembar kertas. Tengah malam, dua sosok hantu bernama El Kalla dan Oni muncul bergantian. Setelah berhasil keluar dari lab, layar menghitam dan Wandih bermonolog tentang pengalamannya semalaman, lalu game kembali ke menu utama.

## Mata Pelajaran
- **Single Player:** setelah menekan MULAI di layar Cara Bermain, pilih mata pelajaran. Soal dalam game diambil dari mapel itu.
- **Multi Player:** pembuat room memilih mapel di lobi (di bawah tombol Mudah/Sedang/Sulit). Pemain lain hanya melihat mapel yang dipilih.
- Soal disimpan di `soal.js` per mapel (`BANK.rpl`, `BANK.indonesia`, `BANK.inggris`, `BANK.sejarah`, `BANK.matematika`).

## Tujuan
1. Temukan dan jawab semua lembar soal di meja komputer (muncul 5 lembar per gelombang). Pilihan jawaban diacak tiap kertas dibuka.
2. Telepon guru, lalu ambil kunci di meja guru (ruang biru).
3. Buka pintu di ruangan itu dan keluar.

## Kontrol
| | PC / Laptop | HP |
|---|---|---|
| Jalan | W A S D atau tombol panah | geser layar kiri |
| Lari | Shift (tahan) | - |
| Melihat | Mouse | geser layar kanan |
| Interaksi | E | ketuk tulisan interaksi |
| Senter | F | tombol senter kanan bawah |

### Shortcut keyboard (PC / Laptop)
| Tombol | Fungsi |
|---|---|
| 1 - 4 | Memilih jawaban saat membaca kertas soal |
| Q | Menutup kertas soal tanpa menjawab |
| P | Jeda dan lanjut (Single Player) |
| M | Bisukan / hidupkan semua suara |
| Esc | Melepas kursor mouse (Single Player otomatis menjeda) |
| Enter / Space | Melanjutkan teks cerita |
| Enter (Multi Player) | Membuka chat, Enter lagi untuk kirim, Esc untuk tutup |
| Z / X / C (Multi Player) | Tanda cepat: soal di sini / kunci di sini / hantu! |
| Panah kiri / kanan (Multi Player) | Berganti pemain yang ditonton saat menjadi penonton |

## Aturan
- Jawaban benar menjadi hijau, salah menjadi merah. Lembar yang salah bisa dicoba lagi.
- **Gagal** jika salah menjawab 50% dari jumlah soal, atau jika disentuh El Kalla atau Oni.
- Saat El Kalla atau Oni muncul, sembunyi di lemari (E). Jika ia berdiri di depan lemari, ia pergi setelah 5 detik.

## Hantu: El Kalla dan Oni
Dua hantu muncul **bersamaan** di setiap putaran. Masing-masing menjaga **satu ruang** dan hanya berkeliling di ruangnya sendiri (memeriksa 2 lemari di ruang itu). Tiap putaran mereka **bertukar ruang**:

| Putaran | Ruang pertama (kuning) | Ruang kedua (biru) |
|---|---|---|
| 1 (setelah pemain spawn) | El Kalla | Oni |
| 2 | Oni | El Kalla |
| 3 | El Kalla | Oni |
| dst. | bergantian terus | bergantian terus |

Kedua hantu muncul di batas dua ruang (sisi kiri/kanan diacak), lalu masuk ke ruangnya. Hantu hanya mengejar pemain yang ada di ruangnya. Jeda setelah hantu menghilang sama dengan jeda kemunculan pertama (lihat tabel level), dihitung setelah **kedua** hantu pergi. Berlaku di Single Player dan Multi Player.

## Tingkat Kesulitan
| Level | Single Player | Batas salah | Multi Player (soal) | Hantu muncul / jeda | Hadir | Kecepatan |
|---|---|---|---|---|---|---|
| Mudah | 10 soal | 6 (60%) | 10 + 3 per pemain tambahan | 55 dtk | 20 dtk | +10% |
| Sedang | 15 soal | 8 (50%) | 15 + 3 per pemain tambahan | 40 dtk | 25 dtk | +20% |
| Sulit | 20 soal | 8 (40%) | 20 + 3 per pemain tambahan | 30 dtk (SP) / 25 dtk (MP) | 30 dtk | +30% |

Di Multi Player, batas salah berlaku **per pemain** dan tidak bertambah mengikuti jumlah pemain.

## Mode
- **Single Player:** cerita Wandih melawan El Kalla dan Oni sendirian, lengkap dengan cerita pembuka, telepon guru, dan ending.
- **Multi Player:** 2 sampai 6 pemain lewat PeerJS. Satu pemain membuat room dan membagikan kode, yang lain masuk dengan kode itu. Ada chat lobi/dalam game, penanda lokasi (soal, kunci, hantu), dan mode penonton.

## Saran dan Peringatan
- **Matikan jumpscare** (ikon gigi di atas layar) jika di bawah umur, mudah takut, memiliki kecemasan, penyakit jantung, atau sensitif terhadap kilatan cahaya dan suara keras.
- **Mainkan Single Player dulu** untuk mengenal denah lab, lemari, dan pola hantu tanpa tekanan pemain lain.
- Istirahat jika merasa pusing, sesak, atau cemas berlebihan.

## Pengaturan
Volume musik, volume efek suara, sensitivitas mouse/layar, dan jumpscare (suara dan efek kilat).

## Teknologi dan Struktur
HTML, CSS, JavaScript, [Three.js r128](https://threejs.org/), PeerJS 1.5.4 (keduanya dimuat dari cdnjs, jadi perlu internet).

| File | Fungsi |
|---|---|
| `index.html` | Struktur halaman dan menu |
| `style.css` | Tampilan |
| `game.js` | Mesin game, cerita, kontrol |
| `mp.js`, `mp2.js` | Multiplayer |
| `soal.js` | Bank soal |
| `cerita.js` | Cerita pembuka, telepon, monolog, ending, dan `CUT_SND` (sound cutscene buatan sendiri) |
| `cutscene3d.js` | Mesin cutscene 3D (ruang pertama lab, tokoh, kamera, kantor Guru) |
| `aset.js` | Daftar gambar dan suara |
| `hantu.png`, `hantu.mp3` | Wajah dan suara El Kalla |
| `oni.png`, `oni.mp3` | Wajah dan suara Oni (ganti dengan file buatanmu, nama file tetap) |

## Menjalankan
Buka `index.html` di browser modern (Chrome, Edge, Firefox, Safari) dengan koneksi internet, atau jalankan lewat server lokal, misalnya `python3 -m http.server`, lalu buka `http://localhost:8000`.

## Cutscene bergambar
Adegan cerita ada di `cerita.js` (`OPEN`, `CALL`, `END`, `MONO`). Selain `e`, `t`, `x`, `bg`, `snd`, tiap adegan boleh punya:
| Field | Fungsi |
|---|---|
| `img` | File gambar 16:9 (jpg/png), ditaruh di folder yang sama dengan `index.html`. Kalau file belum ada, otomatis memakai `sv` |
| `sv` | Nama scene gambar-lewat-kode di `SCN` (SVG). Tanpa `img` dan `sv`, adegan tampil seperti biasa dengan emoji |
| `who` | `'WANDIH'` atau `'GURU'`: pembicara disorot di scene telepon |
| `fx` | `'shake'` (layar bergetar) atau `'flash'` (kilat) saat adegan muncul |

Gambar yang disiapkan (opsional): `scene-hukuman.jpg`, `scene-teman.jpg`, `scene-tengahmalam.jpg`.

## Cutscene 3D (tokoh beranimasi)
Adegan dengan field `stage` di `cerita.js` tampil sebagai adegan 3D: tokoh balok (Wandih, Guru, El Kalla, Oni) bergerak dan berdialog, kamera berpindah sudut seperti film. Kodenya ada di `cutscene3d.js`. Semua adegan 3D memakai **ruang pertama (dinding kuning) lab komputer yang sama dengan yang dimainkan** (scene game dirender dengan kamera cutscene), kecuali adegan Guru di kantor. Kalau terjadi error, otomatis memakai `sv`/`img`.
| Field | Fungsi |
|---|---|
| `stage` | `'hukuman'` (Guru dan Wandih di ruang pertama, papan REMEDIAL, pintu belakang), `'lab'` (tengah malam, lampu berkedip), `'telepon'` (Wandih menelpon, berdiri di tempat pemain menyelesaikan soal), `'kantor'` (Guru duduk di meja kerja memegang HP) |
| `cam` | Sudut kamera. hukuman: `tegang`, `guru`, `wandih`, `pintu`. lab: `belakang`, `lorong`. telepon: `wdepan`, `wsamping` (kamera otomatis menghindari meja/dinding). kantor: `meja`, `dekat` |
| `who` | `'WANDIH'` / `'GURU'`: pembicara, kepalanya mengangguk saat teks diketik |
| `anim` | Animasi per tokoh, mis. `{GURU:'marah',WANDIH:'takut'}`. Pilihan: `diam`, `tunduk`, `takut`, `kaget`, `marah`, `tunjuk`, `bicara`, `dorong`, `melayang`, `telp` (berdiri menelpon), `dudukTelp` (duduk menelpon) |
| `go` | Jalan ke titik (x,z), mis. `{GURU:[[-3,11.4],[-4.5,12.95]]}` |
| `at` | Langsung pindah ke titik (x,z), mis. `{WANDIH:[-2.75,11.5]}` |
| `look` | Arah hadap: nama tokoh atau titik, mis. `{WANDIH:'GURU'}` |
| `spd` | Kecepatan jalan (m/s) |
| `pan` | `true` = kamera bergeser halus ke sudut baru (bawaan: potong langsung) |
| `kalla` | Khusus `lab`: `'creep'` = tiap lampu padam muncul **satu** hantu samar (opacity 30%), bergantian El Kalla lalu Oni, makin dekat |
| `keep` | `true` = hantu tidak diulang dari awal (lanjutan adegan `creep` sebelumnya) |

### Alur cutscene
- **Pembuka:** Guru memarahi Wandih di ruang pertama, Guru keluar lewat pintu belakang dan mengunci. Tengah malam Wandih mendorong pintu, lalu lampu berkedip dan El Kalla / Oni muncul bergantian secara samar (tanpa adegan El Kalla mengejutkan Wandih). Teks "Cari lembar soal..." menyambung setelah teks "Sunyi...".
- **Telepon:** setelah soal terakhir benar, Wandih menelpon Guru **di tempat yang sama** dengan posisi pemain, Guru terlihat duduk di meja kerja sambil memegang HP. Setelah itu kembali ke game dengan sudut pandang dan posisi pemain seperti sebelum cutscene.

### Sound buatan sendiri
Di bagian atas `cerita.js` ada `CUT_SND`. Taruh file (mp3) di folder yang sama dengan `index.html`, lalu isi namanya:
| Nama | Adegan |
|---|---|
| `wandihKaget` | Wandih: "Hah?! Semalaman di lab, Pak? Tapi... saya..." |
| `guruMarah` | Guru: "Kerjakan semua soal di lembar kertas..." |
| `lorong` | Lampu kelap-kelip, El Kalla dan Oni bergantian: "Sunyi... lalu terdengar langkah pelan." (bawaan: `langkah.mp3`) |
| `lorongLanjut` | Lanjutan teks: "Cari lembar soal dan selesaikan..." |


## Pembaruan cutscene akhir
- **Papan tulis hijau "REMEDIAL" dihapus** dari cutscene; yang tampil kini papan tulis polos asli di dalam game.
- **Suara Guru** ("Kerjakan semua soal..."): isi `CUT_SND.guruMarah` di `cerita.js` dengan file sendiri. Kalau kosong, dibacakan suara bawaan browser (bahasa Indonesia, nada rendah).
- **Suara pintu Guru**: taruh 1 file `pintu-guru.mp3` (buka + tutup + kunci) di folder index.html. Diputar saat guru mulai membuka pintu. Nama file diubah di `CUT_SND.pintuGuru`.
- **Telepon Wandih**: tokoh langsung muncul dengan tangan sudah di telinga (tidak turun-naik lagi).
- **`cutscene_akhir.js`** (baru, dimuat setelah `cutscene3d.js`): panggung `jalan` (Vespa merah, hutan, tiang lampu tiap 10 m), `rumah` (parkir di halaman, rumah batu + rumah tetangga modern), `tidur` (kasur, selimut dinamis, tangan di dada, efek Zzz).
- **Suara**: `motor.wav` (placeholder sintetis, berulang) dan `night.mp3` (suasana malam). Motor berhenti saat Wandih parkir.
- **Selimut**: simpan gambar sebagai `selimut.png`, ukuran **1500 x 1400 px** (rasio 15:14). Nama file diubah di `BLANKET_URL` (`aset.js`). Tanpa file, dipakai motif bawaan.


## Cutscene pembuka 3D (`cutscene_awal.js`)
Dimuat setelah `cutscene_akhir.js`. Panggung baru:
| Panggung | Adegan |
|---|---|
| `kelas` | Ruang kelas sore hari: SMK (Wandih tertidur, Guru menulis), LANGGANAN TERBAWAH (papan peringkat + stempel TERBAWAH), REMEDIAL (Guru menyodorkan kertas, Wandih menolak) |
| `teman` | Flashback di ruang pertama lab: tiga teman beravatar berekspresi menginap, diganggu El Kalla dan Oni (bergantian), lalu kapok keluar lab |

Field tambahan di `cerita.js`: `board` (`'ajar'`/`'rank'`/`'remedial'`), `stamp`, `zzz`, `paper` (kelas); `flick`, `ghost`, `walk` (teman).
Ekspresi wajah (`expr:{T1:'senang'}`): `normal`, `senang`, `lelah`, `takut`, `marah`. Animasi duduk baru: `duduk`, `ketik`, `ketik2`, `ngobrol`, `tertawa`, `dudukTakut`, `dudukKaget`, `tidurDuduk`; berdiri: `tulis`, `tolak`, `lelah`.

## Pembaruan cutscene: rapor merah dan hantu di pinggir jalan
- **Flashback rapor merah** (`OPEN` di `cerita.js`, setelah "LANGGANAN TERBAWAH", sebelum "REMEDIAL"):
  - *RAPOR MERAH*: Guru menyerahkan rapor bersampul merah, papan tulis berisi "TIDAK NAIK KELAS" tiga tahun berturut-turut (field `board:'rapor'`, `rapor:true`).
  - *LULUS LEBIH DULU*: tiga teman bertopi toga bersorak di depan papan "SELAMAT! LULUS", Wandih menunduk di barisan meja (field `board:'lulus'`, `lulus:true`, kamera `lulus`, animasi `rayakan`).
- **Hantu di pinggir jalan** (`MONO` di `cerita.js`, panggung `jalan`): field `hantu:'K'` (El Kalla, sisi kiri) atau `hantu:'O'` (Oni, sisi kanan) memunculkan sosok samar di pinggir jalan. Wandih menoleh, lalu sosok hilang. `hdelay` = jeda detik sebelum sosok muncul (bawaan 0,7). Kamera baru: `sorot`.
- Suara tiap adegan baru bisa diisi lewat field `snd` (saat ini kosong).
- Adegan *LULUS LEBIH DULU* memutar `yeay.mp3`.

## Durasi jumpscare dan glitch
Jumpscare 3 detik, lalu glitch 5 detik (total 8 detik, Single Player dan Multi Player). Disesuaikan dengan `jumpscare.mp3` (3,1 dtk) dan `glitch.mp3` (5,2 dtk). Angkanya ada di `game.js` (`scT<3` dan `scT<8`) dan `mp2.js` (`scT=8.01` saat jumpscare dimatikan).
