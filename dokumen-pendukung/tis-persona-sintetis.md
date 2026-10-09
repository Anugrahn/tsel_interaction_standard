# TIS · Simulasi Persona Sintetis

*10 Oktober 2026. Mode ketiga di tab Flow: AKSA menjadi satu pengguna dengan pola perilaku nyata, berjalan layar demi layar tanpa peta, dengan kendala inklusif yang ditegakkan kode.*

Sumber persona: `reserarch/TIS_persona_research_v1.html` (9.647 sesi MyTelkomsel, 24 Agustus 2026).
Kode: `plugin/ui.html`, blok `SIMULASI PERSONA`, `PERSONA_SYS`, `KNOWLEDGE.persona`, `KNOWLEDGE.kendala`.

---

## 1. Masalah yang diselesaikan

Task Walkthrough (`TW_SYS`) memerankan satu "pengguna paling kesulitan" yang menerima **semua layar dan peta alur sekaligus**. Catatan kalibrasi sudah mencatat tiga akibatnya:

| Catatan | Gejala | Akar |
|---|---|---|
| §19 | AKSA hampir tidak pernah gagal | dia memegang peta, tahu tiap tombol menuju ke mana |
| §25 | 5/5 berhasil di layar 36 teks | kata di task bocor jadi label, AKSA cuma mencocokkan kata |
| §28 | layar padat lolos hijau | teks datang sebagai daftar rata, mencari tidak berbiaya |

Semua mitigasi di TW_SYS berbentuk **larangan di prompt**. Riset luar menunjukkan pola yang sama: agen bilang dirinya pemula tapi bertindak seperti ahli, karena persona yang ditulis sebagai kata sifat tidak mengubah apa yang agen lihat.

Simulasi persona mengubah **apa yang dilihat**, bukan apa yang diminta.

---

## 2. Cara kerja

```
code.js  getFlow       → graph[].actions = { label, txt, box, nid, toId, auto }
code.js  getFlowShots  → shot = { png skala 1.0, texts{x,y,pos}, sr[], w, h }   (reqId digaungkan)

ui.html  untuk tiap persona × kendala × run:
           langkah 1..12:
             simView()   rakit SATU layar: gambar (dipotong/difilter), tulisan, DAFTAR AKSI bernomor
                         tanpa nama frame, tanpa tujuan tombol
             apiFetch()  PERSONA_SYS + view  →  { lihat, pikir, aksi, confused, guessed, ingat }
             simRun()    kode yang memindahkan: aksi n → toId, kembali → pop, gulir/geser → bagian lain
                         kode yang menentukan sampai: layar == End Screen
           simVerdict()  tangga yang sama dengan walkthrough
         personaSummary() → per kombinasi: sampai/n, rasio mundur, titik gagal, BELUM LENGKAP
```

**Yang ditegakkan kode, bukan diminta ke model:**

| Aturan | Cara |
|---|---|
| Tanpa peta | `toId` tidak pernah dikirim. AKSA hanya tahu label dan posisi |
| Nama layer tidak bocor | Frame disebut "layar ke-n". Ikon tanpa teks disebut "(ikon/gambar tanpa tulisan)", bukan nama layernya |
| Sampai atau tidak | Kode mencocokkan layar dengan End Screen. Klaim "selesai" di layar lain = nyasar |
| Menebak = gagal | Run yang sampai lewat langkah `guessed` divonis gagal, sama seperti walkthrough |
| Pindah otomatis | Layar yang cuma punya after-delay dilewati otomatis, tidak ditawarkan sebagai tombol |

---

## 3. Persona (perilaku, bukan demografi)

| Kunci | Persona | Bukti | Mekanik | Dipakai saat |
|---|---|---|---|---|
| `lancar` | Lancar | n=472, konversi 84,7% | ingatan penuh | **selalu**, sebagai pembanding |
| `bolakbalik` | Bolak-balik | n=271, konversi 34,3% | **ingatan dipotong ke satu catatan, maks 12 kata** | navigasi atau tombol kembali berubah |
| `lamapaham` | Lama Paham | n=830, konversi 37,0% | **tulisan dan label tidak diberikan, baca dari gambar** | teks, susunan info, atau warna berubah |
| `teralih` | Teralih | **dugaan** (2 dari 4 tanda) | label promo ditandai `[promo]` | promo baru di tengah alur, **jangan dipakai memutuskan** |

Ditolak: persona umur ("GenZ", "ortu") dan persona nama (Pak Tri, Hadi). Alasannya Kirschner & De Bruyckere 2017 di riset kita, dan Wang dkk. (LLM yang diberi identitas demografis cenderung memotret stereotip dan meratakan kelompok). Nama tetap dipakai untuk cerita di deck, tidak untuk simulasi.

---

## 4. Kendala inklusif (ditempel ke persona)

| Kunci | Profil | Yang ditegakkan kode | WCAG |
|---|---|---|---|
| `normal` | - | tidak ada | - |
| `teks200` | vision | hanya separuh layar per pandangan, perlu `gulir`; label > 18 huruf dipotong | 1.4.4 |
| `katarak` | vision | gambar diberi filter katarak (sama dengan Simulation Lens), tulisan tidak diberikan | - |
| `terik` | vision | gambar dipudarkan, tulisan tidak diberikan | - |
| `pembesar` | vision | hanya seperempat layar per pandangan, perlu `geser`, tiap geser makan satu langkah | 3.2.3 |
| `screenreader` | blind | **tanpa gambar**. Hanya urutan baca dari scene graph; tombol tanpa teks bernama generik dibacakan "tombol (tanpa nama)" | 4.1.2, 1.3.2 |
| `motorik` | motor | target < 24px berpeluang 35% meleset ke tetangga ≤ 8px, < 44px 15%. **Diundi kode**, benih tetap per run | 2.5.8 |
| `literasi` | lowlit | istilah di `KNOWLEDGE.jargon` diganti `???` | - |

Aturan dari riset: **simulasi tanpa satu pun kendala ditandai BELUM LENGKAP.** Standarnya Teks 200%.

Daftar `jargon` dan peluang meleset motorik adalah **Tier C**: titik awal yang masuk akal, bukan hasil ukur. Kalibrasi dari sesi UT selama pilot.

---

## 5. Cara pakai (desainer)

1. Tab **Flow**, isi **Tujuan journey** sebagai keinginan orang, bukan nama fitur. "Internet di rumah lambat, mau lebih kencang", bukan "upgrade paket utama" (lihat §25).
2. Pilih **End Screen**. Tanpa itu hasil hanya "klaim", tidak terverifikasi.
3. Mode **👥 Persona**. Biarkan Lancar menyala. Tambah persona sesuai apa yang berubah di desain (tabel §3).
4. Pilih minimal satu kendala inklusif. Lihat perkiraan jumlah panggilan AI sebelum menekan Jalankan.
5. Baca hasil sebagai **selisih terhadap Lancar tanpa kendala**, bukan skor tunggal. Klik baris untuk melihat jejak tiap run: layar, aksi, alasan, ragu/menebak/meleset.

Biaya: tiap langkah satu panggilan `MODEL` dengan satu gambar. 2 persona × 2 kendala × 3 run × ~6 langkah ≈ 72 panggilan.

---

## 6. Kalibrasi sebelum dipercaya

Ini satu-satunya simulator di TIS yang punya **target angka nyata**:

| Persona | Rasio mundur di data asli |
|---|---|
| Lancar | 0,27 |
| Bolak-balik | 0,70 |

Prosedur:

1. Ambil prototype alur **produksi yang sekarang** (misalnya beli paket di MyTelkomsel) dari Figma.
2. Jalankan Lancar dan Bolak-balik, tanpa kendala, 5 run.
3. Kotak "Cek kalibrasi" menampilkan rasio simulasi di samping data asli.
4. Kalau meleset jauh, **jangan pakai hasilnya untuk desain baru**. Setel `KNOWLEDGE.persona[*].perilaku`, ulangi.

Ini mengikuti pendekatan simulasi e-commerce yang dikalibrasi terhadap clickstream (SimGym, SimPersona): bukti realisme adalah kecocokan dengan perilaku yang sudah tercatat, bukan kesan "terdengar seperti manusia".

---

## 7. Hubungan ke gate dan Govern Store

- **Advisory.** Tidak mengubah `journeyVerdict()`, tidak masuk TIS Score, tidak menahan rilis. Comparator memastikan blok gate tidak berubah (12 baris ditambah, 0 baris dihapus).
- Saat Submit feature, hasil masuk Feature Snapshot sebagai `persona_sim` (per kombinasi: sampai, rasio mundur, titik gagal, profil).
- Measurement Spec mendapat `persona_profil_berisiko`: profil yang tingkat sampainya ≥ 1/3 di bawah Lancar tanpa kendala. Setelah rilis, dibandingkan dengan completion rate segmen lewat `a11y_font_scale`, `a11y_screen_reader`, dan lain lain. Inilah yang membuat prediksi persona **bisa dibantah**.

---

## 8. Batas jujur

- Vision model tetap membaca gambar lebih baik daripada mata katarak sungguhan. Filter dan pemotongan mendekatkan, tidak menyamakan.
- Urutan screen reader adalah **perkiraan posisi** (atas ke bawah, kiri ke kanan). Urutan sebenarnya ditentukan implementasi.
- Persona tidak mengalami lelah, waktu, atau gangguan dunia nyata. Rasio mundur bisa dikalibrasi; waktu belum.
- Prototype yang wiring-nya tidak lengkap membuat persona "nyasar" padahal desainnya benar. Cek peringatan "layar tak terjangkau" dulu.
- Teralih masih dugaan. Hasilnya untuk eksplorasi, bukan keputusan.
