# TIS v2, redesign visual

Salinan v1 yang dipakai sebagai landasan redesign visual. **Capability-nya wajib identik dengan v1.**
Yang boleh berubah cuma lapisan visual. Aturan kalibrasi, scanner, formula gate, dan isi prompt tidak boleh disentuh.

## Kenapa dipisah, bukan ditimpa

Dipilih berdampingan supaya v1 dan v2 bisa dijalankan pada frame yang sama lalu hasilnya dibandingkan.
Kalau vonisnya berbeda, berarti redesign-nya merembes ke logika, dan itu ketahuan sebelum dirilis.

**Konsekuensi yang perlu diberitahukan ke tim:** `id` di manifest sengaja berbeda dari v1.
Figma menyimpan API key per plugin id, jadi tiap orang perlu memasukkan key sekali lagi di v2.
Key di v1 tetap tersimpan dan tidak terganggu. Jangan pernah menyamakan id kedua plugin ini.

## Aturan main selama redesign

1. `code.js` tidak disentuh sama sekali. Scanner, kontras, geometri, dan `stampFid` tetap apa adanya.
2. Di `ui.html`, blok `KNOWLEDGE`, semua string prompt (`SYS`, `FLOW_SYS`, `TW_SYS`, `SYNTH_SYS`),
   pembangun klausa, dan blok `featureScreens` yang menghitung gate tidak boleh diubah.
3. Perubahan visual hanya lewat token dan class. Dilarang menambah `style="..."` inline baru.
4. Tiap kali selesai satu tahap, jalankan pembanding capability. Kalau ada satu saja yang meleset, hentikan.

## Urutan kerja

- [x] Kerangka v2 berdiri, manifest id sendiri
- [x] Inventaris nilai visual v1
- [x] Token `:root` diganti tema gelap, nama variabel dipertahankan
- [x] 166 warna hardcode di JS dipetakan ke palet gelap
- [x] 24 nilai terang tersisa di CSS ikut dipetakan
- [x] Empat perampingan diterapkan
- [x] Verifikasi capability identik terhadap v1, 23 titik
- [ ] Uji pasang di Figma, cek tiap tab
- [ ] Putuskan bahasa label nav: Layar/Simulasi/Alur atau Screen/Simulation/Flow


## Apa yang berubah di v2

**Tema.** Gelap, mengikuti halaman TIS Redesign. Latar `#000C1F` ke `#000918` dengan dua glow ungu
`#44338C` dan `#5742B4`. Permukaan memakai putih beralpha rendah, bukan putih pekat.

Nama variabel `:root` sengaja dipertahankan sama dengan v1. Jadi setiap `var(--x)` yang sudah ada
di seluruh berkas ikut berubah tanpa disentuh satu per satu. Yang perlu dipetakan manual cuma
warna yang tertanam langsung di dalam kode.

**Warna hardcode.** 166 kemunculan di JS dan 24 di CSS dipetakan. Prinsipnya tiga:
teks berwarna dinaikkan kecerahannya supaya terbaca di latar gelap, latar pastel diturunkan
jadi warna transparan rendah, dan garis jadi warna semi-transparan.

**Tiga hex yang SENGAJA tidak diganti.** `#E60012` di dalam `SYS` itu data, bukan gaya:
dia menyebut token `action/primary` Design System Telkomsel yang dibaca AKSA. Penggantian
buta sempat mengubahnya dan langsung ketahuan oleh pembanding capability.

**Empat perampingan.**

1. Chip kredensial "WCAG 2.2 · 7 sumber" dibuang dari top bar.
2. Hero skor diringkas: cincin 66px jadi 46px, baris "Stabil · dasar gate" pindah ke tooltip.
3. Segmen diurutkan terburuk dulu, tiga sisanya dilipat. Von Restorff.
4. Daftar urutan layar dilipat begitu titik mulai dan tujuan sudah dipilih, diganti baris
   ringkasan `mulai → tujuan · N layar`. Paragraf pengenalan AKSA hanya muncul sebelum ada hasil.

## Yang belum diputuskan

Label nav di desain Figma memakai bahasa Inggris (Screen, Simulation, Flow), sedangkan plugin
memakai bahasa Indonesia (Layar, Simulasi, Alur). v2 masih memakai bahasa Indonesia karena
seluruh isi plugin berbahasa Indonesia. Perlu diputuskan mana yang ikut.


## Sistem spasi v2

Satu aturan, dipegang satu tempat.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--sp1` | 4px | jarak label ke sub-label, gap ikon nav |
| `--sp2` | 8px | gap dalam baris, jarak judul seksi ke isinya |
| `--sp3` | 12px | jarak antar blok, padding kartu kecil |
| `--sp4` | 16px | inset samping panel, padding dalam kartu |
| `--sp5` | 20px | padding samping bar nav, padding samping kartu skor |
| `--sp6` | 24px | padding blok kosong |

**Inset samping dipegang oleh `#app`, bukan oleh tiap komponen.** Tiap blok cuma mengatur
jarak bawahnya lewat `#app > * + *`. Sebelumnya tiap komponen memasang `margin:0 16px` sendiri,
lalu satu aturan `#app > *{margin-left:0}` menghapusnya diam-diam. Komponen yang kebetulan
punya `!important` selamat, yang tidak punya jadi mepet ke tepi. Itu sebabnya segmented control
dan tab filter menempel ke pinggir sementara kartu di bawahnya tidak.

**Dua bug spasi yang diperbaiki di sini.**

1. `#app > *{margin-left:0}` memakai selector ID, jadi kekuatannya mengalahkan semua aturan
   kelas tanpa `!important`. Efeknya tidak merata dan sulit dilacak. Sekarang inset cuma ada
   di satu tempat, jadi tidak ada yang bisa menghapusnya sebagian.

2. `.seg` sempat saya buat `flex-direction:column` mengikuti struktur frame Figma. Tapi markup
   di JS menaruh emoji, label, persen, dan bar sebagai empat elemen sejajar, bukan bersarang.
   Akibatnya emoji dan label menumpuk ke bawah dan terlihat rata tengah. Diperbaiki jadi
   `flex-wrap`, sehingga tiga elemen pertama sebaris dan bar turun ke baris kedua.

**Batas verifikasi.** Pemeriksaan yang bisa saya lakukan di sini bersifat struktural:
tidak ada aturan lama yang bentrok, tidak ada kelas tanpa aturan, sintaks lolos, capability
identik. Perataan piksel yang sesungguhnya baru terlihat setelah dipasang di Figma.


---

# v4 · Design System TIS v4 diterapkan

Rujukan: `ds-tis-v4.md`. Kanvas dari v2, tipografi dan pola konten dari v3.

## Yang berubah

**Permukaan jadi nilai tetap, bukan alpha.** `--surface` sekarang `#0F1826`, bukan `rgba(255,255,255,.08)`.
Alasannya prinsip v4: latar di belakang teks harus bisa dihitung dengan pasti. Dengan alpha, nilai
akhirnya bergantung apa yang ada di belakangnya, dan itu yang bikin kontras sulit dijamin.

**Glow ungu dan glow emas dibuang.** Nol `radial-gradient` tersisa. Aturan v4 yang saya tulis sendiri:
dekorasi yang menaikkan kompleksitas latar tanpa menambah informasi harus pergi. Glow di belakang
angka skor kena aturan yang sama, walaupun dia terlihat manis.

**Warna status dihitung ulang untuk latar gelap.** Nilai dari v3 dirancang untuk kartu putih,
jadi tidak bisa disalin. 88 kemunculan warna di JS dipetakan.

| Peran | v4 | di L1 | di L2 |
|---|---|---|---|
| Pelanggaran | `#F2586E` | 5,43 | 4,89 |
| Potensi | `#E8B600` | 9,45 | 8,50 |
| Lolos | `#2BA875` | 5,91 | 5,32 |
| Referensi | `#6E95BE` | 5,70 | 5,13 |
| Profil | `#9B85CB` | 5,62 | 5,05 |

**Merah merek dan merah pelanggaran sengaja berbeda.** `--tis` tetap `#E60012` dan hanya untuk logo
dan tombol utama. Kalau sama, orang tidak bisa membedakan identitas dari peringatan.

## Tiga kebiasaan dari GO Club yang masuk

**Judul vonis dua warna.** Ketujuh keadaan sudah dipecah jadi dua bagian, dan bagian kedua diberi
warna status. Yang diberi warna adalah bagian yang mengubah keputusan.

```
[r] ✕ Mayoritas user « gagal »
[a] △ Sampai tujuan, « tapi lewat keraguan »
[g] ✓ Konsisten « berhasil »
```

**Satuan menempel.** Pil hitungan sekarang `5berhasil`, `2ragu`, bukan `Berhasil 5`. Angka besar
dulu 15px berat 800, label kecil menempel tanpa spasi.

**Keadaan kosong sebagai halaman.** "tidak ada pelanggaran" dibuat 32px dua warna, bukan catatan
abu-abu kecil. Itu kabar baik, dan sebelumnya tampil seperti kegagalan sistem.

## Aturan basi yang dibuang

Tiga aturan lama memakai `--ink` sebagai LATAR: `.chip.on`, `.mode.on`, `.im-badge`. Sudah tertimpa
aturan v4, tapi tetap dihapus supaya berkasnya jujur. Ini bug yang pernah kejadian dan menghasilkan
putih di atas putih.

## Verifikasi

| Yang diperiksa | Hasil |
|---|---|
| Pasangan teks dan latar di CSS | 135 diperiksa, **0 di bawah 4,5:1** |
| Warna teks inline di JS | 46 diperiksa, 0 di bawah ambang |
| Judul vonis dua warna | 7 dari 7 keadaan benar |
| Capability terhadap v1 | 23 titik identik |

Semua dijalankan dengan komposit alpha, bukan diperkirakan.
