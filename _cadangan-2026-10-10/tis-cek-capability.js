#!/usr/bin/env node
// Pembanding capability v1 vs v2.
//
// Redesign visual sah kalau SEMUA yang di bawah ini identik byte per byte:
//   - isi code.js (scanner, kontras, geometri, gate deterministik)
//   - blok KNOWLEDGE (34 aturan kalibrasi + 4 profil)
//   - semua string prompt yang dikirim ke model
//   - pembangun klausa bersyarat
//   - blok penghitung gate di featureScreens
//
// Yang BOLEH berbeda cuma CSS, class, dan string HTML presentasi.
//
// Pakai:  node tis-cek-capability.js
//         node tis-cek-capability.js <folder-v1> <folder-v2>

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const A = process.argv[2] || "tis-figma-plugin";
const B = process.argv[3] || "tis-figma-plugin-v2";

const h = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);
const baca = (d, f) => fs.readFileSync(path.join(d, f), "utf8");
const skrip = (html) => (html.match(/<script>([\s\S]*?)<\/script>/) || [, ""])[1];

// Ambil satu blok berimbang kurung mulai dari penanda tertentu.
function blok(src, mulai, buka = "{", tutup = "}") {
  const i = src.indexOf(mulai);
  if (i < 0) return null;
  let j = src.indexOf(buka, i), d = 0, k = j;
  if (j < 0) return null;
  for (; k < src.length; k++) {
    if (src[k] === buka) d++;
    else if (src[k] === tutup) { d--; if (!d) { k++; break; } }
  }
  return src.slice(i, k);
}

// Ambil isi sebuah var string multi-baris sampai titik koma di awal baris berikutnya.
function varStr(src, nama) {
  const re = new RegExp("var\\s+" + nama + "\\s*=\\s*", "g");
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length, d = 0, q = null, k = i;
  for (; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === "\\") { k++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === "(" || c === "[" || c === "{") d++;
    else if (c === ")" || c === "]" || c === "}") d--;
    else if (c === ";" && d <= 0) break;
  }
  return src.slice(i, k);
}

function potret(dir) {
  const code = baca(dir, "code.js");
  const ui = skrip(baca(dir, "ui.html"));
  const p = {};
  p["code.js utuh"] = code;
  p["blok KNOWLEDGE"] = blok(ui, "var KNOWLEDGE", "{", "}");
  ["SYS", "FLOW_SYS", "TW_SYS", "SYNTH_SYS"].forEach((n) => { p["prompt " + n] = varStr(ui, n); });
  ["cmpClauseFor", "densClause", "screenDensity", "taskLeak", "compareIntent",
   "knowledgeCheck", "knowledgeSources", "profilPromptBlock",
   "accFromFindings", "accScore", "toScore", "eqiWeight", "isViol", "hardFail", "isDet",
   "journeyVerdict"].forEach((n) => { p["fungsi " + n + "()"] = blok(ui, "function " + n + "("); });
  p["blok gate featureScreens"] = blok(ui, 'msg.type==="featureScreens"');
  // Titik buta lama: comparator memeriksa journeyVerdict, tapi tidak pernah
  // memeriksa dari mana counts-nya datang. Padahal penegakan deterministik
  // (guessed -> gagal, confused -> rapuh) mengubah counts, dan counts itulah
  // yang menentukan vonis dan gate. Sekarang ikut dikunci.
  p["penegakan verdict walkthrough"] = (function(){
    const out = [];
    const re = /PENEGAKAN DETERMINISTIK[\s\S]*?\n      \}\);/g;
    let x; while ((x = re.exec(ui))) out.push(x[0]);
    return out.join("\n") || null;
  })();

  return p;
}

let a, b;
try { a = potret(A); b = potret(B); }
catch (e) { console.error("Gagal membaca:", e.message); process.exit(2); }

const kunci = Object.keys(a);
const beda = [], hilang = [];
console.log("Pembanding capability");
console.log("  v1: " + A);
console.log("  v2: " + B);
console.log("");

kunci.forEach((k) => {
  const x = a[k], y = b[k];
  if (x == null || y == null) { hilang.push(k + (x == null ? " (tidak ketemu di v1)" : " (tidak ketemu di v2)")); return; }
  const sama = x === y;
  if (!sama) beda.push(k);
  console.log("  " + (sama ? "sama  " : "BEDA  ") + k.padEnd(30) +
              " v1 " + h(x) + "  v2 " + h(y) + "  " + String(x.length).padStart(7) + " char");
});

console.log("");
if (hilang.length) { console.log("Tidak bisa diperiksa:"); hilang.forEach((k) => console.log("  - " + k)); console.log(""); }

if (beda.length) {
  console.log("GAGAL. " + beda.length + " bagian capability berubah:");
  beda.forEach((k) => console.log("  - " + k));
  console.log("");
  console.log("Redesign visual tidak boleh menyentuh bagian ini. Kembalikan dulu sebelum lanjut.");
  process.exit(1);
}
console.log("LULUS. Semua bagian capability identik. Perbedaan v2 murni di lapisan visual.");
