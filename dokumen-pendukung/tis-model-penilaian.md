# TIS: Model Penilaian Definitif (merged)

*Hasil rekonsiliasi deck resmi (4 dasar) + wireframe sesi (6 sumber). 2 Juli 2026.*

Prinsip inti: **jangan diflatten jadi 1 skor.** Tiap sumber punya peran & otoritas beda. WCAG = salah satu input, bukan fondasi. Output gak bisa di-copy kompetitor karena dua sumber internal Telkomsel.

## Sumber & perannya

| Sumber | Peran | Bentuk output | Kondisi |
|---|---|---|---|
| **WCAG 2.2** | Lantai deterministik universal | Vonis lolos/langgar | Selalu aktif |
| **Apple HIG** | Preskriptif platform iOS | Vonis terukur | Kondisional (native iOS) |
| **Android Material** | Preskriptif platform Android | Vonis terukur | Kondisional (native Android) |
| **Design System Telkomsel** | Referensi internal: sumber kebenaran pola. Deteksi deviasi **+ basis nilai perbaikan** | Vonis + nilai fix | Selalu aktif |
| **UX Laws** (Hick's, Fitts's, Jakob's) | Heuristik | **Pertanyaan**, bukan vonis | Selalu aktif |
| **UX Psychology** | Otoritas paling lemah (termasuk bahasa/low-literacy, urgency/dark-pattern) | **Perlu manusia** | Selalu aktif |
| **User Behaviour & Data** (analytics + churn + riset kual) | **Pengali prioritas, bukan pendeteksi**: di mana pengguna berhenti | Bobot Impact | Fase 2 (butuh akses analytics) |

## Cara sumber bekerja sama

- **Prioritas = Severity (dari deteksi) × Impact (dari User Behaviour & Data).** Deteksi datang dari WCAG/Apple/Android/DS/UX Laws; Impact datang dari analytics (Fase 2, sekarang placeholder).
- **Design System = peran ganda.** (1) Pendeteksi: elemen yang nyimpang dari component/token/pattern resmi ke-flag. (2) Basis perbaikan: generate-improvement nyomot token Telkomsel asli, jadi fix on-brand & gak bisa ditiru. Ini yang bikin "generate design improvement" defensible.
- **Moat = dua sumber internal.** Design System + User Behaviour lahir dari data Telkomsel sendiri. Itu sebab output TIS "bukan salinan WCAG untuk segmen inklusi, atau intuisi semata."

## Peta otoritas (buat UI & gerbang)

- **Deterministik** (WCAG, Apple, Android, DS): boleh auto-generate perbaikan. Vonis pasti.
- **Heuristik** (UX Laws): muncul sebagai pertanyaan, bukan auto-fix.
- **Perlu manusia** (UX Psychology, termasuk low-literacy): gak boleh auto-fix, disisakan buat keputusan orang.
- **Pengali** (User Behaviour): naikin urutan/severity, bukan badge temuan.

## Persona VoC (buat deck/narasi) vs Mode simulasi (buat wireframe)

**VoC deck** (buat cerita, bukan buat lens wireframe): Rezha (tunanetra), Tyo (tunadaksa), Hadi (63 low vision). Low-literacy = segmen 57% (KOMINFO 2023).

**Mode simulasi di wireframe**: 8 mode, tanpa nama persona (lebih universal / Curb Cut, sejalan "7 vision modes" di deck):
Normal · Low vision · Buta warna parsial · Katarak (lansia) · Terik matahari · HP murah (low-end) · Low literacy · Motorik (tremor).
Katarak + terik + HP murah = situasional/lansia, yang paling bikin beda dari checklist WCAG biasa.

## Catatan konteks penting (dari deck)

- **MVP = telkomsel.com (web)**, produk pertama. Native nyusul. → platform guideline (Apple/Android) kondisional; buat web MVP, WCAG + Design System yang mimpin.
- **axe-core = L1 Scanner** (jalan di Figma/URL/screenshot, pre-release, MVP). Bukan cuma verifikasi dev. Seam desain→dev perlu diframe ulang: axe-core udah di sisi scan.
- 4-layer: L1 Scanner (MVP) · L2 Behavior Mining (Fase 2) · L3 Gap Prioritization (Fase 2) · L4 Guideline Generation (MVP).
- Ladder output: **Component → Pattern → Guideline → Standard** (contoh guideline: TI-07 "tombol wajib label teks").
- Narasi kunci: **Curb Cut Effect**, **Empathy Gap**, decision gate di sprint checklist ("+1 step").

## Skor & gate (model final), sumber kebenaran: `tis-govern-endtoend.md`

Peta otoritas di atas diterjemahkan jadi model skor & gate yang sekarang dipakai plugin + dashboard:

- **EQI (skor campuran) dipensiunkan.** Screen dinilai lewat **Skor Aksesibilitas** (deterministik). Usability (rubrik AKSA) = **pengaya**, tidak nge-gate.
- **Gate rilis = 2 sinyal stabil:** (1) semua screen **aksesibilitas ≥ floor** (deterministik), dan (2) **journey tidak broken**. Cocok dengan peta otoritas: yang "deterministik/pasti" boleh menahan rilis, yang "heuristik/perlu manusia" tidak.
- **Trust ladder journey verdict:** vonis journey dari AKSA (AI) = **advisory** kecuali dikonfirmasi struktur deterministik atau override manusia; pakai confidence N-run + audit override. Sejalan dengan baris "UX Psychology = perlu manusia" di tabel di atas.
- **User Behaviour & Data** tetap **pengali prioritas** (Fase 2), dan sekalian validasi prediksi journey lawan drop-off nyata (`matched-dropoff`).

Detail rumus, Feature Snapshot schema, dan rollup: lihat `tis-govern-endtoend.md`. Trust ladder buat BOD: `TIS_Slide_TrustLadder.pptx`.

## Usability = Nielsen's 10 Heuristics (dasar penilaian AKSA)

Biar skor usability tidak arbitrary, AKSA di-ground ke **10 Usability Heuristics dari Nielsen Norman Group** (standar industri sejak 1994). Posisi jadi sejajar: **Aksesibilitas = WCAG 2.2 · Usability = Nielsen heuristics.** Dua standar yang diakui, bukan intuisi tim. Sumber: https://www.nngroup.com/articles/ten-usability-heuristics/

**Peta 10 heuristik → level cek AKSA:**

| # | Heuristik | Level | Cek AKSA |
|---|---|---|---|
| 1 | Visibility of system status | per-layar (parsial) + journey | indikator loading/status/progress |
| 2 | Match system & real world | **per-layar** | istilah familiar, bukan jargon |
| 3 | User control & freedom | journey | back/cancel/undo, jalan keluar |
| 4 | Consistency & standards | **per-layar + antar-layar** | konsisten komponen/istilah (Design System) |
| 5 | Error prevention | per-layar + journey | konfirmasi aksi destruktif, constraint input |
| 6 | Recognition, not recall | **per-layar** | info yang perlu terlihat, tidak mengingat |
| 7 | Flexibility & efficiency | journey | jalan pintas, task depth |
| 8 | Aesthetic & minimalist | **per-layar** | tidak ramai/noise, fokus, hierarki |
| 9 | Recognize & recover from errors | per-layar (error state) + journey | pesan error jelas + solusi |
| 10 | Help & documentation | **perlu manusia** | flag task kompleks tanpa bantuan (tidak di-skor otomatis) |

**Pembagian sesuai arsitektur TIS:**
- **Skor usability per-screen (tab Layar)** = **6 dimensi praktis, tiap dimensi berlandaskan heuristik Nielsen** (biar konkret & terasa "desain", tapi tetap ter-ground): hierarki-visual (**#8**), kejelasan-label (**#2/#6**), beban-kognitif (**#6**), konsistensi (**#4**), penonjolan-aksi (**#1/#8**), alur-baca (**#8**).
- **Per-journey (tab Alur / Task Walkthrough)** = #1, #3, #5, #7, #9.
- **Perlu manusia** = #10.

Kenapa 6 dimensi (bukan nama heuristik mentah): lebih konkret & actionable buat desainer, sambil tetap bisa dijelaskan sebagai heuristik Nielsen (di plugin tiap dimensi diberi tag #-nya).

**Scoring:** tiap dimensi dinilai **baik/cukup/kurang** + **saran konkret cara naik ke 'baik'**; `skor = 100 × (1 − rata penalti)` (baik=0, cukup=0.5, kurang=1), temuan aktif memotong tambahan (maks −25). Skor dibuat **responsif**: kalau layar sudah dibenahi, status dinaikkan ke 'baik'. Tetap **pengaya, bukan gate** (konsisten model final). #10 di-flag, tidak di-skor.

**VoC nyata → heuristik (bukti kriterianya relevan, bukan ngarang):**

| Keluhan pengguna | Heuristik dilanggar |
|---|---|
| "istilah sok asik" | #2 match real world |
| "kebanyakan pilihan/iklan/loading" | #8 minimalist · #1 status |
| "menu membingungkan" | #6 recognition · #4 consistency |
| "error gak jelas / server ga memuat" | #9 error recovery · #1 status |
| "4 step belum ketemu paket" | #7 efficiency |

Artinya TIS mengukur persis apa yang user keluhkan, dipetakan ke standar Nielsen.

**UX Laws tetap dipakai, sebagai mekanisme, bukan daftar terpisah.** UX Laws menjelaskan & mempertajam heuristik tertentu + memberi sinyal terukur:
- **Hick's Law** (banyak pilihan → lama mutusin) menopang **#8 minimalist / #6 recognition** (hitung jumlah pilihan).
- **Fitts's Law** (ukuran & jarak target) → tap target & efisiensi aksi; sebagian sudah **deterministik** di lapis aksesibilitas (area tap < 44px).
- **Jakob's Law** (user berharap konsisten dgn app lain) menopang **#4 consistency & standards**.

Jadi: Nielsen = kerangka "apa yang dicek", UX Laws = "alasan + cara ngukur" sebagian cek itu. Saling melengkapi, tidak bersaing.

## Lensa psikologi & etika (kurasi ~15 konsep · terinspirasi Built for Mars UX glossary)

Memperkaya lapis **UX Psychology** (otoritas paling lemah di model 7-sumber). **Perlu manusia, TIDAK nge-gate, TIDAK auto-fix.** Bukan skor baru, ini **knowledge base** untuk dua hal:

1. **Kosakata "kenapa"**: AKSA menamai prinsip di balik temuan (feedback jadi kredibel & mendidik), memperkuat penjelasan skor Nielsen.
2. **Lensa etika / dark-pattern**: menandai pola persuasi manipulatif (relevan buat app Telkomsel yang penuh promo/iklan). Sifatnya **flag**, bukan vonis.

*Atribusi: konsep dasar (Hick's, Loss Aversion, dst) publik; kurasi & sebagian istilah dari **Built for Mars UX glossary** (builtformars.com/ux-glossary). Definisi ditulis ulang dengan kata sendiri, jangan salin verbatim.*

**Kognitif (terbaca per-layar):**

| Konsep | Arti singkat (kata sendiri) | Menopang |
|---|---|---|
| Cognitive Load | beban memori kerja untuk selesaikan tugas | #6 |
| Hick's Law | makin banyak pilihan, makin lama memutuskan | #8 |
| Decision Fatigue | makin sering disuruh memilih, makin lelah/asal | #8 |
| Selective Attention | mata fokus ke satu titik, sisanya terabaikan | #1 · #8 |
| Pattern Matching | orang mencari pola yang familiar | #4 |
| Progressive Disclosure | sembunyikan kerumitan, buka bertahap | #8 |
| Serial Position | item di awal & akhir paling diingat | #8 · journey |
| Framing | cara menyajikan info mengubah pemahaman | #2 |

**Journey / flow:**

| Konsep | Arti singkat | Menopang |
|---|---|---|
| Goal Gradient | progres yang terlihat memotivasi menyelesaikan | journey |
| Peak-end Rule | pengalaman dinilai dari momen puncak & akhir | journey |
| Doherty Threshold | antarmuka lambat (>~0,4 dtk) bikin bosan/hilang fokus | #1 (status/kecepatan) |

**Etika / dark-pattern (flag, perlu manusia):**

| Konsep | Yang ditandai AKSA |
|---|---|
| Scarcity Effect | urgency/stok terbatas yang berpotensi palsu (countdown, "tinggal 2") |
| Decoy Effect | opsi umpan untuk menggiring pilihan tertentu |
| Foot-in-the-door (FITD) | consent/komitmen dicicil diam-diam sampai besar |
| Reactance | memaksa aksi/persetujuan → memicu penolakan |
| Intentional Friction | friksi asimetris (gampang daftar, susah cancel/unsub) |
| Loss Aversion | menakut-nakuti kehilangan untuk mendorong aksi |

**Batas jelas:** lensa ini menambah *kualitas penjelasan* dan *deteksi risiko etis*, bukan angka gate. Konsisten dengan hierarki: WCAG (gate) · Nielsen (skor usability) · UX Laws + psikologi (mekanisme, kosakata, etika, perlu manusia).

---

## Analisa Journey: Task Walkthrough (AKSA jadi user)

Ini analisa AI ketiga di TIS (selain rubrik per-layar & analisa alur heuristik). Fungsinya menjawab: *"kalau dirangkai jadi journey, user awam bisa menyelesaikan task-nya nggak?"* → hasilnya **PASS / BROKEN** (gate stabil), bukan skor.

### Metode: Cognitive Walkthrough + simulated UT (BUKAN heuristic evaluation)
AKSA berperan jadi **user paling kesulitan** (awam/lansia/low-literacy) dan mencoba menyelesaikan task langkah demi langkah. Ini metode **behavioral/task-based**, komplemen (bukan pengganti) rubrik Nielsen per-layar. Triangulasi: rubrik & analisa alur = "inspeksi ahli pakai checklist"; walkthrough = "nyoba beneran pakai orang awam".

### Kerangka teori
- **Dasar: Norman's Gulfs** (inti cognitive walkthrough). Tiap langkah nilai dua jurang:
  - **Gulf of Execution**, user tahu *cara bertindak* (aksi yang benar jelas & bisa dikenali) atau harus menebak? *(awam: "tahu harus ngapain?")*
  - **Gulf of Evaluation**, setelah beraksi, user tahu *hasilnya* (berhasil? di layar yang benar? langkah berikutnya apa)? *(awam: "tahu udah kejadian apa?")*
- **Operasional: Wharton 3-questions** (turunan gulfs): NOTICE (sadar aksi tersedia) · MATCH (hubungkan label ke tujuan) · FEEDBACK (yakin setelah klik).
- **Hick's Law / choice overload** untuk langkah keputusan.

### Dua jenis langkah (WAJIB dibedakan)
1. **Navigasi (findability)**: cari tombol lanjut yang jelas.
2. **Keputusan (decidability)**: memilih di antara banyak opsi (mis. pilih paket). Task baru BERHASIL kalau user bisa **yakin memilih yang tepat**, bukan sekadar bisa klik salah satu. Banyak opsi mirip + differensiasi tidak jelas → kewalahan/menebak → **RAPUH** (ini sering yang bikin user asli kesulitan di UT, dan yang paling gampang under-detect kalau cuma cek navigasi).

### Aturan findability (anti dua arah)
- **existence ≠ findability**: label ada ≠ user pasti menemukannya.
- **best-match first**: pilih label yang paling tepat & menonjol; jangan puas dengan match sebagian.
- Label tepat **menonjol → berhasil**; **tenggelam/kecil/ambigu → rapuh**; **tidak ada yang cocok → gagal**.

### Grounding anti-halusinasi
- **Teks asli tiap layar** dikirim ke prompt (dari scene-graph Figma, `screenTexts`) → AKSA **dilarang bilang label "tidak ada" kalau teksnya ada**, dan **dilarang mengarang** nama tombol/paket/layar.
- **Label opsi di peta alur = teks tombol asli** (`nodeText`, bukan nama layer teknis) → AKSA bisa mencocokkan opsi ke tujuan dengan benar.
- **Dilarang klaim angka teknis** (ukuran px, kontras, jarak "berdekatan"), itu wilayah scanner deterministik. Kesulitan disampaikan sebagai *pengalaman user*, bukan klaim teknis.
- **Wiring-gap ≠ cacat UX**: kalau tombol yang tepat jelas & menonjol tapi belum di-wire di prototype, ditandai sebagai *masalah wiring*, bukan divonis journey rapuh.

### Tangga verdict dari ketertemuan label (penentu utama)
Ini yang memisahkan rapuh dari gagal, dan sempat hilang dari prompt sehingga hasilnya terlalu optimis (`aksa-calibration-notes.md` §19).

| Kondisi di suatu langkah | Verdict run |
|---|---|
| Ada label yang cocok dengan maksud task, dan menonjol | mulus |
| Ada label yang cocok, tapi tenggelam, kecil, atau ambigu | **rapuh** |
| **Tidak ada** label yang cocok, sehingga harus menebak elemen tanpa label | **gagal** |

Langkah menebak ditandai `guessed`, dan **ditegakkan deterministik di kode**: run yang punya langkah `guessed` otomatis turun jadi `gagal`, dengan alasan ditampilkan terbuka. Rapuh hanya untuk user yang ragu **padahal labelnya ada**.

### Bias peta (keterbatasan mendasar)
AKSA diberi peta alur berisi semua opsi beserta layar tujuannya, supaya bisa menerjemahkan nama layer jadi tujuan. Konsekuensinya: **AKSA tidak pernah benar-benar tersesat**, karena bisa melihat kunci jawaban. Ini bias optimis sistematis yang membuat hasil menumpuk di "berhasil" dan "rapuh".

Mitigasinya tiga lapis: dilarang memilih elemen dengan alasan peta menunjukkan jalan ke goal, langkah tanpa label yang cocok ditandai `guessed`, dan penurunan verdict ditegakkan di kode. Terbukti lewat rekaman uji manusia yang gagal pada task yang semula dinilai hanya rapuh.

### Verdict, agregasi, stabilitas
- Verdict per run: **berhasil / rapuh / gagal / nyasar**.
- Dijalankan **N=5** run → distribusi → headline (Konsisten berhasil / Hasil campur rawan gagal / Mayoritas gagal) → status gate PASS/BROKEN.
- **Variasi antar-run = sinyal rapuh** (journey kokoh selalu 5/5; broken selalu gagal; rapuh loncat-loncat).
- **Hasil di-pin (cache) per journey** biar tidak loncat tiap scan; tombol **↻ Fresh** buat ulang dari nol (temperature tak tersedia di model, jadi determinisme lewat caching).

### Sintesis lintas-run (analisa menyeluruh)
Setelah 5 run, 1 call sintesis merangkum (grounded pada fakta run, dilarang halu):
`broken_at` (layar+elemen eksak) · `friction_point` · `divergence` (di mana run mulai beda jalan) · `failure_modes` · `root_cause` (boleh sebut jurang Norman: execution/evaluation) · `affected` (persona) · `confidence` (dari konsistensi run) · `top_fix` · `fixes` (2-4 prioritas, konkret).

### Triangulasi walkthrough × heuristik (Nielsen)
Sintesis ikut membaca hasil **analisa alur heuristik (FLOW)** dan merekonsiliasi dua sumber bukti (**perilaku** (walkthrough) + **inspeksi** (heuristik)) lewat field `evidence` di tiap fix:
- **Muncul di walkthrough DAN dilanggar aspek heuristik** = bukti **terkuat** → prioritas utama, `evidence="walkthrough+heuristik"` (chip merah di UI).
- **Heuristik nandai masalah TAPI walkthrough mulus** = kemungkinan **false positive** heuristik → diturunkan/dianulir (nggak bikin panik palsu).
- **Walkthrough kesulitan TAPI heuristik aman** = **gap yang inspeksi lewat** → tetap diangkat, `evidence="walkthrough"`.
- Syarat: jalankan **Insight perbaikan (FLOW)** dulu, lalu **Task Walkthrough**: sintesis otomatis nggabungin keduanya. Kalau cuma walkthrough, tetap jalan (bukti perilaku saja).

### Tiering, leverage & confidence rekomendasi
Tiap `fix` dari sintesis diberi tiga penanda supaya bisa langsung diprioritaskan (bukan daftar datar):
- **`tier`**: **blocker** (bikin user gagal / task tak selesai) › **friksi** (selesai tapi ragu/lambat/rawan salah = rapuh) › **polish** (minor, bukan penghambat). Kartu di UI diwarnai per tier; urutan blocker → friksi → polish.
- **`top_fix`**, satu **perbaikan akar berleverage tertinggi**: yang menuntaskan blocker terparah atau meredakan paling banyak friksi sekali benah, plus efek berantainya. Ditampilkan sebagai kotak "⚡ Paling berleverage".
- **`certainty`**: **yakin** (bukti perilaku konsisten lintas run / bukti ganda) vs **perlu-cek** (kesimpulan analisa statis yang butuh validasi manusia, mis. discoverability/signifier, atau cuma 1 run). Yang `perlu-cek` diberi chip "⚑ perlu cek manusia", sejalan trust ladder (AI advisory, manusia yang putuskan).

### Model: hybrid Opus × Sonnet
AKSA pakai dua model sesuai beban tugas: **Opus** (`MODEL_JUDGE`) untuk pass **judgment-heavy call-tunggal**, rubrik per-layar, analisa FLOW, sintesis walkthrough (di sinilah nuansa hierarki/konsistensi/akar-masalah paling ngaruh). **Sonnet** (`MODEL`) untuk pass **volume + vision berulang**, 5× run Task Walkthrough per-journey (hemat biaya & latency, karena tiap orang pakai API key sendiri). **Fallback otomatis**: kalau key user belum punya akses Opus, call judgment mendeteksi error model lalu retry ke Sonnet (sekali deteksi → seterusnya langsung Sonnet), plus banner pemberitahuan di UI. Catatan: pilihan model **bukan** pengganti kalibrasi prompt, false positive umumnya celah logic prompt, diperbaiki lewat kalibrasi; Opus cuma bonus ketajaman.

### Konteks journey = Auto (zero config)
TIS **tidak** meminta designer mengklasifikasi journey (tipe/prioritas) lewat form. Keputusan desain: presisi journey datang dari **kualitas "Tujuan journey"** yang diketik + layar yang dibaca AI, bukan dari user memilih taksonomi. **Tipe** (task-terarah vs eksplorasi) di-infer AI dari intent + layar. **Prioritas** (core/niche) sengaja TIDAK diminta, itu fakta strategi produk yang designer sering tak tahu, dan justru yang AI dilarang mengarang; kalau tak tahu, rekomendasi penempatan diframe kondisional, bukan divonis. Prinsip: **jalan tanpa konfigurasi, scalable lintas journey/tim; satu-satunya input = intent** (makin spesifik → makin tajam inference-nya).

### Hubungan ke gate & trust ladder
- Journey = **gate stabil** (PASS/BROKEN), setara aksesibilitas floor. Detail: `tis-govern-endtoend.md`.
- Vonis **murni-AI** journey = **advisory** (trust ladder); confidence dihitung dari konsistensi N=5 run; manusia override & jadi bahan kalibrasi.

### Roadmap lensa (belum diimplement)
Sudah: **Norman's Gulfs + Hick's Law + findability**. Bisa ditambah bertahap: Miller's Law (7±2), Recognition-over-recall (#6), Feedback/Visibility (#1), Error prevention & recovery (#5/#9) + reversibility, Plain-language (low-literacy). Sengaja TIDAK dipakai di walkthrough: Fitts's Law & Proximity/Similarity (itu wilayah scanner/rubrik, bukan journey).
