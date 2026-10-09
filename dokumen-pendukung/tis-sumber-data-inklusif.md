# TIS · Audit Sumber Data Inklusif

Ditelusuri 21 September 2026. Tiap angka yang dipakai di deck dilacak sampai sumber aslinya, lalu diverifikasi ke publikasi resmi.

**Ringkas: satu angka tidak punya sumber, dua angka kekecilan, satu angka salah satuan.**

---

## 1. Angka 57% low literacy

**Tidak ada sumbernya.**

Di dokumen kita, 57% disebut di lima tempat. Dua di antaranya mencantumkan asal:

| Berkas | Atribusi |
|---|---|
| `tis-model-penilaian.md` | "Low-literacy = segmen 57% (KOMINFO 2023)" |
| `tis-appendix-bod.md` | "PISA 2022 / KOMINFO 2023 · **[KONFIRM]**" |

Kominfo tidak pernah menerbitkan angka 57% soal literasi. Yang diterbitkan Kominfo adalah **Indeks Literasi Digital**, dan bentuknya **skor 1 sampai 5**, bukan persentase orang. Nilainya **3,65 pada 2023**, naik dari 3,54. Kalau dipaksa jadi persen, 3,65 dari 5 itu 73%, dan artinya pun kebalikan: itu tingkat kemampuan, bukan porsi yang tidak mampu.

Jadi 57% bukan salah kutip. Dia tidak bisa dilacak ke publikasi mana pun.

**Dokumen kita sendiri sudah menandainya.** `tis-appendix-bod.md` baris 12 menulis peringatan yang tidak pernah ditindaklanjuti:

> ada 2 set angka pasar yang beredar di dok kita, harus disatukan sebelum pitch. Deck hal. 11 pakai 22,5 jt disabilitas · 29 jt lansia · **57% low-literacy**; `tis-ringkasan.md` pakai 22,9 jt · 33,94 jt · 74,5% (PISA 2022). Pilih satu sumber resmi.

Peringatan itu ditulis, lalu dua set angka tetap jalan berdampingan sampai sekarang.

**Gantinya:** PISA 2022, **75% pelajar Indonesia di bawah Level 2 kemampuan membaca**. Angka ini resmi, terbit, dan bisa dikutip. Tapi baca batasannya di bagian 3 sebelum dipakai.

---

## 2. Tabel verifikasi

| Klaim | Di deck | Yang benar | Sumber | Status |
|---|---|---|---|---|
| Penyandang disabilitas | 22,5 juta | **22,97 juta** (~8,5% penduduk) | Kemenko PMK, merujuk data BPS | kekecilan |
| Lansia | 29 juta | **33,94 juta** (11,97% penduduk) | BPS, Statistik Penduduk Lanjut Usia 2025 | kekecilan 4,9 juta |
| Lansia 2045 | 65,82 juta | belum diverifikasi ke publikasi BPS | proyeksi, dikutip media | perlu dicek |
| Low literacy | 57% | **tidak ada sumbernya** | tidak ada | **ganti** |
| Pelajar di bawah Level 2 membaca | 74,5% | **75%** (25% mencapai Level 2 ke atas) | OECD PISA 2022, Country Note Indonesia | benar, bulatkan |
| Pengguna internet | 229 juta | **229.428.417** | APJII, survei semester I 2025 | benar |
| Penetrasi internet | belum dipakai | **80,66%** | APJII 2025 | bisa ditambahkan |
| Akses via seluler | 74,27% | belum terverifikasi | APJII, metrik perangkat | perlu dicek |

---

## 3. Batasan PISA yang harus kamu sebut sendiri

PISA mengukur **pelajar usia 15 tahun**, bukan penduduk umum.

Kalau di deck tertulis "75% orang Indonesia literasinya rendah", itu salah. Yang benar "75% pelajar Indonesia usia 15 tahun berada di bawah Level 2 kemampuan membaca". Bedanya besar, dan reviewer yang teliti akan menangkapnya.

**Cara memakainya yang jujur dan tetap kuat:**

> Dari pelajar usia 15 tahun, 75% berada di bawah level minimum kemampuan membaca menurut PISA 2022. Mereka adalah pengguna MyTelkomsel lima tahun lagi. Kalau antarmuka kita menuntut kemampuan membaca di atas level itu, kita sedang mendesain untuk seperempat pasar.

Ini lebih kuat daripada 57% tanpa sumber, karena bisa dibuktikan dan tidak bisa dibantah dengan satu pencarian.

**Bahasa awam soal Level 2:** Level 2 adalah batas paling dasar. Di bawah itu artinya kesulitan menemukan informasi yang dinyatakan langsung dalam teks, atau menyimpulkan hal sederhana dari bacaan. Bukan buta huruf, tapi kesulitan memahami kalimat yang tidak lurus.

---

## 4. Dampak ke angka "bukan niche"

Framing di `tis-deck-revisi-feedback.md`: "22,5 jt disabilitas + 29 jt lansia + 57% low-literacy = puluhan juta, bukan ceruk."

Dengan angka yang benar, argumennya **justru menguat**:

```
22,97 juta disabilitas  +  33,94 juta lansia  =  56,91 juta orang
```

Naik dari 51,5 juta. Dan itu sebelum menghitung literasi, dan sebelum menghitung kondisi situasional.

**Saran penyajian.** Jangan jumlahkan tiga angka jadi satu, karena ada tumpang tindih. Lansia dan penyandang disabilitas beririsan besar. Kemenko PMK sendiri menyebut jumlah disabilitas terbanyak justru pada usia lanjut. Menjumlahkannya akan terbaca sebagai penggelembungan, dan itu merusak kredibilitas seluruh deck.

Lebih aman disusun bertingkat:

| Lapis | Angka | Sifat |
|---|---|---|
| Permanen | 22,97 juta disabilitas | menetap |
| Menua | 33,94 juta lansia, menuju 20% penduduk | bertambah tiap tahun |
| Kemampuan membaca | 75% pelajar di bawah Level 2 | pasar lima tahun lagi |
| Situasional | 229 juta pengguna internet, mayoritas mobile-first | **semua orang**, bergantian |

Lapis terakhir yang paling kuat, dan tidak butuh angka besar. Curb-cut effect: orang yang memakai HP murah di bawah terik matahari dengan sinyal seadanya mengalami hal yang sama dengan pengguna low vision. Bedanya cuma sementara.

---

## 5. Yang harus dikerjakan sebelum deck dipakai lagi

1. **Buang 57% dari seluruh dokumen.** Ada di lima berkas: `tis-mvp-roadmap.md`, `tis-appendix-bod.md`, `tis-vs-stark.md`, `tis-model-penilaian.md`, `tis-deck-revisi-feedback.md`, `tis-profil-kapasitas.md`.
2. **Perbaiki 22,5 jadi 22,97 dan 29 jadi 33,94.** Keduanya mengecilkan argumenmu sendiri tanpa alasan.
3. **Ganti 57% dengan 75% PISA, beserta kalimat batasannya.** Jangan pakai angka PISA tanpa menyebut bahwa itu pelajar.
4. **Verifikasi dua angka tersisa:** proyeksi lansia 2045 dan porsi akses via seluler. Keduanya belum ketemu di publikasi resmi.
5. **Hentikan penjumlahan tiga segmen.** Ganti dengan penyajian bertingkat di bagian 4.

---

## 6. Daftar sumber

**Disabilitas**
- [Kemenko PMK, Pemerintah Penuhi Hak Penyandang Disabilitas di Indonesia](https://www.kemenkopmk.go.id/pemerintah-penuhi-hak-penyandang-disabilitas-di-indonesia) · 22,97 juta, ~8,5% penduduk
- [BPS, Potret Penyandang Disabilitas di Indonesia, hasil Long Form SP2020](https://www.bps.go.id/en/publication/2024/12/20/43880dc0f8be5ab92199f8b9/potret-penyandang-disabilitas-di-indonesia-hasil-long-form-sp2020.html)

**Lansia**
- [BPS, Statistik Penduduk Lanjut Usia 2025](https://www.bps.go.id/id/publication/2025/12/12/868d335b088dcddc3ddee052/statistik-penduduk-lanjut-usia-2025.html) · 33,94 juta, 11,97%
- [Databoks, jumlah lansia 2025](https://databoks.katadata.co.id/en/demographics/statistics/69649198c109c/the-number-of-elderly-population-in-indonesia-in-2025)

**Kemampuan membaca**
- [OECD, PISA 2022 Results Country Note Indonesia](https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/indonesia_c2e1ae0e-en.html) · 25% mencapai Level 2 ke atas, berarti 75% di bawahnya
- [Databoks, PISA 2022 kemampuan membaca pelajar Indonesia](https://databoks.katadata.co.id/en/education/statistics/871e4e286982d42/pisa-2022-indonesian-students-reading-proficiency-ranked-low-in-asean)

**Pengguna internet**
- [APJII, survei internet Indonesia 2025](https://survei.apjii.or.id/) · 229.428.417 pengguna, penetrasi 80,66%
- [Kompas Tekno, pengguna internet 2025 tembus 229,4 juta](https://tekno.kompas.com/read/2025/08/08/16110007/jumlah-pengguna-internet-di-indonesia-tahun-2025-tembus-2294-juta)
- [Antara, penetrasi internet 80,66 persen](https://www.antaranews.com/berita/5019229/apjii-catat-tingkat-penetrasi-internet-indonesia-capai-8066-persen)

**Literasi digital, untuk konteks, bukan untuk klaim low literacy**
- [Kominfo, Indeks Literasi Digital 2022](https://aptika.kominfo.go.id/2023/02/indeks-literasi-digital-indonesia-kembali-meningkat-tahun-2022/) · skor 3,54 dari 5
- [Siaran pers Kominfo, indeks literasi digital](https://www.kominfo.go.id/content/detail/47179/siaran-pers-no-10hmkominfo022023-tentang-indeks-literasi-digital-tahun-2022-meningkat-kominfo-tetap-perhatikan-indeks-keamanan/0/siaran_pers)

---

## 7. Catatan untuk lain kali

Angka 57% bertahan di enam berkas selama berbulan bulan, padahal appendix kita sendiri sudah menandainya `[KONFIRM]` sejak awal. Penanda itu ditulis, lalu tidak pernah ada yang menutupnya.

Penanda `[KONFIRM]` cuma berguna kalau ada yang memeriksanya sebelum dokumen dipakai. Sebelum deck berikutnya dipresentasikan, cari seluruh `[KONFIRM]` yang tersisa dan tutup satu satu. Di `tis-appendix-bod.md` saja masih ada lebih dari lima belas, termasuk pada angka yang menopang proyeksi Rp 96 miliar: siklus rework per tahun, story point terdampak, dan biaya per story point.
