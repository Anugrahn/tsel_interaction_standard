# TIS · Cara Pasang

Buat desainer. Tidak perlu tahu apa pun soal kode.

---

## 1. Pasang plugin

Butuh **Figma Desktop**, bukan Figma di browser.

1. Buka Figma Desktop
2. Menu `Plugins` → `Development` → `Import plugin from manifest...`
3. Cari folder TIS, pilih **`manifest.json`**
4. Selesai. Plugin sekarang ada di `Plugins` → `Development` → **TIS v2 · Telkomsel Interaction Standard**

---

## 2. Masukkan token Claude

Sebagian fitur (AKSA, Task Walkthrough) memanggil Claude, dan tiap orang memakai tokennya sendiri.

1. Buka [console.anthropic.com](https://console.anthropic.com) → `API Keys` → buat token baru
2. Salin **seluruhnya**. Token asli panjangnya sekitar 100 karakter dan diawali `sk-ant-`
3. Di plugin, buka tab **Screen** → kartu **AKSA** → tempel → **Simpan**
4. Muncul baris hijau konfirmasi kalau berhasil

**Kolom Workspace ID biarkan kosong.** Dia cuma perlu diisi kalau tokenmu terikat workspace, dan kalau begitu plugin akan memberitahu sendiri dan membuka kolomnya.

**Token disimpan lokal di mesin kamu saja.** Tidak masuk ke berkas Figma, tidak dibagi ke siapa pun.

### Kalau token ditolak

Pesan errornya sudah dibedakan per penyebab. Buka **"Lihat jawaban asli Anthropic"** di bawah pesan untuk melihat apa yang sebenarnya dikatakan server.

Yang paling sering: token tersalin tidak utuh. Cek jumlah karakternya di panel itu. Kalau jauh di bawah 100, salin ulang.

Kalau perlu ganti token, klik **Ganti** di baris status token. Tidak perlu tutup plugin.

---

## 3. Cara pakai

### Tab Screen · periksa satu layar

Pilih satu frame di canvas. TIS langsung memindai.

| Yang kamu lihat | Artinya |
|---|---|
| **Pelanggaran** | Gagal standar keras WCAG. Ini harus dibenahi. |
| **Potensi** | Perlu keputusan kamu. TIS tidak yakin, dan memang tidak bisa yakin dari file desain saja. |
| **Lolos** | Elemen yang aman |

Klik kartu temuan untuk melihat alasannya, dari sumber mana, dan siapa yang kesulitan. Klik **↗ Pilih di canvas** untuk lompat ke elemennya.

Kalau sebuah temuan salah, tandai **Bukan isu** dengan alasan. Semua penandaan tercatat dan jadi bahan kalibrasi.

### Tab Simulation · lihat dengan mata lain

Buta warna, penglihatan kabur, layar di bawah matahari. Bukan pengganti pengujian dengan pengguna asli, tapi cukup untuk menangkap masalah yang jelas.

### Tab Flow · periksa journey

1. Tulis **tujuan journey**. Ini penting. Tanpa tujuan, angka jumlah tap cuma angka. Tiga tap wajar untuk cek kuota, tapi terlalu sedikit untuk registrasi.
2. Pilih **screen akhir journey** lewat tombol `End Screen`
3. Pilih mode, lalu jalankan

**AI Walkthrough** membuat AKSA berperan jadi pengguna awam yang mencoba menyelesaikan task lima kali. Hasilnya PASS atau BROKEN. Kalau hasilnya loncat loncat antar percobaan, journey-nya rapuh.

**Insight Flow** memberi saran perbaikan tanpa memvonis.

Kalau vonisnya menurutmu salah, ada kontrol **Tinjau / override verdict**. Kamu pegang keputusan akhir.

---

## 4. Yang perlu kamu tahu soal hasilnya

**Gate belum menahan rilis.** Sekarang fase pilot, statusnya shadow: dicatat, tapi tidak memblokir apa pun. Gate baru akan menahan setelah terbukti tingkat kesepakatannya dengan penilaian manusia cukup tinggi.

**TIS tidak menggantikan pengujian dengan pengguna.** Dia menangkap masalah yang bisa dilihat dari desain. Perilaku backend, performa di perangkat nyata, dan konten yang berubah setelah rilis tidak terlihat olehnya.

**Kalau ada angka yang terasa salah**, buka **"Cara angka ini didapat"** di kartu temuan kontras. Isinya warna fill apa adanya, latar terhitung, dan rasionya. Kirim isi panel itu, jangan tangkapan layarnya, supaya bisa dilacak.

---

## 5. Kalau muncul "Failed to fetch"

Ini **bukan** soal token. Artinya permintaan tidak pernah sampai ke server Anthropic, jadi tidak ada jawaban apa pun untuk dibaca.

Klik **Tes koneksi** di kartu AKSA. Dia akan memberi tahu kegagalannya berhenti di lapisan mana:

| Hasil tes | Artinya |
|---|---|
| Hijau, koneksi dan token beres | Semua lapisan tembus |
| Pesan token ditolak | Jaringan **tembus**, masalahnya di token |
| Pesan jaringan | Permintaan tidak sampai ke server |

Kalau yang terakhir, cek berurutan:

1. **Buka `https://api.anthropic.com` di browser.** Kalau tidak terbuka, jaringan kantor atau VPN memblokirnya. Ini penyebab paling sering di lingkungan korporat.
2. **Pastikan pakai Figma Desktop**, bukan Figma di browser.
3. **Pastikan plugin di-import dari `manifest.json` milik TIS**, bukan salinan lama. Izin domain ada di berkas itu.
4. **Coba jaringan lain**, misalnya hotspot HP. Kalau berhasil, berarti benar jaringan kantornya.

Kalau nomor 1 yang jadi penyebabnya, itu perlu diselesaikan dengan tim jaringan, bukan di plugin. Solusi jangka panjangnya proxy backend Telkomsel, dan itu sudah tercatat sebagai P1 di dokumen handoff engineering.

---

## 6. Kalau plugin tidak ter-update

Figma menyimpan `ui.html` selama plugin masih terbuka. Kalau berkasnya baru diperbarui:

1. Tutup panel plugin, jalankan lagi
2. Kalau masih lama, `Plugins` → `Development` → `Hot reload plugin`
3. Kalau masih juga, tutup Figma Desktop lalu buka lagi

Pastikan yang kamu jalankan bernama **TIS v2**. Kalau tanpa "v2", itu versi lama.

---

Ada masalah atau temuan yang aneh, hubungi Syafrizal Wardhana, Aksara Team.
