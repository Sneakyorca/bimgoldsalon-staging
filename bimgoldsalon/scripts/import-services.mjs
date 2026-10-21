// Dry run (changes nothing):  node --env-file=.env.local scripts/import-services.mjs
// Really import:               node --env-file=.env.local scripts/import-services.mjs --apply --replace
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import readline from "node:readline/promises";

const APPLY = process.argv.includes("--apply");
const REPLACE = process.argv.includes("--replace");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run with --env-file=.env.local",
  );
  process.exit(1);
}

const raw = JSON.parse(
  readFileSync(new URL("./fresha-services.json", import.meta.url), "utf8"),
);

const CATEGORY_NAMES = {
  "FEED-IN BRAIDS /FULANI BRAIDS /STITCHES BRAIDS":
    "Feed-in, Fulani & Stitches Braids",
  "MICRO TWIST/LOCS": "Micro Twist / Locs",
  "MINI/KINKY TWIST": "Mini / Kinky Twist",
  "SEW-INS": "Sew-ins",
  "HAIR & STYLING": "Hair & Styling",
};
// "Category|Name" -> better name
const RENAMES = {
  "Relaxed Hair Treatment|Protein treatment":
    "Protein treatment (relaxed hair)",
};

const clean = (s) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s/-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const categoryName = (c) => CATEGORY_NAMES[clean(c)] ?? titleCase(clean(c));
const minutes = (s) => {
  let total = 0;
  for (const m of s.matchAll(/(\d+)\s*hr|(\d+)\s*min/g))
    total += m[1] ? Number(m[1]) * 60 : Number(m[2]);
  return total;
};
const priceOf = (s) => {
  const m = clean(s).match(/£\s*([\d,]+(?:\.\d+)?)/);
  return m ? Number(m[1].replace(",", "")) : NaN;
};
const key = (i) =>
  [clean(i.name), clean(i.price), clean(i.duration)].join("|").toLowerCase();
const isFeatured = (i) => clean(i.category).toLowerCase() === "featured";

const featuredKeys = new Set(raw.filter(isFeatured).map(key));
const kept = new Map();
const notes = [];

for (const item of raw) {
  if (isFeatured(item)) continue;
  const k = key(item);
  const description = clean(item.description);
  const existing = kept.get(k);
  if (existing) {
    notes.push(
      `Merged duplicate "${clean(item.name)}" (${clean(item.category)}) into ${existing.category}`,
    );
    if (!existing.description && description)
      existing.description = description;
    continue;
  }

  const category = categoryName(item.category);
  const duration = clean(item.duration);
  const range = duration.split(/\s+-\s+/);
  const price = priceOf(item.price);
  const durationMin = minutes(range[range.length - 1]);
  if (!Number.isFinite(price) || durationMin <= 0) {
    console.error(
      `Can't read price or duration for "${clean(item.name)}":`,
      item.price,
      item.duration,
    );
    process.exit(1);
  }
  kept.set(k, {
    name: RENAMES[`${category}|${clean(item.name)}`] ?? clean(item.name),
    category,
    price,
    durationMin,
    // only ranges need their own text; single durations are formatted by the site
    durationLabel: range.length > 1 ? duration : "",
    description,
    featured: featuredKeys.has(k),
  });
}

const rows = [...kept.values()];

// ---- report ----------------------------------------------------------------
const perCategory = {};
for (const r of rows)
  perCategory[r.category] = (perCategory[r.category] ?? 0) + 1;
console.log(
  `\n${rows.length} services in ${Object.keys(perCategory).length} categories, ${rows.filter((r) => r.featured).length} featured\n`,
);
console.table(perCategory);

const byName = {};
for (const r of rows) (byName[r.name.toLowerCase()] ??= []).push(r);
for (const list of Object.values(byName))
  if (list.length > 1)
    notes.push(
      `Same name used ${list.length} times: "${list[0].name}" (${list.map((l) => `${l.category}, £${l.price}, ${l.durationMin} min`).join(" | ")}). Check which is right.`,
    );
for (const r of rows)
  if (r.durationMin >= 540)
    notes.push(
      `Long service: "${r.name}" is ${r.durationMin / 60} hr. It only fits on days the salon is open that long.`,
    );
if (notes.length) console.log("\nNotes:\n- " + notes.join("\n- "));

if (!APPLY) {
  console.log(
    "\nDry run only. Nothing was changed. Add --apply (and --replace to remove the current services first).",
  );
  process.exit(0);
}

if (REPLACE) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(
    "\n--replace deletes EVERY current service. Old bookings keep their service names. Type YES to continue: ",
  );
  rl.close();
  if (answer.trim() !== "YES") {
    console.log("Cancelled.");
    process.exit(0);
  }
}

const db = createClient(url, secret, { auth: { persistSession: false } });

if (REPLACE) {
  const { error } = await db.from("services").delete().gt("id", 0);
  if (error) {
    console.error("Could not clear services:", error.message);
    process.exit(1);
  }
}

const records = rows.map((r, i) => ({
  name: r.name,
  category: r.category,
  price: r.price,
  duration_min: r.durationMin,
  duration_label: r.durationLabel,
  deposit_percent: 30,
  capacity: 2,
  featured: r.featured,
  extra_info: r.description ? { About: r.description } : {},
  sort_order: i,
}));

for (let i = 0; i < records.length; i += 50) {
  const { error } = await db.from("services").insert(records.slice(i, i + 50));
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }
}
console.log(`\nImported ${records.length} services.`);
