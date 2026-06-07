import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const mod = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
new Function(mod.replace(/import .*?;/g, "").replace(/await /g, "").replace(/import\(/g, "x("));
console.log("syntaxe OK");
const code = html.match(/const FRNUM[\s\S]*?function stripDe.*/)[0];
const fns = new Function(code + "\n;return { parseQty, normalizeSpeech, findGeneric };")();
const { parseQty, normalizeSpeech, findGeneric } = fns;
let fail = 0;
function T(q, gen, g) {
  const qty = parseQty(normalizeSpeech(q));
  const f = findGeneric(qty.clean || q);
  const name = f ? f[0] : "OFF";
  let grams = null;
  if (f) { const u = f[5]; grams = qty.grams || (qty.count && u ? qty.count * u : (u || 100)); }
  const ok = name === gen && (g == null || Math.abs(grams - g) < 0.01);
  if (!ok) { fail++; console.log("ECHEC:", q, "->", name, grams); }
}
T("3 oeufs", "\u0152uf", 165);
T("3 \u0153ufs", "\u0152uf", 165);
T("un oeuf", "\u0152uf", 55);
T("50 g de p\u00e2tes cuites", "P\u00e2tes cuites", 50);
T("riz", "Riz cuit", 100);
T("2 tranches de jambon", "Jambon blanc", 90);
T("une banane et demie", "Banane", 180);
T("2 carr\u00e9s de chocolat", "Chocolat noir (carr\u00e9)", 20);
T("33cl de coca", "Soda type cola", 330);
T("yaourt danone", "OFF", null);
T("2 yaourts", "Yaourt nature", 250);
T("30g de whey", "Whey", 30);
T("du fromage", "Fromage (p\u00e2te dure)", 30);
T("2 pains au chocolat", "Pain au chocolat", 130);
T("200g de frites", "Frites", 200);
if (fail) { console.error(fail + " echec(s)"); process.exit(1); }
console.log("15 tests OK");
