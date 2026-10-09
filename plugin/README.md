# TIS · Telkomsel Interaction Standard

Plugin Figma yang memeriksa aksesibilitas dan usability sebuah desain **sebelum** masuk development, lalu mengeluarkan vonis yang bisa dipakai sebagai gate rilis.

```
Desain di Figma  →  TIS scan  →  temuan + skor  →  gate  →  handoff ke engineering
```

---

## Mulai dari mana

| Kamu siapa | Buka ini |
|---|---|
| Engineer yang melanjutkan kode ini | **[HANDOFF-ENGINEER.md](HANDOFF-ENGINEER.md)** |
| Engineer yang mau paham struktur dalamnya | [ARSITEKTUR.md](ARSITEKTUR.md) |
| Yang mau menambah atau mengubah aturan AKSA | [KALIBRASI.md](KALIBRASI.md) |
| Desainer yang mau memakai | [INSTALL-untuk-tim.md](INSTALL-untuk-tim.md) |
| Yang mau tahu apa yang berubah di v2 dan v4 | [VERSI.md](VERSI.md) |

---

## Apa yang dilakukan TIS

**Tiga tab, tiga pertanyaan berbeda.**

| Tab | Pertanyaan | Cara menjawab |
|---|---|---|
| **Screen** | Apakah satu layar ini bisa dipakai semua orang? | Cek deterministik: kontras, ukuran teks, area tap, struktur heading, urutan fokus. Plus AKSA untuk hal yang butuh pemahaman makna. |
| **Simulation** | Bagaimana layar ini terlihat oleh mata yang berbeda? | Simulasi buta warna, penglihatan kabur, layar terik |
| **Flow** | Apakah pengguna benar benar sampai ke tujuannya? | Task Walkthrough: AKSA berperan jadi pengguna awam, mencoba menyelesaikan task lima kali (gate). Mode **Persona**: AKSA jadi satu pengguna dengan pola perilaku nyata + kendala inklusif, berjalan layar demi layar tanpa peta (advisory) |

**Yang keluar di ujung:** skor aksesibilitas per layar, vonis journey, dan **Feature Snapshot** yang bisa dikirim ke Govern Store.

---

## Dua hal yang membedakannya dari checker biasa

**Pelanggaran dan potensi dipisah.** Pelanggaran adalah kegagalan standar keras yang bisa dihitung pasti, misalnya kontras di bawah 4,5:1. Potensi adalah hal yang butuh keputusan manusia, misalnya kontras di atas latar berblur yang memang tidak bisa dipastikan dari file desain. Kalau digabung, orang akan berhenti percaya pada temuan merah.

**Sistem mengakui kalau tidak tahu.** Kalau latar di belakang teks berupa gambar atau gradasi transparan, TIS tidak memvonis. Dia menandai "kontras belum bisa dipastikan" dan menyerahkan ke manusia. Satu vonis salah merusak kepercayaan lebih cepat daripada sepuluh vonis benar membangunnya.

---

## Status

| | |
|---|---|
| Fase | 1, pilot. Gate berstatus **shadow**: dicatat, tidak menahan rilis |
| Dipakai | Tim desain Aksara, harian |
| Knowledge | `2026-10-10` · 41 aturan kalibrasi · 4 profil kapabilitas · 4 persona · 8 kendala |
| Model | Opus untuk analisa, otomatis turun ke Sonnet kalau akun tidak punya akses |

**Gate tidak akan menahan rilis sampai fase 4**, yaitu setelah tingkat kesepakatan antara vonis sistem dan penilaian manusia mencapai Cohen's kappa 0,7 sampai 0,8. Itu setara tingkat kesepakatan antara dua reviewer manusia.

---

## Pasang cepat

1. Figma Desktop, menu `Plugins › Development › Import plugin from manifest`
2. Pilih `manifest.json` di folder ini
3. Jalankan `Plugins › Development › TIS v3 · Telkomsel Interaction Standard`
4. Masukkan token Claude kamu sendiri di kartu AKSA

Rinci ada di [INSTALL-untuk-tim.md](INSTALL-untuk-tim.md).

**Token disimpan lokal di mesin kamu** lewat `figma.clientStorage`. Tidak pernah masuk berkas, tidak pernah masuk repo, tidak pernah dibagi ke orang lain.

---

## Sebelum commit

```bash
node ../tis-cek-capability.js
```

Comparator membandingkan dua versi di 40 titik dan memastikan perubahan visual tidak diam diam mengubah kemampuan. Wajib dijalankan setiap kali menyentuh `code.js` atau `ui.html`. Alasannya ada di HANDOFF §5, dan alasannya bukan teoretis.

---

## Berkas

| Berkas | Isi |
|---|---|
| `manifest.json` | Definisi plugin dan domain yang diizinkan |
| `code.js` | Sandbox Figma. Scene graph, pemeriksaan deterministik, heatmap |
| `ui.html` | UI, KNOWLEDGE, prompt, panggilan AI, perhitungan gate |
| `icon.png` | Ikon plugin |

---

Syafrizal Wardhana · Aksara Team · Telkomsel
