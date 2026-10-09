// TIS, L1 Scanner (core + mode + color-suggestion DS + Impact + Sidekick data)
// Main thread: baca scene graph, hitung temuan multi-sumber, saran warna dari token DS,
// pengali Impact (mock analytics), export frame buat preview mode.

figma.showUI(__html__, { width: 380, height: 760, themeColors: true });

// ---- ambang ----
var MIN_FONT = 12, WCAG_TARGET = 24, APPLE_TARGET = 44, ANDROID_TARGET = 48, MIN_CONTRAST = 4.5;
// Dicocokkan per KATA, bukan substring. Regex substring lama menganggap "Re-cta-ngle 12",
// "Transaction", dan "Table" sebagai tombol, sehingga persegi latar bernama default divonis
// pelanggaran 4.1.2 "tombol tanpa label" dan ikut menahan gate.
var INTERACTIVE_WORDS = ["btn","button","buttons","tombol","cta","chip","chips","tab","tabs","link","action","beli","bayar","submit","pilih"];
function nameWords(s){ return String(s||"").replace(/([a-z0-9])([A-Z])/g,"$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); }
var INTERACTIVE = { test: function(s){ return nameWords(s).some(function(w){ return INTERACTIVE_WORDS.indexOf(w) >= 0; }); } };
// Trigger yang berarti "ditekan". After-delay (splash), drag (carousel), dan hover bukan area tap.
var TAP_TRIGGER = /^(ON_CLICK|ON_PRESS|MOUSE_UP|MOUSE_DOWN|ON_KEY_DOWN)$/;
function hasTapReaction(node){
  if (!Array.isArray(node.reactions) || !node.reactions.length) return false;
  return node.reactions.some(function(rx){ return !rx.trigger || TAP_TRIGGER.test(rx.trigger.type || ""); });
}
// Nama layer yang TIDAK bisa dipakai sebagai dasar accessible name (default Figma / nama teknis ikon).
// Dipakai cek 4.1.2: kalau elemen interaktif tanpa teks DAN namanya generik, screen reader tak dapat apa-apa.
var GENERIC_NAME = /^(frame|group|rectangle|ellipse|vector|union|subtract|component|instance|layer|shape|mask|line|star|polygon|image|img|icon|ic|ico|iconly|svg|path|container|wrapper|box|item|element|content|btn|button|tombol|cta|_+|-+)?[\s_\-/]*\d*$/i;
var CONVERSION = /(beli|bayar|checkout|submit|cta)/i;

// ---- token Design System Telkomsel (buat color suggestion) ----
function hexToRgb(h){ h = h.replace("#",""); return { r: parseInt(h.substr(0,2),16)/255, g: parseInt(h.substr(2,2),16)/255, b: parseInt(h.substr(4,2),16)/255 }; }
var DS_TOKENS = [
  { name: "text/ink",      hex: "#1A1A1D" },
  { name: "text/on-red",   hex: "#FFFFFF" },
  { name: "text/navy",     hex: "#1B1F3B" },
  { name: "action/primary",hex: "#E60012" }
].map(function(t){ t.rgb = hexToRgb(t.hex); return t; });

// ---- util kontras ----
function ch(v){ return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
function lum(c){ return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b); }
function contrast(a, b){ var la = lum(a) + 0.05, lb = lum(b) + 0.05; return la > lb ? la / lb : lb / la; }
// ---- komposit alpha: teks/latar transparan & background blur ----
function over(src, a, dst){
  if (a <= 0) return dst;
  if (a >= 0.999) return { r:src.r, g:src.g, b:src.b };
  return { r: src.r*a + dst.r*(1-a), g: src.g*a + dst.g*(1-a), b: src.b*a + dst.b*(1-a) };
}
function hasBgBlur(node){
  var e = node && node.effects;
  if (!e || e === figma.mixed || !e.length) return false;
  for (var i=0;i<e.length;i++){
    var x = e[i];
    if (x && x.visible !== false && x.type === "BACKGROUND_BLUR" && (x.radius||0) > 0) return true;
  }
  return false;
}
// Semua fill satu node digabung jadi satu lapisan { color, alpha, unknown }.
// alpha SUDAH termasuk opacity node itu sendiri. Inilah yang dulu diabaikan.
function foldFills(f, nodeOpacity){
  if (f === figma.mixed || !f || !f.length) return null;
  var cc = null, ca = 0, unknown = false;
  for (var i=0;i<f.length;i++){
    var pf = f[i];
    if (!pf || pf.visible === false) continue;
    var a = (pf.opacity === undefined ? 1 : pf.opacity);
    if (a <= 0) continue;
    var c = null;
    if (pf.type === "SOLID") c = pf.color;
    else if (pf.type && pf.type.indexOf("GRADIENT") === 0){
      var gr = avgGradient(pf);
      if (gr){ c = gr.color; a = a * gr.alpha; }   // gradasi transparan tidak lagi dianggap menutup
    }
    else { unknown = true; c = { r:0.5, g:0.5, b:0.5 }; }
    if (!c) continue;
    var outA = a + ca*(1-a);
    if (outA <= 0) continue;
    cc = cc ? { r:(c.r*a + cc.r*ca*(1-a))/outA, g:(c.g*a + cc.g*ca*(1-a))/outA, b:(c.b*a + cc.b*ca*(1-a))/outA }
            : { r:c.r, g:c.g, b:c.b };
    ca = outA;
  }
  if (!cc || ca <= 0) return null;
  var no = (typeof nodeOpacity === "number") ? nodeOpacity : 1;
  return { color: cc, alpha: ca * no, unknown: unknown };
}
function nodeLayer(node){
  if (!node || !("fills" in node)) return null;
  return foldFills(node.fills, node.opacity);
}
// Di Figma, KARAKTER bisa punya fill sendiri yang menimpa fill tingkat node.
// Pola yang sangat umum: teks dibuat dari text style (mis. text/secondary),
// lalu karakternya diseleksi dan diwarnai putih. Yang berubah cuma fill
// karakternya. node.fills tetap menyimpan warna lama, dan warna itu tidak
// dipakai untuk merender satu karakter pun.
// Membaca node.fills saja berarti membaca nilai yang sudah mati.
function textLayers(node){
  var out = [];
  try{
    var segs = node.getStyledTextSegments(["fills"]);
    for (var i=0;i<segs.length;i++){
      var L = foldFills(segs[i].fills, node.opacity);
      if (L){ L.chars = segs[i].characters; out.push(L); }
    }
  }catch(e){}
  if (!out.length){ var N = nodeLayer(node); if (N) out.push(N); }
  return out;
}
// Bounding box bukan berarti bentuknya benar-benar menutupi. Donat, busur, dan vektor
// punya bbox besar tapi tengahnya kosong. Ini sumber vonis "teks di atas warnanya sendiri".
function rectInsideEllipse(er, tr){
  if (!er || !tr) return false;
  var cx = er.x + er.width/2, cy = er.y + er.height/2, a = er.width/2, b = er.height/2;
  if (a <= 0 || b <= 0) return false;
  var xs = [tr.x, tr.x + tr.width], ys = [tr.y, tr.y + tr.height];
  for (var i=0;i<2;i++) for (var j=0;j<2;j++){
    var dx = (xs[i]-cx)/a, dy = (ys[j]-cy)/b;
    if (dx*dx + dy*dy > 1) return false;
  }
  return true;
}
function shapeCovers(node, tb){
  var t = node.type;
  // Teks lain di bawahnya bukan latar pejal (kotak teks hampir selalu transparan di sela huruf),
  // dan layer mask tidak dirender sebagai cat. Dua-duanya dulu dianggap menutup → kontras ~1:1 palsu.
  if (t === "TEXT" || node.isMask) return false;
  if (t === "ELLIPSE"){
    var ad = node.arcData;
    if (ad){
      var sweep = Math.abs((ad.endingAngle||0) - (ad.startingAngle||0));
      if ((ad.innerRadius||0) > 0.001 || sweep < Math.PI*2 - 0.01) return false; // donat / busur
    }
    return rectInsideEllipse(node.absoluteBoundingBox, tb);
  }
  if (t === "VECTOR" || t === "BOOLEAN_OPERATION" || t === "STAR" || t === "POLYGON" || t === "LINE") return false;
  return true;   // RECTANGLE, FRAME, COMPONENT, INSTANCE, GROUP, SECTION
}
function compositeStack(stack){
  var res = { r:1, g:1, b:1 }, cov = 0;
  for (var i=stack.length-1; i>=0; i--){
    var L = stack[i];
    if (L.unknown && L.alpha > 0.02) return { unknown:true };
    res = over(L.color, L.alpha, res);
    cov = L.alpha + cov*(1-L.alpha);
  }
  return { color: res, alpha: cov };
}
function solidFill(node){
  if (!node || !("fills" in node)) return null;
  var fills = node.fills;
  if (fills === figma.mixed || !fills || !fills.length) return null;
  for (var i = fills.length - 1; i >= 0; i--){ var f = fills[i]; if (f.type === "SOLID" && f.visible !== false) return f.color; }
  return null;
}
function bgBehind(node){ var p = node.parent; while (p && p.type !== "PAGE"){ var c = solidFill(p); if (c) return c; p = p.parent; } return { r: 1, g: 1, b: 1 }; }
// resolveBg: baca background sebenarnya, solid, gradient (rata2 stop), atau gambar (tak tentu → jangan vonis)
function topVisFill(node){
  if (!("fills" in node)) return null; var f = node.fills;
  if (f === figma.mixed || !f || !f.length) return null;
  for (var i = f.length - 1; i >= 0; i--){ if (f[i].visible !== false && (f[i].opacity === undefined || f[i].opacity > 0)) return f[i]; }
  return null;
}
// Stop gradasi punya alpha sendiri, dan versi lama membuangnya. Akibatnya
// gradasi yang memudar sampai transparan terbaca seolah cat pekat, dan warna
// rata-ratanya bercampur dengan stop yang sebenarnya tidak kelihatan.
// Itu sumber laporan "teks #54637a" untuk teks yang aslinya putih.
// Sekarang mengembalikan { color, alpha }: warna rata-rata tertimbang alpha,
// dan alpha rata-rata sebagai daya tutup lapisan.
function avgGradient(fill){
  var st = fill.gradientStops; if (!st || !st.length) return null;
  var r=0,g=0,b=0,sa=0,n=0;
  for (var i=0;i<st.length;i++){
    var c=st[i].color; if(!c) continue;
    var ca=(c.a===undefined?1:c.a);
    r+=c.r*ca; g+=c.g*ca; b+=c.b*ca; sa+=ca; n++;
  }
  if(!n) return null;
  if(sa<=0) return { color:{ r:0,g:0,b:0 }, alpha:0 };
  return { color:{ r:r/sa, g:g/sa, b:b/sa }, alpha:sa/n };
}
// JANGAN DIPAKAI LAGI: sisa pemeriksa kontras sebelum perbaikan alpha (§21).
// Versi ini mengabaikan transparansi, jadi bisa melaporkan lulus untuk teks yang sebenarnya gagal.
function resolveBg(node){ // { color } ATAU { unknown:true }
  var p = node.parent;
  while (p && p.type !== "PAGE"){
    var f = topVisFill(p);
    if (f){
      if (f.type === "SOLID") return { color: f.color };
      if (f.type && f.type.indexOf("GRADIENT") === 0){ var a = avgGradient(f); return a ? { color:a.color } : { unknown:true }; }
      if (f.type === "IMAGE" || f.type === "VIDEO") return { unknown:true };
      return { unknown:true };
    }
    p = p.parent;
  }
  return { color: { r:1, g:1, b:1 } }; // tak ada fill di atas = kanvas putih
}
// bgUnderText: cari yang BENAR2 di belakang teks, layer sibling/ancestor yang menutupi bbox teks (solid/gradient/gambar)
function rectsOverlap(a,b){ return !(a.x+a.width<=b.x || b.x+b.width<=a.x || a.y+a.height<=b.y || b.y+b.height<=a.y); }
function rectContains(a,b){ return a.x<=b.x+0.5 && a.y<=b.y+0.5 && a.x+a.width>=b.x+b.width-0.5 && a.y+a.height>=b.y+b.height-0.5; }
function fillToBg(f){
  if(!f || f.visible===false) return null;
  if(f.type==="SOLID") return { color:f.color };
  if(f.type && f.type.indexOf("GRADIENT")===0){ var a=avgGradient(f); return a ? { color:a.color } : { unknown:true }; }
  if(f.type==="IMAGE" || f.type==="VIDEO") return { unknown:true };
  return { unknown:true };
}
// JANGAN DIPAKAI LAGI: lihat catatan di resolveBg.
function nodeBg(node){ return fillToBg(topVisFill(node)); }
function bgUnderText(text){
  var tb = text.absoluteBoundingBox; if(!tb) return { color:{ r:1,g:1,b:1 }, alpha:1 };
  var stack = [], cur = text, guard = 0, L;
  while(cur && cur.parent && cur.parent.type!=="PAGE" && guard++ < 80){
    var par = cur.parent, kids = par.children, idx = kids.indexOf(cur), i, k, kb;
    for(i=idx-1;i>=0;i--){                        // layer di BAWAH cur (z-order) = di belakang
      k = kids[i];
      if(!k || k.visible===false || k.opacity===0 || isHeat(k)) continue;
      kb = k.absoluteBoundingBox; if(!kb) continue;
      if(rectContains(kb,tb) && shapeCovers(k,tb)){
        if (hasBgBlur(k)) return { unknown:true, blur:true };
        L = nodeLayer(k);
        if (L){ stack.push(L); if (L.alpha >= 0.995) return compositeStack(stack); continue; }
        if ("children" in k) return { unknown:true };
      }
    }
    if (hasBgBlur(par)) return { unknown:true, blur:true };
    L = nodeLayer(par);
    if (L){ stack.push(L); if (L.alpha >= 0.995) return compositeStack(stack); }
    cur = par;
  }
  return compositeStack(stack);                   // sisanya jatuh ke kanvas putih
}
// Bukti pengukuran. Selama ini temuan cuma menyebut hasil akhir, jadi kalau
// hasilnya meleset tidak ada cara tahu di langkah mana melesetnya.
function fillNote(node){
  if(!node || !("fills" in node)) return "tanpa fill";
  var f=node.fills;
  if(f===figma.mixed) return "fill campur (beda warna per karakter)";
  if(!f||!f.length) return "tanpa fill";
  var out=[];
  for(var i=0;i<f.length;i++){
    var p=f[i]; if(!p) continue;
    var vis=(p.visible===false)?" [mati]":"";
    var op=(p.opacity===undefined?1:p.opacity);
    if(p.type==="SOLID") out.push(hex(p.color)+" @"+Math.round(op*100)+"%"+vis);
    else if(p.type&&p.type.indexOf("GRADIENT")===0){
      var g=avgGradient(p);
      out.push("gradasi "+(p.gradientStops?p.gradientStops.length:0)+" stop \u2192 "+
        (g?hex(g.color)+" tutup "+Math.round(g.alpha*100)+"%":"?")+" @"+Math.round(op*100)+"%"+vis);
    }
    else out.push(String(p.type).toLowerCase()+" @"+Math.round(op*100)+"%"+vis);
  }
  var no=(typeof node.opacity==="number")?node.opacity:1;
  return out.join(" + ")+(no<0.999?"  \u00B7 opacity node "+Math.round(no*100)+"%":"");
}
// Ringkasan fill yang benar-benar merender karakter, bukan fill tingkat node.
function segNote(node){
  var segs=null;
  try{ segs = node.getStyledTextSegments(["fills"]); }catch(e){}
  if(!segs || !segs.length) return fillNote(node);
  var out=[];
  for(var i=0;i<segs.length && i<4;i++){
    var L=foldFills(segs[i].fills, 1);
    var teks=String(segs[i].characters||"").slice(0,14).replace(/\n/g," ");
    out.push("\u201C"+teks+"\u201D "+(L?hex(L.color)+" @"+Math.round(L.alpha*100)+"%":"?"));
  }
  if(segs.length>4) out.push("(+"+(segs.length-4)+" segmen)");
  var nodeF=foldFills(node.fills, 1);
  var beda = nodeF && segs.length && (function(){ var a=foldFills(segs[0].fills,1); return a && hex(a.color)!==hex(nodeF.color); })();
  return out.join(" \u00B7 ")+(beda?"  \u00B7 fill tingkat node "+hex(nodeF.color)+" TIDAK dipakai merender":"");
}
function hex(c){ function h(n){ var s = Math.round(n*255).toString(16); return s.length<2?"0"+s:s; } return "#" + h(c.r) + h(c.g) + h(c.b); }

// saran warna: token DS pertama yang lolos kontras vs bg, ratio tertinggi
function suggestFromDS(bg){
  var best = null;
  DS_TOKENS.forEach(function(t){ var r = contrast(t.rgb, bg); if (r >= MIN_CONTRAST && (!best || r > best.ratio)) best = { name: t.name, hex: t.hex, ratio: r }; });
  return best ? { token: best.name, hex: best.hex, ratio: best.ratio.toFixed(1) } : null;
}

// ---- deteksi target sentuh beneran (bukan cuma nama) ----
function isTouchTarget(node){
  if (node.type === "TEXT") return false;                 // teks bukan area tap
  // Layar itu sendiri bukan tombol, walaupun punya reaction (splash after-delay, swipe antar layar).
  // Kalau dianggap tombol, seluruh isinya ikut dibungkam dari cek area tap dan cek label.
  var top = node.parent && (node.parent.type === "PAGE" || node.parent.type === "SECTION");
  if (!top && hasTapReaction(node)) return true;          // ada interaksi TEKAN di prototype = interaktif
  var nameHit = INTERACTIVE.test(node.name || "");
  var control = node.type === "COMPONENT" || node.type === "INSTANCE" || node.type === "FRAME" || node.type === "RECTANGLE" || node.type === "GROUP";
  var hasBg = !!solidFill(node) || (("strokes" in node) && node.strokes && node.strokes.length > 0);
  return nameHit && control && hasBg;                      // nama interaktif + bentuk kontrol + ada bg/stroke
}

// ---- Impact (mock analytics, placeholder, Fase 2 pakai data asli) ----
function mockImpact(node){
  var n = (node.name || "").toLowerCase();
  if (CONVERSION.test(n)) return { mult: 1.8, traffic: "~68% sesi lewat step ini", dropoff: "12% drop di titik ini", revenue: "jalur SR N+1 (revenue langsung)" };
  if (INTERACTIVE.test(n)) return { mult: 1.3, traffic: "~40% sesi menyentuh elemen ini", dropoff: "-", revenue: "-" };
  return { mult: 1.0, traffic: "-", dropoff: "-", revenue: "-" };
}

// ---- cek per node → temuan multi-sumber ----
// suppressTouch = true kalau node ini di DALAM elemen tappable lain (ikon di dalam tombol → jangan dicek target)
function checkNode(node, out, suppressTouch){
  if (node.type === "TEXT"){
    if (typeof node.fontSize === "number" && node.fontSize < MIN_FONT){
      out.push({ id: node.id, name: node.name, type: node.type, sev: 2, impact: mockImpact(node),
        cat: "type", title: "Teks kecil (" + (Math.round(node.fontSize*10)/10) + "px)",
        sources: [
          { s: "wcag", v: "review", code: "1.4.4 Resize Text \u00b7 AA", note: "WCAG tidak menetapkan ukuran font minimum. Yang diatur 1.4.4 adalah teks harus dapat diperbesar sampai 200% tanpa kehilangan isi. Jadi ukuran ini bukan pelanggaran WCAG, tapi tetap perlu dicek keterbacaannya." },
          { s: "ds", v: "thin", code: "token: type/body-min", note: "Di bawah body-min Design System Telkomsel (" + MIN_FONT + "px)." },
          { s: "apple", v: "fail", code: "HIG \u00b7 Dynamic Type", plat: "ios", note: "Apple menganjurkan minimum 11pt untuk teks badan." },
          { s: "android", v: "fail", code: "Material \u00b7 Type scale", plat: "android", note: "Material body-small 12sp." },
          { s: "uxpsych", note: "Perlu keputusan manusia. Label pendukung seperti satuan atau keterangan boleh lebih kecil. Yang berbahaya kalau teks utama atau angka yang harus dibaca yang mengecil." }
        ] });
    }
    var fgAll = textLayers(node);
    var fgL = fgAll[0] || null;
    var bgr = fgL ? bgUnderText(node) : null;
    if (fgL && bgr && bgr.unknown){
      // Latar tidak dapat dipastikan: transparan berlapis, gambar, atau Background Blur.
      // Jangan divonis melanggar. Ini justru kasus yang dulu memunculkan "putih di atas putih".
      out.push({ id: node.id, name: node.name, type: node.type, sev: 2, impact: mockImpact(node),
        cat: "contrast", title: "Kontras belum bisa dipastikan (latar " + (bgr.blur ? "berblur" : "tidak solid") + ")",
        sources: [
          { s: "wcag", v: "review", code: "1.4.3 Contrast \u00b7 AA", note: bgr.blur
            ? "Latar memakai Background Blur, warnanya ikut isi di belakangnya saat dipakai. Rasio tidak bisa dihitung dari file desain, perlu dicek pada konten nyata yang paling terang dan paling gelap."
            : "Latar di belakang teks tidak solid, bisa berlapis transparan, gradasi, atau gambar. Rasio tidak bisa dipastikan dari file desain saja." },
          { s: "uxpsych", note: "Butuh keputusan manusia. Uji pada konten terburuk, bukan pada contoh yang paling ramah." }
        ] });
    } else if (fgL && bgr && !fgL.unknown){          // bg gambar/tak tentu → JANGAN vonis (hindari false positive kayak putih-di-putih)
      var bg = bgr.color;
      // Satu teks bisa punya beberapa warna karakter. Yang dinilai adalah
      // segmen dengan kontras TERBURUK, karena itu yang paling sulit dibaca.
      var worst = null;
      for (var si=0; si<fgAll.length; si++){
        var Ls = fgAll[si]; if (Ls.unknown) continue;
        var fs = over(Ls.color, Ls.alpha, bg), rs = contrast(fs, bg);
        if (!worst || rs < worst.ratio) worst = { L:Ls, fg:fs, ratio:rs };
      }
      if (!worst) worst = { L:fgL, fg:over(fgL.color, fgL.alpha, bg), ratio:contrast(over(fgL.color, fgL.alpha, bg), bg) };
      fgL = worst.L;
      var fg = worst.fg;
      var ratio = worst.ratio;
      var alphaNote = (fgL.alpha < 0.995)
        ? " Teks memakai opacity " + Math.round(fgL.alpha*100) + "%, jadi warna efektifnya " + hex(fg) + ", bukan " + hex(fgL.color) + "."
        : "";
      var bgNote = (bgr.alpha !== undefined && bgr.alpha < 0.995)
        ? " Latar tidak sepenuhnya menutup, warna efektif setelah dikomposit ke kanvas: " + hex(bg) + "."
        : "";
      // WCAG 1.4.3: teks besar (>= 24px, atau >= 18,66px tebal) cukup 3:1. Dulu semua teks diuji 4,5:1,
      // sehingga judul 20px tebal putih di atas merah merek (~4:1) divonis pelanggaran dan menahan gate.
      // Ukuran/ketebalan campuran (figma.mixed) tetap diuji 4,5:1, aman ke arah ketat.
      var fsz = (typeof node.fontSize === "number") ? node.fontSize : 0;
      var fwt = (typeof node.fontWeight === "number") ? node.fontWeight : 400;
      var bigText = fsz >= 24 || (fsz >= 18.66 && fwt >= 700);
      var minRatio = bigText ? 3 : MIN_CONTRAST;
      if (ratio < minRatio){
        out.push({ id: node.id, name: node.name, type: node.type, sev: 3, impact: mockImpact(node),
          cat: "contrast", title: "Kontras teks rendah (" + ratio.toFixed(1) + ":1)",
          suggest: suggestFromDS(bg),
          measure: { fill: segNote(node), fg: hex(fg), bg: hex(bg),
                     seg: (fgAll.length>1 && fgL.chars) ? ("segmen \u201C"+String(fgL.chars).slice(0,24).replace(/\n/g," ")+"\u201D dari "+fgAll.length+" segmen") : null,
                     fgRaw: hex(fgL.color), fgAlpha: Math.round(fgL.alpha*100),
                     ratio: ratio.toFixed(2) },
          sources: [
            { s: "wcag", v: "fail", code: "1.4.3 Contrast · AA", note: "Min " + minRatio + ":1" + (bigText ? " (teks besar)" : "") + ". Teks " + hex(fg) + " di atas " + hex(bg) + "." + alphaNote + bgNote },
            { s: "ds", v: "fail", code: "token: color/text-on-bg", note: "Deviasi kontras dari token." },
            { s: "apple", v: "fail", code: "HIG · Color & Contrast", plat: "ios" },
            { s: "android", v: "fail", code: "Material · Contrast", plat: "android" }
          ] });
      }
    }
  }
  if (!suppressTouch && ("width" in node) && isTouchTarget(node)){
    var small = Math.min(node.width, node.height), big = Math.max(node.width, node.height), ratio = big / Math.max(1, small);
    // Lewati garis/pemisah/track & bentuk sangat memanjang, itu bukan area tap (divider tinggi 2-4px, progress bar, underline)
    var isDividerOrSliver = small <= 6 || (ratio >= 6 && small < 24);
    if (!isDividerOrSliver && small < APPLE_TARGET){
      var wcagV = small < WCAG_TARGET ? "fail" : "thin";
      out.push({ id: node.id, name: node.name, type: node.type, sev: small < WCAG_TARGET ? 3 : 2, impact: mockImpact(node),
        cat: "target", title: "Area tap kecil (" + Math.round(node.width) + "×" + Math.round(node.height) + ")",
        sources: [
          { s: "wcag", v: wcagV, code: "2.5.8 Target Size · AA", note: "Area tap min " + WCAG_TARGET + "px. Ikon boleh tetap kecil, perbesar area tap-nya (tambah padding)." },
          { s: "ds", v: "fail", code: "token: touch-target/min", note: "Hit area token Telkomsel " + ANDROID_TARGET + "dp, dari padding, bukan besarin ikon. CATATAN: yang diukur di sini bounds VISUAL di Figma, bukan hit area implementasi. Material sendiri membolehkan visual lebih kecil dari touch target (mis. checkbox 40×40 visual, 48×48 hit area lewat padding). Jadi kalau visual ini memang " + ANDROID_TARGET + "dp hit area-nya di kode, ini AMAN, pastikan padding-nya ada, tak perlu membesarkan elemen." },
          { s: "apple", v: "fail", code: "HIG · Hit targets · 44pt", plat: "ios" },
          { s: "android", v: "fail", code: "Material · Touch target · 48dp", plat: "android" },
          { s: "uxlaw", law: "Fitts's Law", q: "Makin kecil & rapat, makin rawan salah tap. Nyaman buat jempol?" }
        ] });
    }
  }
  // ---- NAMA AKSESIBEL: elemen interaktif tanpa teks sama sekali (ikon-saja) ----
  // Ini blind spot nyata: elemen ikon-saja tidak punya node TEXT, jadi lolos cek kontras & tipografi,
  // dan bisa lolos cek target. Buat pengguna screen reader, elemen ini praktis TIDAK ADA.
  // Deterministik: teks ada atau tidak, nama layer deskriptif atau tidak. Bukan penilaian rasa.
  if (!suppressTouch && isTouchTarget(node) && !isHeat(node)){
    var vis = nodeText(node);
    if (!vis){
      var nm = (node.name || "").trim();
      var namaGeneric = !nm || GENERIC_NAME.test(nm) || nm.length < 3;
      out.push({ id: node.id, name: node.name, type: node.type,
        sev: namaGeneric ? 3 : 2, impact: mockImpact(node),
        cat: "name",
        title: namaGeneric ? "Elemen interaktif tanpa nama (ikon-saja)" : "Ikon-saja, nama aksesibel perlu dipastikan",
        sources: [
          { s: "wcag", v: namaGeneric ? "fail" : "thin", code: "4.1.2 Name, Role, Value · A",
            note: namaGeneric
              ? "Tidak ada teks yang terlihat DAN nama layer tidak deskriptif (\"" + (nm || "tanpa nama") + "\"). Pengguna screen reader tidak mendengar apa pun selain \"tombol\", jadi elemen ini praktis tidak ada buat mereka."
              : "Tidak ada teks yang terlihat, tapi nama layer (\"" + nm + "\") deskriptif. Ini bisa jadi dasar accessible name, TAPI Figma tidak menjamin dev memakainya. Pastikan di implementasi ada contentDescription / aria-label / accessibilityLabel." },
          { s: "ds", v: namaGeneric ? "fail" : "review", code: "guideline: TI-07 tombol wajib label",
            note: "Solusi terbaik: tambah label teks di samping ikon. Kalau ruang tidak memungkinkan, wajib ada label aksesibel di kode." },
          { s: "uxlaw", law: "Recognition over recall",
            q: "Ikon tanpa label juga menuntut pengguna awam menebak artinya. Sudah pasti maknanya universal?" }
        ] });
    }
  }
  if (("fills" in node) && node.fills !== figma.mixed && Array.isArray(node.fills)){
    if (node.fills.some(function(f){ return f.type === "IMAGE" && f.visible !== false; })){
      out.push({ id: node.id, name: node.name, type: node.type, sev: 1, impact: mockImpact(node),
        cat: "image", title: "Gambar tanpa keterangan",
        sources: [
          { s: "wcag", v: "review", code: "1.1.1 Non-text Content · A", note: "Dekoratif atau bermakna?" },
          { s: "uxpsych", note: "Perlu manusia: kalau bermakna kasih alt/label, kalau hiasan lewati." }
        ] });
    }
  }
}

function isCandidate(node, inInteractive){
  if (node.type === "TEXT") return true;
  if (!inInteractive && isTouchTarget(node)) return true;
  if (("fills" in node) && node.fills !== figma.mixed && Array.isArray(node.fills) && node.fills.some(function(f){ return f.type === "IMAGE" && f.visible !== false; })) return true;
  return false;
}
// walk manual: SKIP node hidden + tandai anak dari elemen tappable; hitung kandidat buat "Lolos"
function walk(node, out, inInteractive, stats){
  if (node.visible === false || node.opacity === 0) return;   // tersembunyi / opacity 0% tak perlu dicek
  if (isHeat(node)) return;                                   // overlay heatmap sendiri, jangan ikut discan
  var bb = node.absoluteBoundingBox;
  if (bb && (bb.width < 2 || bb.height < 2)) return;           // < 2px = divider/garis tipis, lewati (anaknya juga; garis gak punya anak penting)
  if (isCandidate(node, inInteractive)) stats.cand++;
  if (stats.nodes.length < 80){         // peta node buat AI (biar bisa refer & highlight)
    var t = node.type;
    if (t==="TEXT"||t==="FRAME"||t==="COMPONENT"||t==="INSTANCE"||t==="GROUP"||t==="RECTANGLE"||t==="VECTOR"){
      // buat TEXT, kirim ISI teksnya (bukan nama layer) biar AI bisa cocokin persis
      var label = (t==="TEXT" && typeof node.characters==="string" && node.characters) ? ('"'+node.characters.slice(0,50)+'"') : (node.name||"").slice(0,40);
      stats.nodes.push({ id:node.id, name:label, type:t });
    }
  }
  checkNode(node, out, inInteractive);
  if ("children" in node){
    var childIn = inInteractive || isTouchTarget(node);  // anak-anaknya bagian dari 1 area tap
    node.children.forEach(function(c){ walk(c, out, childIn, stats); });
  }
}
// Satu node bisa melahirkan LEBIH DARI SATU temuan (mis. teks yang sekaligus kekecilan dan
// kontrasnya rendah). Kalau identitas temuan dipakai = id node, ketiga hal ini rusak:
// menutup satu temuan ikut menutup temuan lain di node yang sama, membuka satu kartu
// membuka semua kartu node itu, dan hitungan temuan jadi hitungan node.
// Maka tiap temuan diberi identitas sendiri. 'id' tetap id node supaya pilih di canvas jalan.
function stampFid(out){
  var pakai = {};
  (out || []).forEach(function(f){
    var base = f.id + "#" + (f.cat || "lain");
    var k = base, n = 2;
    while (pakai[k]) { k = base + "#" + n; n++; }
    pakai[k] = 1;
    f.fid = k;
  });
  return out;
}
// Bukti bahwa aturan deterministik BENAR-BENAR masih ada di badan fungsi pemeriksa, bukan
// sekadar tercantum di daftar. Versi lama mengirim daftar string yang ditulis tangan, jadi
// pemeriksa integritas hanya mencocokkan daftar itu dengan dirinya sendiri dan selalu lulus
// walaupun logikanya sudah dihapus. Sekarang yang dikirim adalah isi fungsinya.
figma.ui.postMessage({ type: "scannerRules", rules: String(checkNode) });

function scan(){
  var sel = figma.currentPage.selection;
  var roots = sel.length ? sel : figma.currentPage.children;
  var out = [], stats = { cand: 0, nodes: [] };
  roots.forEach(function(root){ walk(root, out, false, stats); });
  stampFid(out);
  figma.ui.postMessage({ type: "findings", items: out, checked: stats.cand, nodes: stats.nodes, scope: sel.length ? "pilihan" : "halaman" });
}
// batch-scan semua screen di flow (Feature) → EQI aksesibilitas per screen dihitung di UI dari findings
function scanFrames(ids){
  var screens = [];
  (ids || []).forEach(function(id){
    var n = figma.getNodeById(id); if (!n) return;
    var out = [], stats = { cand: 0, nodes: [] };
    walk(n, out, false, stats);
    stampFid(out);
    screens.push({ id: id, name: n.name, findings: out, checked: stats.cand });
  });
  figma.ui.postMessage({ type: "featureScreens", screens: screens });
}

function sendPreview(){
  var sel = figma.currentPage.selection[0];
  if (!sel || !("exportAsync" in sel)){ figma.ui.postMessage({ type: "preview", bytes: null }); return; }
  // Batas gambar Anthropic: sisi terpanjang 8000px. Section atau layar panjang di skala 1 bisa lewat,
  // dan analisa langsung ditolak 400. Sisi terpanjang dikunci 4000px.
  var lg = Math.max(sel.width || 0, sel.height || 0);
  var sc = (lg > 4000) ? (4000 / lg) : 1;
  sel.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: sc } })
    .then(function(bytes){ figma.ui.postMessage({ type: "preview", bytes: bytes, name: sel.name }); })
    .catch(function(){ figma.ui.postMessage({ type: "preview", bytes: null }); });
}

// ---- Headings: kumpulin teks + ukuran (inferensi hierarki) ----
function collectHeadings(){
  var sel = figma.currentPage.selection, roots = sel.length ? sel : figma.currentPage.children, out = [];
  function w(n){
    if (n.visible === false || n.opacity === 0) return;
    if (n.type === "TEXT" && typeof n.fontSize === "number"){
      var b = n.absoluteBoundingBox || { x:0, y:0 };
      var fw = (n.fontName && n.fontName !== figma.mixed && /bold|semibold|black|heavy/i.test(n.fontName.style)) ? 1 : 0;
      out.push({ id:n.id, text:(n.characters||"").slice(0,48), size:Math.round(n.fontSize), bold:fw, y:b.y, x:b.x });
    }
    if ("children" in n) n.children.forEach(w);
  }
  roots.forEach(w);
  figma.ui.postMessage({ type:"headings", items: out });
}
// ---- Focus order: elemen interaktif, urut tebakan atas→bawah ----
function collectFocus(){
  var sel = figma.currentPage.selection, roots = sel.length ? sel : figma.currentPage.children, out = [];
  function w(n, inI){
    if (n.visible === false || n.opacity === 0) return;
    var tt = isTouchTarget(n);
    if (tt && !inI){ var b = n.absoluteBoundingBox || { x:0, y:0 }; out.push({ id:n.id, name:n.name, type:n.type, y:b.y, x:b.x }); }
    if ("children" in n){ var ci = inI || tt; n.children.forEach(function(c){ w(c, ci); }); }
  }
  roots.forEach(function(r){ w(r, false); });
  out.sort(function(a, b){ return (a.y - b.y) || (a.x - b.x); });
  figma.ui.postMessage({ type:"focus", items: out });
}

// ---- Flow / Journey: baca prototype reactions → graf antar-layar → task depth (jumlah tap) ----
function topFrames(){
  // respect selection (konsisten dgn scan/heatmap): kalau user pilih layar, alur dinilai HANYA dari layar terpilih.
  var out=[], seen={};
  function push(f){ if(f && !seen[f.id] && (f.type==="FRAME"||f.type==="COMPONENT")){ seen[f.id]=true; out.push(f); } }
  function pushFrom(n){
    if(n.type==="SECTION" && "children" in n){ n.children.forEach(push); }
    else push(topOwnerFrame(n));
  }
  function topOwnerFrame(n){ // node dalam frame (mis. tombol kepilih) → naik ke frame top-level-nya
    var p=n; while(p && p.parent && p.parent.type!=="PAGE" && p.parent.type!=="SECTION"){ p=p.parent; }
    return p;
  }
  var sel=figma.currentPage.selection;
  if(sel.length){ sel.forEach(pushFrom); if(out.length) return out; }
  figma.currentPage.children.forEach(pushFrom);
  return out;
}
function allFrames(){ // semua layar di page (buat resolve tujuan link, termasuk yang nested/tak terpilih)
  // INSTANCE ikut: modal/overlay & layar reusable sering ditaruh sebagai instance komponen. Tanpa ini,
  // link ke situ dibuang dan layar setelahnya jadi yatim (alur kelihatan putus padahal ter-wire).
  // Aman dari instance tombol/ikon: kita return begitu ketemu layar, jadi isi frame tidak ditelusuri.
  var out=[];
  function w(n){
    if(n.type==="FRAME"||n.type==="COMPONENT"||n.type==="INSTANCE"){ out.push(n); return; }
    if((n.type==="SECTION"||n.type==="GROUP"||n.type==="COMPONENT_SET") && "children" in n) n.children.forEach(w);
  }
  figma.currentPage.children.forEach(w);
  return out;
}
function ownerFrame(n){ var p=n; while(p && p.parent && p.parent.type!=="PAGE" && p.parent.type!=="SECTION" && p.parent.type!=="GROUP" && p.parent.type!=="COMPONENT_SET") p=p.parent; return p; }
function selectedSeeds(){
  var sel=figma.currentPage.selection, seeds=[], seen={};
  sel.forEach(function(n){ var f=ownerFrame(n); if(f && (f.type==="FRAME"||f.type==="COMPONENT"||f.type==="INSTANCE") && !seen[f.id]){ seen[f.id]=true; seeds.push(f.id); } });
  return seeds;
}
function collectNodeDests(acts, res){
  (acts||[]).forEach(function(a){
    if(!a) return;
    // CHANGE_TO = ganti varian komponen (hover/pressed), SCROLL_TO = gulir di layar yang sama.
    // Keduanya bukan pindah layar; kalau dihitung, varian tombol muncul sebagai "layar" journey.
    if(a.type==="NODE" && a.destinationId && a.navigation!=="CHANGE_TO" && a.navigation!=="SCROLL_TO"){ res.push(a.destinationId); }
    else if(a.type==="BACK" || a.type==="CLOSE"){ res.exit=true; }   // ada jalan keluar, layar ini bukan buntu
    else if(a.type==="CONDITIONAL" && a.conditionalActions){ a.conditionalActions.forEach(function(ca){ if(ca && ca.actions) collectNodeDests(ca.actions, res); }); }
  });
}
function nodeText(n){ // teks yang benar-benar kelihatan di elemen ini (buat label opsi di peta)
  var out=[];
  function w(x){ if(!x||x.visible===false) return; if(x.type==="TEXT" && typeof x.characters==="string"){ var t=x.characters.replace(/\s+/g," ").trim(); if(t) out.push(t); } if("children" in x) x.children.forEach(w); }
  w(n);
  return out.join(" · ").slice(0,60);
}
function reactDests(frame){ // {destId,label}, SEMUA reactions di dalam frame (tombol sering FRAME, jadi jangan berhenti di frame anak)
  var res=[];
  var fb=frame.absoluteBoundingBox||{x:0,y:0};
  function w(n){
    if(!n || n.visible===false) return;   // link di layer tersembunyi tidak bisa ditekan user
    if(n.reactions && n.reactions.length){
      var tx=nodeText(n);
      var lbl=tx||(n.name||"");   // pakai TEKS asli elemen; fallback nama layer kalau ikon-only
      // Simulasi persona butuh tahu elemen mana yang diklik TANPA melihat tujuannya:
      // id node, kotaknya relatif ke layar (buat posisi, kendala motorik & pembesar), dan apakah labelnya teks terlihat.
      var b=n.absoluteBoundingBox;
      var box=b?{ x:Math.round(b.x-fb.x), y:Math.round(b.y-fb.y), w:Math.round(b.width), h:Math.round(b.height) }:null;
      n.reactions.forEach(function(rx){
        var acts = rx.actions || (rx.action ? [rx.action] : []);
        var dests=[]; collectNodeDests(acts, dests);
        if(dests.exit) res.exit=true;
        // Pindah otomatis (after delay, splash) atau reaction milik layar itu sendiri bukan tombol.
        // Tetap dicatat sebagai link supaya layar berikutnya terjangkau, tapi tidak boleh tampil sebagai
        // opsi berlabel seluruh teks layar, dan tidak ditawarkan ke persona sebagai elemen yang bisa ditekan.
        var auto = (n===frame) || !!(rx.trigger && rx.trigger.type==="AFTER_TIMEOUT");
        dests.forEach(function(dz){ res.push({ destId:dz, label:(auto?"(pindah otomatis)":lbl), nid:n.id, txt:(auto?false:!!tx), box:(auto?null:box), auto:auto }); });
      });
    }
    if("children" in n) n.children.forEach(w);
  }
  w(frame);
  return res;
}
function screenTexts(node){ // teks yang ada di layar + POSISI (on-screen / bawah fold / off-screen samping) buat grounding walkthrough
  var out=[], seen={};
  var fb=node.absoluteBoundingBox||{x:0,y:0,width:(node.width||99999),height:(node.height||99999)};
  function posOf(n){
    var b=n.absoluteBoundingBox; if(!b) return "on";
    var rx=b.x-fb.x, ry=b.y-fb.y;
    if(rx>=fb.width-2 || (rx+(b.width||0))<=2) return "side";   // kanan/kiri di luar viewport (perlu swipe)
    if(ry>=fb.height-2) return "below";                          // di bawah fold (perlu scroll ke bawah)
    return "on";                                                 // terlihat (termasuk yang ngintip di tepi)
  }
  function w(n){
    if(!n || n.visible===false) return;
    if(n.type==="TEXT" && typeof n.characters==="string"){
      var t=n.characters.replace(/\s+/g," ").trim();
      if(t && t.length<=60 && !seen[t.toLowerCase()]){
        seen[t.toLowerCase()]=1;
        // x,y = posisi relatif (0..1) terhadap layar. Dipakai simulasi persona untuk kendala
        // teks 200% dan pembesar layar, di mana yang terlihat cuma sebagian layar.
        var bb=n.absoluteBoundingBox;
        var fy=(bb&&fb.height)?Math.round(((bb.y-fb.y)/fb.height)*100)/100:0;
        var fx=(bb&&fb.width)?Math.round(((bb.x-fb.x)/fb.width)*100)/100:0;
        out.push({t:t, pos:posOf(n), x:fx, y:fy});
      }
    }
    if("children" in n) n.children.forEach(w);
  }
  w(node);
  return out.slice(0,55);
}
function screenAffordances(node){ // ikon/afordansi non-teks (chevron, panah, dots, scroll), buat bantu deteksi signifier swipe/scroll tanpa cuma andalkan vision
  var fb=node.absoluteBoundingBox||{x:0,y:0,width:(node.width||99999),height:(node.height||99999)};
  var re=/chevron|caret|arrow|panah|›|»|>|next|prev|selanjut|kembali|more|lihat\s*semua|see\s*all|view\s*all|scroll|swipe|indicator|dots|pager|carousel|slider|pagination/i;
  var out=[], seen={};
  function posOf(n){ var b=n.absoluteBoundingBox; if(!b) return "on"; var rx=b.x-fb.x, ry=b.y-fb.y;
    if(rx>=fb.width-2||(rx+(b.width||0))<=2) return "off-samping";
    if(ry>=fb.height-2) return "bawah-fold";
    if((rx+(b.width||0))>=fb.width-48) return "tepi-kanan";     // nempel tepi kanan viewport = kandidat cue swipe
    return "on"; }
  function w(n){
    if(!n||n.visible===false) return;
    if(n.type!=="TEXT"){
      var nm=(n.name||"");
      if(nm && re.test(nm)){
        var key=nm.toLowerCase();
        if(!seen[key]){ seen[key]=1; out.push({ name:nm.slice(0,40), pos:posOf(n), interactive:!!(n.reactions&&n.reactions.length) }); }
      }
    }
    if("children" in n) n.children.forEach(w);
  }
  w(node);
  return out.slice(0,20);
}
function screenLoad(node){ // beban pencarian visual: hitung MENTAH tanpa dedupe & tanpa cap (screenTexts dedupe + cap 55, jadi tidak bisa dipakai ukur kepadatan)
  var fb=node.absoluteBoundingBox||{x:0,y:0,width:(node.width||99999),height:(node.height||99999)};
  var teksOn=0, teksFold=0, tapOn=0, grup=0;
  function onScreen(n){
    var b=n.absoluteBoundingBox; if(!b) return false;
    var rx=b.x-fb.x, ry=b.y-fb.y;
    if(rx>=fb.width-2 || (rx+(b.width||0))<=2) return false;
    if(ry>=fb.height-2) return false;
    return true;
  }
  function belowFold(n){
    var b=n.absoluteBoundingBox; if(!b) return false;
    return (b.y-fb.y) >= fb.height-2;
  }
  function w(n){
    if(!n || n.visible===false) return;
    if(n.type==="TEXT" && typeof n.characters==="string" && n.characters.replace(/\s+/g,"").length){
      if(onScreen(n)) teksOn++; else if(belowFold(n)) teksFold++;
    }
    if(n.reactions && n.reactions.length && onScreen(n)) tapOn++;
    if("children" in n) n.children.forEach(w);
  }
  if("children" in node){ grup=node.children.filter(function(c){ return c.visible!==false; }).length; node.children.forEach(w); }
  return { teks:teksOn, fold:teksFold, tap:tapOn, grup:grup };
}
// Urutan baca screen reader (perkiraan: atas ke bawah, kiri ke kanan) dan nama yang DIUMUMKAN.
// Dipakai simulasi persona kendala screen reader: AKSA tidak diberi gambar sama sekali, cuma
// daftar ini. Elemen interaktif tanpa teks dan bernama generik diumumkan tanpa nama ("tombol"),
// persis pengalaman pengguna tunanetra di layar yang belum diberi label.
function screenReaderOrder(node){
  var fb=node.absoluteBoundingBox||{x:0,y:0};
  var out=[];
  function rel(n){ var b=n.absoluteBoundingBox; return b?{ x:b.x-fb.x, y:b.y-fb.y }:{ x:0, y:0 }; }
  function named(nm){ nm=(nm||"").trim(); return (nm && !GENERIC_NAME.test(nm)) ? nm : ""; }
  function w(n){
    if(!n || n.visible===false) return;
    if(n!==node && n.reactions && n.reactions.length){
      var r=rel(n), tx=nodeText(n), say=tx||named(n.name);
      out.push({ nid:n.id, role:"tombol", say:say, named:!!say, ry:r.y, rx:r.x });
      return;   // teks di dalam tombol sudah jadi labelnya, jangan dibaca dua kali
    }
    if(n.type==="TEXT" && typeof n.characters==="string"){
      var t=n.characters.replace(/\s+/g," ").trim(), r2=rel(n);
      if(t) out.push({ role:"teks", say:t.slice(0,120), ry:r2.y, rx:r2.x });
      return;
    }
    if(n!==node && Array.isArray(n.fills) && n.fills.some(function(f){ return f && f.type==="IMAGE" && f.visible!==false; })){
      var r3=rel(n), s3=named(n.name);
      out.push({ role:"gambar", say:s3, named:!!s3, ry:r3.y, rx:r3.x });
    }
    if("children" in n) n.children.forEach(w);
  }
  w(node);
  out.sort(function(a,b){ var dy=a.ry-b.ry; return Math.abs(dy)>8 ? dy : a.rx-b.rx; });
  return out.slice(0,90).map(function(o){ return { nid:o.nid||null, role:o.role, say:o.say, named:(o.named!==false) }; });
}
function exportFlowShots(ids, scale, reqId){
  // reqId digaungkan balik supaya UI tahu balasan ini milik permintaan yang mana (walkthrough,
  // insight, atau persona). Dulu dirutekan lewat variabel global, jadi permintaan yang tumpang
  // tindih bisa salah alamat.
  if(!ids.length){ figma.ui.postMessage({ type:"flowShots", shots:[], reqId:reqId||null }); return; }
  var out=new Array(ids.length), pending=ids.length;
  // Walkthrough lama tetap 0,4 (5 run × banyak layar). Simulasi persona minta 1,0 karena untuk
  // kendala yang membaca dari gambar (katarak, terik, Lama Paham), teks 12px di skala 0,4 jadi
  // 5px dan tak terbaca oleh siapa pun, sehingga desain yang baik pun akan "gagal".
  var sc=(typeof scale==="number" && scale>0 && scale<=2) ? scale : 0.4;
  function done(){ figma.ui.postMessage({ type:"flowShots", shots: out.filter(Boolean), reqId:reqId||null }); }
  ids.forEach(function(id,i){
    var n=figma.getNodeById(id);
    if(n && "exportAsync" in n){
      var txts=screenTexts(n); var affs=screenAffordances(n); var load=screenLoad(n);
      var sr=[]; try{ sr=screenReaderOrder(n); }catch(e){ sr=[]; }
      var W=n.width||0, H=n.height||0;
      n.exportAsync({ format:"PNG", constraint:{ type:"SCALE", value:sc } })
        .then(function(bytes){ out[i]={ id:id, name:n.name, bytes:bytes, texts:txts, affs:affs, load:load, sr:sr, w:W, h:H }; if(--pending===0) done(); })
        .catch(function(){ if(--pending===0) done(); });
    } else { if(--pending===0) done(); }
  });
}
function collectFlow(startId){
  var all=allFrames(), byId={}; all.forEach(function(f){ byId[f.id]=f; });   // universe = SEMUA frame page (biar tujuan link selalu resolve)
  var edges=[], rawLinks=0, exits={};
  all.forEach(function(f){ var rd=reactDests(f); if(rd.exit) exits[f.id]=true; rd.forEach(function(d){
    rawLinks++;
    var dn=figma.getNodeById(d.destId), dest=dn?ownerFrame(dn):null;   // tujuan nested/overlay → petakan ke frame layar induknya
    if(dest && byId[dest.id] && dest.id!==f.id) edges.push({ from:f.id, to:dest.id, label:d.label, nid:d.nid, txt:d.txt, box:d.box, auto:!!d.auto });
  }); });
  var adj={}; edges.forEach(function(e){ (adj[e.from]=adj[e.from]||[]).push(e.to); });
  // seed: 🚩 override > frame terpilih > flag prototype > frame tanpa incoming
  var starts;
  if(startId && byId[startId]){ starts=[startId]; }
  else {
    var sd=selectedSeeds();
    if(sd.length){ starts=sd; }
    else {
      starts=(figma.currentPage.flowStartingPoints||[]).map(function(s){return s.nodeId;}).filter(function(id){return byId[id];});
      if(!starts.length){ var hasIn={}; edges.forEach(function(e){ hasIn[e.to]=true; }); starts=all.filter(function(f){return !hasIn[f.id];}).map(function(f){return f.id;}); }
      if(!starts.length && all.length) starts=[all[0].id];
    }
  }
  // journey = BFS dari seed, NGEMBANG ngikutin link (jadi frame tujuan ikut walau tak terpilih)
  var depth={}, q=[]; starts.forEach(function(s){ if(byId[s]){ depth[s]=0; q.push(s); } });
  while(q.length){ var cur=q.shift(); (adj[cur]||[]).forEach(function(nx){ if(depth[nx]===undefined){ depth[nx]=depth[cur]+1; q.push(nx); } }); }
  var reachIds=Object.keys(depth);
  var steps=reachIds.map(function(id){ return { id:id, name:byId[id].name, depth:depth[id] }; }).sort(function(a,b){ return a.depth-b.depth; });
  var maxDepth=0; steps.forEach(function(s){ if(s.depth>maxDepth) maxDepth=s.depth; });
  // Overlay yang ditutup lewat Back/Close punya jalan keluar, jadi bukan layar buntu.
  var deadends=reachIds.filter(function(id){ return !(adj[id] && adj[id].length) && !exits[id]; }).map(function(id){ return { id:id, name:byId[id].name }; });
  // Tak terjangkau = layar yang IKUT di-wire (punya link masuk/keluar) tapi tidak tercapai dari start.
  // Dulu selalu [] sehingga satu-satunya vonis BROKEN deterministik ("goal tak terjangkau") tidak pernah
  // bisa menyala. Frame lepas tanpa link sama sekali tidak dihitung, supaya tidak berisik.
  var inGraph={}; edges.forEach(function(e){ inGraph[e.from]=true; inGraph[e.to]=true; });
  var unreachable=all.filter(function(f){ return inGraph[f.id] && depth[f.id]===undefined; }).map(function(f){ return { id:f.id, name:f.name }; });
  // Wired = ada minimal satu link yang berangkat dari layar journey. Dulu "steps>1" sudah cukup,
  // padahal tanpa link sama sekali semua frame jadi start, steps>1, dan gate "wajib wired" lolos.
  var wired=edges.some(function(e){ return depth[e.from]!==undefined; });
  // peta alur buat Task Walkthrough: hanya layar yang ke-reach
  var graph=steps.map(function(s){
    // Satu opsi per ELEMEN. Dulu satu per tujuan, dengan label link pertama, jadi dua tombol berbeda
    // yang menuju layar sama tampil dengan label yang sama di peta walkthrough.
    var opts=edges.filter(function(x){ return x.from===s.id; }).map(function(e){ return { label:e.label||"(tanpa label)", to:(byId[e.to]?byId[e.to].name:"?") }; });
    // 'actions' = tiap elemen yang bisa ditekan, satu per elemen (bukan per tujuan), lengkap dengan
    // id tujuan. Dipakai simulasi persona yang berjalan layar demi layar: AKSA hanya diberi label
    // dan posisi, tujuannya disimpan di kode. 'options' dibiarkan apa adanya untuk walkthrough lama.
    var acts=edges.filter(function(x){ return x.from===s.id; }).map(function(e){
      return { label:e.label, txt:!!e.txt, nid:e.nid||null, box:e.box||null, toId:e.to, to:(byId[e.to]?byId[e.to].name:"?"), auto:!!e.auto };
    });
    return { id:s.id, name:s.name, reachable:true, options:opts, actions:acts };
  });
  figma.ui.postMessage({ type:"flow", steps:steps, edges:edges.length, frames:steps.length, framesTotal:all.length, rawLinks:rawLinks, maxDepth:maxDepth, wired:wired, startName:(byId[starts[0]]?byId[starts[0]].name:""), startId:starts[0]||null, graph:graph, unreachable:unreachable, deadends:deadends });
}

// ---- Heatmap: bobot visual (ukuran × kontras × saturasi), "mana yang paling narik mata" ----
var _heatGroup = null;
function isHeat(node){ return !!node && (node.name === "heat" || (node.name && node.name.indexOf("TIS Heatmap") >= 0)); }
function clearHeat(){ if(_heatGroup){ try{ if(!_heatGroup.removed) _heatGroup.remove(); }catch(e){} _heatGroup=null; } }
function satOf(c){ if(!c) return 0; return Math.max(c.r,c.g,c.b) - Math.min(c.r,c.g,c.b); }
function heatColor(t){
  t = Math.max(0, Math.min(1, t)); var r,g,b;
  if(t < 0.5){ var u=t/0.5; r=0.10+u*0.90; g=0.35+u*0.55; b=0.90-u*0.75; } // biru → kuning
  else { var v=(t-0.5)/0.5; r=1.0; g=0.90-v*0.82; b=0.15-v*0.15; }         // kuning → merah
  return { r:r, g:Math.max(0,g), b:Math.max(0,b) };
}
function textColor(node){
  if(node.type!=="TEXT") return null;
  // Sama seperti pemeriksa kontras: yang merender adalah fill KARAKTER.
  var L=textLayers(node); if(L.length) return L[0].color;
  var f=node.fills;
  if(f===figma.mixed||!f||!f.length) return null;
  for(var i=f.length-1;i>=0;i--){ if(f[i].type==="SOLID"&&f[i].visible!==false) return f[i].color; }
  return null;
}
function imgFill(node){
  if(!("fills" in node)) return false; var f=node.fills;
  if(f===figma.mixed||!f) return false;
  for(var i=0;i<f.length;i++){ if(f[i].type==="IMAGE"&&f[i].visible!==false) return true; }
  return false;
}
function heatCollect(node, arr){
  if(node.visible===false||node.opacity===0||isHeat(node)) return;
  var bb=node.absoluteBoundingBox; if(!bb||bb.width<2||bb.height<2) return;
  var t=node.type, leaf=(t==="TEXT"||t==="RECTANGLE"||t==="ELLIPSE"||t==="VECTOR"||t==="STAR"||t==="POLYGON"||t==="INSTANCE"||t==="COMPONENT");
  if(leaf){
    var hasImg=imgFill(node);
    var fill = (t==="TEXT") ? textColor(node) : solidFill(node);
    var con = Math.min(1,((fill ? contrast(fill, bgBehind(node)) : 1.2)-1)/9);
    var sat = satOf(fill);
    if(hasImg){ con=Math.max(con,0.72); sat=Math.max(sat,0.45); } // foto = penarik perhatian tinggi (wajah/warna); math gak bisa baca isinya, kasih floor
    arr.push({ bb:bb, area:bb.width*bb.height, con:con, sat:sat, hasImg:hasImg,
      name:(t==="TEXT" ? ('"'+(node.characters||"").slice(0,30)+'"') : (hasImg?("🖼 "+(node.name||"image")):(node.name||t))) });
    return; // blok konten = 1 unit, jangan rekursi ke dalamnya
  }
  if("children" in node) node.children.forEach(function(c){ heatCollect(c, arr); });
}
function drawHeatmap(){
  clearHeat();
  var prevSel=figma.currentPage.selection.slice();
  var roots=prevSel.length?prevSel:figma.currentPage.children, arr=[];
  roots.forEach(function(r){ heatCollect(r, arr); });
  if(!arr.length){ figma.notify("TIS: tidak ada elemen untuk heatmap"); figma.ui.postMessage({type:"heatmap",top:[],drawn:false}); return; }
  var frameArea=0; roots.forEach(function(r){ var b=r.absoluteBoundingBox; if(b) frameArea+=b.width*b.height; });
  var maxA=0; arr.forEach(function(e){ if(e.area>maxA) maxA=e.area; });
  arr.forEach(function(e){
    e.w = Math.sqrt(e.area/maxA)*0.55 + e.con*0.28 + e.sat*0.17;
    if(!e.hasImg && frameArea && e.area/frameArea>0.5) e.w *= 0.3; // bidang solid gede = background/konteks, bukan focal, dinginkan
  });
  var maxW=0; arr.forEach(function(e){ if(e.w>maxW) maxW=e.w; });
  arr.forEach(function(e){ e.t = maxW ? e.w/maxW : 0; });
  arr.sort(function(a,b){ return b.t-a.t; });
  var rects=[], cap=Math.min(arr.length,140);
  for(var i=0;i<cap;i++){
    var e=arr[i], col=heatColor(e.t), rc=figma.createRectangle();
    rc.resize(Math.max(1,e.bb.width), Math.max(1,e.bb.height));
    rc.x=e.bb.x; rc.y=e.bb.y; rc.cornerRadius=6; rc.name="heat";
    rc.fills=[{ type:"SOLID", color:col, opacity:0.26+e.t*0.44 }];
    rects.push(rc);
  }
  var g=figma.group(rects, figma.currentPage);
  g.name="🔥 TIS Heatmap (visual weight)"; g.locked=true; g.expanded=false;
  _heatGroup=g;
  _progSel=true; try{ figma.currentPage.selection=prevSel.filter(function(n){return !n.removed;}); }catch(e){} // balikin selection user, jangan ke-group heatmap
  var top=arr.slice(0,4).map(function(e){ return { name:e.name, t:Math.round(e.t*100) }; });
  figma.notify("TIS: heatmap dibuat, merah = paling menarik mata. Cek: yang paling merah sesuai tujuan halaman?");
  figma.ui.postMessage({ type:"heatmap", top:top, drawn:true });
}

// highlight hover = SELECT node native (pasti pas posisinya), selection user disimpan & dibalikin
var _savedSel = null, _progSel = false;
function clearHL(){ if(_savedSel!==null){ _progSel=true; try{ figma.currentPage.selection=_savedSel.filter(function(n){return !n.removed;}); }catch(e){} _savedSel=null; } }
// Node dari halaman lain tidak boleh di-select: figma melempar error dan seluruh onmessage berhenti.
function onCurrentPage(n){ var p=n; while(p && p.type!=="PAGE") p=p.parent; return p===figma.currentPage; }
function showHL(id){
  var n = figma.getNodeById(id);
  if(!n || n.type==="PAGE" || n.removed || !onCurrentPage(n)) return;
  if(_savedSel===null) _savedSel = figma.currentPage.selection.slice(); // simpan selection user sekali
  _progSel = true;
  try{ figma.currentPage.selection = [n]; }catch(e){ _progSel = false; }
}
// Heatmap hanya diingat di memori. Kalau plugin ditutup tanpa dimatikan, grup terkunci tertinggal
// di file dan tidak bisa dibersihkan lagi. Bersihkan saat tutup, dan sisa sesi lama saat buka.
figma.on("close", function(){ clearHeat(); });
try{ figma.currentPage.findChildren(function(n){ return isHeat(n); }).forEach(function(n){ try{ n.remove(); }catch(e){} }); }catch(e){}

function refresh(){ scan(); sendPreview(); }
figma.on("selectionchange", function(){
  if(_progSel){ _progSel=false; return; }  // perubahan dari kita (hover), abaikan
  _savedSel = null;                          // user ganti selection manual → jangan dibalikin
  refresh();
});
refresh();

// muat token Claude (lokal di mesin, bukan di file)
Promise.all([figma.clientStorage.getAsync("tis_key"), figma.clientStorage.getAsync("tis_ws")])
  .then(function(v){ figma.ui.postMessage({ type: "key", key: v[0] || "", ws: v[1] || "" }); });

figma.ui.onmessage = function(msg){
  if (msg.type === "hover"){ showHL(msg.id); return; }
  if (msg.type === "unhover"){ clearHL(); return; }
  if (msg.type === "heatmap"){ drawHeatmap(); return; }
  if (msg.type === "clearHeatmap"){ clearHeat(); figma.ui.postMessage({ type:"heatmap", top:[], drawn:false }); return; }
  clearHL();
  if (msg.type === "rescan"){ refresh(); }
  else if (msg.type === "getHeadings"){ collectHeadings(); }
  else if (msg.type === "getFocus"){ collectFocus(); }
  else if (msg.type === "getFlow"){ collectFlow(msg.startId); }
  else if (msg.type === "getFlowShots"){ exportFlowShots(msg.ids || [], msg.scale, msg.reqId); }
  else if (msg.type === "scanFrames"){ scanFrames(msg.ids || []); }
  else if (msg.type === "saveWs"){ figma.clientStorage.setAsync("tis_ws", msg.ws || "").catch(function(){ figma.notify("TIS: workspace gagal disimpan", { error:true }); }); }
  else if (msg.type === "saveKey"){
    figma.clientStorage.setAsync("tis_key", msg.key || "")
      .then(function(){ figma.notify("TIS: token Claude disimpan (lokal di mesin ini)"); })
      .catch(function(){ figma.notify("TIS: token gagal disimpan", { error:true }); });
  }
  else if (msg.type === "resize"){ var rw=Math.round(+msg.w), rh=Math.round(+msg.h); if (rw>0 && rh>0) figma.ui.resize(rw, rh); }
  else if (msg.type === "preview"){ sendPreview(); }
  else if (msg.type === "select" && msg.id){ var n = figma.getNodeById(msg.id); if (n && !n.removed && onCurrentPage(n)){ try{ figma.currentPage.selection = [n]; figma.viewport.scrollAndZoomIntoView([n]); }catch(e){} } }
  else if (msg.type === "mint"){
    var target = (msg.targetId ? figma.getNodeById(msg.targetId) : null) || figma.currentPage.selection[0] || figma.currentPage;
    // Record ditulis ke LAYAR, bukan ke tombol yang kebetulan terpilih.
    if (target && target.type !== "PAGE" && target.type !== "DOCUMENT") target = ownerFrame(target) || target;
    // Feature Snapshot (schema Govern Store): produk + skor aksesibilitas per screen + journey status (gate: journey + acc floor)
    var snap = msg.snapshot || null;
    var product = (snap && snap.product) || "";
    var rec = { product: product, screen: target.name, ts: Date.now(), open: msg.open || 0, status: "design-verified → handoff dev", snapshot: snap };
    // Dulu tanpa penjaga: node yang sudah dihapus melempar error, sementara UI sudah menampilkan
    // "record dibuat". Sekarang hasilnya dikabarkan balik, sukses atau gagal.
    try{
      target.setSharedPluginData("tis", "record", JSON.stringify(rec));
      var jtxt = (snap && snap.journey) ? " · journey " + snap.journey.status : "";
      var ptxt = product ? (product + " · ") : "";
      figma.notify("TIS: " + ptxt + "record di-mint ke “" + target.name + "” · siap handoff dev" + jtxt);
      figma.ui.postMessage({ type:"minted", ok:true, target:target.name });
    }catch(e){
      figma.notify("TIS: record GAGAL ditulis (" + String(e && e.message || e).slice(0,80) + ")", { error:true });
      figma.ui.postMessage({ type:"minted", ok:false, err:String(e && e.message || e) });
    }
  }
};
