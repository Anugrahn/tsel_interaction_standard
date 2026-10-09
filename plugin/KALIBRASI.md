# TIS · Katalog Aturan Kalibrasi

Versi knowledge **`2026-10-10`**. Total **41 aturan**, **4 profil kapabilitas**, **4 persona perilaku**, **8 kendala inklusif**.

Dokumen ini turunan langsung dari objek `KNOWLEDGE` di `ui.html`. Kalau berbeda dengan kode, **kode yang benar**. Regenerasi dokumen ini setiap kali menambah aturan.

---

## Kenapa aturan ini ada

AKSA adalah model bahasa yang menilai desain. Tanpa kalibrasi, dia punya dua kecenderungan yang merusak kepercayaan:

**Dia menuduh terlalu banyak.** Link teks di dalam kalimat dianggap dark pattern. Layar padat dianggap masalah padahal itu alat kerja power user. Dua tombol berbeda dianggap tidak konsisten padahal memang beda fungsi.

**Dia mengarang.** Menyebut elemen yang tidak ada di layar, atau menyimpulkan sesuatu tanpa mengutip apa yang dilihatnya.

41 aturan di bawah adalah hasil kalibrasi dari pemakaian nyata. Tiap aturan lahir dari satu kesalahan yang benar benar terjadi. Alasan tiap aturan ada di `aksa-calibration-notes.md` di folder induk.

---

## Empat jenis aturan

| Jenis | Jumlah | Fungsi |
|---|---|---|
| **menahan** | 20 | Mencegah AKSA menuduh sesuatu yang sebenarnya wajar |
| **deteksi** | 16 | Memastikan AKSA melihat hal yang mudah terlewat |
| **atribusi** | 3 | Memaksa tiap temuan menyebut siapa yang kesulitan |
| **ambang** | 2 | Batas kapan sesuatu layak dilaporkan |

Bahasa awam: **menahan** itu rem, **deteksi** itu kacamata, **atribusi** itu pertanyaan "siapa yang dirugikan", **ambang** itu garis "cukup penting untuk disebut".

---

## Sumber yang disentuh

| Sumber | Aturan | Apa ini |
|---|---|---|
| `TW_SYS` | 10 | Prompt Task Walkthrough, AKSA berperan jadi pengguna awam |
| `SYNTH_SYS` | 7 | Prompt sintesis, merangkum hasil beberapa run jadi satu vonis |
| `analyze` | 6 | Prompt analisa layar tunggal |
| `SYS` | 5 | Prompt sistem utama |
| `klausa` | 4 | Klausa kondisional atau dirakit dari KNOWLEDGE (persona, kendala), diperiksa lewat pembangunnya |
| `PERSONA_SYS` | 4 | Prompt simulasi persona, satu pengguna berjalan layar demi layar tanpa peta |
| `code.js` | 2 | Aturan yang dijalankan deterministik, bukan oleh AI |
| `semua prompt` | 1 | Wajib ada di SETIAP prompt, bukan salah satu |
| `FLOW_SYS` | 1 | Prompt insight alur |
| `persona_kode` | 1 | Kode ringkasan simulasi persona (diperiksa dari badan fungsinya) |

**Catatan penting soal `klausa`.** Kalau sebuah aturan hidup di klausa kondisional, `menyentuh` harus ditulis `klausa`, bukan nama promptnya. Kalau ditulis nama prompt, integrity checker akan melaporkannya hilang setiap kali kondisinya tidak aktif. Ini pernah terjadi pada `KBANDING` dan menghasilkan alarm palsu.

---

## Empat profil kapabilitas

| Kunci | Profil | Yang dinilai |
|---|---|---|
| `vision` | Penglihatan terbatas | Kontras, ukuran teks, ketergantungan pada warna |
| `blind` | Screen reader | Label, struktur heading, urutan fokus, alt text |
| `lowlit` | Literasi rendah | Panjang kalimat, istilah asing, beban kognitif |
| `motor` | Motorik | Ukuran area tap, jarak antar target, gestur wajib |

Skor "Kesiapan inklusif per segmen" di tab Aksesibilitas dihitung per profil, bukan rata rata. Alasannya satu layar bisa sempurna untuk penglihatan tapi mustahil untuk screen reader, dan merata ratakan akan menyembunyikan itu.

---

## Persona perilaku dan kendala inklusif (simulasi persona)

Ditambahkan 2026-10-10. Persona dibentuk dari **cara orang bergerak** di aplikasi (9.647 sesi MyTelkomsel, `reserarch/TIS_persona_research_v1.html`), bukan umur. Kendala inklusif **ditempel** ke persona, bukan persona terpisah. Detail: `dokumen-pendukung/tis-persona-sintetis.md`.

| Kunci | Persona | Peran | Bukti | Target kalibrasi |
|---|---|---|---|---|
| `lancar` | Lancar | pembanding | n=472, konversi 84.7% | rasio mundur 0.27 |
| `bolakbalik` | Bolak-balik | navigasi | n=271, konversi 34.3% | rasio mundur 0.7 |
| `lamapaham` | Lama Paham | keterbacaan | n=830, konversi 37% | - |
| `teralih` | Teralih | gangguan alur | dugaan, belum boleh dipakai memutuskan | - |

| Kunci | Kendala | Profil | Yang ditegakkan kode |
|---|---|---|---|
| `normal` | Tanpa kendala | - | tidak ada |
| `teks200` | Teks 200% | `vision` | cuma separuh layar terlihat sekaligus (perlu 'gulir'), label panjang dipotong |
| `katarak` | Katarak | `vision` | gambar dikaburkan, daftar teks dan label TIDAK diberikan |
| `terik` | Terik matahari | `vision` | gambar dipudarkan, daftar teks dan label TIDAK diberikan |
| `pembesar` | Pembesar layar | `vision` | cuma seperempat layar terlihat (perlu 'geser'), tiap geser makan satu langkah |
| `screenreader` | Screen reader | `blind` | tanpa gambar; cuma urutan elemen yang dibacakan, tombol tanpa nama dibacakan 'tombol' |
| `motorik` | Tremor / satu tangan | `motor` | tombol kecil yang berdekatan bisa meleset ke tetangganya (peluang ditentukan kode dari ukuran) |
| `literasi` | Literasi rendah | `lowlit` | istilah asing atau teknis di label dan teks diganti '???' |

Simulasi persona **advisory**: tidak nge-gate, tidak masuk TIS Score. Hasilnya masuk Feature Snapshot (`persona_sim`) sebagai prediksi yang diuji lawan data segmen setelah rilis.

---

## Integrity checker

`knowledgeCheck()` memeriksa tiap aturan: apakah `jejak`-nya benar benar ada di dalam sumber yang disebut `menyentuh`.

Tiga keadaan:

| Keadaan | Arti |
|---|---|
| **ada** | Aturan hidup, jejaknya ketemu di sumbernya |
| **hilang** | Aturan terdaftar tapi jejaknya tidak ada. **Ini bug.** Prompt diedit dan aturannya ikut terhapus. |
| **belum** | Prompt belum dirakit karena belum ada scan. Normal sebelum pemakaian. |

Hasilnya tampil sebagai lencana `🧠 Knowledge <versi> · <n> aturan · 4 profil` di tab Usability. Kalau lencana berwarna merah, jangan percaya hasil AKSA sampai diperbaiki.

---

## Daftar lengkap

### menahan (20)

| id | menyentuh | jejak yang diperiksa | ringkas |
|---|---|---|---|
| `K01` | `SYS` | BATAS 'dark-pattern' TINGGI | Link teks dalam kalimat deskriptif itu konvensi, bukan dark-pattern |
| `K03` | `SYS` | ESTIMASI MENONJOL (prominence) YANG BENAR | Penonjolan dinilai dari saturasi dan kontras, bukan cuma ukuran |
| `K04` | `analyze` | AMBANG DAMPAK | Jangan keluarkan temuan yang kesimpulannya sendiri ragu-ragu |
| `K06` | `SYS` | DEFINISI 'noise' YANG BENAR | Noise = mengganggu penyelesaian task, bukan sekadar berwarna |
| `K11` | `analyze` | KALIBRASI HIERARKI & FOCAL POINT | Focal bersaing hanya masalah kalau memperebutkan aksi yang sama |
| `K12` | `analyze` | KALIBRASI KONSISTENSI (anti-inversi | Afordansi standar yang sama untuk interaksi sejenis itu konsisten, bukan pelanggaran |
| `K13` | `analyze` | ANTI-OSILASI | Saran tidak boleh menciptakan temuan berikutnya |
| `K14` | `analyze` | KALIBRASI PENONJOLAN AKSI | Aksi tidak harus berbentuk tombol, dan fokus tidak harus CTA dominan |
| `K18b` | `SYNTH_SYS` | JALUR BERBEDA BUKAN DENGAN SENDIRINYA | Jalur berbeda tanpa keraguan itu rute paralel yang wajar |
| `KGAYA` | `semua prompt` | GAYA TULIS (WAJIB) | Dilarang memakai em dash di teks apa pun yang dihasilkan |
| `KDENS` | `analyze` | KEPADATAN | Kepadatan terorganisir wajar untuk alat kerja power user |
| `KHALU` | `TW_SYS` | ANTI-HALU | Wajib mengutip teks tombol dan label persis, dilarang mengarang nama tombol, paket, atau layar |
| `KPILIH` | `TW_SYS` | KALIBRASI KEPUTUSAN | Choice overload cuma dihitung friksi kalau task-nya spesifik dan opsinya sulit dibedakan |
| `KSTATIS` | `TW_SYS` | KETERBATASAN ANALISA STATIS | Frame diam tidak memperlihatkan isyarat runtime, jadi tidak menemukan isyarat bukan berarti isyaratnya tidak ada |
| `KWIRING` | `TW_SYS` | WIRING PROTOTYPE | Tombol tepat yang belum disambung di prototipe itu masalah wiring, bukan cacat UX |
| `KPOLA` | `SYS` | KALIBRASI KE POLA UMUM | Pola yang sudah jadi konvensi umum dilarang ditandai sebagai masalah (Jakob) |
| `KTIPE` | `FLOW_SYS` | KALIBRASI TIPE JOURNEY | Indikator progres cuma relevan untuk journey linear berujung tetap, bukan untuk journey menjelajah |
| `KGROUND` | `SYNTH_SYS` | GROUNDING | Sintesis hanya boleh memakai fakta dari hasil run, dilarang mengarang detail UI baru |
| `KPERAN` | `PERSONA_SYS` | PERAN ADALAH POLA PERILAKU | Persona memerankan pola perilaku dari data sesi, bukan umur atau demografi, dan dilarang mengarang kutipan |
| `KSAMPAI` | `PERSONA_SYS` | SISTEM YANG MENENTUKAN SAMPAI | Berhasil atau gagal ditentukan kode dari layar tujuan, bukan dari klaim model |

### deteksi (16)

| id | menyentuh | jejak yang diperiksa | ringkas |
|---|---|---|---|
| `K17` | `code.js` | NAMA AKSESIBEL | Elemen interaktif tanpa teks sama sekali diflag, berat sesuai nama layer |
| `K18` | `SYNTH_SYS` | KONSISTENSI INTERNAL | Variasi jalur dan langkah ragu dihitung, sintesis tak boleh membantahnya |
| `K19a` | `TW_SYS` | TANGGA VERDICT | Tidak ada label yang cocok sehingga harus menebak = gagal, bukan rapuh |
| `K19b` | `TW_SYS` | ANTI-BIAS PETA | Dilarang memilih elemen karena peta menunjukkan jalan ke goal |
| `KTRI` | `SYNTH_SYS` | TRIANGULASI | Gabungkan bukti perilaku dan inspeksi, bukti ganda naik prioritas |
| `KTIER` | `SYNTH_SYS` | TIERING | Tiap fix diberi tier, certainty, dan satu top_fix berleverage |
| `KPADAT` | `klausa` | LAYAR BERBEBAN PENCARIAN TINGGI | Di layar padat, AKSA dilarang menganggap label mudah ditemukan hanya karena ada di daftar teks, dan wajib menyebut 3 elemen pertama yang diperiksa |
| `KBANDING` | `klausa` | TASK INI BERSIFAT MEMBANDINGKAN | Kalau tujuan user membandingkan, memindai beberapa opsi tanpa info pembanding dihitung ragu, bukan perilaku normal |
| `KBOCOR` | `TW_SYS` | PINTU ALTERNATIF | Sebelum memilih, wajib sebutkan semua label yang masuk akal, dan dilarang memilih karena kemiripan kata |
| `KCW` | `TW_SYS` | COGNITIVE WALKTHROUGH | Tiap langkah diuji tiga pertanyaan Wharton: sadar, cocok, dan ada umpan balik |
| `KDISC` | `TW_SYS` | DISCOVERABILITY | Aksi yang tidak bisa ditemukan dihitung rapuh walaupun jalurnya ada di prototipe |
| `KLANGKAH` | `TW_SYS` | JENIS LANGKAH | Langkah navigasi dan langkah keputusan dinilai dengan ukuran berbeda |
| `KTANPAPETA` | `PERSONA_SYS` | TANPA PETA | Persona hanya melihat layar sekarang. Tujuan tiap tombol disimpan di kode, tidak pernah dikirim ke AI, jadi bias peta (§19) hilang secara struktural, bukan lewat larangan |
| `KMENEBAK` | `PERSONA_SYS` | TANDAI MENEBAK | Memilih tanpa label yang menyatakan maksud task wajib ditandai menebak, dan run yang sampai lewat tebakan dihitung gagal |
| `KKENDALA` | `klausa` | KENDALA AKTIF | Kendala inklusif ditegakkan mekanis (gambar dikaburkan, layar dipotong, label disamarkan, tekanan meleset), klausa prompt hanya menjelaskan |
| `KINGATAN` | `klausa` | INGATAN PENDEK | Persona Bolak-balik hanya membawa catatan dari satu layar sebelumnya, dipotong 12 kata oleh kode |

### atribusi (3)

| id | menyentuh | jejak yang diperiksa | ringkas |
|---|---|---|---|
| `K05` | `SYS` | AKURASI SEGMEN | Tag tunanetra hanya untuk isu screen reader, bukan isu visual |
| `KATR` | `SYNTH_SYS` | ATRIBUSI PROFIL | Tiap temuan dan fix ditandai profil yang terdampak |
| `KCERT` | `SYNTH_SYS` | CERTAINTY | Tiap usulan perbaikan wajib menyatakan yakin atau perlu dicek, dan alasannya |

### ambang (2)

| id | menyentuh | jejak yang diperiksa | ringkas |
|---|---|---|---|
| `K15` | `code.js` | bounds VISUAL | Target 24 sampai 44px itu potensi yang perlu diverifikasi, bukan pelanggaran |
| `KLENGKAP` | `persona_kode` | BELUM LENGKAP | Simulasi tanpa satu pun kendala inklusif ditandai belum lengkap, sisi inklusif tidak boleh terlewat |

---

## Cara menambah aturan

1. Tulis aturannya di prompt yang relevan, dengan kalimat penanda yang **unik dan stabil**. Hindari kalimat yang mungkin kamu edit lagi nanti.
2. Tambahkan entri di `KNOWLEDGE.kalibrasi`:
```js
{ id: "KXXX",
  jenis: "menahan",          // menahan | deteksi | atribusi | ambang
  menyentuh: "SYS",          // atau klausa, kalau kondisional
  jejak: "POTONGAN PERSIS DARI PROMPT",
  ringkas: "satu kalimat, apa yang aturan ini cegah atau pastikan" }
```
3. Naikkan `KNOWLEDGE.versi` ke tanggal hari ini.
4. Buka tab Usability, pastikan lencana knowledge tidak merah.
5. Jalankan `node tis-cek-capability.js`.
6. Regenerasi dokumen ini.

**Jangan menambah aturan tanpa kasus nyata.** Tiap aturan menambah panjang prompt, dan prompt panjang menurunkan ketaatan model pada aturan yang lain. Aturan yang lahir dari kekhawatiran, bukan dari kesalahan yang benar benar terjadi, lebih banyak merugikan daripada menolong.
