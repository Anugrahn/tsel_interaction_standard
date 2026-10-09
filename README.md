# TIS · Telkomsel Interaction Standard

**Versi 3 · Oktober 2026 · UT persona**

TIS adalah plugin Figma yang memeriksa **aksesibilitas, usability, dan journey** sebuah desain **sebelum** masuk development. Hasilnya bisa dipakai sebagai gate rilis, lalu dicatat ke Govern Store supaya kualitas pengalaman semua produk digital Telkomsel terukur di satu tempat.

```
Desain di Figma  →  TIS scan + AKSA AI  →  temuan, skor, vonis journey  →  gate  →  handoff ke engineering
```

---

## Kenapa TIS ada

Masalah usability dan aksesibilitas selama ini kebanyakan ditemukan **setelah rilis**, lewat keluhan pengguna dan siklus rework. Di review desain, keputusan sering bergeser ke selera dan pendapat paling senior, karena tidak ada standar bersama.

TIS memindahkan pemeriksaan itu ke **awal**, di tempat desainer sudah bekerja, dan mendasarkannya pada standar yang bisa diperiksa:

| Lapis | Dasar |
|---|---|
| Standar eksternal | WCAG 2.2, 10 Heuristik Nielsen, UX Laws, Apple HIG, Android Material |
| Standar internal | Design System Telkomsel, perilaku pengguna Telkomsel, SOP dan governance |

TIS adalah agen tahap **desain** dalam AI SDLC Telkomsel: CELIA (requirement), **TIS (desain)**, BELLA (build & test), AION (rilis & operasi). Keempatnya berbagi satu basis pengetahuan yang divalidasi manusia.

---

## Kegunaan

| Untuk | TIS membantu |
|---|---|
| **Desainer** | Scan di Figma, langsung tahu apa yang gagal, kenapa, siapa yang dirugikan, dan cara memperbaikinya. Tandai siap rilis. |
| **Researcher** | Menguji journey dengan persona sintetis yang dibentuk dari data perilaku nyata, sebelum merekrut peserta UT. |
| **Developer & QA** | Menerima Feature Snapshot dan Measurement Spec: skor per layar, vonis journey, dan event yang perlu dipasang. |
| **BU & CX** | Memantau skor per produk dan prioritas perbaikan lewat Govern Store. |

---

## Apa yang diperiksa

| Tab | Pertanyaan | Cara menjawab |
|---|---|---|
| **Screen** | Apakah layar ini bisa dipakai semua orang? | Cek deterministik (kontras, ukuran teks, area tap, label, urutan fokus) + rubrik usability AKSA berbasis Nielsen |
| **Simulation** | Bagaimana layar ini terlihat oleh mata yang berbeda? | Lensa low vision, buta warna, katarak, terik matahari, HP murah |
| **Flow · Cek usable** | Apakah pengguna awam bisa menyelesaikan task? | Task Walkthrough: AKSA mencoba task 5 kali, vonis PASS / BROKEN |
| **Flow · Insight** | Apa yang bisa diperbaiki dari journey ini? | Analisa alur berbasis heuristik Nielsen |
| **Flow · Persona** *(baru di v3)* | Siapa yang tersendat, dan di mana? | UT persona: AKSA jadi satu pengguna dengan pola perilaku nyata, berjalan layar demi layar tanpa peta |

**Gate rilis** hanya memakai sinyal yang stabil: semua layar aksesibilitas ≥ 80 **dan** journey tidak BROKEN. Penilaian AI bersifat advisory sampai kesepakatannya dengan penilai manusia mencapai Cohen's kappa 0,7 sampai 0,8. Manusia selalu bisa meng-override, dan setiap override tercatat.

---

## Yang baru di versi 3: UT persona

Task Walkthrough versi sebelumnya memberi AI semua layar dan peta alur sekaligus. Akibatnya AI hampir tidak pernah tersesat, karena dia memegang kunci jawabannya. Versi 3 menambahkan mode **👥 Persona** yang mengubah **apa yang dilihat AI**, bukan sekadar instruksinya.

**4 persona perilaku**, dibentuk dari 9.647 sesi MyTelkomsel. Dasarnya cara orang bergerak di aplikasi, bukan umur:

| Persona | Pola |
|---|---|
| Lancar | pembanding; kalau dia saja tersendat, desainnya yang bermasalah |
| Bolak-balik | kehilangan konteks antar layar, sering mundur untuk memastikan |
| Lama Paham | membaca pelan, hanya menangkap teks yang jelas |
| Teralih | tertarik promo di tengah alur (masih dugaan) |

**8 kendala inklusif**, ditempel ke persona mana pun dan ditegakkan oleh kode: teks 200%, katarak, terik matahari, pembesar layar, screen reader, tremor / satu tangan, literasi rendah, atau tanpa kendala.

Aturan yang dijaga oleh kode:
- AI tidak pernah melihat tujuan tombol atau nama layer.
- Sampai atau tidaknya ditentukan dari layar tujuan, bukan dari klaim AI.
- Sampai lewat tebakan tetap dihitung gagal.

Hasil persona bersifat **advisory**. Hasilnya dicatat ke Feature Snapshot sebagai prediksi per profil, lalu diuji lawan data segmen setelah rilis. Rancangan lengkap dan cara kalibrasinya ada di [`dokumen-pendukung/tis-persona-sintetis.md`](dokumen-pendukung/tis-persona-sintetis.md).

Versi 3 juga memperbaiki 26 bug hasil review menyeluruh. Beberapa di antaranya bug gate: vonis BROKEN deterministik yang tidak pernah bisa menyala, pelanggaran palsu pada layer bernama "Rectangle", dan walkthrough yang error tapi tetap ter-mint sebagai PASS. Daftar lengkapnya di [`plugin/HANDOFF-ENGINEER.md`](plugin/HANDOFF-ENGINEER.md) §12.

### Riwayat versi

| Versi | Isi |
|---|---|
| v1 | MVP: scanner deterministik, AKSA, Task Walkthrough, gate, Feature Snapshot |
| v2 | Redesign visual (design system v4). Capability identik dengan v1, dibuktikan comparator |
| **v3** | **UT persona + kendala inklusif + 26 perbaikan bug**. `id` plugin tetap, token tidak perlu dimasukkan ulang |

---

## Pasang cepat

1. Clone repo ini atau unduh ZIP-nya.
2. Figma Desktop → `Plugins` → `Development` → `Import plugin from manifest`.
3. Pilih `plugin/manifest.json`.
4. Jalankan **TIS v3 · Telkomsel Interaction Standard**, lalu masukkan token Claude kamu sendiri di kartu AKSA. Token disimpan lokal di mesinmu dan tidak pernah masuk berkas.

Rinci untuk desainer: [`plugin/INSTALL-untuk-tim.md`](plugin/INSTALL-untuk-tim.md).

---

## Isi repo

```
├── plugin/                      ← plugin siap pasang di Figma
│   ├── manifest.json
│   ├── code.js                  sandbox Figma: scene graph, cek deterministik, graf journey
│   ├── ui.html                  UI, KNOWLEDGE, prompt, AI, gate, simulasi persona
│   ├── README.md                ← mulai dari sini untuk engineer
│   ├── HANDOFF-ENGINEER.md      arsitektur, kontrak data, perubahan v3, utang teknis
│   ├── ARSITEKTUR.md            peta modul, siklus render, cara uji
│   ├── KALIBRASI.md             katalog 41 aturan AKSA + persona + kendala
│   ├── INSTALL-untuk-tim.md     untuk desainer
│   └── VERSI.md                 riwayat versi
│
├── tis-cek-capability.js        comparator 40 titik, WAJIB sebelum commit
├── _cadangan-2026-10-10/        salinan beku v2 sebelum v3, pembanding comparator
│
└── dokumen-pendukung/
    ├── tis-persona-sintetis.md     UT persona: rancangan, cara pakai, kalibrasi
    ├── tis-model-penilaian.md      metode Task Walkthrough dan dasar teorinya
    ├── aksa-calibration-notes.md   alasan tiap aturan kalibrasi, per sesi
    ├── tis-measurement-handoff.md  skema Measurement Spec ke engineering
    ├── tis-sumber-data-inklusif.md audit sumber angka segmen inklusif
    ├── tis-spesifikasi-layar-v2.md spesifikasi layar dari frame Figma
    ├── ds-tis-v4.md                design system plugin
    └── tis-opsi-gate.html          empat opsi rumus gate, interaktif
```

---

## Sebelum mengubah kode

**Jalankan comparator** setiap kali menyentuh `code.js` atau `ui.html`:

```bash
node tis-cek-capability.js _cadangan-2026-10-10/plugin plugin
```

Comparator memastikan kemampuan (prompt, aturan kalibrasi, scanner, rumus gate) tidak berubah tanpa disengaja. Kalau perubahannya memang disengaja, catat alasannya di `plugin/VERSI.md` lalu perbarui salinan beku.

Tiga jebakan yang sudah pernah terjadi:

1. **Nilai hex di dalam string prompt adalah DATA, bukan styling.** `#E60012` di dalam `SYS` merujuk token Design System yang dibaca AKSA.
2. **`node.fills` bukan warna teks yang terlihat.** Pakai `getStyledTextSegments`.
3. **Jangan ubah `id` di `manifest.json`.** Mengubahnya mereset token semua anggota tim.

Detailnya di [`plugin/HANDOFF-ENGINEER.md`](plugin/HANDOFF-ENGINEER.md).

---

## Status

| | |
|---|---|
| Versi | 3 · 10 Oktober 2026 |
| Fase | Pilot. Gate berstatus **shadow**: dicatat, belum menahan rilis |
| Knowledge | `2026-10-10` · 41 aturan · 4 profil · 4 persona · 8 kendala |
| Verifikasi v3 | uji DOM tiruan 53/53, uji Figma tiruan 16/16; prompt lama dan rumus gate identik byte per byte |
| Belum diverifikasi | UT persona belum dijalankan di Figma nyata dan belum dikalibrasi ke data produksi (lihat `tis-persona-sintetis.md` §6) |
| Token dalam repo | tidak ada, sudah dicek |

---

**Aksara Team · Telkomsel** · Research: Gatra Erga Yudhanto · Design: Syafrizal Wardhana · Data Scientist: Anugrah Nurhamid · AI Solution: Rifki Muhammad Bogara

Internal Telkomsel.
