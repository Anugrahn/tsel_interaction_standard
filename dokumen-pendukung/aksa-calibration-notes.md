# AKSA: Calibration Notes

*7 Juli 2026. Catatan kalibrasi AKSA (AI reviewer di plugin TIS). Tiap aturan lahir dari false positive nyata pas ngetes, jadi ini sekaligus bukti "human review layer" jalan: koreksi desainer nyetel AI, bukan AI kotak hitam yang maksa. Ada bahasa awam.*

## Prinsip inti

**Presisi > recall.** Di flag subjektif (usability, psychology, noise, dark-pattern), lebih baik AKSA **melewatkan pola wajar** daripada bikin false positive. Alasannya: satu tuduhan ngawur bikin desainer berhenti percaya seluruh alat.

*(Bahasa awam: mending AKSA diem kalau ragu, daripada asal nuduh, karena sekali salah tuduh, orang males pakai lagi.)*

---

## Aturan kalibrasi (beserta pemicunya)

### 1. Inline link = konvensi, bukan dark-pattern
**Pemicu:** AKSA nge-flag link "syarat & ketentuan" di kalimat consent sebagai dark-pattern + area-tap ambigu.
**Aturan:** link teks di dalam kalimat deskriptif (T&C, Privacy, "Pelajari selengkapnya") itu **pola standar**: jangan diflag. Consent standar "dengan melanjutkan kamu setuju..." = wajar.
*(Bahasa awam: link di dalam kalimat itu hal biasa di semua app, bukan jebakan.)*

### 2. "Dark-pattern" cuma buat niat menipu (bar tinggi)
**Aturan:** kategori dark-pattern HANYA untuk yang beneran menjebak, checkbox opt-in kecentang default, biaya disembunyikan, iklan nyamar, auto-subscribe tanpa disclosure, confirmshaming, tombol destruktif disamarkan, susah membatalkan. **Teks kecil = isu aksesibilitas**, bukan dark-pattern. Jangan double-flag.
*(Bahasa awam: "dark-pattern" itu kata berat, cuma buat yang sengaja nipu, bukan buat teks yang kekecilan.)*

### 3. Prominence dinilai dari saturasi & kontras, bukan cuma ukuran
**Pemicu:** AKSA bilang CTA "Hubungkan Indihome/Orbit" (tombol merah full-width) "kurang menonjol" dibanding foto.
**Aturan:** tombol full-width warna aksi solid = **sudah paling menonjol** walau foto lebih besar. Jangan flag CTA utama sebagai kurang menonjol kalau udah full-width + kontras tinggi.
*(Bahasa awam: tombol merah selebar layar itu jelas nonjol, jangan diributin cuma karena ada foto yang lebih gede.)*

### 4. Jangan keluarkan temuan ragu-ragu
**Pemicu:** AKSA nulis temuan yang kesimpulannya sendiri "sudah cukup menonjol, hanya perlu dipastikan".
**Aturan:** kalau kesimpulanmu "sudah oke / cuma perlu dipastikan" → **buang, jangan ditulis**. Cuma tulis kalau ada masalah nyata & yakin.
*(Bahasa awam: kalau AKSA sendiri gak yakin ada masalah, ya diem aja.)*

### 5. Segmen harus akurat (tunanetra ≠ isu visual)
**Pemicu:** AKSA tag "Tunanetra" buat isu hierarki visual.
**Aturan:** tag tunanetra/blind HANYA untuk isu screen reader (label/alt hilang, urutan baca, struktur semantik). Isu **hierarki visual / prominence / warna / kontras** → tandai lansia/low-vision & low-literacy, BUKAN tunanetra (mereka gak lihat). *(Peta kategori diperbaiki: "hierarki" → vision + low-literacy.)*
*(Bahasa awam: orang tunanetra pakai pembaca layar, jadi masalah "kurang nonjol" gak relevan buat mereka.)*

### 6. Noise = mengganggu task, bukan sekadar berwarna
**Pemicu:** foto header di satu varian dianggap noise.
**Aturan:** noise = elemen yang narik perhatian **sampai ganggu penyelesaian task**. Foto hero di header itu **wajar** (kasih konteks), bukan noise kecuali (a) ada di zona aksi, atau (b) lebih dominan dari CTA utama sampai user bingung.
*(Bahasa awam: gambar yang narik mata itu wajar; baru jadi masalah kalau bikin orang lupa tombolnya.)*

### 7. Bold ≠ noise (yang penting titik fokus & persaingan)
**Pemicu:** bingung kenapa header merah-bold (kiri) gak dianggap noise, tapi header pink+foto (kanan) iya.
**Aturan/prinsip:** noise bukan soal seberapa tebal warna. Bidang warna rata (bahkan bold) = konteks, mata gak nyangkut. Yang bikin narik = **titik fokus** (wajah, detail, teks) + **persaingan dengan aksi utama**. Header merah bold yang rata & sewarna CTA = menguatkan, bukan bersaing. Foto berwajah = titik fokus kuat.
*(Bahasa awam: dinding dicat merah = mencolok tapi mata lewat; ada orang di foto = mata otomatis ke situ. Yang kedua yang bisa jadi noise.)*

### 8. Heatmap: gambar & background dikoreksi
- **Gambar** dikasih "lantai" salience (math gak bisa baca isi foto, jadi jangan di-under-rate). Node foto ditandai 🖼.
- **Bidang solid gede** (>50% layar, bukan foto) **didinginkan**: itu background/konteks, bukan focal. Biar heatmap nunjukin elemen fokus (foto, CTA, teks), bukan tembok warna.
*(Bahasa awam: heatmap sekarang gak salah nyorot "dinding warna" gede, dia fokus ke hal yang beneran narik mata.)*

### 9. Insight journey: triangulasi + tiering + confidence (bukan daftar datar)
**Pemicu:** rekomendasi sintesis walkthrough semua setara & campur yakin/nebak, desainer bingung mana yang wajib dan mana yang cuma asumsi AI.
**Aturan:**
- **Triangulasi** perilaku (walkthrough) × inspeksi (heuristik FLOW). Kena di dua-duanya = bukti terkuat (prioritas). Heuristik nandai tapi walkthrough mulus = kemungkinan false positive → turunkan. Walkthrough kesulitan tapi heuristik aman = gap yang inspeksi lewat → tetap angkat.
- **Tiering**: blocker (gagal) › friksi (rapuh) › polish (minor). Plus satu **top_fix** paling berleverage.
- **Certainty**: tandai `perlu-cek` kalau kesimpulan dari analisa statis (discoverability/signifier, atau cuma 1 run), jujur, jangan overclaim.
*(Bahasa awam: tiap saran sekarang jelas seberapa parah, seberapa yakin, dan mana yang paling worth dikerjain duluan.)*

### 10. Konteks journey = Auto, bukan form (scalable)
**Pemicu:** sempat dibuat field "Tipe journey" + "Prioritas (Core/Niche)", tapi itu maksa desainer milih taksonomi yang kita karang, dan Prioritas itu justru fakta yang AI dilarang mengarang & desainer sering tak tahu.
**Aturan:** **zero config.** Satu input = "Tujuan journey" (intent). Tipe di-infer AI dari intent + layar; Prioritas tak diminta (kalau tak tahu, saran penempatan diframe kondisional, bukan divonis). Presisi datang dari kualitas intent, bukan dari user mengklasifikasi.
*(Bahasa awam: jangan suruh user isi form dulu buat dapet hasil bagus, cukup tulis tujuannya, sisanya AKSA yang baca.)*

### 11. Focal point bersaing ≠ masalah kalau fungsi beda & CTA sudah dominan
**Pemicu:** AKSA flag kartu "Paket Terakhir Dibeli" (riwayat) dianggap bersaing focal point sama kartu "Pasti Pelanggan Suka" (rekomendasi), padahal CTA "Beli Paket" merah full-width udah jelas paling menonjol, dan dua kartu itu beda fungsi + jelas dilabeli.
**Aturan:** "titik fokus bersaing" cuma masalah kalau dua elemen berebut perhatian untuk **keputusan/aksi yang sama**. Jangan flag kalau (a) aksi utama sudah jelas dominan, atau (b) elemen "saingan" beda fungsi & jelas dilabeli (differensiasi lewat label sudah cukup).
*(Bahasa awam: dua kartu keliatan sama-sama menonjol itu wajar kalau tugasnya beda dan ada judulnya, user nggak bingung milih antara "riwayat" dan "rekomendasi".)*

### 12. Ikon standar dipakai berulang = konsisten (jangan dibalik)
**Pemicu:** AKSA flag chevron-down yang dipakai untuk 3 accordion (rincian pemakaian, riwayat paket, skrip jualan) sebagai pelanggaran konsistensi, lalu nyaranin bikin chevron warna beda per "level".
**Aturan:** memakai **afordansi standar yang sama** (chevron=expand, hamburger=menu, panah=lanjut) untuk banyak elemen yang **interaksinya sejenis** (buka/tutup) itu **konsistensi yang benar** (Nielsen #4/Jakob), jangan dibalik jadi masalah cuma karena konten di baliknya beda. Bikin varian ikon per-item malah nambah inkonsistensi. Konsistensi baru dilanggar kalau aksi sama tampil beda antar-layar, ATAU kontrol identik menuju hasil berisiko beda tanpa label pembeda. Kalau tiap kontrol udah ada label teks jelas, ikon sama = wajar.
*(Bahasa awam: chevron itu "tanda bisa dibuka" universal, dipakai di banyak tempat justru bagus, jangan disuruh beda-bedain warnanya.)*

### 13. Anti-osilasi: saran nggak boleh bikin temuan berikutnya
**Pemicu:** kartu "Skrip Jualan" terbuka default → diflag **beban kognitif**, sarannya "collapsed + preview satu baris". Pas diterapkan, preview terpotong `Bilang: "Kuota-nya 2x lipat, Kak, namb…"` malah diflag **kejelasan label**. Saran AKSA sendiri yang melahirkan temuan berikutnya = whack-a-mole.
**Aturan:**
- Sebelum nulis saran, bayangkan hasilnya. Kalau bentuk barunya bakal diflag di dimensi lain, **sarannya yang salah**: perbaiki sarannya, jangan emit findingnya.
- Konten panjang terbuka default → saran benar = **collapsed TANPA preview terpotong**, cukup **label self-explanatory + chevron**.
- **Potongan teks ber-ellipsis di baris collapsed = pola standar, dan BUKAN label.** Nilai kejelasan-label dari **judul barisnya** ("Skrip Jualan (siap dibacakan)"), bukan dari fragmen kalimat yang kepotong.
- Layar yang sudah pakai pola benar → akui beres, jangan cari sisi lain buat tetap dikomentari.
*(Bahasa awam: jangan kasih saran yang nanti kamu salahin sendiri. Dan kalimat kepotong di baris yang bisa dibuka itu wajar, yang penting judulnya jelas.)*

### 14. "Aksi" ≠ tombol, dan fokus ≠ CTA dominan
**Pemicu:** halaman "Rekomendasi untuk nomor ini" diflag *penonjolan aksi · kurang*, "tidak ada tombol beli di tiap kartu paket", sarannya tambah tombol merah "Beli Rp56.500" di **tiap** kartu. Padahal (a) kartu paket kemungkinan besar tappable (pola standar), dan (b) fokus sudah diarahkan lewat **background hijau** (Law of Common Region) + badge **"Paling Untung"** (Von Restorff).
**Aturan:**
- Di daftar/kartu/baris, **elemen itu sendiri sering jadi target tap**. Dilarang vonis "tidak ada aksi" seolah fakta, tappable nggak bisa diverifikasi dari gambar statis. Kalau cue kurang, framing benar = **"tambahkan cue bisa-ditap (chevron ›, state pressable)"**, bukan "tambah tombol di tiap kartu" (3+ tombol setara malah bersaing).
- **Kredit mekanisme fokus non-tombol**: common region (bidang warna pengelompok), badge pembeda, ukuran, urutan. Kalau sudah efektif, akui, jangan nilai rendah cuma karena tak ada tombol.
- Turunkan status **hanya** kalau user beneran tak tahu **cara melanjutkan** setelah menentukan pilihan (gulf of execution), dan sebut sebagai masalah **cara lanjut**, bukan "tidak ada CTA dominan".
*(Bahasa awam: kartu yang bisa diklik itu udah tombol. Dan bidang hijau + label "Paling Untung" itu udah ngarahin mata, jangan dibilang nggak ada fokus cuma gara-gara nggak ada tombol.)*

### 15. Area tap: bounds visual ≠ hit area (jangan overclaim)
**Pemicu:** text button "Ubah Nomor" (77×40) diflag ✕ merah "Area tap kecil", sekeras kegagalan kontras, padahal 40px **lolos** WCAG 2.5.8 AA (min 24).
**Temuan cek standar:**
- **WCAG 2.5.8 AA** = 24×24 → 40px lolos.
- **Apple HIG** = 44×44pt, **tanpa pengecualian** untuk text button/link → meleset 4px.
- **Material** = 48dp touch target, **tapi visual boleh lebih kecil** (checkbox/radio: 40×40 visual, 48×48 hit area lewat padding).

**Aturan:** TIS mengukur **bounds visual di Figma**, bukan **hit area implementasi**: dua hal berbeda, dan yang kedua tak bisa diverifikasi dari desain statis. Maka:
- **min < 24px** → gagal WCAG → tetap **Pelanggaran** (✕ merah, bobot penuh).
- **24–44px** → lolos WCAG, cuma meleset panduan platform/DS → **Potensi** "perlu cek hit area implementasi" (! amber, bobot separuh).
- Ikon ✕ merah sekarang dihitung dari `hardFail()` (gagal WCAG), bukan dari "ada kategori", dulu semua temuan deterministik dapat ✕ merah tanpa pandang berat.
- Saran yang benar: **tambah padding** sampai hit area 48dp, visual & ukuran teks tak perlu diubah.
*(Bahasa awam: yang diukur TIS itu kotak yang kelihatan, bukan area yang bisa dipencet. Material sendiri bolehin tombol keliatan 40 tapi area pencetnya 48. Jadi jangan divonis salah, cukup diingetin buat dicek.)*

### 16. Profil kapasitas jadi lensa, bukan aktor tambahan
**Pemicu:** rencana menambah tiga profil sebagai persona terpisah di walkthrough. Ditimbang ulang, ongkosnya terlalu besar: menyentuh `TW_SYS` yang penuh kalibrasi (risiko regresi), perawatan 3× lipat, kedalaman per profil turun dari 5 run jadi 3, dan panggilan naik dari 6 jadi 10.
**Aturan:**
- Profil dipakai sebagai **lensa pembacaan hasil**, bukan aktor. `affected` di sintesis dikunci ke empat ID tetap (`vision`, `blind`, `lowlit`, `motor`) yang sama dengan taksonomi segmen yang sudah dipakai skoring, dan tiap `fix` wajib membawa `affected` sendiri.
- Melanjutkan §5: dilarang menandai `blind` untuk masalah hierarki visual atau penonjolan.
- Atribusi hanya dari friksi yang **teramati di run**, bukan tebakan siapa yang mungkin kesulitan. Kalau bukti kurang, dikosongkan.
- Blind spot screen reader ditutup lewat **scanner deterministik** (kategori `name`), bukan lewat persona AI. Alasannya: yang deterministik boleh menahan rilis, persona AI selamanya cuma advisory sampai tervalidasi.
*(Bahasa awam: kita nggak nambah "pemeran" baru yang bikin analisisnya makin berat dan makin rawan rusak. Kita cuma menandai tiap temuan itu kena siapa, lalu masalah yang benar-benar tak terlihat mata kita periksa pakai aturan pasti, bukan pakai tebakan AI.)*

### 17. Elemen interaktif tanpa teks: pelanggaran atau potensi, tergantung nama layer
**Pemicu:** scanner cuma punya empat kategori (`contrast`, `type`, `target`, `image`). Elemen ikon-saja tidak punya node TEXT, jadi lolos semuanya, padahal buat pengguna screen reader elemen itu praktis tidak ada.
**Aturan:** flag hanya kalau elemen **benar-benar interaktif** dan **tidak punya teks yang terlihat**. Lalu dibedakan:
- Nama layer generik (`Frame 123`, `Vector`, `icon`) → **pelanggaran**, WCAG 4.1.2 gagal, tidak ada dasar accessible name sama sekali.
- Nama layer deskriptif (`Tombol Tutup`) → **potensi**, perlu diverifikasi, karena Figma tidak menjamin dev memakai nama layer sebagai label.
- Punya teks, atau tidak interaktif → tidak diflag.
Nama teknis seperti `ic_close` sengaja dianggap deskriptif, jadi masuk potensi. Ada makna di situ, hanya perlu dipastikan tidak dibacakan mentah.
*(Bahasa awam: tombol yang cuma ikon itu bisu buat pembaca layar. Kalau nama layernya pun asal, itu pelanggaran. Kalau namanya sudah jelas, itu tinggal dipastikan dipakai di kode.)*

### 18. "Semua berhasil" tidak sama dengan kokoh: hitung variasi jalur
**Pemicu:** hasil walkthrough menampilkan "Konsisten berhasil 5 dari 5, Rapuh 0", padahal di bagian yang sama sintesis menulis "Di Run 3 dan Run 5 user harus swipe horizontal dulu" dan menyebut kerentanan entry kategori yang off-screen. Lebih parah, `confidence` menulis "jalur dan pilihan konsisten identik di 5 dari 5 run", bertentangan dengan pola kegagalan yang dia tulis sendiri dua baris di atasnya.
**Akar masalah:** dokumen kita menyatakan "variasi antar-run = sinyal rapuh", tapi itu **hanya ada di dokumen**. Di kode, `counts` cuma menjumlahkan verdict yang dilaporkan tiap run. Tidak ada yang membandingkan jalur antar-run, jadi lima run yang menempuh rute berbeda tetap terhitung "konsisten".
**Aturan:**
- **Hitung deterministik dari data run**, jangan percaya klaim model: jumlah jalur berbeda (`pathVariants`) dan jumlah run yang punya langkah bingung (`confusedRuns`).
- Headline "✓ Konsisten berhasil" **hanya boleh** muncul kalau semua run berhasil, jalurnya satu macam, dan tidak ada langkah bingung. Kalau semua sampai goal tapi lewat rute berbeda, headline jadi "△ Sampai goal, tapi jalur tidak seragam".
- Angka itu **dikirim ke sintesis sebagai FAKTA TERHITUNG yang tidak boleh dibantah**, sehingga model tidak bisa mengklaim jalur identik saat datanya bilang lain.
- Tambah aturan konsistensi internal di `SYNTH_SYS`: dilarang menyebut pola kegagalan di run tertentu lalu mengklaim semua run seragam; dan kalau memang kokoh, kosongkan `failure_modes`, jangan mengarang kerentanan supaya terlihat teliti.
*(Bahasa awam: kalau lima orang sampai tujuan lewat jalan berbeda-beda SAMBIL kebingungan, itu tanda mereka cuma kebetulan nemu jalannya. Dulu ini kebaca "berhasil semua", sekarang dihitung dan diberi tahu.)*

### 18b. Koreksi §18: jalur berbeda bukan dengan sendirinya tanda rapuh
**Pemicu:** aturan §18 langsung dipakai dan ternyata over-correct. Journey Shop-Internet dapat headline kuning "jalur tidak seragam", padahal sintesisnya sendiri menjelaskan dengan benar: ada dua pintu masuk paralel ('Digital & Musik' dan 'Digital Lifestyle') yang sama-sama berlabel jelas menuju tujuan yang sama, "perbedaan ini soal panjang jalur, bukan kegagalan", dan "tidak menimbulkan kebingungan pada run mana pun". AKSA menalar benar, aturan sayalah yang salah.
**Akar masalah:** aturannya menyala karena **bentuk** (jumlah jalur berbeda), bukan karena **fungsi** (usernya ragu atau tidak). Ini pengulangan kesalahan yang sama dengan §11, §12, dan §14.
**Aturan:**
- Pemicu kuning adalah **langkah ragu** (`confusedRuns`), bukan jumlah jalur (`pathVariants`).
- Jalur berbeda **tanpa** keraguan = rute paralel yang sah. Headline tetap hijau, diberi keterangan "ada rute alternatif", dan kotaknya **netral abu, bukan kuning**.
- Isi catatan netralnya diarahkan ke pertanyaan yang benar: apakah rute terpanjang layak dipendekkan (efisiensi), **bukan** apakah rutenya harus dijadikan tunggal. Memaksa satu rute justru sering memperburuk arsitektur informasi.
- `SYNTH_SYS` ikut dikoreksi dengan pembeda eksplisit d1 (beda jalur karena ragu = rapuh) versus d2 (rute paralel berlabel jelas = wajar).
*(Bahasa awam: dua pintu masuk yang dua-duanya jelas menuju tempat yang sama itu normal, bukan cacat. Yang bikin rapuh itu bingungnya, bukan banyaknya pintu.)*

### 19. AKSA memegang peta, jadi hampir tidak pernah bisa gagal
**Pemicu:** paling penting sesi ini, karena ada **bukti dunia nyata**. Task upgrade paket IndiHome: Pak Tri **gagal** saat mencobanya di video. AKSA melaporkan "Rapuh 5 dari 5, sampai goal". Jejak run-nya jujur menyebut *"tidak ada tombol upgrade/ganti paket utama yang jelas di layar ini"* dan *"user menebak area info nomor/akun ini bisa membuka pengaturan langganan"*, tapi verdict-nya tetap rapuh, bukan gagal.

**Dua akar masalah, dua-duanya struktural:**

1. **Tangga verdict-nya hilang dari prompt.** Aturan lama "label menonjol → berhasil, tenggelam/ambigu → rapuh, **tidak ada yang cocok → gagal**" tercatat di dokumen metode, tapi grep membuktikan frasa itu **tidak ada sama sekali** di `TW_SYS` yang berjalan. Aturan yang seharusnya menangkap kasus ini memang tidak pernah ada di mesinnya.
2. **AKSA diberi peta alur.** `mapText` memuat semua opsi beserta layar tujuannya. Artinya AKSA tidak pernah benar-benar tersesat, dia bisa melihat kunci jawaban. Ini bias optimis yang sistematis: selama ada jalur ter-wire, dia akan menemukannya, sehingga hasilnya menumpuk di "berhasil" dan "rapuh" dan nyaris tidak pernah "gagal".

**Aturan:**
- Tambah field langkah **`guessed`**: benar kalau tidak ada satu pun label terlihat yang cocok dengan maksud task, sehingga harus menebak elemen tanpa label (blok info akun, banner, avatar).
- **Tangga verdict dikembalikan dan dibuat mekanis.** `rapuh` hanya untuk user yang ragu **padahal labelnya ada**. Kalau labelnya memang tidak ada dan kebetulan tebakannya benar, itu **gagal**.
- **Anti-bias peta:** dilarang keras memilih elemen dengan alasan "peta menunjukkan ini menuju goal". Pilih hanya dari yang terbaca di layar. Kalau tidak ada yang terbaca cocok, laporkan gagal walaupun peta memperlihatkan jalan tembus. **User asli tidak memegang peta.**
- **Penegakan deterministik di kode**, bukan mengandalkan kepatuhan model: run yang punya langkah `guessed` diturunkan otomatis jadi `gagal`, dan alasan penurunannya ditampilkan terbuka di UI supaya tidak jadi kotak hitam.

**Hasil simulasi dengan data run yang sama:** Rapuh 5 dari 5 berubah jadi **Gagal 5 dari 5**, headline "✕ Mayoritas user gagal". Cocok dengan yang dialami Pak Tri.

*(Bahasa awam: selama ini AKSA disuruh jadi user awam tapi dikasih peta jalannya. Ya wajar dia selalu sampai tujuan. Sekarang dia dilarang pakai peta itu buat memilih, dan kalau di layar memang tidak ada tulisan yang nyambung sama tujuannya, itu dihitung gagal, bukan cuma ragu.)*

---

## Blok KNOWLEDGE dan pemeriksa integritas

*Ditambahkan 12 Agu 2026.*

Sebelumnya pengetahuan TIS tersebar: definisi profil hidup di dua tempat berjauhan tanpa penyelaras, dan 20 aturan kalibrasi tertanam di dalam string prompt sepanjang puluhan ribu karakter. Menyunting di situ pernah menyebabkan **kegagalan diam-diam**, ketika satu karakter salah melepaskan dua klausa dari prompt tanpa memicu error apa pun.

**Yang sekarang berjalan:**

1. **`KNOWLEDGE.profil`** jadi sumber tunggal. `var PROFIL` (render chip) **diturunkan** dari sini, dan klausa `ATRIBUSI PROFIL` di prompt **dibangkitkan** dari sini lewat `profilPromptBlock()`. Keduanya tidak mungkin melenceng lagi. Field `bukan` di tiap profil otomatis jadi larangan di prompt, misalnya `blind` tidak boleh ditandai untuk isu hierarki visual.

2. **`KNOWLEDGE.kalibrasi`** mengkatalog 20 aturan, masing-masing dengan `jenis`, `ringkas`, `menyentuh`, `tidak_berlaku_saat`, dan **`jejak`** yaitu potongan teks penanda yang harus ada di prompt atau scanner terkait.

3. **`knowledgeCheck()`** memverifikasi tiap `jejak` **terhadap nilai variabel yang benar-benar dipakai**, bukan terhadap teks file. Ini pembedanya dari sekadar grep: kalau sebuah klausa terlepas dari string prompt, teksnya masih ada di file tapi tidak ada di variabel, dan hanya cara ini yang menangkapnya.

4. **Lencana kecil di panel AKSA** menampilkan `20/20 aturan aktif` saat sehat, dan berubah jadi peringatan merah yang menyebut ID aturannya kalau ada yang lepas.

**Diuji dengan sabotase disengaja.** Empat klausa dilepas satu per satu dari sumbernya (TRIANGULASI dari SYNTH_SYS, anti-bias peta dari TW_SYS, anti-osilasi dari prompt analisa, cek nama aksesibel dari scanner). Keempatnya terdeteksi, dan tanpa sabotase hasilnya bersih.

**Catatan jujur tentang cakupannya:** pemeriksa ini menjawab "apakah aturannya masih terpasang", **bukan** "apakah aturannya masih benar". Yang kedua hanya bisa dijawab oleh golden set dan eval set. Ini jaring pengaman terhadap kerusakan tak sengaja, bukan pengganti validasi.

---

## Batas jujur

- Heatmap **matematis** cuma proxy kasar (ukuran × kontras × saturasi), gak bisa baca isi gambar. **AKSA (yang punya penglihatan)** yang nambahin pertimbangan "ini focal competitor atau cuma background?". Dua-duanya saling lengkapi, bukan saling gantiin.
- Kalibrasi ini **heuristik**, bukan hukum pasti, tetap butuh konfirmasi manusia (AKSA nyaranin, bukan auto-ubah).

## Arah lanjut: Convention Library (Fase 2)

Semua aturan ini idealnya jadi **perpustakaan pola** yang di-ground ke referensi nyata (mobbin, Design System Telkomsel): kumpulan pola yang **diterima** (biar AKSA gak salah tuduh) + pola yang **beneran bermasalah**. Ini bikin TIS ngerti **konteks desain modern**, bukan checklist kaku, diferensiasi kuat vs scanner biasa.

## Nilai buat pitch

Iterasi kalibrasi ini = bukti hidup **"human review layer"**: desainer koreksi, AKSA makin tajam. Ceritanya: **TIS belajar dari manusia, bukan AI yang maksa keputusan.** Persis prinsip "AI nyaranin, manusia mutusin".

*Terkait: `tis-lensa-kalibrasi.md`, `tis-produk-ringkasan.md`, `tis-figma-plugin/ui.html` (SYS prompt AKSA).*

---

## §21 · Kontras harus dihitung setelah komposit alpha, bukan dari kode warna mentah

**Dilaporkan:** 20 Agustus 2026, dari layar TIS sendiri. Temuan berbunyi "Kontras teks rendah (1.0:1), teks #ffffff di atas #ffffff", padahal layar itu berlatar gelap dan teksnya terbaca jelas.

**Akar masalah.** Tiga fungsi di `code.js` membaca warna fill tetapi mengabaikan transparansi:

1. `solidFill()` mengembalikan `f.color` tanpa melihat `f.opacity`
2. `fillToBg()` dan `nodeBg()` sama, dan berhenti pada lapisan pertama yang ditemukan
3. `node.opacity` pada level layer tidak pernah dibaca sama sekali

Akibatnya kartu kaca berisi fill putih 8% di atas frame gelap dibaca sebagai putih pekat. Teks putih di atasnya jadi putih di atas putih, rasio 1,0:1.

**Perbaikan.** Ditambahkan komposit alpha yang benar:

- `nodeLayer(node)` menggabungkan seluruh fill sebuah node menjadi satu lapisan `{ color, alpha, unknown }`, dengan alpha sudah dikalikan `node.opacity`
- `bgUnderText()` mengumpulkan tumpukan lapisan dari yang terdekat di belakang teks sampai menemukan lapisan yang benar-benar menutup, lalu `compositeStack()` menghitungnya dari kanvas ke atas
- Warna teks sendiri ikut dikomposit ke latarnya sebelum rasio dihitung, karena teks semi-transparan warnanya berubah

**Efeknya dua arah, dan arah kedua yang lebih penting.** Selain menghilangkan vonis palsu, perbaikan ini menangkap kegagalan yang sebelumnya lolos. Teks putih dengan opacity 45% di atas latar `#18181C` sebenarnya menghasilkan rasio 4,49:1, tepat di bawah ambang 4,5:1. Kode lama membacanya sebagai 17:1 dan meloloskannya.

**Aturan menahan diri yang menyertai.** Kalau latar tetap tidak dapat dipastikan, sistem tidak boleh memvonis:

| Kondisi latar | Perlakuan |
|---|---|
| Solid, atau tumpukan transparan yang bisa dikomposit | dihitung, boleh menjadi pelanggaran |
| Gambar atau video | tidak dihitung, menjadi potensi |
| Container tanpa fill yang menutup teks | tidak dihitung, menjadi potensi |
| **Background Blur aktif** | tidak dihitung, menjadi potensi, dengan catatan khusus |

Kasus Background Blur perlu disebut terpisah karena warnanya ikut isi di belakangnya saat produk dipakai, sehingga rasio tidak punya nilai tunggal. Catatannya mengarahkan desainer menguji pada konten paling terang dan paling gelap, bukan pada contoh yang paling ramah.

**Catatan yang layak diingat.** Bahasa desain TIS sendiri memakai glassmorphism. Artinya pemindai TIS sebelumnya tidak mampu menilai antarmuka TIS sendiri dengan benar. Kalau ada satu alasan untuk memakai alat sendiri pada pekerjaan sendiri, ini contohnya.

**Jejak verifikasi.** Lima kasus diuji terhadap fungsi yang sudah dipatch:

| Kasus | Hasil |
|---|---|
| Teks putih, kartu putih 8%, frame gelap | latar `#2a2a2e`, rasio 14,21:1, lolos |
| Node opacity 20% di atas frame gelap | latar `#464649`, rasio 9,37:1, lolos |
| Teks putih opacity 45% di atas frame gelap | teks efektif `#808082`, rasio 4,49:1, melanggar |
| Kartu dengan Background Blur 28px | ditandai tidak pasti, menjadi potensi |
| Kontrol: teks gelap di atas putih solid | rasio 17,01:1, lolos |

---

## §22 · Bounding box bukan cakupan nyata

**Dilaporkan:** 20 Agustus 2026. Temuan berbunyi "Kontras teks rendah (1.0:1), teks #ffc800 di atas #ffc800" pada angka di tengah gauge.

**Akar masalah.** Angka "72" berada di **lubang donat** gauge. Ring gauge adalah `ELLIPSE` dengan `arcData.innerRadius` 0,79, artinya bagian tengahnya kosong. Tetapi bounding box-nya tetap lingkaran penuh 58×58, dan bounding box itu memuat kotak teks 28×32. Pemeriksa `rectContains` menyatakan ring menutupi teks, lalu warna ring dipakai sebagai latar. Teks kuning di atas ring kuning, rasio 1,0:1.

Ini kelas kesalahan yang berbeda dari §21. Di §21 warnanya salah dibaca karena transparansi. Di sini warnanya benar, tetapi **bentuknya** yang salah diasumsikan.

**Perbaikan.** Ditambahkan `shapeCovers(node, textBox)` yang dipanggil setelah `rectContains`:

| Tipe node | Perlakuan |
|---|---|
| `ELLIPSE` dengan `innerRadius > 0` atau sudut kurang dari lingkaran penuh | tidak dianggap menutupi, lanjut cari ke belakang |
| `ELLIPSE` penuh | dianggap menutupi hanya bila keempat sudut kotak teks berada di dalam elips |
| `VECTOR`, `BOOLEAN_OPERATION`, `STAR`, `POLYGON`, `LINE` | tidak dianggap menutupi, bentuknya tidak dapat dipastikan |
| `RECTANGLE`, `FRAME`, `COMPONENT`, `INSTANCE`, `GROUP`, `SECTION` | dianggap menutupi bounding box-nya |

**Yang dijaga agar tidak berlebihan.** Huruf inisial di dalam lingkaran avatar adalah pola nyata dan sering dipakai. Kalau semua elips ditolak, kasus itu akan luput. Karena itu elips penuh tetap diterima, dengan syarat kotak teks benar-benar berada di dalam elipsnya.

**Jejak verifikasi.**

| Kasus | Hasil |
|---|---|
| Angka di lubang donat gauge | melewati ring, latar `#101018`, rasio 12,18:1 |
| Inisial di lingkaran avatar penuh | tetap memakai lingkaran, rasio 4,57:1 |
| Teks yang bbox-nya melewati tepi lingkaran | melewati lingkaran, jatuh ke frame di belakang |

---

## §23 · WCAG tidak menetapkan ukuran font minimum

**Ditemukan bersama §22.** Teks 11,5px dilaporkan sebagai **pelanggaran** dengan rujukan WCAG 1.4.4 Resize Text, dan judulnya tertulis "Teks terlalu kecil (12px)".

**Dua kesalahan sekaligus.**

Pertama, **WCAG tidak pernah menetapkan ukuran font minimum.** Kriteria 1.4.4 mengatur hal yang berbeda, yaitu teks harus dapat diperbesar sampai 200% tanpa kehilangan isi atau fungsi. Mengutipnya sebagai gagal untuk teks 11,5px adalah rujukan yang keliru. Karena sumber WCAG bernilai gagal, temuan ini menjadi pelanggaran, dan pelanggaran menggerbang rilis. Artinya rilis bisa tertahan oleh aturan yang tidak ada.

Kedua, **judulnya membulatkan angka.** Ukuran sebenarnya 11,5px ditulis 12px, sementara ambangnya sendiri 12px. Pembaca melihat "terlalu kecil (12px)" padahal 12px justru lolos.

**Perbaikan.**

- Sumber WCAG diturunkan menjadi perlu cek, dengan catatan yang menjelaskan bahwa WCAG tidak mengatur ukuran minimum
- Apple HIG dan Material tetap gagal, karena keduanya memang preskriptif: Apple menganjurkan minimum 11pt untuk teks badan, Material memakai body-small 12sp
- Design System diturunkan menjadi lolos tipis
- Severity turun dari 3 ke 2, sehingga temuan ini masuk **Potensi**, bukan Pelanggaran
- Judul menampilkan satu desimal, sehingga 11,5px tidak lagi terbaca 12px
- Ditambahkan catatan perlu manusia: label pendukung seperti satuan boleh lebih kecil, yang berbahaya kalau teks utama yang mengecil

**Konsistensi dengan aturan yang sudah ada.** Prinsip ini sudah dipakai untuk target sentuh: lolos WCAG tetapi meleset dari panduan platform berarti potensi, bukan pelanggaran. Aturan itu tidak pernah diterapkan ke ukuran font. Sekarang keduanya seragam.

---

## §24 · Pemeriksa integritas ikut berteriak palsu

**Dilaporkan:** 20 Agustus 2026. Muncul peringatan merah "6 aturan kalibrasi tidak terdeteksi di mesin: K04, K11, K12, K13, K14, KDENS", semuanya bersumber `analyze`.

**Ini alarm palsu.** Keenam aturan itu tetap ada di kode. Yang salah adalah pemeriksanya.

**Dua akar penyebab.**

Pertama, `knowledgeCheck()` hanya mengenal dua keadaan: ditemukan atau hilang. Aturan yang sumbernya **belum tersedia** ikut dihitung hilang. Enam aturan itu hidup di dalam prompt analisa, dan prompt analisa baru terisi setelah tombol analisa ditekan. Jadi setiap kali plugin dibuka dan belum ada analisa, keenamnya otomatis dilaporkan lepas.

Kedua, dan ini yang membuat alarmnya hampir pasti muncul: fungsi **tebak context** ikut merekam prompt-nya ke `lastAnalyzePrompt`. Padahal prompt tebak context sama sekali tidak memuat aturan kalibrasi. Begitu tombol Tebak context ditekan, variabel itu terisi teks yang salah, pemeriksa menganggap sumbernya sudah tersedia, lalu melaporkan keenam aturan hilang.

**Perbaikan.**

- `knowledgeCheck()` sekarang mengenal tiga keadaan: **ada**, **hilang**, dan **belum diperiksa**. Hanya `hilang` yang berarti masalah, yaitu sumbernya sudah terisi tetapi jejaknya tidak ada
- Prompt tebak context tidak lagi direkam ke `lastAnalyzePrompt`
- Lencana hanya berwarna merah untuk `hilang`. Untuk `belum`, tampilannya baris abu biasa yang menyebutkan berapa aturan akan diperiksa setelah analisa pertama

**Kenapa ini penting melampaui satu bug.** Pemeriksa integritas dibangun supaya aturan yang lepas tidak lolos diam-diam. Alat semacam itu hanya berguna kalau peringatannya dipercaya. Peringatan yang muncul setiap kali plugin dibuka akan diabaikan dalam hitungan hari, dan ketika suatu saat ada aturan yang benar-benar lepas, tidak akan ada yang menoleh. Alarm palsu pada alat pengawas lebih berbahaya daripada tidak ada alarm sama sekali.

**Jejak verifikasi.**

| Keadaan | Hasil |
|---|---|
| Plugin baru dibuka, belum ada analisa | ada 14, hilang 0, belum 6. Tidak ada peringatan merah |
| Setelah analisa pertama dijalankan | ada 20, hilang 0, belum 0 |
| Jejak K13 sengaja dihapus dari prompt | ada 19, hilang 1, K13 terdeteksi. Peringatan merah muncul |

---

## §25 · Kata di task bocor jadi label di layar

**Dilaporkan:** 20 Agustus 2026, dari layar dashboard IndiHome di MyTelkomsel. Walkthrough melaporkan berhasil 5 dari 5 dengan keyakinan tinggi, padahal layarnya sangat padat, 36 teks terlihat sekaligus.

**Kenapa bisa berhasil lima kali.** Tiga sebab yang menumpuk.

Pertama, AKSA tidak pernah benar-benar mencari. Ia menerima daftar rata seluruh teks di layar, dipisah menjadi terlihat, di bawah fold, dan off-screen. Buat AKSA, layar berisi 36 elemen sama mudahnya dengan layar berisi 5. Biaya menyapu mata melewati puluhan elemen, yang justru mahal bagi manusia, sama sekali tidak ada dalam simulasi.

Kedua, peta menyebutkan nama pintunya. Instruksi kita menyatakan label opsi di peta diusahakan sama dengan teks asli elemennya, dan AKSA boleh memakainya untuk mencocokkan. Ini saudara kandung dari bias peta yang sudah kita tangani lewat K19b, tapi K19b hanya melarang memilih karena peta menunjukkan jalan, bukan karena peta menyebut namanya.

Ketiga, dan ini yang paling menentukan, kata di task hampir sama persis dengan label di layar. Task berbunyi upgrade paket utama, labelnya Ganti Paket Utama. Itu bukan keputusan, itu pencocokan kata.

Padahal di layar yang sama ada tiga pintu yang sama-sama masuk akal bagi orang yang internetnya lambat: Ganti Paket Utama, Tambah Speed dan FUP, serta Tambah Jangkauan. Dua terakhir bahkan punya ikon plus yang secara visual terlihat lebih bisa ditekan. AKSA tidak pernah menimbang keduanya.

Jadi ini bukan lima keputusan yang sepakat. Ini satu jawaban yang sudah bocor, diulang lima kali.

**Dalam taksonomi kita ini `terlewat`.** Orang berpotensi kesulitan, TIS diam, dan temuannya tidak akan pernah muncul sampai ada uji pengguna yang membantahnya.

**Perbaikan, tiga lapis.**

Lapis pertama deterministik. Ditambahkan `taskLeak()` yang membandingkan kata di task dengan label yang terlihat di layar. Kalau sebuah label pendek punya minimal dua kata yang sama dengan task dan proporsinya di atas 60 persen, itu dihitung kebocoran. Kalau seluruh katanya sama, tingkatnya berat.

Lapis kedua menurunkan keyakinan. Kebocoran berat menurunkan keyakinan tinggi menjadi sedang, dan keyakinan sedang menjadi rendah. Alasannya sederhana: kalau kelima percobaan mencocokkan kata yang sama, kesepakatan mereka tidak membuktikan apa pun tentang kejelasan alurnya.

Lapis ketiga aturan baru **KBOCOR** di `TW_SYS` dengan jejak `PINTU ALTERNATIF`. Isinya mewajibkan AKSA menyebut dulu semua label yang masuk akal di tiap layar, melarang memilih hanya karena kemiripan kata, dan meminta menandai titik ragu kalau ada dua atau lebih label yang sama masuk akal walaupun akhirnya memilih yang benar.

Ditambah satu catatan kepadatan yang tidak menggerbang. Layar dengan 25 teks terlihat atau lebih diberi catatan bahwa AKSA menerima teks sebagai daftar, sehingga kepadatan tidak memberatkannya seperti memberatkan mata manusia, dan kalau layar itu penting kepadatannya perlu diuji ke orang.

**Jejak verifikasi.**

| Task yang diuji | Hasil |
|---|---|
| upgrade paket utama | bocor tingkat sedang, label Ganti Paket Utama |
| Ganti Paket Utama IndiHome | bocor tingkat berat |
| internet di rumah lambat, mau lebih kencang | tidak ada kebocoran |
| cek sisa kuota | tidak ada kebocoran |

Semua kasus di atas memakai layar yang sama, dan semuanya ditandai padat dengan 36 teks terlihat.

**Yang bisa dilakukan desainer tanpa menunggu apa pun.** Tulis task sebagai keinginan orang, bukan nama fitur. Bukan upgrade paket utama, melainkan internet di rumah lambat dan mau lebih kencang. Perubahan ini saja sudah memaksa AKSA memilih di antara tiga pintu tadi.

**Ralat jumlah aturan.** Sekalian dicatat di sini. Pola pencarian yang saya pakai sebelumnya, `id:"[A-Z0-9]+"`, melewatkan tiga aturan yang idnya mengandung huruf kecil, yaitu K18b, K19a, dan K19b. Akibatnya beberapa dokumen sempat menyebut tujuh belas aturan. Jumlah sebenarnya dua puluh sebelum KBOCOR, dan dua puluh satu sesudahnya. Sebarannya: sebelas menahan diri, tujuh deteksi, dua atribusi, satu ambang.

---

## §26 · Vonis kuning terbaca bertentangan dengan angkanya

**Dilaporkan:** 20 Agustus 2026. Hasil walkthrough berbunyi "Sampai goal, tapi sempat ragu" berwarna kuning, sementara baris angkanya berbunyi "Gagal 0 · Rapuh 0 · Berhasil 5 dari 5". Pembacanya bingung, dan wajar.

**Bukan bug logika, tapi bug komunikasi.** Vonis kuningnya benar menurut aturan §18b: kuning dipicu oleh langkah ragu, bukan oleh variasi jalur. Masalahnya, dua hal berbeda dipakai bergantian tanpa dibedakan di layar.

**Rapuh** itu vonis untuk satu percobaan utuh. **Ragu** itu keadaan di satu langkah di dalam percobaan yang bisa saja berakhir berhasil. Sebuah run bisa berhasil dan tetap mengandung langkah ragu. Baris angka lama hanya menampilkan rapuh, jadi angka nol di situ terbaca sebagai tidak ada masalah, padahal keraguannya ada dan justru itu yang memicu warna kuning.

**Perbaikan.** Angka sekarang ditampilkan sebagai pil terpisah, dan **Sempat ragu berdiri sendiri persis di sebelah Berhasil**. Ditambah satu baris pendek berjudul "Kenapa kuning" yang menjelaskan sebabnya dalam satu kalimat.

Baris "Variasi sama dengan beda user beda hasil, kayak UT beneran" dihapus. Kalimat itu muncul di semua keadaan, termasuk saat kelima run menempuh jalur yang persis sama, sehingga justru menyesatkan.

**Sekalian merapikan keluaran yang terlalu panjang.** Hasil walkthrough sebelumnya menampilkan sepuluh blok sejajar, dan sebagian mengulang isi yang sama dengan kata berbeda.

| Blok | Sebelum | Sesudah |
|---|---|---|
| Peringatan kebocoran kata | kotak besar | dilipat ke dalam satu baris Mutu bukti |
| Catatan kepadatan | kotak besar | dilipat ke baris yang sama |
| Pola kegagalan | daftar terbuka | dilipat, muncul jumlahnya saja |
| Mulai beda jalan | selalu tampil | disembunyikan kalau isinya menyatakan semua run konvergen |
| Keyakinan | satu kalimat panjang | satu kata, alasannya jadi tooltip |
| Rekomendasi | semua terbuka | yang pertama terbuka, sisanya dilipat |

Prinsipnya satu vonis, satu sebab, satu tindakan. Sisanya tetap ada, tapi tidak menuntut perhatian sebelum diminta.

**Yang sengaja tidak dilipat:** penurunan vonis karena menebak. Itu satu-satunya blok yang mengubah hasil gate, jadi ia harus terlihat tanpa perlu diklik.

---

## §27 · Journey yang sama memberi vonis berlawanan, dan eksplorasi dianggap wajar

**Dilaporkan:** 20 Agustus 2026, journey ganti paket utama IndiHome. Dua kali dijalankan, dua kesimpulan berbeda.

Jalan pertama: dua dari lima run ragu di layar Detail paket karena harus membandingkan Internet Basic, Internet plus Telepon, Internet plus TV, dan Paket Complete tanpa penanda mana yang lebih murah. Vonisnya kuning.

Jalan kedua: nol keraguan, vonisnya hijau, dan akar masalahnya justru berbunyi memindai kartu adalah perilaku normal, bukan choice overload.

Layarnya sama. Kesimpulannya berlawanan.

**Dua sebab, dan keduanya perlu ditangani terpisah.**

**Sebab pertama, kata di task menentukan apakah eksplorasi dihitung friksi.** Pada jalan pertama task mengandung maksud ekonomi, menurunkan biaya. Membandingkan empat kategori tanpa harga jelas menghambat maksud itu. Pada jalan kedua task hanya berbunyi ganti paket utama, tanpa menyebut apa yang dicari, sehingga memindai kartu memang terbaca sebagai menjelajah biasa.

Jadi AKSA tidak sepenuhnya keliru. Ia menjawab pertanyaan yang berbeda karena pertanyaannya memang berubah. Tapi desainer tidak menyadari perubahan kata sekecil itu mengubah vonis, dan itu berbahaya.

**Perbaikannya, aturan KBANDING.** Task diperiksa deterministik untuk kata yang menandakan pembandingan seperti murah, hemat, biaya, turun, terbaik, paling, bandingkan, kencang. Kalau ketemu, sebuah klausa disisipkan ke prompt yang menyatakan langkah memilih di antara beberapa opsi sejenis adalah bagian dari tugas, bukan latar belakang. Kalau informasi pembandingnya tidak tampil di layar pemilihan, langkah itu wajib ditandai ragu walaupun akhirnya benar. Klausa itu juga melarang secara eksplisit kesimpulan memindai kartu adalah perilaku normal untuk task semacam ini.

Ditambah satu catatan mutu bukti. Kalau task terdeteksi komparatif tetapi hasilnya nol keraguan, itu ditandai patut dicurigai, bukan diterima begitu saja.

**Sebab kedua, dan ini yang lebih mendasar: hasil kita memang belum stabil.** Paper MatrAIx menunjukkan vonis bisa berayun jauh hanya karena beda model. Yang terjadi di sini serupa, dan muncul di alat kita sendiri.

**Perbaikannya, riwayat kestabilan.** Vonis tiap jalan disimpan per journey. Kalau jalan berikutnya menghasilkan kombinasi angka yang berbeda, muncul peringatan di paling atas kartu yang menyebutkan hasil sebelumnya apa, dan menyarankan menjalankan sekali lagi sebelum dipakai mengambil keputusan.

Peringatan itu sengaja diletakkan paling atas, bukan dilipat, karena ia melemahkan seluruh isi kartu, bukan cuma satu bagiannya.

**Jejak verifikasi deteksi task komparatif.**

| Task | Hasil |
|---|---|
| ganti paket utama IndiHome | biasa |
| cari paket internet yang paling murah | komparatif, dari kata murah dan paling |
| turunkan biaya langganan bulanan | komparatif, dari kata biaya, turun, turunkan |
| internet di rumah lambat, mau lebih kencang | komparatif, dari kata kencang |
| daftar akun baru | biasa |
| cek sisa kuota | biasa |

**Yang masih terbuka.** Deteksi ini masih bergantung pada kata di task. Kalau desainer menulis task dengan kata lain yang bermakna sama, misalnya cari yang pas di kantong, aturannya tidak menyala. Daftar katanya perlu ditambah dari task nyata selama pilot, dan itu masuk jalur feeding sebagai sumber `dismissed-designer` maupun `ut`.

---

## §28 Layar padat lolos hijau karena mencari tidak berbiaya buat AKSA

**Temuan.** Journey dengan layar 39 teks terlihat menghasilkan Konsisten berhasil 5 dari 5, nol keraguan. Kepadatannya cuma muncul sebagai catatan kaki di Mutu bukti, tidak berpengaruh apa pun ke vonis.

**Sebab pokoknya bukan kekurangan model, tapi bentuk masukannya.** Manusia menghadapi layar sebagai bidang dua dimensi dan harus memindai. AKSA menerima teks layar sebagai daftar rata yang sudah terurut. Menemukan sebuah label buat AKSA hampir gratis, jadi layar 39 teks tidak lebih berat daripada layar 6 teks. Kepadatan adalah persis jenis friksi yang paling tidak bisa dirasakan oleh bentuk masukan seperti ini.

Karena itu kepadatan tidak boleh diserahkan ke AI untuk dinilai. Dia harus dihitung dari scene graph, lalu dipaksakan masuk ke prompt sebagai biaya yang wajib diakui.

**Kenapa hitungan lama tidak memadai.** Ukuran sebelumnya memakai `screenTexts`, yang membuang teks kembar, memotong di 55 item, dan membuang label lebih dari 60 karakter. Tiga hal itu semuanya menurunkan angka kepadatan. Padahal lima tombol berlabel sama tetap lima benda yang harus dipindai mata.

**Perbaikan pertama, ukur dari scene graph.** `screenLoad()` di code.js menghitung mentah tanpa dedupe dan tanpa cap: jumlah teks terlihat, jumlah target bisa ditap yang terlihat, jumlah teks di bawah fold, dan jumlah kelompok tingkat atas.

**Perbaikan kedua, kepadatan jadi biaya di prompt.** Aturan baru `KPADAT`. Layar yang lewat ambang disebutkan namanya ke AKSA, disertai larangan menyimpulkan tidak ada friksi hanya karena label yang benar ada di daftar. Di layar itu AKSA wajib menuliskan tiga elemen pertama yang diperiksa sebelum menemukan target, dan wajib menandai ragu kalau target tidak termasuk tiga elemen pertama, atau berada di bawah fold, atau tidak ada satu titik fokus visual yang menuntun ke target.

Permintaan menyebut tiga elemen pertama itu bukan hiasan. Dia mengubah pertanyaannya dari apakah label ada menjadi seberapa jauh label harus dicari, dan jawabannya bisa diperiksa manusia.

**Perbaikan ketiga, naikkan dari catatan kaki jadi peringatan.** Layar sangat padat yang menghasilkan nol keraguan sekarang tampil sebagai peringatan di badan kartu, bukan di dalam lipatan. Kombinasi itu justru kondisi di mana vonis hijau paling mungkin keliru.

**Ambang yang dipakai, dan statusnya.** Padat pada 30 teks terlihat atau 10 target bisa ditap. Sangat padat pada 45 teks atau 16 target. Angka ini heuristik, dipilih supaya layar dashboard kelas MyTelkomsel dan IndiHome kena, sementara layar formulir biasa tidak. Belum ada dasar empiris. Kalibrasinya diambil dari sesi UT selama pilot, dengan membandingkan layar mana yang benar-benar bikin peserta memindai lama.

**Dua aturan yang sengaja saling tarik.** `KDENS` menahan AKSA supaya tidak otomatis menghukum kepadatan pada alat kerja power user. `KPADAT` memaksa AKSA mengakui biaya pencarian. Keduanya memang berlawanan arah, dan itu disengaja: yang pertama mencegah alarm palsu pada dashboard mitra, yang kedua mencegah lolos palsu pada layar konsumen. Kalau selama pilot keduanya sering bentrok di layar yang sama, yang perlu ditambah adalah penanda tipe pengguna di journey, bukan salah satu aturannya dihapus.

**Alarm palsu yang ikut ketahuan.** Waktu menambah `KPADAT` ketahuan `KBANDING` dari §27 salah alamat. `menyentuh`-nya ditulis `TW_SYS`, padahal jejaknya hidup di klausa bersyarat yang cuma menyala kalau task terdeteksi komparatif. Pemeriksa integritas akan melaporkannya lepas dari mesin padahal utuh. Persis jenis alarm palsu yang dicatat di §24.

Diperbaiki dengan menambah sumber `klausa`. Pembangun klausa dipanggil memakai masukan uji, jadi klausa bersyarat tetap bisa diverifikasi tanpa harus menunggu pemicunya menyala.

**Hasil pemeriksaan setelah perubahan.** 23 aturan, rincian 11 menahan, 9 deteksi, 2 atribusi, 1 ambang. Tidak ada aturan berstatus hilang. Delapan berstatus belum, semuanya aturan yang menyentuh prompt analisa, dan itu wajar sebelum analisa pertama dijalankan.

**Yang tetap tidak terpecahkan.** Perubahan ini membuat AKSA memperlakukan kepadatan sebagai biaya, tapi tidak membuatnya benar-benar mengalami pencarian visual. Yang diukur tetap kepatuhan pada instruksi, bukan kesulitan yang sesungguhnya. Kepadatan tetap masuk daftar hal yang wajib diuji ke orang, bukan diputuskan dari sini.

---

## §29 Code review menyeluruh: enam bug, dan satu lubang audit yang lebih besar dari semuanya

Pemeriksaan menyeluruh terhadap `code.js` dan `ui.html`. Tidak ada referensi tak terdefinisi dan tidak ada kesalahan sintaks. Yang ditemukan bukan kesalahan tulis, melainkan enam kekeliruan logika dan satu lubang audit.

### Lubang audit: 12 aturan hidup di prompt tanpa pernah didaftarkan

Sebelum pemeriksaan ini, katalog berisi 22 aturan. Setelah menyisir semua penanda aturan yang benar-benar terkirim ke model, ditemukan 12 aturan lain yang selama ini bekerja tanpa pernah masuk katalog: `ANTI-HALU`, `COGNITIVE WALKTHROUGH`, `DISCOVERABILITY`, `JENIS LANGKAH`, `KALIBRASI KEPUTUSAN`, `KETERBATASAN ANALISA STATIS`, `WIRING PROTOTYPE`, `KALIBRASI KE POLA UMUM`, `KALIBRASI TIPE JOURNEY`, `GROUNDING`, dan `CERTAINTY`.

Ini masalah tata kelola, bukan cacat perilaku. Aturannya berfungsi. Tetapi karena tidak terdaftar, pemeriksa integritas tidak bisa melihatnya, dan tidak ada satu pun yang bisa menjelaskan ke auditor mengapa TIS memutuskan sesuatu dengan cara tertentu. `KALIBRASI KEPUTUSAN` bahkan menentukan kapan choice overload dihitung friksi, persis pokok sengketa di §27, dan selama ini tidak tercatat di mana pun.

Semuanya sudah didaftarkan tanpa mengubah isi prompt. Katalog sekarang 34 aturan: 18 menahan, 12 deteksi, 3 atribusi, 1 ambang.

Perlu dicatat juga penomorannya berlubang. Tidak ada K02, K07, K08, K09, K10, dan K16. Entah dihapus tanpa jejak, entah tidak pernah ada. Pemakaian nomor urut untuk aturan sebaiknya dihentikan, ganti kode yang bermakna seperti yang dipakai belakangan.

### Bug 1: pemeriksa integritas untuk aturan scanner memeriksa dirinya sendiri

`SCANNER_RULES` berisi daftar string yang ditulis tangan, lalu dikirim ke UI, lalu dicocokkan dengan jejak `K15` dan `K17`. Karena jejaknya memang ada di dalam daftar itu, pencocokan selalu lulus. Kalau logika sesungguhnya dihapus dari fungsi pemeriksa, lencana tetap hijau.

Ini alarm yang mustahil berbunyi, dan itu lebih buruk daripada tidak ada alarm sama sekali. Sama persis dengan pelajaran §24, tapi arahnya terbalik.

Diperbaiki dengan mengirim isi fungsi `checkNode` apa adanya lewat `String(checkNode)`, 8110 karakter. Sekarang pencocokan menyentuh badan fungsi yang benar-benar berjalan.

### Bug 2: satu node, banyak temuan, satu identitas

Temuan memakai `id: node.id`. Padahal satu node bisa melahirkan lebih dari satu temuan. Teks yang kekecilan sekaligus kontrasnya rendah menghasilkan dua temuan dengan identitas yang sama persis.

Tiga akibatnya, semuanya terlihat oleh pemakai:

Menutup satu temuan ikut menutup temuan lain di node yang sama. Kalau desainer menandai teks kecil sudah dibenahi, temuan kontras rendah di node yang sama ikut hilang tanpa pernah dibenahi. Temuan kontras itu bersifat menahan rilis.

Membuka satu kartu membuka semua kartu di node itu sekaligus.

Hitungan temuan jadi hitungan node, sehingga jumlah masalah terlihat lebih sedikit daripada yang sebenarnya.

Diperbaiki dengan memberi tiap temuan identitas sendiri lewat `stampFid`, berupa id node ditambah kategori, dengan penomoran kalau ada kembar. `id` node tetap dibawa terpisah supaya pilih di canvas dan sorot di canvas tetap jalan.

### Bug 3: gate tidak menghormati keputusan desainer

`accFromFindings`, yang dipakai menghitung skor gate, tidak melihat status temuan sama sekali. Panel menghormati temuan yang sudah ditutup, gate tidak. Untuk layar yang sama, angka di layar dan angka yang menentukan lolos atau tidak bisa berbeda.

Diperbaiki: gate memakai aturan yang sama dengan panel.

### Bug 4: snapshot tidak mencatat asal-usul vonis

Ini P1 yang sudah beberapa kali ditunda sejak analisa MatrAIx. `snapshot` tidak mencatat model apa yang memberi vonis, apakah sedang mundur ke Sonnet karena token tidak punya akses Opus, dan versi knowledge berapa yang berlaku. Padahal beda model bisa mengubah hasil dari 23 persen ke 94 persen pada kohort identik, dan BR sudah mewajibkan versi model bisa ditelusuri.

Sudah ditambahkan blok `provenance`.

### Bug 5: peringatan mutu bukti berhenti di layar

Semua peringatan yang dibangun di §25 sampai §28, vonis goyah, kebocoran task, layar padat, task komparatif, tampil di UI tapi tidak ikut masuk snapshot. Pembaca hilir di Govern melihat GATE PASS tanpa tahu vonisnya sempat berbeda di jalan sebelumnya.

Sudah ditambahkan blok `evidence`.

### Bug 6: lebar jendela awal tidak sesuai

`figma.showUI` membuka di 360, sementara `render()` langsung meminta 380. Akibatnya jendela berkedip sekali tiap plugin dibuka. Sudah disamakan ke 380.

### Yang sengaja dibiarkan

Beberapa fungsi tidak terpakai: `resolveBg`, `nodeBg`, dan `rectsOverlap` di `code.js` adalah sisa pemeriksa kontras sebelum perbaikan alpha di §21. Dibiarkan dulu, tapi diberi catatan supaya tidak ada yang memakainya lagi, karena versi itu mengabaikan transparansi.

Penangan pesan `preview` dan `rescan` di `code.js` tidak pernah dipanggil UI. Tidak berbahaya.

Temuan berstatus potensi tetap ikut menurunkan skor dengan bobot setengah, jadi secara teori potensi bisa ikut menahan rilis. Butuh sekitar 25 potensi di satu layar untuk menembus ambang 80, jadi jarang terjadi. Tetap perlu diputuskan apakah ini sesuai dengan sikap bahwa yang menahan rilis hanya sinyal deterministik yang pasti.

---

## §30 Keputusan: gate aksesibilitas tetap seperti sekarang

**Tanggal:** 26 Agustus 2026. **Diputuskan oleh:** Nang.

Setelah menimbang empat opsi lewat `tis-opsi-gate.html`, aturan gate tidak diubah. Tetap lolos kalau skor tiap layar minimal 80, dengan pelanggaran berbobot 5 dan potensi berbobot setengah severity.

**Alasannya, dan ini yang mengubah arah pembahasan.** Bucket potensi bukan sekadar catatan kecil. Di situlah semua kasus yang scanner belum sanggup putuskan mendarat, terutama temuan "kontras belum bisa dipastikan" yang muncul ketika latar teks berblur, transparan, atau berupa gambar. Selama titik buta itu masih ada, potensi berfungsi sebagai jaring pengaman.

Kalau bobot potensi dinolkan, akibatnya terbalik dari yang diniatkan: layar glass dan overlay yang justru paling berisiko malah jadi yang paling gampang lolos, karena masalahnya tidak pernah naik jadi pelanggaran. Opsi A dan C keduanya punya efek samping ini, dan saya tidak melihatnya waktu menyusun rekomendasi.

**Yang tetap terbuka.** Alasan di atas membenarkan mempertahankan bobot potensi. Dia tidak membenarkan pelanggaran yang tetap lunak. Lima kegagalan WCAG yang pasti masih menghasilkan skor 80 dan lolos gate. Dua hal ini bisa dipisah: bobot potensi dibiarkan apa adanya, sementara pelanggaran dibuat nol-toleransi. Belum diputuskan, dan sengaja tidak didorong sekarang.

**Prasyarat kalau nanti ditinjau ulang.** Pemicu yang paling masuk akal adalah ketika titik buta kontras sudah mengecil, misalnya setelah pemeriksa sanggup membaca latar berblur dengan andal. Saat itu isi bucket potensi berubah, dan pertimbangan di atas perlu dihitung ulang dengan angka layar sungguhan, bukan profil rekaan.

---

## §31 Acuan Figma ternyata flat, padahal pluginnya glassmorphism

**Temuan, dan ini kesalahan saya.** Nang menandai bahwa layar Figma yang saya buat tidak sesuai dengan plugin. Setelah dicek, penyebabnya bukan detail kecil. Saya membaca fungsi JavaScript yang merakit HTML untuk tahu strukturnya, tapi tidak pernah membuka blok `<style>`. Akibatnya seluruh gambaran visualnya keliru.

**Selisihnya, dari CSS yang sebenarnya.**

| Bagian | `ui.html` | Yang saya gambar |
|---|---|---|
| Latar panel | tiga radial gradient merah, oranye, ungu di atas linear `#F3F2F8` ke `#E9E8F0` | flat `#EDEDF3` |
| Top bar dan nav | putih 55 persen dengan `backdrop-filter: blur(28px) saturate(1.8)` | putih 72 dan 88 persen, tanpa blur |
| Kartu temuan | putih 58 persen, `blur(22px) saturate(1.7)`, garis putih 75 persen, bayangan luar plus sorotan dalam | putih pekat, tanpa garis, tanpa bayangan |
| Ikon severity | lingkaran penuh 20px, isi warna, huruf putih | kotak radius 6, latar pucat, huruf berwarna |
| Nav aktif | pil putih 80 persen plus bayangan, ikon SVG garis 22px | glyph teks, tanpa pil |
| Judul header | 12,5px berat 700, sub 9,5px berat 500 | 15px berat 800, sub 10px berat 400 |

**Cakupannya lebih luas dari enam layar yang saya buat.** Pemeriksaan halaman acuan menemukan 2342 node dengan nol blur dan nol gradient. Jadi seluruh halaman `TIS · Plugin UI EXISTING` sejak awal adalah perkiraan flat, dan Nang meredesign dari acuan yang salah.

**Sebab akarnya, sumber acuan yang salah.** Saya menyamakan diri dengan halaman Figma lama alih-alih dengan berkas yang sebenarnya berjalan. Halaman lama itu buatan saya sendiri, jadi kesalahannya berlipat tanpa ada yang menyanggah.

**Cara memperbaikinya, mengubah bukan menggambar ulang.** Frame yang ada sudah benar isinya, yang salah cuma atributnya. Maka perbaikannya lewat transformasi bertahap terhadap 44 frame: latar diganti gradient plus tiga blob radial, top bar dan nav diberi blur 28, kartu diberi blur 22 dengan garis dan bayangan, ikon severity dijadikan lingkaran, glyph nav diganti SVG asli, dan skala huruf disamakan dengan CSS. Hasilnya 44 latar, 43 top bar, 44 nav, 114 ikon, 95 kartu, dan 22 ikon severity.

**Pengaman yang gagal dibuat.** Saya mencoba memasang perender otomatis, `tis-render-layar.js`, yang menjalankan `ui.html` di browser headless lalu memotret tiap keadaan. Skripnya jadi, tapi Chrome tidak bisa diunduh dari lingkungan ini. Skrip itu tetap disimpan supaya bisa dijalankan di mesin yang punya Chrome. Selama itu belum jalan, acuan Figma tetap hasil terjemahan tangan, dan terjemahan tangan sudah terbukti bisa meleset jauh.

**Pelajarannya.** Kalau ada dua sumber kebenaran, berkas yang berjalan dan gambar yang pernah dibuat, yang dipakai harus berkas yang berjalan. Gambar yang pernah dibuat bukan bukti, dia cuma salinan yang bisa saja sudah salah sejak awal.

---

## §32. Kasus terbuka: afordansi palsu di zona aksi

**Status: dicatat, belum jadi aturan. Butuh 3 kasus sebelum diputuskan. Sekarang baru 1.**

**Kasus 1, 22 September 2026.** Layar Convergence SIMPATI ke IndiHome. Ada banner biru pekat, lebar penuh, sudut membulat, ikon plus teks tebal, duduk tepat di atas tombol "Lanjut". Isinya syarat kelayakan, bukan aksi. AKSA memvonis dimensi Penonjolan aksi **baik**.

**Vonis itu benar menurut aturan yang ada.** K11 membebaskan focal bersaing kalau elemennya *beda fungsi dan jelas dilabeli*. K14 menambah bahwa fokus tidak harus CTA dominan. Banner itu memang beda fungsi, jadi lolos.

**Lubangnya:** K11 menilai "beda fungsi" dari **arti**, bukan dari **rupa**. Blok berwarna pekat berbentuk kontrol tetap terbaca sebagai kontrol walaupun fungsinya lain. Yang dibayar pengguna adalah satu tap untuk mencari tahu, dan itu paling mahal justru untuk profil literasi rendah dan motorik.

**Kenapa belum dijadikan aturan.**

Pertama, TIS secara struktural tidak bisa memastikannya. Satu satunya sinyal tappable dari file desain adalah `node.reactions`, dan ketiadaan reaction bisa berarti bukan tombol atau belum di-wire. KWIRING sudah ada persis untuk ambiguitas itu. Konsekuensinya, kalaupun dipasang, ini tidak boleh pernah jadi pelanggaran, paling jauh potensi dengan label perlu cek manusia.

Kedua, elemennya sebenarnya sudah tertangkap. AKSA menandainya di dimensi Alur baca dengan alasan yang benar dan spesifik, dan perbaikan untuk temuan itu, memindahkan syarat ke atas atau mengubahnya jadi teks, sekaligus menghapus rebutan visualnya. Satu temuan akurat sudah menggerakkan perbaikan yang benar. Menandai elemen yang sama di dua dimensi menambah panjang panel dan membuat TIS terasa mengulang ulang.

**Arah perbaikan kalau nanti diputuskan jalan.** Jangan tambah aturan deteksi baru. Perketat pengecualian K11 supaya berlaku hanya kalau elemennya juga **terlihat** beda dari kontrol, dan batasi ke **zona aksi** saja, yaitu di antara konten dan CTA. Batasan zona aksi itu yang menahan false positive, karena banner promo di tengah daftar konten tidak akan tersentuh.

**Cara memutuskan.** Scan lima sampai delapan layar, lalu hitung berapa yang punya elemen bukan aksi, berbentuk kontrol, di zona aksi, yang **belum** tertangkap dimensi lain. Nol atau satu, biarkan. Tiga atau lebih, perketat K11.

**Prinsip yang dipegang:** aturan lahir dari kesalahan yang benar benar terjadi, bukan dari kekhawatiran. Satu kasus belum cukup untuk mengubah perilaku AKSA di seluruh layar.
