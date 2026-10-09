# TIS v2, spesifikasi layar

Diambil langsung dari frame di halaman **TIS Redesign** (`527:66`), bukan dari ingatan atau tangkapan layar. Dipakai sebagai rujukan waktu membangun `ui.html` v2, supaya tidak ada lagi bolak-balik menebak.

Cara mengambilnya: menelusuri anak dari container `app` tiap frame, berurutan dari atas, beserta teks pertama tiap blok.

---

## Kerangka semua layar

Panel 380 lebar. Latar `#000918` dengan dua glow ungu `#44338C` dan `#5742B4` yang diblur 100 sampai 135.

| Bagian | Isi |
|---|---|
| Nav bar atas, y20 tinggi 44 | logo 32px, "Telkomsel Interaction Standard" 12px Semi Bold, "Ⓒ 2026" di kanan |
| `app`, padding 16, gap 12 | isi per tab, lihat di bawah |
| Tab Bar iPhone, tinggi 98 | pil mengambang radius penuh, tiga tab: Screen, Simulation, Flow |

Top bar **tidak punya latar sendiri**, dia duduk langsung di atas gradient.

---

## Tab Screen › Aksesibilitas

Urutan blok, dari frame A1 sampai A9.

1. `tabs` — segmented **Aksesibilitas / Usability**, tinggi 48, radius 12, tab aktif putih pekat teks `#1C1C1E` 14px Bold
2. `hero / EQI` — **hanya skor aksesibilitas**. Angka 60px Extra Bold bergradien, "Skor Aksesibilitas" 14px Bold, vonis 12px berwarna, chip "WCAG 2.2 · 7 sumber"
3. `segwrap` — judul "Kesiapan inklusif · per segmen" lalu empat baris segmen. Tiap baris: emoji, label 14px, persen 14px Bold, bar 5px track `#EEEFF1`
4. `fh` — "Filter Temuan", 14px Medium `#CED3D9`
5. `tabs` — filter **Pelanggaran (n) / Potensi (n) / Lolos (n)**, tinggi 38, aktif `#EDEDED` 30 persen
6. `find` — kartu temuan, radius 22, padding 16. Ikon lingkaran 24px, judul 14px Bold, baris layer 12px, baris `kena:` profil, chevron di kanan

**Tiga hal yang TIDAK ada di desain ini,** dan sempat saya bangun keliru:

- **Tidak ada baris "Usability (AKSA)" di hero.** Skor usability punya hero sendiri di tab Usability. Menaruh dua skor dalam satu kartu mengaburkan mana yang jadi dasar gate.
- **Tidak ada tiga kotak statistik** Pelanggaran, Potensi, Lolos. Angkanya sudah tertulis di tab filter, jadi kotak itu mengulang informasi yang sama sambil memakan sekitar 100px.
- **Tidak ada blok AKSA** di tab ini. Dia milik tab Usability.

### Keadaan kosong

Frame A5, A7, A8 menunjukkan pola yang sama:

1. blok `empty` dengan pesan sesuai tab
2. `fh` "Cek lanjutan"
3. `list` berisi "Struktur heading" dan "Urutan fokus"
4. catatan penutup: "Submit ke Govern Store dilakukan per feature di tab Alur"

Pesan kosong per tab: Pelanggaran "Tidak ada pelanggaran", Potensi "Tidak ada potensi pelanggaran", Lolos "42 elemen lolos aksesibilitas (teks, area tap, gambar yang aman)".

---

## Tab Screen › Usability

Urutan blok, dari frame B1 sampai B10.

1. `tabs` — segmented
2. `sidekick` — kartu Context halaman: dua kolom isian (konten, intensi) dan tombol "Tebak context (AKSA)"
3. **lencana knowledge** — `🧠 Knowledge <versi> · <n> aturan · 4 profil`
4. `hero / EQI` — **Skor Usability**, bentuk sama dengan hero aksesibilitas
5. `fh` — "RUBRIK USABILITY · HEURISTIK NIELSEN"
6. `rubrik /` — satu kartu per dimensi: nama, status, tag heuristik, alasan, lalu temuan yang menempel

Enam dimensi, urutannya tetap: Hierarki visual, Kejelasan label, Beban kognitif, Penonjolan aksi, Konsistensi, Alur baca.

### Keadaan lain di tab ini

| Frame | Keadaan |
|---|---|
| B1 | belum ada token, cuma kartu sidekick berisi input token |
| B2 | token tersambung, context kosong |
| B3 | sedang menebak konteks |
| B4 | konteks selesai ditebak |
| B5 | AKSA sedang bekerja |
| B6, B9, B10 | hasil dengan skor cukup, baik, perlu perbaikan |
| B7 | AI Vision, judul `fh` lalu kartu `ai card` per temuan |
| B8 | fallback dan peringatan: lencana knowledge rusak, banner token tanpa Opus, respons tidak terbaca sebagai JSON, lalu penjelasan bahwa ini kegagalan teknis bukan vonis desain |

---

## Sub-view Cek lanjutan

Frame C1 dan C2. Keduanya **tanpa segmented control**, dicapai dari daftar "Cek lanjutan".

**Struktur heading (C1):** judul "5 teks · urut posisi", lalu baris per heading berisi tingkat (H1, H2, body), teks, dan ukuran. Catatan penutup kalau tidak ada teks di scope.

**Urutan fokus (C2):** judul "6 elemen fokusable · urut Dev Mode", lalu baris bernomor per elemen. Catatan penutup berisi temuan, misalnya banner promo mendapat fokus sebelum tombol beli.

---

## Tab Flow

Urutan blok di frame Alur:

1. `details / Atur journey` — "🎯 Tujuan journey (apa yang user mau capai?)" dan kolom isian
2. `fh` — "Pilih Screen akhir journey"
3. `urutan layar` — kartu per layar dengan nomor langkah, penanda start dan end
4. pemisah
5. `fh` — "Pilih Mode Analisis"
6. `tabs` — "🧑‍🦯 AI Walkthrough" dan "⚡ Insight Flow"
7. paragraf penjelas AKSA
8. tombol "Jalankan Ulang"
9. `kartu vonis walkthrough`

**Satu perbedaan yang disengaja.** Frame ini menampilkan seluruh setup secara permanen. Di v2, setup melipat sendiri setelah tujuan dipilih, menyisakan satu baris ringkasan. Itu keputusan yang diambil terpisah lewat `tis-ramping-wireframe.html`, karena dengan setup permanen kartu hasil jatuh 100 persen di bawah batas layar. Frame Figma dibuat sebelum keputusan itu.

---

## Perbedaan lain yang perlu diputuskan

**Pita nilai skor.** Frame A3 menandai **55 sebagai merah "Perlu Perbaikan"**. Kode memakai batas 50 dan 80, jadi 55 masuk kuning "Cukup". Karena floor gate 80, skor 55 tetap tertahan rilis, sehingga kata "Cukup" bisa menyesatkan. Belum diputuskan.

**Segmen dilipat atau tidak.** Frame menampilkan empat segmen sekaligus. Di v2 hanya yang terburuk yang terbuka, tiga sisanya dilipat, hasil keputusan perampingan.

**Lencana knowledge kedaluwarsa di Figma.** Tertulis `2026-08-12 · 20/20 aturan aktif`. Yang benar `2026-08-26 · 34 aturan`.
