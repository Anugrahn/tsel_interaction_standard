# TIS: Measurement Handoff

*Jembatan dari desain ke bisnis, developer, dan QA. Di-generate otomatis saat designer klik **Submit feature** di plugin TIS.*

---

## 1. Masalah yang diselesaikan

`tis-govern-endtoend.md` §6 merancang runtime signals (drop-off, rage tap, segment gap, fix-efficacy) dan jujur menulis: *"Perlu instrumentasi: rage taps, time-on-task, backtracking, segmen font-scale/a11y-flag."*

Tapi selama ini **tidak ada artefak yang memberi tahu siapa pun apa yang harus dipasang.** Akibatnya dashboard runtime menggantung, kita merancang tampilannya, datanya tidak akan pernah ada.

**Measurement Handoff = artefak yang hilang itu.**

*(Bahasa awam: TIS bisa nebak di mana user bakal kesulitan. Tapi kalau nggak ada yang masang "sensor" di aplikasi, tebakan itu nggak pernah bisa dibuktikan. Dokumen ini yang bilang ke developer sensornya dipasang di mana.)*

---

## 2. Kenapa ini bisa otomatis

Saat Submit feature, TIS **sudah memegang semua bahannya**:

| Yang TIS sudah tahu | Dipakai untuk |
|---|---|
| Journey + urutan layar (`flowData.steps`) | rangka funnel per step |
| Titik broken/friksi dari Task Walkthrough (`broken_at`, `friction_point`) | menentukan di mana event friksi dipasang |
| Verdict journey + skor aksesibilitas per layar | prediction record (buat divalidasi nanti) |
| Produk + nama journey | penamaan & pengelompokan event |

Yang selama ini hilang cuma **penerjemahannya** ke bahasa tiga audiens.

---

## 3. Prinsip: prediksi harus falsifiable

Ini nilai terpentingnya. TIS bilang *"user akan tersendat di layar Pilih Paket"* → step itu di-instrument → setelah rilis ketahuan **cocok atau meleset**.

Tanpa ini, TIS cuma alat opini. Dengan ini, loop `matched-dropoff` dan `fix-efficacy` di §6.4 benar-benar menutup, dan itu bukti terkuat buat BOD: *prediksi → perbaikan → dampak nyata terukur*.

---

## 4. Cakupan: funnel murah di semua step, friksi mahal di titik risiko

Keputusan desain, karena tidak semua event sama biayanya:

- **Rangka funnel itu MURAH**: satu event dengan parameter step berbeda. Pasang di semua step biayanya hampir sama dengan pasang di tiga step. → **pasang di SEMUA step.**
- **Event friksi itu MAHAL**: butuh listener, timer, state tracking per layar. → **hanya di step yang TIS flag broken/rapuh.**

**Kenapa funnel harus lengkap:** kalau hanya mengukur di tempat yang TIS duga bermasalah, datanya cenderung membenarkan TIS sendiri (**bias konfirmasi**), dan kita buta kalau user ternyata tersendat di tempat lain. Funnel lengkap juga syarat mutlak buat **segment-completion-gap** (§6.2) yang butuh completion rate journey utuh.

*(Bahasa awam: pasang CCTV murah di semua pintu, pasang sensor mahal cuma di pintu yang dicurigai. Kalau CCTV cuma di pintu yang dicurigai, kita nggak akan pernah tahu kalau malingnya lewat pintu lain.)*

---

## 5. Skema event

Konvensi: `snake_case`, semua event bawa `journey_id` supaya bisa di-join.

### 5.1 Rangka funnel: WAJIB, semua step

| Event | Kapan | Properti |
|---|---|---|
| `journey_start` | user masuk langkah pertama | `journey_id`, `product`, `entry_point` |
| `journey_step_view` | tiap layar journey tampil | `journey_id`, `step_index`, `step_name` |
| `journey_complete` | tujuan journey tercapai | `journey_id`, `duration_ms`, `step_count` |
| `journey_abandon` | user keluar sebelum selesai | `journey_id`, `last_step_index`, `last_step_name` |

Empat event ini saja sudah menghasilkan: funnel drop-off per step, completion rate, time-to-complete.

### 5.2 Event friksi: hanya di step yang di-flag TIS

| Event | Kapan | Properti | Menjawab |
|---|---|---|---|
| `ui_rage_tap` | ≥3 tap cepat di area sama | `journey_id`, `step_name`, `element` | frustrasi, afordansi tidak jelas |
| `ui_dead_tap` | tap di elemen non-interaktif | `journey_id`, `step_name` | user kira bisa diklik, ternyata tidak |
| `journey_backtrack` | mundur ke step sebelumnya | `journey_id`, `from_step`, `to_step` | kebingungan navigasi |
| `step_dwell` | saat meninggalkan step | `journey_id`, `step_name`, `dwell_ms` | beban kognitif per layar |

### 5.3 Properti segmen: WAJIB, level sesi (non-PII)

Ini yang mengubah misi inklusif dari klaim jadi angka. Dilampirkan ke semua event di atas:

| Properti | Tipe | Kenapa penting |
|---|---|---|
| `a11y_font_scale` | float | proxy terkuat untuk lansia / low-vision |
| `a11y_screen_reader` | bool | proxy tunanetra |
| `a11y_high_contrast` | bool | proxy low-vision |
| `device_tier` | low\|mid\|high | proxy segmen ekonomi |
| `network_type` | 2g\|3g\|4g\|5g\|wifi | proxy daerah 3T |

> **Privacy:** semua proxy device/OS-setting, **non-PII**. Dilarang mengirim nomor HP, email, NIK, atau apa pun yang mengidentifikasi individu. Jangan menggabungkan data pribadi lintas sumber.

### 5.4 Prediction record: ke Govern Store, BUKAN ke analytics

Disimpan bersama Feature Snapshot supaya nanti bisa di-join dengan data runtime:

```json
"measurement": {
  "journey_id": "mytelkomsel__ganti-paket",
  "predicted_risk_steps": [
    { "step_name": "Pilih Paket", "verdict": "rapuh",
      "why": "opsi mirip, differensiasi tidak jelas",
      "evidence": "walkthrough+heuristik" }
  ],
  "journey_status": "PASS",
  "min_accessibility": 84,
  "events_required": ["journey_start", "journey_step_view", "..."]
}
```

---

## 6. Satu spec, tiga lensa

Tiga audiens butuh hal berbeda dari data yang sama. Spec yang dikirim ke semua orang dalam satu bentuk akan diabaikan dua dari tiga.

### 6.1 Bisnis / PM: *pertanyaan apa yang kejawab*
Bukan nama event, tapi keputusan yang kebuka:
- "Berapa % user dengan font besar gagal menyelesaikan Ganti Paket?" → ukuran gap inklusi
- "Di langkah mana user paling banyak hilang, dan berapa rupiah yang menempel di situ?" → prioritas perbaikan
- "Setelah desain diperbaiki, angkanya naik nggak?" → bukti ROI
- Tanpa instrumentasi: **tidak satu pun pertanyaan ini bisa dijawab.**

### 6.2 Developer: *apa yang dipasang, di mana*
- Tabel event §5.1–5.3, dipetakan ke nama layar persis dari desain
- Payload schema + tipe data
- Catatan: rangka funnel dipasang semua; event friksi hanya di step yang ditandai ⚠

### 6.3 QA: *cara memverifikasi*
Checklist penerimaan:
- [ ] Tiap event menyala **tepat sekali** per kejadian (tidak dobel)
- [ ] `journey_id` konsisten sepanjang satu sesi journey
- [ ] Payload lengkap, tipe data benar, tidak ada `null` yang tak disengaja
- [ ] Properti a11y terisi di device yang settingnya aktif (uji: nyalakan font besar & TalkBack/VoiceOver)
- [ ] **Tidak ada PII** di payload mana pun
- [ ] `journey_abandon` menyala saat user keluar, bukan cuma saat app ditutup
- [ ] Re-test temuan TIS yang statusnya `fixed` → tandai `verified` / `regression`

---

## 7. Alur kerja

```
Designer (Figma)          Dev + QA                    Produksi           Web Govern
──────────────────        ────────────────            ──────────         ──────────────
Submit feature
  ├─ gate PASS/BLOCKED
  └─ Measurement Spec ──► pasang event ──► QA verify ──► data ngalir ──► matched-dropoff
     (3 lensa)                                                            segment gap
                                                                          fix-efficacy
                                                                              │
                                                        kalibrasi AKSA ◄──────┘
```

Spec ikut masuk **Feature Snapshot**, jadi:
- Designer bisa copy langsung dari Figma buat ditempel ke Jira/Confluence
- Dev & QA yang tidak punya Figma membukanya lewat **Web Govern**
- Web Govern bisa menampilkan **status instrumentasi** per feature (belum dipasang / sebagian / lengkap), jadi ketahuan journey mana yang prediksinya belum bisa divalidasi

---

## 8. Batas jujur

- Spec ini **saran, bukan perintah**. Dev/PM tetap yang memutuskan kapasitas, konsisten dengan prinsip TIS "AI nyaranin, manusia mutusin".
- Nama layar di spec diambil dari **nama frame Figma**. Kalau penamaan frame berantakan, spec-nya ikut berantakan. Ini alasan tambahan buat disiplin penamaan.
- `step_dwell` dan `rage_tap` butuh SDK analytics yang mendukung event kustom + timer. Kalau stack analytics belum mampu, mulai dari §5.1 saja, itu sudah menutup loop prediksi paling dasar.
- Instrumentasi tidak otomatis bikin data valid. Butuh QA gate (§6.3), kalau tidak dashboard menampilkan angka yang salah dengan percaya diri.

---

*Terkait: `tis-govern-endtoend.md` §6 (runtime signals), `tis-model-penilaian.md` (asal prediksi), `tis-flow-detail.md` (alur F1–F4).*
