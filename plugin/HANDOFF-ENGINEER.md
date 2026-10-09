# TIS · Handoff Engineering

**Telkomsel Interaction Standard.** Plugin Figma yang memeriksa aksesibilitas dan usability sebuah desain sebelum masuk development, lalu mengeluarkan vonis yang bisa dipakai sebagai gate rilis.

Dokumen ini untuk tim yang **melanjutkan** kode ini, bukan menulis ulang dari nol. Isinya arsitektur, kontrak data, titik ekstensi, dan utang teknis berurut prioritas.

| | |
|---|---|
| Status | MVP jalan, dipakai harian oleh tim desain |
| Stack | Figma Plugin API, JavaScript polos, tanpa build step |
| Berkas inti | `code.js` ±940 baris, `ui.html` ±3.500 baris |
| Versi knowledge | `2026-10-10`, 41 aturan kalibrasi, 4 profil kapabilitas, 4 persona perilaku, 8 kendala inklusif |
| Penulis | Syafrizal Wardhana, Aksara Team |

---

## 1. Baca ini dulu kalau waktumu 10 menit

TIS bukan linter. Linter memberi tahu aturan mana yang dilanggar. TIS memberi tahu **siapa yang akan kesulitan** dan **seberapa yakin sistem terhadap vonisnya sendiri**.

Tiga hal yang membedakannya dari checker aksesibilitas biasa, dan ketiganya harus dipertahankan kalau kode ini dikembangkan:

**Pertama, pemisahan pelanggaran dan potensi.** Pelanggaran adalah kegagalan standar keras yang bisa dihitung deterministik, misalnya rasio kontras di bawah 4,5:1. Potensi adalah hal yang perlu keputusan manusia, misalnya kontras di atas latar berblur yang nilainya tidak bisa dipastikan dari file desain. Menggabungkan keduanya akan membuat tim berhenti percaya pada temuan merah.

**Kedua, sistem mengakui ketidaktahuannya.** Kalau latar di belakang teks berupa gambar, gradasi transparan, atau Background Blur, TIS tidak memvonis. Dia menandai "kontras belum bisa dipastikan" dan menyerahkan ke manusia. Ini sengaja. Versi paling awal memvonis dan menghasilkan "putih di atas putih" yang salah, dan satu vonis salah merusak kepercayaan lebih cepat daripada sepuluh vonis benar membangunnya.

**Ketiga, manusia memegang keputusan akhir.** Ada kontrol override di vonis journey. Semua override tercatat dan menjadi bahan kalibrasi. Jangan dihapus.

---

## 2. Arsitektur

Dua berkas, dua dunia, komunikasi hanya lewat pesan.

```
┌─────────────────────────────────────────────────────────┐
│  code.js  ·  sandbox Figma, punya akses scene graph      │
│                                                          │
│  scan()          baca node, jalankan checkNode()         │
│  collectFlow()   telusuri prototype links jadi graf      │
│  collectHeadings() collectFocus()  sub-view              │
│  drawHeatmap()   gambar overlay di canvas                │
│  clientStorage   simpan token per mesin                  │
│                                                          │
│  TIDAK punya: fetch, DOM, localStorage                   │
└──────────────────────┬──────────────────────────────────┘
                       │  figma.ui.postMessage / onmessage
┌──────────────────────┴──────────────────────────────────┐
│  ui.html  ·  iframe, punya jaringan                      │
│                                                          │
│  render()        seluruh UI, tanpa framework             │
│  KNOWLEDGE       34 aturan kalibrasi + 4 profil          │
│  4 prompt        SYS, FLOW_SYS, TW_SYS, SYNTH_SYS        │
│  aiSend()        panggil Anthropic API langsung          │
│  journeyVerdict() gate                                   │
│                                                          │
│  TIDAK punya: akses scene graph                          │
└─────────────────────────────────────────────────────────┘
```

**Kenapa tidak ada build step.** Figma memuat `ui.html` apa adanya, satu berkas, termasuk CSS dan JS di dalamnya. Menambahkan bundler berarti menambahkan langkah yang harus dijalankan tiap orang sebelum bisa mencoba perubahan. Untuk tim yang sekarang, biaya itu lebih besar daripada manfaatnya. Kalau nanti ada CI, ini keputusan pertama yang layak ditinjau ulang.

### Kontrak pesan

Semua komunikasi lewat `postMessage`. Ini kontraknya, dan ini yang harus kamu jaga kalau memecah berkas.

**ui.html ke code.js**

| type | payload | efek |
|---|---|---|
| `rescan` | - | pindai ulang seleksi sekarang |
| `scanFrames` | `ids[]` | pindai beberapa frame sekaligus, untuk submit feature |
| `getFlow` | `startId` | telusuri prototype dari titik mulai |
| `getFlowShots` | `ids[]`, `scale?`, `reqId` | ekspor PNG tiap layar. Walkthrough & insight 0,4; simulasi persona 1,0. `reqId` digaungkan balik |
| `getHeadings` | - | kumpulkan teks urut posisi |
| `getFocus` | - | kumpulkan elemen fokusable urut Dev Mode |
| `heatmap` / `clearHeatmap` | - | gambar atau hapus overlay noise |
| `hover` / `unhover` | `id` | sorot node di canvas |
| `select` | `id` | pilih dan zoom ke node |
| `saveKey` | `key` | simpan token ke clientStorage |
| `saveWs` | `ws` | simpan workspace id |
| `mint` | `snapshot` | tulis Feature Snapshot ke node |
| `resize` | `w`, `h` | ubah ukuran panel |
| `preview` | - | minta PNG frame untuk AI Vision |

**code.js ke ui.html**

| type | isi |
|---|---|
| `findings` | array temuan, sudah ber-`fid` unik |
| `flow` | graf journey: steps, edges, **unreachable** (layar ter-wire yang tak tercapai, dulu selalu kosong), deadends (tanpa overlay yang punya Back/Close), `graph[].actions` (per elemen: label, txt, box, nid, **toId**, auto) |
| `flowShots` | PNG per layar + `texts{t,pos,x,y}`, `affs`, `load`, `sr` (urutan baca screen reader), `w`, `h`, dan `reqId` |
| `minted` | `{ok, target, err}` setelah Feature Snapshot ditulis. Dulu UI menampilkan sukses tanpa konfirmasi |
| `headings`, `focus` | isi sub-view |
| `heatmap` | daftar node ternoisy |
| `featureScreens` | skor per layar untuk gate |
| `preview` | base64 PNG frame terpilih |
| `key` | token dan workspace id dari clientStorage |
| `scannerRules` | **badan fungsi `checkNode` sebagai string**, lihat §6 |

---

## 3. Cara kerja pemeriksaan

### 3.1 Kontras, bagian paling rawan

Ini fungsi yang paling sering salah kalau diubah tanpa hati hati. Urutannya:

```
textLayers(node)      → warna teks dari fill KARAKTER, bukan fill node
bgUnderText(node)     → telusuri z-order dan hirarki, komposit tumpukan
over(fg, alpha, bg)   → komposit alpha
contrast(fg, bg)      → rasio WCAG
```

**Empat jebakan yang sudah pernah menjatuhkan kode ini.** Semuanya sudah diperbaiki, dan semuanya akan kembali kalau kamu menulis ulang bagian ini tanpa membaca dulu.

**`node.fills` bukan warna yang terlihat.** Di Figma, karakter bisa punya fill sendiri yang menimpa fill tingkat node. Pola yang sangat umum: teks dibuat dari text style, lalu karakternya diseleksi dan diwarnai ulang. Yang berubah hanya fill karakter. `node.fills` tetap menyimpan warna lama yang tidak dipakai merender satu huruf pun. Pakai `getStyledTextSegments(["fills"])`. Lihat `textLayers()`.

**Teks bisa punya beberapa warna.** Kalau segmen berbeda warna, `node.fills` mengembalikan `figma.mixed` dan kode lama berhenti tanpa memeriksa apa pun. Artinya teks dua warna lolos diam diam. Sekarang tiap segmen dinilai dan yang dilaporkan adalah **segmen dengan kontras terburuk**.

**Stop gradasi punya alpha.** Merata ratakan RGB saja membuat gradasi yang memudar sampai transparan terbaca seolah cat pekat. Lihat `avgGradient()`, yang sekarang mengembalikan `{ color, alpha }`.

**Bounding box bukan berarti menutupi.** Donat, busur, dan vektor punya bbox besar dengan tengah kosong. Kalau dianggap menutupi, teks bisa divonis berada di atas warnanya sendiri. Lihat `shapeCovers()` dan `rectInsideEllipse()`.

### 3.2 Identitas temuan

Satu node bisa menghasilkan beberapa temuan. Kalau `id` temuan memakai `node.id` saja, menutup satu temuan akan menutup semua temuan di node itu. `stampFid()` memberi tiap temuan identitas sendiri berbentuk `<nodeId>#<kategori>` dengan penomoran kalau bentrok.

**Aturan:** untuk operasi UI (dismiss, expand, tandai selesai) pakai `fidOf(f)`. Untuk operasi canvas (hover, select) pakai `f.id`.

### 3.3 Gate

```js
accPass     = min(screens[].acc) >= 80
journeyPass = journey.status !== "BROKEN"
boleh rilis = accPass && journeyPass
```

Skor dihitung dari bobot temuan, bukan dari jumlah:

```js
toScore(W) = round(100 * (1 - W/(W+100)))
W = 5 × jumlah pelanggaran + 0,5 × Σ severity potensi
```

**Kenapa melengkung.** Supaya layar dengan satu pelanggaran fatal tidak terlihat sama dengan layar dengan dua puluh masalah kecil. Konsekuensinya tambahan pelanggaran makin lama makin tidak terasa. Ini sudah dibahas dan diputuskan tetap, alasannya ada di `tis-opsi-gate.html`.

**Yang wajib diperhatikan:** `accFromFindings()` harus menghormati `isActive(f)`. Temuan yang sudah ditandai selesai atau diabaikan tidak boleh ikut menurunkan skor. Ini pernah terlewat dan menghasilkan skor gate berbeda dengan skor yang tampil di panel.

---

## 4. KNOWLEDGE, dan kenapa dia ada

`KNOWLEDGE` adalah satu objek di `ui.html` yang memuat seluruh aturan kalibrasi AKSA. Isinya bukan dokumentasi. Isinya **sumber kebenaran yang diperiksa keberadaannya saat runtime**.

```js
KNOWLEDGE = {
  versi: "2026-08-26",
  profil: { vision, blind, lowlit, motor },   // 4 profil kapabilitas
  kalibrasi: [ ...34 aturan ]
}
```

Tiap aturan berbentuk:

```js
{ id: "KPADAT",
  jenis: "menahan",              // menahan | deteksi | atribusi | ambang
  menyentuh: "SYS",              // prompt mana yang harus memuatnya
  jejak: "sebut 3 elemen pertama yang kamu cek",   // potongan teks penanda
  kenapa: "..." }
```

Sebarannya: 18 menahan, 12 deteksi, 3 atribusi, 1 ambang. Sumber yang disentuh: `TW_SYS` 10, `SYNTH_SYS` 6, `analyze` 6, `SYS` 5, `code.js` 2, `klausa` 2, sisanya satu satu.

### Integrity checker

`knowledgeCheck()` mengambil tiap aturan, mencari `jejak`-nya di dalam sumber yang disebut `menyentuh`, lalu melaporkan tiga keadaan: **ada**, **hilang**, atau **belum** (prompt belum dirakit karena belum ada scan).

**Kenapa ini penting.** Prompt panjang dan sering diedit. Tanpa pemeriksa, satu aturan bisa terhapus tanpa ada yang tahu, dan AKSA diam diam berhenti mempertimbangkan sesuatu. Lencana `🧠 Knowledge` di tab Usability adalah tampilan hasil pemeriksaan ini.

**Jebakan yang pernah terjadi.** Dulu ada konstanta `SCANNER_RULES` berisi daftar aturan yang ditulis tangan, lalu diperiksa terhadap dirinya sendiri, jadi selalu lulus. Sekarang `code.js` mengirim `String(checkNode)`, yaitu badan fungsi sungguhan, jadi yang diperiksa adalah kode yang benar benar berjalan.

**Kalau menambah aturan:** tambahkan entri di `KNOWLEDGE.kalibrasi`, lalu pastikan `jejak`-nya benar benar ada di prompt yang disebut. Kalau `menyentuh` menunjuk klausa kondisional yang hanya muncul di kondisi tertentu, daftarkan sumbernya sebagai `klausa`, bukan nama promptnya. Ini pernah menghasilkan alarm palsu pada aturan `KBANDING`.

---

## 5. Comparator, jaring pengaman yang wajib dipakai

`tis-cek-capability.js` di folder induk membandingkan v1 dan v2 pada **23 titik**: seluruh `code.js`, blok `KNOWLEDGE`, empat prompt, pembangun klausa, fungsi skor, `journeyVerdict`, dan blok gate. Perbandingannya SHA-256 per blok, diambil dengan penguraian kurung berimbang.

```bash
node tis-cek-capability.js
```

**Jalankan setiap kali menyentuh `ui.html` atau `code.js`.**

Ini bukan formalitas. Contoh nyata: satu penggantian warna massal mengubah `#E60012` menjadi `#E80022` di tiga tempat. Dua di antaranya memang styling. Yang ketiga ada **di dalam string prompt**, merujuk token `action/primary` Design System Telkomsel yang dibaca AKSA. Perubahan itu diam diam mengubah perilaku AI. Comparator yang menangkapnya.

**Aturan turunannya: nilai hex di dalam string prompt adalah DATA, bukan styling.** Jangan pernah melakukan find-replace warna tanpa melindungi blok prompt.

---

## 6. Keamanan

| Hal | Keadaan sekarang |
|---|---|
| Token Claude | Dimasukkan tiap orang sendiri, disimpan di `figma.clientStorage`, per mesin. Tidak pernah masuk berkas, tidak pernah masuk repo. |
| Workspace id | Sama, opsional, hanya dikirim kalau diisi |
| Panggilan API | Langsung dari iframe ke `api.anthropic.com` dengan header `anthropic-dangerous-direct-browser-access` |
| Domain | Dibatasi di `manifest.json`, hanya `https://api.anthropic.com` |
| PII | Payload analitik tidak memuat data pribadi |

**Utang keamanan yang harus dibereskan sebelum dipakai luas:** panggilan langsung dari browser berarti token ada di memori iframe dan tiap orang perlu tokennya sendiri. Untuk produksi, gantikan dengan **proxy backend Telkomsel**. Satu token organisasi, plugin memanggil proxy, proxy yang memanggil Anthropic. Ini juga memecahkan masalah kuota dan audit pemakaian.

**Jangan ubah `manifest.json` id plugin v1.** Mengubahnya akan mereset `clientStorage` setiap anggota tim dan semua orang harus memasukkan token lagi. v2 memakai id berbeda dengan sadar, konsekuensinya memang harus isi token ulang.

---

## 7. Utang teknis, berurut prioritas

Angka di bawah diukur, bukan diperkirakan.

### P1 · Proxy backend untuk token
Lihat §6. Ini penghalang terbesar untuk pemakaian di luar tim desain.

### P2 · CSS berlapis lapis
```
selector ditulis lebih dari sekali : 76 dari 329
!important                          : 216
baris CSS                           : 807
```
Penyebabnya redesign bertumpuk: blok v4 ditumpuk di atas v2 di atas v1, dan tiap lapisan menambah `!important` untuk menang dari lapisan sebelumnya. Akibatnya sudah beberapa kali terjadi: aturan `margin:0 !important` pada kartu menghapus `margin-top` inline yang ditulis di markup, dan tidak ada yang bisa melihat itu terjadi.

**Cara membereskan:** hapus lapisan v1 dan v2 sepenuhnya, sisakan v4. Jangan menambal. Setelah itu ubah sistem spasi dari margin ke `gap`, karena `gap` tidak bisa dihapus oleh `margin:0`.

### P3 · Style inline di dalam string JS
```
style="..." di dalam string JS : 220
```
Jarak yang ditulis di dalam string HTML tidak akan pernah ikut kalau sistem spasinya berubah, dan tidak terlihat oleh siapa pun yang membaca CSS. Pindahkan ke kelas. Prioritaskan tab Alur, di sana paling parah.

### P4 · `ui.html` 3.013 baris dalam satu berkas
Sudah di batas nyaman. Kalau akan dipecah, ingat Figma hanya memuat satu berkas, jadi pemecahan membutuhkan build step. Timbang dengan §2.

### P5 · Dua fungsi mati
`resolveBg()` dan `nodeBg()` sudah ditandai `JANGAN DIPAKAI LAGI`. Versi lama pemeriksa kontras yang mengabaikan transparansi. Dibiarkan sebagai catatan sejarah, boleh dihapus setelah tim baru paham konteksnya.

---

## 8. Cara menambah pemeriksaan baru

Contoh: menambah cek "tombol tanpa label teks".

**1. Tulis deteksinya di `checkNode()` pada `code.js`.**
```js
if (isTouchTarget(node) && !nodeText(node)) {
  out.push({
    id: node.id, name: node.name, type: node.type,
    sev: 3,                          // 1 rendah, 2 sedang, 3 tinggi
    impact: mockImpact(node),
    cat: "label",                    // dipakai fid dan filter
    title: "Tombol tanpa label teks",
    sources: [
      { s: "wcag", v: "fail", code: "4.1.2 Name, Role, Value · A",
        note: "Screen reader membacanya sebagai 'button' tanpa keterangan." },
      { s: "uxpsych",
        note: "Perlu keputusan manusia kalau ikonnya konvensional." }
    ]
  });
}
```

**2. Tentukan kerasnya.** `hardFail()` menentukan apakah temuan masuk **pelanggaran** atau **potensi**. Pelanggaran hanya untuk kegagalan WCAG yang pasti. Kalau yang meleset cuma panduan platform atau Design System, itu potensi.

**3. Daftarkan ke `KNOWLEDGE.kalibrasi`** kalau aturannya juga membimbing AKSA, dengan `jejak` yang benar benar ada di prompt.

**4. Jalankan comparator.** Kalau `code.js` berubah, samakan juga ke v1, atau bereskan keputusan versinya dulu.

**5. Uji lawan DOM palsu.** `ui.html` bisa dijalankan di Node dengan DOM tiruan. Ini menangkap kesalahan render yang tidak terlihat dari pemeriksaan sintaks.
```bash
node -e "new Function(require('fs').readFileSync('ui.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1])"
```

---

## 9. Roadmap, sesuai BR

| Fase | Isi | Exit criteria |
|---|---|---|
| 1 · Pilot | 1 produk, 2 sampai 3 desainer, distribusi manual, gate berstatus shadow | 80% temuan design-fixable tertangkap sebelum handoff, baseline false positive terukur |
| 2 · Team adoption | Plugin terpublikasi privat di organisasi | Seluruh desainer memakai satu versi yang sama |
| 3 · Governance | Govern Store dan dashboard aktif, gate dievaluasi di CI tapi masih shadow | Feature Snapshot tersimpan untuk seluruh fitur yang dirilis |
| 4 · Runtime validation | Instrumentasi berjalan, gate mulai menahan rilis | Cohen's kappa antara vonis sistem dan penilaian manusia mencapai 0,7 sampai 0,8 |

**Gate tidak boleh menahan rilis sebelum fase 4.** Angka kappa 0,7 sampai 0,8 itu setara tingkat kesepakatan antara dua reviewer manusia. Menahan rilis sebelum tingkat itu tercapai akan menghasilkan penolakan yang benar benar merugikan tim, dan kepercayaan tidak akan kembali.

---

## 10. Yang belum diputuskan

Tiga hal, sengaja dibiarkan terbuka, dan sebaiknya diputuskan bersama tim baru.

**Pita nilai skor.** Frame Figma menandai 55 sebagai merah "Perlu Perbaikan". Kode memakai batas 50 dan 80, jadi 55 masuk kuning "Cukup". Karena ambang gate 80, skor 55 tetap tertahan rilis, sehingga kata "Cukup" bisa menyesatkan.

**Nol toleransi untuk pelanggaran WCAG.** Sekarang pelanggaran berbobot 5 tapi tetap bisa lolos kalau jumlahnya sedikit. Pertanyaannya apakah satu pelanggaran WCAG saja sudah cukup untuk menahan.

**Bahasa label navigasi.** Sekarang Screen, Simulation, Flow mengikuti frame Figma. Isi panelnya berbahasa Indonesia.

---

## 11. Berkas dalam paket ini

| Berkas | Isi |
|---|---|
| `manifest.json` | Definisi plugin, domain yang diizinkan |
| `code.js` | Sandbox Figma, scene graph, pemeriksaan deterministik |
| `ui.html` | UI, KNOWLEDGE, prompt, panggilan AI, gate |
| `icon.png` | Ikon plugin |
| `HANDOFF-ENGINEER.md` | Dokumen ini |
| `ARSITEKTUR.md` | Peta modul dan siklus render, lebih rinci |
| `KALIBRASI.md` | Katalog 34 aturan beserta sumber dan jejaknya |
| `INSTALL-untuk-tim.md` | Cara pasang untuk desainer |
| `VERSI.md` | Riwayat perubahan visual v2 dan v4 |
| `README.md` | Pintu masuk paket |

Dokumen pendukung di folder induk project:

| Berkas | Isi |
|---|---|
| `tis-cek-capability.js` | Comparator 23 titik |
| `aksa-calibration-notes.md` | Catatan kalibrasi per sesi, alasan tiap aturan |
| `ds-tis-v4.md` | Design system yang dipakai v4 |
| `tis-model-penilaian.md` | Metode Task Walkthrough dan dasar teorinya |
| `tis-measurement-handoff.md` | Skema Measurement Spec ke engineering |
| `tis-opsi-gate.html` | Empat opsi rumus gate dan alasan pilihan |

---

## 12. Perubahan 10 Oktober 2026

**Fitur baru: simulasi persona** (tab Flow, mode 👥 Persona). Rancangan, cara pakai, dan cara kalibrasi ada di `dokumen-pendukung/tis-persona-sintetis.md`. Prinsipnya satu: aturan ditegakkan di **apa yang dilihat AI** (layar dipotong, gambar difilter, tujuan tombol disembunyikan, ingatan dipotong, tekanan diundi), bukan di kata sifat prompt. Advisory, tidak menyentuh gate.

**Bug yang diperbaiki** (ditemukan lewat review menyeluruh, diverifikasi dengan uji DOM tiruan dan Figma tiruan):

| Berkas | Bug | Akibat sebelumnya |
|---|---|---|
| code.js | `INTERACTIVE` mencocokkan substring | "Re**cta**ngle 12", "Table", "Transaction" dianggap tombol → pelanggaran 4.1.2 palsu yang menahan gate |
| code.js | teks besar diuji 4,5:1 | judul ≥24px (atau ≥18,66px tebal) seharusnya 3:1 → pelanggaran kontras palsu |
| code.js | `unreachable:[]` tertulis mati, `wired` = steps>1 | vonis BROKEN deterministik tidak pernah bisa menyala; halaman tanpa link lolos "wajib wired" |
| code.js | CHANGE_TO dihitung pindah layar, link di layer tersembunyi ikut | varian tombol muncul sebagai layar journey |
| code.js | reaction apa pun = tombol, termasuk milik layar | layar dengan after-delay membungkam cek area tap dan label seluruh isinya; muncul sebagai opsi berlabel seluruh teks layar |
| code.js | dua tombol ke layar sama berbagi satu label di peta | walkthrough membaca label yang salah |
| code.js | teks/mask di bawah teks dianggap latar pejal | kontras ~1:1 palsu |
| code.js | select/hover node halaman lain, mint tanpa try/catch, heatmap tertinggal | error tak tertangkap; record "sukses" palsu; grup heatmap terkunci tersisa di file |
| ui.html | hasil walkthrough/override tidak dibuang saat tujuan/intent berubah | vonis tujuan A ter-submit atas nama tujuan B |
| ui.html | submit cukup `walkResult` ada | 5 run error API ter-mint sebagai GATE PASS |
| ui.html | 1 dari 5 run sukses = "konsisten berhasil, keyakinan tinggi" | sekarang minimal 3 run, parsial tidak di-pin, keyakinan diturunkan |
| ui.html | tanpa timeout & retry 429/529 | spinner abadi; run kena rate limit dihitung gagal |
| ui.html | analisa AKSA kembali setelah pindah frame | hasil frame A di-cache dengan kunci frame B; temuan AI frame lama ikut memotong skor frame baru |
| ui.html | `isJudgeErr` mencocokkan "access" | saldo habis dianggap "tidak punya akses Opus" permanen |
| ui.html | KBANDING substring + "pilih" | "pilih paket" (task terbuka menurut KPILIH) memicu klausa banding |
| ui.html | jawaban terpotong diselamatkan `repairJson` | langkah hilang, penegakan guessed/confused terlewat |
| ui.html | bentuk JSON sintesis tak dijamin | string di tempat array membuat render() rusak sampai Fresh |
| ui.html | KATR memeriksa dirinya sendiri, KGAYA cukup satu prompt | aturan bisa lepas tanpa ketahuan |
| ui.html | trim WALK_CAP bisa membuang layar penghubung ke tujuan | vonis gagal palsu; sekarang jalur terpendek start→tujuan selalu ikut |

**Comparator** sekarang memeriksa 40 titik (dulu 23), termasuk `PERSONA_SYS` dan fungsi simulasi persona. Dibandingkan salinan sebelum perubahan: keempat prompt lama, `journeyVerdict`, `toScore`, `accFromFindings` identik byte per byte.

**Utang yang sengaja belum disentuh** (butuh file uji Figma nyata, bukan tebakan):

- Opacity leluhur belum ikut komposit kontras (grup 40% opacity bisa lolos palsu).
- Latar yang hanya menutup sebagian kotak teks belum ditandai "tidak pasti".
- Penanda `_progSel` untuk selection bisa tertukar saat hover cepat; rescan saat ganti halaman belum ada.
- `figma.getNodeById` sinkron akan rusak kalau manifest memakai `documentAccess: "dynamic-page"`.
- Override, dismiss, dan pin masih di memori, hilang saat plugin ditutup.
- P1 sampai P5 di §7 tetap berlaku.

## 13. Kontak

Syafrizal Wardhana, Designer, Aksara Team, Telkomsel.

Kalau ada temuan yang nilainya terasa meleset, buka **"Cara angka ini didapat"** di kartu temuan kontras. Isinya fill per segmen, warna sebelum dan sesudah komposit, latar terhitung, dan rasionya. Kirim isi panel itu, bukan tangkapan layarnya, supaya bisa dilacak sampai baris kode.
