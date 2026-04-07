import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd());
const dataRoot = path.join(repoRoot, "frontend", "public", "data");

const isKanji = (s) => /[\u3400-\u9FFF]/.test(String(s || ""));
const norm = (s) => String(s ?? "").trim();

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && ent.name.endsWith(".json")) out.push(p);
  }
  return out;
}

function levelFromPath(filePath) {
  const rel = filePath.replace(/\\/g, "/");
  const m = rel.match(/\/(tango|minna|speed-master)-n([1-5])\//i);
  if (!m) return "";
  return `N${m[2]}`;
}

function normalizeType(type) {
  const t = norm(type).toLowerCase();
  if (!t) return "Other";
  if (t.includes("đại từ") || t.includes("pronoun")) return "Pronoun";
  if (t.includes("danh từ") || t.includes("noun")) return "Noun";
  if (t.includes("động từ") || t.includes("verb")) return "Verb";
  if (t.includes("tính từ") || t.includes("adjective") || t === "adj") return "Adjective";
  if (t.includes("trợ từ") || t.includes("particle")) return "Particle";
  if (t.includes("phụ tố") || t.includes("suffix")) return "Suffix";
  return "Other";
}

function coreTypeToEnglish(coreType) {
  const t = norm(coreType).toLowerCase();
  if (!t) return "Other";
  if (t === "noun") return "Noun";
  if (t === "verb") return "Verb";
  if (t === "adjective") return "Adjective";
  if (t === "pronoun") return "Pronoun";
  if (t === "particle") return "Particle";
  if (t === "suffix") return "Suffix";
  return "Other";
}

function normalizeHanViet(hv) {
  const v = norm(hv);
  if (!v) return "";
  return v.toUpperCase().replace(/,/g, "");
}

function loadCoreWords() {
  const p = path.join(dataRoot, "core", "words.json");
  const words = JSON.parse(fs.readFileSync(p, "utf8"));
  const byWord = new Map();
  const byReading = new Map();
  for (const w of words) {
    if (w?.word) byWord.set(w.word, w);
    if (w?.reading) byReading.set(w.reading, w);
  }
  return { byWord, byReading };
}

const core = loadCoreWords();

function lookupHanViet(word, reading) {
  const w = core.byWord.get(word) || core.byReading.get(reading) || core.byReading.get(word);
  return normalizeHanViet(w?.hanViet || "");
}

function lookupCoreType(word, reading) {
  const w = core.byWord.get(word) || core.byReading.get(reading) || core.byReading.get(word);
  return coreTypeToEnglish(w?.type || "");
}

function forcedTypeOverride(word, reading) {
  const w = norm(word);
  const r = norm(reading) || w;

  // Interjections / fixed responses
  const interjections = new Set(["はい", "いいえ", "ええ", "うん", "ううん", "こんにちは", "こんばんは", "おはよう", "ありがとう", "すみません"]);
  if (interjections.has(w) || interjections.has(r)) return "Other";

  // Copula / auxiliary politeness markers: treat as Other (not lexical Verb)
  if (r === "です" || w === "です") return "Other";
  if (r === "でした" || w === "でした") return "Other";
  if (r === "じゃない" || w === "じゃない") return "Other";
  if (r === "ではありません" || w === "ではありません") return "Other";

  return "";
}

function inferTypeFromSurface(word, reading, meaning) {
  const w = norm(word);
  const r = norm(reading) || w;
  const m = norm(meaning).toLowerCase();

  // Vietnamese hints (if present)
  if (m.includes("đại từ")) return "Pronoun";
  if (m.includes("danh từ")) return "Noun";
  if (m.includes("động từ")) return "Verb";
  if (m.includes("tính từ")) return "Adjective";
  if (m.includes("trợ từ")) return "Particle";
  if (m.includes("phụ tố")) return "Suffix";

  // High-confidence closed classes
  const pronouns = new Set([
    "私",
    "わたし",
    "僕",
    "ぼく",
    "俺",
    "おれ",
    "私たち",
    "わたしたち",
    "僕たち",
    "ぼくたち",
    "あなた",
    "君",
    "きみ",
    "彼",
    "かれ",
    "彼女",
    "かのじょ",
    "皆",
    "みな",
  ]);
  if (pronouns.has(w) || pronouns.has(r)) return "Pronoun";

  // Interjections / fixed responses (treat as Other)
  const interjections = new Set(["はい", "いいえ", "ええ", "うん", "ううん", "こんにちは", "こんばんは", "おはよう", "ありがとう", "すみません"]);
  if (interjections.has(w) || interjections.has(r)) return "Other";

  // Particles / copula / common function words (Minna/Tango frequent)
  const particles = new Set([
    "は",
    "が",
    "を",
    "に",
    "で",
    "へ",
    "の",
    "も",
    "と",
    "や",
    "ね",
    "よ",
    "か",
    "な",
    "から",
    "まで",
    "より",
    "だけ",
    "しか",
    "でも",
    "では",
    "じゃ",
  ]);
  if (particles.has(w) || particles.has(r)) return "Particle";

  // Polite copula / common auxiliary forms
  if (r === "です" || w === "です" || r === "でした" || w === "でした") return "Other";

  // Name suffixes / counters-ish suffixes
  const suffixes = ["さん", "さま", "ちゃん", "くん", "たち"];
  if (suffixes.some((s) => r.endsWith(s) || w.endsWith(s))) return "Suffix";

  // Verb patterns
  if (r.endsWith("する") || w.endsWith("する")) return "Verb";
  if (r.endsWith("ます") || r.endsWith("ました") || r.endsWith("ません")) return "Verb";
  if (r.endsWith("ない") && !r.endsWith("くない")) return "Verb"; // negative plain (rough heuristic)

  // i-adjective patterns
  if (r.endsWith("い") && !r.endsWith("いい")) return "Adjective";
  if (r.endsWith("くない") || r.endsWith("かった") || r.endsWith("くて")) return "Adjective";

  // na-adjective: often written with な in dictionaries; here we use meaning hints as fallback
  if (m.includes("adj") && m.includes("na")) return "Adjective";

  // Default: most remaining are nouns in beginner vocab sets
  return "Noun";
}

function normalizeEntry(entry, level, textbookHint) {
  const word = norm(entry.word);
  const reading = norm(entry.reading);
  const exampleJp = norm(entry?.example?.jp) || norm(entry?.exampleSentence) || norm(entry?.example_jp);
  const exampleVn = norm(entry?.example?.vn) || norm(entry?.example_vi) || norm(entry?.exampleMeaning);

  // source hanviet fields in various datasets
  const hv =
    entry.han_viet ??
    entry.hanViet ??
    entry.hanviet ??
    entry.hanViet?.toString?.();

  const normalizedType = normalizeType(entry.type);
  const typeFromCore = lookupCoreType(word, reading);
  const inferredType = inferTypeFromSurface(word, reading, entry.meaning || entry.meaning_vi || entry.meaningVi || "");
  const forcedType = forcedTypeOverride(word, reading);

  return {
    word: word,
    reading: reading || word,
    han_viet: normalizeHanViet(hv) || lookupHanViet(word, reading),
    meaning: norm(entry.meaning) || norm(entry.meaning_vi) || norm(entry.meaningVi),
    // Prefer explicit type in dataset; if it's "Other", try to infer from core words
    type:
      forcedType
        ? forcedType
        : normalizedType !== "Other"
          ? normalizedType
          : typeFromCore && typeFromCore !== "Other"
            ? typeFromCore
            : inferredType || "Other",
    level: level || "",
    example: {
      jp: exampleJp,
      vn: exampleVn,
    },
  };
}

function normalizeFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(raw);
  const level = levelFromPath(filePath);

  let changed = false;

  if (Array.isArray(json.vocabulary)) {
    const before = json.vocabulary;
    const after = before.map((e) => normalizeEntry(e, level, "minna"));
    json.vocabulary = after;
    changed = true;
  }

  if (Array.isArray(json.words)) {
    const before = json.words;
    const after = before.map((e) => normalizeEntry(e, level, json.textbookId || ""));
    json.words = after;
    changed = true;
  }

  if (!changed) return false;

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n");
  return true;
}

const files = walk(dataRoot).filter((p) => !p.includes(`${path.sep}core${path.sep}`));
let updated = 0;
let failed = 0;

for (const f of files) {
  try {
    const ok = normalizeFile(f);
    if (ok) updated++;
  } catch (e) {
    failed++;
    console.error("Failed:", f, e?.message || e);
  }
}

console.log(JSON.stringify({ scanned: files.length, updated, failed }, null, 2));
