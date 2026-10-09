# TIS · Arsitektur

Pendamping `HANDOFF-ENGINEER.md`. Dokumen ini lebih rinci di tingkat modul dan siklus hidup. Baca handoff dulu.

---

## 1. Batas sandbox, dan kenapa strukturnya begini

Figma memberi plugin dua lingkungan yang **sengaja tidak bisa saling menyentuh**.

| | `code.js` | `ui.html` |
|---|---|---|
| Akses scene graph | ya | tidak |
| Akses jaringan | tidak | ya |
| DOM | tidak | ya |
| Penyimpanan | `figma.clientStorage` | tidak ada, semua di memori |
| Dijalankan di | sandbox Figma | iframe |

Seluruh bentuk kode ini adalah konsekuensi dari tabel itu. Pemeriksaan deterministik butuh scene graph, jadi ada di `code.js`. Pemanggilan AI butuh jaringan, jadi ada di `ui.html`. Keduanya cuma bisa berkirim pesan.

**Konsekuensi yang sering mengejutkan orang baru:** UI tidak bisa membaca satu properti node pun. Semua yang ditampilkan harus dikirim lebih dulu oleh `code.js` dalam bentuk objek biasa. Kalau UI butuh informasi baru dari canvas, itu selalu berarti menambah field pada pesan, bukan menambah pembacaan di UI.

---

## 2. Siklus hidup satu scan

```
Desainer pilih frame di Figma
        │
        ▼
figma.on("selectionchange")  ──►  refresh()
        │
        ├─► scan()
        │     walk(node)                   telusuri scene graph
        │       isCandidate(node)          layak diperiksa?
        │       checkNode(node, out)       jalankan seluruh cek
        │     stampFid(out)                beri identitas unik tiap temuan
        │     postMessage("findings")
        │
        └─► sendPreview()
              exportAsync PNG              buat AI Vision
              postMessage("preview")
        │
        ▼
ui.html  window.onmessage
        findings = msg.findings
        render()                           gambar ulang seluruh UI
```

**`render()` menggambar ulang semuanya.** Tidak ada diffing, tidak ada virtual DOM. Untuk panel 380 piksel dengan paling banyak beberapa puluh kartu, ini lebih sederhana dan cukup cepat. Konsekuensinya: **jangan simpan state di DOM**. Semua state harus di variabel JS, karena DOM akan dihapus pada render berikutnya.

State yang hidup di `ui.html`:

| Variabel | Isi |
|---|---|
| `state` | `{ nav, view, tab }`, posisi navigasi |
| `findings` | temuan dari scanner |
| `fstate` | status tiap temuan: open, done, defer, dismiss |
| `aiFindings`, `aiRubric` | hasil AKSA |
| `aiCache` | hasil di-pin per signature layar |
| `flowData`, `walkResult` | data journey |
| `journeyOverride` | override manusia atas vonis |
| `apiKey`, `wsId` | kredensial, dari clientStorage |

---

## 3. Peta modul `code.js`

| Kelompok | Fungsi | Catatan |
|---|---|---|
| **Warna** | `ch` `lum` `contrast` `over` `hex` | Matematika WCAG dan komposit alpha |
| **Fill** | `foldFills` `nodeLayer` `textLayers` `avgGradient` `solidFill` `topVisFill` | `textLayers` yang benar untuk teks, bukan `nodeLayer` |
| **Latar** | `bgUnderText` `compositeStack` `shapeCovers` `rectInsideEllipse` `hasBgBlur` | Bagian paling halus, baca §3.1 handoff |
| **Bukti** | `fillNote` `segNote` | Isi panel "Cara angka ini didapat" |
| **Pemeriksaan** | `checkNode` `isTouchTarget` `isCandidate` `walk` `stampFid` `scan` | `checkNode` adalah inti, 118 baris |
| **Sub-view** | `collectHeadings` `collectFocus` | Struktur heading dan urutan fokus |
| **Journey** | `collectFlow` `reactDests` `allFrames` `ownerFrame` `exportFlowShots` | Bangun graf dari prototype links |
| **Grounding** | `screenTexts` `screenAffordances` `screenLoad` | Bahan untuk prompt walkthrough |
| **Heatmap** | `heatCollect` `drawHeatmap` `heatColor` `clearHeat` | Overlay noise di canvas |
| **Canvas** | `showHL` `clearHL` | Sorot node saat hover di panel |
| **Mati** | `resolveBg` `nodeBg` | Ditandai JANGAN DIPAKAI LAGI |

### `screenLoad`, dan kenapa terpisah dari `screenTexts`

`screenTexts` melakukan dedupe dan memotong di 55 item, karena dia bahan prompt dan prompt punya batas. Akibatnya dia tidak bisa dipakai mengukur kepadatan layar. Layar dengan 200 teks dan layar dengan 55 teks akan terlihat sama.

`screenLoad` menghitung **mentah**: jumlah teks terlihat, teks di bawah fold, target tap, dan grup tingkat atas. Angka inilah yang dipakai aturan `KPADAT` untuk memaksa AKSA menyebut tiga elemen pertama yang dia periksa, supaya dia tidak bisa menyimpulkan "tidak ada friksi" di layar yang sebenarnya padat.

Bahasa awam: AKSA menerima teks sebagai daftar rapi, jadi mencari sesuatu terasa gratis baginya. Manusia harus memindai dengan mata. `screenLoad` yang memberitahu AKSA seberapa berat pemindaian itu sebenarnya.

---

## 4. Peta modul `ui.html`

Berkas ini punya tiga lapisan dalam satu file.

```
<style>   807 baris   CSS, 3 generasi bertumpuk, lihat utang P2
<body>     ~20 baris   kerangka: #top, #app, #nav, #foot
<script> 2187 baris   seluruh logika
```

Isi `<script>`, berurut:

| Blok | Isi |
|---|---|
| Konstanta | `SRC` sumber rujukan, `PRODUCTS`, `SEGMENTS`, `ICONS` |
| `KNOWLEDGE` | 34 aturan, 4 profil, versi |
| Prompt | `SYS`, `FLOW_SYS`, `TW_SYS`, `SYNTH_SYS` |
| Pembangun klausa | `densClause`, `cmpClauseFor`, dan kawan kawan |
| Integritas | `knowledgeSources`, `knowledgeCheck` |
| Auth | `authHeaders`, `bersihKunci`, `kunciWajar`, `wsWajar`, `pesanGagal` |
| AI | `aiSend`, `callClaude`, `analyze`, `taskWalk`, `flowAksa` |
| Skor | `accFromFindings`, `toScore`, `usaScore`, `journeyVerdict` |
| Render | `render`, `renderScan`, `renderAi`, `renderFlow`, `renderWalk`, `detailHtml`, `findCard` |
| Event | satu delegasi klik di `document`, berdasarkan `data-*` |

### Delegasi event

Satu listener di `document`, satu daftar selector:

```js
var el = e.target.closest("[data-navtab],[data-sub],[data-back],[data-find],[data-goto],[data-flowgoal],[data-flowstart],[data-flowmode],[data-act],[data-act2],[data-plat],[data-mode],[data-tab],[data-aiact]");
```

**Jebakan:** kalau menambah atribut `data-*` baru untuk tombol, **wajib** menambahkannya ke daftar selector ini. Kalau lupa, tombolnya akan terlihat normal tapi tidak melakukan apa apa, dan tidak ada error di console. Ini pernah terjadi pada `data-view` dan butuh waktu lama untuk ketemu.

---

## 5. Alur AKSA

```
Desainer klik "Analisa mendalam"
        │
        ▼
kumpulkan konteks
   nodeMap          daftar id, tipe, nama tiap elemen
   previewB64       PNG frame, untuk Vision
   aiCtx            konten dan intensi halaman
        │
        ▼
rakit prompt
   SYS + KNOWLEDGE yang relevan + klausa kondisional
   lastAnalyzePrompt = hasil rakitan       ◄── dipakai integrity checker
        │
        ▼
aiSend()
   model utama MODEL_JUDGE (Opus)
   kalau ditolak → isJudgeErr() → fallback ke MODEL (Sonnet)
        │
        ▼
parseAi(text)
   buang pagar kode, ambil objek JSON pertama
        │
        ▼
cocokkan temuan AI ke node lewat TEKS, bukan lewat id
   normTxt() + validNode()
        │
        ▼
aiCache[hashFrame()] = hasil       ◄── di-pin supaya tidak loncat tiap scan
```

**Kenapa pencocokan lewat teks, bukan id.** Model sering mengarang id node. Teks yang dikutipnya jauh lebih bisa dipercaya karena dia benar benar melihatnya. `normTxt` menormalkan spasi dan tanda kutip sebelum membandingkan.

**Kenapa hasil di-pin.** Tanpa pin, hasil berubah sedikit tiap scan walaupun desainnya tidak berubah. Desainer akan berhenti percaya. `hashFrame()` membuat signature dari nama frame, daftar temuan, konteks, dan jumlah node. Kalau signature sama, hasil lama dipakai. Tombol **Fresh** memaksa hitung ulang.

**Fallback model.** `MODEL_JUDGE` adalah Opus. Kalau akun tidak punya akses, `isJudgeErr()` mendeteksinya dari pesan error dan otomatis turun ke Sonnet, dengan banner peringatan. Ini supaya plugin tetap berguna di akun dengan akses terbatas.

---

## 6. Penyimpanan

| Apa | Di mana | Umur |
|---|---|---|
| Token Claude | `figma.clientStorage` kunci `tis_key` | Per mesin, per plugin id |
| Workspace id | `figma.clientStorage` kunci `tis_ws` | Sama |
| Hasil AKSA | memori `ui.html` | Hilang saat plugin ditutup |
| Status temuan | memori `ui.html` | Hilang saat plugin ditutup |
| Feature Snapshot | `setPluginData` pada node | Ikut file Figma |

**`clientStorage` terikat pada plugin id.** Mengubah `id` di `manifest.json` akan membuat plugin membaca ruang penyimpanan yang berbeda, dan semua orang harus memasukkan token lagi. Ini alasan v1 tidak boleh diubah id-nya.

**Hasil AKSA sengaja tidak persisten.** Menyimpannya berarti menyimpan penilaian terhadap desain yang mungkin sudah berubah. Feature Snapshot berbeda: dia memang catatan resmi pada satu titik waktu, jadi dia ditulis ke node.

---

## 7. Cara menguji tanpa membuka Figma

`ui.html` bisa dijalankan di Node dengan DOM tiruan. Ini menangkap kesalahan yang tidak terlihat dari pemeriksaan sintaks.

```js
const fs=require('fs'), vm=require('vm');
const src=fs.readFileSync('ui.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const S={};
const el=id=>({id, set innerHTML(v){S[id]=v}, get innerHTML(){return S[id]||''},
  set textContent(v){}, querySelector:()=>null, querySelectorAll:()=>[],
  classList:{toggle(){},add(){},remove(){},contains:()=>false},
  dataset:{}, closest:()=>null, addEventListener(){}, value:'', style:{}});
const sb={document:{getElementById:el, querySelectorAll:()=>[], querySelector:()=>null,
    body:{addEventListener(){}}, addEventListener(){}},
  parent:{postMessage(){}}, console, setTimeout:f=>f(), setInterval(){}, clearInterval(){},
  location:{href:''}, navigator:{}, fetch:()=>Promise.resolve(), btoa:s=>s,
  addEventListener(){}, ResizeObserver:function(){this.observe=function(){}}};
sb.window=sb; vm.createContext(sb);
vm.runInContext(src, sb);

// sekarang seluruh fungsi bisa dipanggil
sb.state.nav='layar'; sb.findings=[];
sb.renderScan();
console.log(S.app);          // HTML hasil render
```

**Pola bug yang hanya tertangkap dengan cara ini:**

Sebuah fungsi pernah diberi nama `top()`. `window.top` bersifat read-only, jadi seluruh render gagal diam diam dan panel tampil kosong. Pemeriksaan sintaks lulus. Yang menangkapnya adalah menjalankan `render()` sungguhan.

Sejak itu, tiap perubahan besar diuji dengan menjalankan render, bukan hanya memeriksa sintaks.

---

## 8. Pemeriksaan kontras otomatis

Ada penyapu kontras untuk CSS dan untuk warna inline di JS. Prinsipnya: semua pasangan teks dan latar harus lolos 4,5:1, dihitung dengan komposit alpha, bukan diperkirakan.

Terakhir dijalankan: **135 pasangan CSS diperiksa, 0 di bawah 4,5:1**. Warna inline di JS: 46 diperiksa, 0 gagal.

**Kelas bug yang disapu ini menangkap:** token teks dipakai sebagai latar. Misalnya `--ink` adalah warna teks, lalu dipakai `background:var(--ink); color:#fff`. Di tema terang hasilnya kebetulan benar. Waktu tema dibalik ke gelap, `--ink` jadi putih dan hasilnya putih di atas putih, kontras 1:1. Pernah terjadi di 22 tempat sekaligus.

**Aturan turunannya:** token teks tidak pernah boleh jadi nilai `background`. Ada di aturan keras `ds-tis-v4.md`.

---

## 9. Keputusan yang sengaja diambil, jangan dibalik tanpa diskusi

**Permukaan memakai nilai tetap, bukan alpha.** `--surface` adalah `#0F1826`, bukan `rgba(255,255,255,.08)`. Dengan alpha, warna akhirnya bergantung apa yang ada di belakangnya, dan kontras tidak bisa dijamin. Ini prinsip pertama design system v4.

**Tidak ada dekorasi yang menaikkan kompleksitas latar.** Glow, gradasi radial, dan blur di belakang teks semuanya dibuang. Bukan karena tidak bagus, tapi karena membuat kontras mustahil dihitung dengan pasti. Alat yang menilai kontras tidak boleh melanggar aturannya sendiri.

**Potensi berbobot 0,5 kali severity, tidak nol.** Bucket potensi menampung temuan "kontras belum bisa dipastikan" yang muncul di latar berblur atau transparan. Selama titik buta itu ada, menolkan bobot potensi justru membuat layar glass dan overlay paling gampang lolos.

**Panel plugin 380 piksel.** Ini lebar yang muat berdampingan dengan canvas Figma tanpa menutupi desain yang sedang dinilai. TIS hidup di sebelah desain yang dihakiminya, dan itu membatasi banyak keputusan visual.
