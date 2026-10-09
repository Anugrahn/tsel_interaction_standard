# Design System TIS v4

Gabungan v2 dan v3. **Kanvas dari v2, tipografi dan pola konten dari v3.**

Bukan kompromi di tengah. Tiap bagian diambil dari versi yang memang lebih kuat di bagian itu, dan yang tidak terpakai dibuang dengan alasan tertulis.

---

## 0. Prinsip yang mengikat semua keputusan

**TIS hidup menempel di sebelah desain yang sedang dinilai.** Itu satu kalimat yang menentukan hampir semua pilihan di bawah.

| Konsekuensi | Aturannya |
|---|---|
| Panel bersaing dengan artboard | Chrome rendah saturasi. Tidak ada warna jenuh menutupi bidang besar. |
| TIS menilai warna | Chrome tidak boleh mewarnai mata penilainya. Simultaneous contrast itu nyata. |
| Dipakai berjam-jam | Tidak ada permukaan putih besar. Silau menumpuk sepanjang hari. |
| Warna punya arti | Merah, kuning, hijau hanya untuk status. Tidak pernah untuk dekorasi. |

**Empat aturan keras.**

1. Warna status **tidak pernah** dipakai sebagai warna merek, dekorasi, atau latar besar.
2. Semua pasangan teks dan latar **wajib** lulus 4.5:1. Alat penilai aksesibilitas tidak boleh gagal ujinya sendiri.
3. Token teks **tidak boleh** dipakai sebagai latar. Ini bug yang sudah kejadian dan menghasilkan putih di atas putih.
4. Setiap warna baru harus dihitung, bukan dipilih karena kelihatan enak.

---

## 1. Permukaan

Diambil dari **v2**, dengan glow ungu dibuang.

| Token | Nilai | Cara membuatnya | Dipakai untuk |
|---|---|---|---|
| `--l0` | `#000C1F` → `#000918` | gradient linear ke bawah | kanvas panel |
| `--l1` | `#0F1826` | putih 6% di atas L0 | kartu, permukaan utama |
| `--l2` | `#1A222F` | putih 10% di atas L0 | kartu terbuka, blok bersarang |
| `--inv` | `#FFFFFF` | putih pekat | **hanya** state terpilih |
| `--on-inv` | `#0B1020` | | teks di atas state terpilih, 18,9:1 |

**Kenapa glow ungu dibuang.** Dia dekorasi yang menaikkan kompleksitas latar tanpa menambah informasi, dan membuat penempatan warna status jadi sulit. Waktu masih ada, 18 pasangan teks gagal kontras. Setelah dibuang, latar bisa dihitung dengan pasti karena nilainya tetap.

**Kenapa tidak ada kartu putih seperti v3.** Kartu putih di atas biru memang kontrasnya tinggi dan enak dibaca sebentar. Tapi panel ini dipelototi berjam-jam, dan permukaan putih besar membuat mata lelah. v3 dipakai polanya, bukan permukaannya.

**Hanya tiga lapis.** Lebih dari tiga membuat kedalaman berhenti berarti. Kalau butuh pemisahan lagi, pakai garis putus, bukan lapis baru.

---

## 2. Warna

### Netral

| Token | Nilai | L0 | L1 | L2 | Dipakai untuk |
|---|---|---|---|---|---|
| `--tx-1` | `#FFFFFF` | 19,96 | 17,84 | 16,05 | judul, angka, isi utama |
| `--tx-2` | `#C3C8D4` | 11,91 | 10,65 | 9,58 | penjelasan, alasan |
| `--tx-3` | `#9AA0AE` | 7,62 | 6,81 | 6,13 | label, meta, satuan |

Tiga tingkat saja. v1 punya lebih dari sepuluh warna teks dan hasilnya hierarki tidak terbaca.

### Status

Semua sudah dihitung ulang untuk latar gelap. Nilai v3 dirancang untuk kartu putih, jadi tidak bisa dipakai langsung.

| Peran | Token | Nilai | L1 | L2 | Arti |
|---|---|---|---|---|---|
| Pelanggaran | `--st-red` | `#F2586E` | 5,43 | 4,89 | kegagalan WCAG yang pasti, menahan rilis |
| Potensi | `--st-amb` | `#E8B600` | 9,45 | 8,50 | perlu keputusan manusia |
| Lolos | `--st-grn` | `#2BA875` | 5,91 | 5,32 | aman |
| Referensi | `--st-blu` | `#6E95BE` | 5,70 | 5,13 | sumber referensi, bukan preskriptif |
| Profil | `--st-vio` | `#9B85CB` | 5,62 | 5,05 | atribusi profil kapasitas |

### Sorot

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--hi` | `#FFD84D` | satu kata yang ditonjolkan di judul, dan kartu satu pesan |
| `--on-hi-1` | `#1A1400` | judul di atas kartu sorot, 13,3:1 |
| `--on-hi-2` | `#3D3000` | badan di atas kartu sorot, 9,4:1 |

Diambil dari v3, tapi diturunkan dari `#FFE500` supaya tidak terlalu berteriak di sebelah artboard.

### Merek

| Token | Nilai | Aturan |
|---|---|---|
| `--brand` | `#E60012` | **Hanya** logo dan tombol utama. Tidak pernah untuk status. |

Merah merek Telkomsel dan merah pelanggaran sengaja **berbeda nilainya**. Kalau sama, orang tidak bisa membedakan mana identitas mana peringatan.

### Tint latar

Kotak peringatan memakai warnanya sendiri pada 16 persen di atas L1.

| Jenis | Tint | Teks | Rasio |
|---|---|---|---|
| Merah | `#342231` | `#F2586E` | 4,51 |
| Amber | `#323120` | `#E8B600` | 6,97 |
| Hijau | `#142F33` | `#2BA875` | 4,70 |
| Biru | `#1E2C3E` | `#6E95BE` | 4,52 |

---

## 3. Tipografi

Bagian yang paling banyak diambil dari **v3**, dan yang paling mengubah rasa.

Keluarga: satu geometris tebal. `Plus Jakarta Sans` sebagai kandidat, atau `Inter` dengan tracking dirapatkan kalau tidak boleh menambah berkas font.

### Skala

| Peran | Ukuran | Berat | Tracking | Contoh |
|---|---|---|---|---|
| Skor | 56 | 800 | −4,5% | `72` |
| Judul vonis | 24 | 800 | −3,5% | `Sampai tujuan, tapi lewat keraguan` |
| Empty state | 32 | 800 | −4% | `tidak ada jalur buntu` |
| Angka statistik | 22 | 800 | −3% | `3rute` |
| Judul kartu | 15 | 700 | −2% | `Teks terlalu samar dibanding latar` |
| Judul seksi | 14 | 700 | 0 | `Segmen paling tertinggal` |
| Badan | 13 | 500 | 0 | alasan, penjelasan |
| Meta | 12 | 500 | 0 | `text 2.9:1 · Label harga paket` |
| Label | 11 | 600 | +2% | `Pelanggaran`, `Potensi` |
| Satuan menempel | 11 sampai 20 | 800 | −2% | `%`, `rute`, `×` |

Sepuluh tingkat. v1 punya delapan belas, dan setengahnya beda setengah piksel dari tetangganya, yang tidak terbaca sebagai hierarki.

### Tiga kebiasaan wajib, diambil dari GO Club

**Angka sebagai gambar.** Nilai utama dibuat sebesar judul atau lebih. Skor 56, angka statistik 22. Yang dinilai penting memang datanya.

**Satuan menempel tanpa spasi.** `44%`, `3rute`, `2×`, `38×38`, `2.9:1`. Angka besar, satuan kecil, menempel. Mata membaca angkanya dulu.

**Judul dua warna.** Bagian yang menurunkan vonis diberi warna, bukan diberi ukuran atau garis bawah.

```
✓ Konsisten berhasil
△ Sampai tujuan, [tapi lewat keraguan]   ← bagian dalam kurung warna amber
✕ Mayoritas user gagal
```

Aturannya: **yang diberi warna adalah bagian yang mengubah keputusan.** Bukan kata yang paling menarik.

---

## 4. Bentuk dan ruang

Diambil dari **v2**, sudah terbukti waktu memperbaiki spacing.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--sp1` | 4 | jarak label ke sub-label |
| `--sp2` | 8 | gap dalam baris, judul ke isi |
| `--sp3` | 12 | jarak antar blok |
| `--sp4` | 16 | inset panel, padding kartu |
| `--sp5` | 20 | padding kartu skor, padding samping nav |
| `--sp6` | 24 | padding blok kosong |

| Radius | Nilai | Dipakai untuk |
|---|---|---|
| `--r-lg` | 22 | kartu utama |
| `--r-md` | 16 | kartu dalam, blok bersarang |
| `--r-sm` | 10 | chip, kotak peringatan |
| `--r-pill` | 999 | tombol, segmented, tab, nav |

**Inset dipegang satu tempat.** `#app` memegang padding samping. Tiap blok cuma mengatur jarak bawahnya. Ini bukan preferensi, ini perbaikan dari bug nyata: waktu tiap komponen memasang margin sampingnya sendiri, satu aturan `#app > *` menghapusnya diam-diam dan sebagian blok jadi mepet ke tepi.

**Pemisah bergaris putus** di dalam kartu, bukan garis penuh. Diambil dari v3. Lebih lembut, dan membedakan pemisah dalam-kartu dari batas antar-kartu.

---

## 5. Komponen

### Kartu skor
Angka 56px berwarna status, nama skor 14px, vonis 12px berwarna sama, chip sumber. Baris statistik tiga kolom di bawah garis putus.

Gradien angka mengikuti pita nilai, bukan warna tetap. Ini bug yang sudah kejadian: gradien emas dipatok di CSS, jadi 99 dan 55 ikut kuning walaupun vonisnya berbeda.

### Segmented control
Pil, tinggi 48, radius penuh. Terpilih memakai `--inv` putih pekat dengan teks `--on-inv`. **Tidak menumpang token teks.**

### Tab filter
Pil, tinggi 38. Terpilih putih 20% dengan teks putih. Angka ikut di label, jadi tidak perlu kotak statistik terpisah.

### Kartu temuan
Ikon lingkaran 24px berisi warna status dengan huruf putih. Judul 15px, meta 12px, baris `kena:` profil. Dibuka memakai `--l2`.

### Kartu satu pesan
Diambil dari v3. Latar `--hi` pekat, judul `--on-hi-1`, badan `--on-hi-2`, tombol gelap di dalamnya. **Maksimal satu per layar.** Kalau ada dua, tidak ada yang menonjol lagi.

### Empty state
Judul 32px dua warna, badan 13px. Diperlakukan sebagai halaman, bukan sebagai kegagalan. `tidak ada` putih, `pelanggaran` dengan `--tx-3`.

### Bar nav
Pil mengambang, radius penuh, ikon 24px garis, label 11px. Terpilih memakai putih 20%, bukan putih pekat, supaya tidak bersaing dengan segmented di atas.

---

## 6. Yang dibuang dari tiap versi, dan alasannya

| Dari | Dibuang | Alasan |
|---|---|---|
| v1 | glassmorphism terang | Panel terang di sebelah kanvas Figma terang membuat batas alat dan karya kabur. |
| v1 | 65 warna, 18 ukuran font | Bukan sistem, kumpulan keputusan satu per satu. |
| v2 | glow ungu berlapis | Dekorasi yang menaikkan kompleksitas latar dan bikin kontras sulit dihitung. |
| v2 | tipografi sopan | Terbukti kalah cepat dibaca dibanding v3. |
| v3 | kanvas biru jenuh | Bersaing dengan artboard, dan menggeser persepsi warna penilainya. |
| v3 | kartu putih pekat | Silau menumpuk pada sesi panjang. |
| v3 | display 38 sampai 44px | Panel 380 lebar berisi daftar temuan, bukan poster. |

---

## 7. Cara memeriksa sebelum menambah apa pun

Sebelum menambah warna atau ukuran baru ke sistem ini, jalankan tiga pertanyaan.

**Apakah nilainya dihitung?** Kalau dipilih karena kelihatan enak, hitung dulu kontrasnya terhadap L0, L1, dan L2.

**Apakah dia menambah informasi?** Kalau cuma menambah rasa, dia dekorasi. Glow ungu gagal di pertanyaan ini.

**Apakah dia menabrak arti yang sudah ada?** Warna baru yang mendekati merah, kuning, atau hijau akan mengaburkan status. Ambil dari netral atau dari biru dan ungu.

---

## Lampiran: seluruh nilai lulus 4.5:1

Diverifikasi dengan komposit alpha di atas `#000918`, bukan diperkirakan.

| Kelompok | Jumlah pasangan | Terendah |
|---|---|---|
| Teks netral di tiga lapis | 9 | 6,13:1 |
| Warna status di dua lapis | 10 | 4,89:1 |
| Teks di dalam kotak tint | 4 | 4,51:1 |
| Teks di kartu sorot | 2 | 9,36:1 |
| State terpilih inverted | 1 | 18,93:1 |

**Nol pasangan di bawah ambang.**

Satu catatan kejujuran: nilai yang diturunkan dari GO Club adalah perkiraan dari tangkapan layar Mobbin, bukan sampel dari berkas desain. Yang dipinjam polanya, dan semua angka di dokumen ini dihitung ulang untuk latar gelap TIS, bukan disalin.
