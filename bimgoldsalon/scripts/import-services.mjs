// Safe to run again and again. It updates services in place and adds missing ones.
// It deletes nothing unless you add --prune.
//   Preview:                  node --env-file=.env.local scripts/import-services.mjs
//   Apply:                    node --env-file=.env.local scripts/import-services.mjs --apply
//   Apply + remove leftovers: node --env-file=.env.local scripts/import-services.mjs --apply --prune
import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";

const APPLY = process.argv.includes("--apply");
const PRUNE = process.argv.includes("--prune");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run with --env-file=.env.local",
  );
  process.exit(1);
}

const t = (h, m = 0) => h * 60 + m;

// The only services shown as "From £X". Everything else is a fixed price.
const KEEP_FROM = new Set([
  "Island twist braids",
  "Boho braids",
  "Normal braids",
  "Micro twist",
  "Sister locs",
  "Sister reloc",
  "Fresh dread locs from start",
  "Kids simple styles with no extensions",
]);
const norm = (s) =>
  s.toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim();

// Descriptions from the old site. Only added to a service that has none yet.
const D = {
  cornrow:
    "Experience the beauty and versatility of intricately styled braids that elevate your look. Our cornrow service offers a stylish way to manage your hair while showcasing your unique personality, making it perfect for every occasion.",
  washBlow:
    "Enjoy a fresh, clean feeling as your hair is expertly washed and styled with a professional blow dry. This service leaves your hair looking smooth and refreshed, perfect for any occasion or simply to treat yourself. Relax and let skilled hands bring out your hair’s natural shine.",
  takeDown:
    "Experience the relief of expertly removing your braids with our take down service. Our skilled professionals will carefully unravel your hair, ensuring a gentle approach that maintains its health and vitality while leaving you feeling refreshed and ready for your next style.",
  miniTwist:
    "Transform your look with beautifully crafted mini twists, designed for a natural and stylish finish. This service offers neat, small twists that are easy to manage and perfect for everyday wear. Enjoy a fresh, versatile hairstyle that suits any occasion.",
  naturalTwist:
    "Embrace your natural beauty with this stylish twist hairstyle. Perfect for adding texture and enhancing your hair's stunning natural pattern, our expert team will create a look that's both versatile and easy to maintain. Enjoy a fresh, eye-catching style that showcases your uniqueness.",
  feedIn:
    "Transform your look with stunning feed-in braids that add style and elegance. Our skilled team creates beautiful, seamless braids that are perfect for any occasion, ensuring a stylish and polished finish that you'll love. Experience the art of braiding at its finest today.",
  stitches:
    "Elevate your style with intricately woven stitches braids, perfect for expressing your unique flair. This beautiful and versatile style provides a stunning look while ensuring easy maintenance and comfort, leaving you feeling confident and ready to shine.",
  fulani:
    "Elevate your style with intricate Fulani braids that combine elegance and tradition. This beautiful service features classic patterns that frame your face perfectly while ensuring your hair is protected and manageable. Experience the art of braiding at its finest.",
  ayurvedic:
    "Experience the ancient wisdom of Ayurveda with a nourishing hair treatment designed to promote natural vitality. This gentle service uses time-honored methods to help refresh your scalp and support healthy-looking hair. Enjoy a relaxing session that brings balance and care to your hair and scalp.",
  freshLocs:
    "Begin your loc journey with expertly created, fresh dread locs tailored just for you. This service provides a professional start to your natural style, offering a clean and confident look. Perfect for anyone ready to embrace and maintain beautiful new dread locs.",
  relock:
    "Refresh and maintain your locs with a professional relocking service. This treatment helps keep your dread locs neat and secure by tightening new growth and restoring your style’s shape. Perfect for anyone looking to keep their locs looking their best with regular care.",
  closure:
    "Achieve a seamless and natural-looking finish with a professional closure wig install. This service ensures your wig is carefully fitted for comfort and style, helping you look and feel your best. Perfect for anyone seeking a polished, protective hairstyle.",
  frontal:
    "Achieve a flawless, natural-looking hairline with this professional wig installation. Designed for those seeking a seamless blend, this service ensures your frontal wig is expertly applied for a comfortable and secure fit. Enjoy a refreshed, confident look with every visit.",
  sewIn:
    "Discover a stunning new style with a sew-in weave, perfect for adding volume, length, or a fresh look. This technique secures hair extensions for a natural, versatile finish while helping protect your own hair. Weavons are also available for purchase at the salon.",
  island:
    "Transform your look with our stunning twisted braids, beautifully accentuated with curls. Each style is tailored to your unique preferences, ensuring both elegance and comfort. Pricing is flexible and varies based on the length and size of your braids, allowing you to choose the perfect option for your needs. Experience a fresh and vibrant look that celebrates your individual style!",
  mediumBoho:
    "Transform your look with a stylish medium boho bob that combines effortless elegance and modern flair. This chic haircut provides a versatile base for everyday wear or special occasions, allowing you to express your unique sense of style.",
  microTwist:
    "Experience a beautifully detailed braid style that offers both versatility and elegance. Micro twists use fine, small sections of hair to create a lightweight and natural look perfect for any occasion. Enjoy a neat, stylish finish that suits a variety of hair types and personal styles.",
  boho: "Add a touch of effortless style to your look with beautifully crafted boho braids. This service creates relaxed, free-spirited braids that suit any occasion, offering a unique blend of texture and flair. Perfect for anyone wanting a chic and modern twist to their hairstyle.",
  knotless:
    "Experience a modern braiding style that offers a sleek, natural look with minimal tension. Knotless braids are created by gradually weaving extensions into your hair, resulting in a lightweight and comfortable finish. Enjoy a versatile, low-maintenance option that suits any occasion.",
  ghana:
    "Elevate your look with expertly crafted Ghana weaving braids, known for their neat and stylish patterns. This service offers a protective and versatile hairstyle suitable for any occasion. Enjoy a professional braiding experience that highlights your unique beauty.",
  blowDry:
    "Transform your hair with a refreshing wash followed by a stylish blow dry. Enjoy smooth, voluminous locks that radiate shine and vitality, perfect for any occasion. Let our experienced stylists help you achieve a flattering look that's sure to turn heads.",
  consult:
    "This service includes a one-to-one consultation with a professional hairstylist, where you will receive expert guidance on understanding and caring for your hair going forward, along with personalised recommendations on the best hairstyles and treatments for you.",
  setting:
    "Refresh your look and maintain your style with expert retouching and setting. This service helps keep your hair looking smooth and polished, focusing on areas that need a touch-up and finishing with a professional set. Perfect for in-between visits or when you want to keep your hair looking its best.",
};

// [category, name, minutes, price, options]
// options: from = "From £X" price, featured = homepage, about = description,
//          old = earlier names (so renames keep photos), label = duration range text
const SERVICES = [
  // ---- Knotless Braids (from the owner's list) ----
  ["Knotless Braids", "Jumbo knotless braids shoulder length", t(4), 70],
  ["Knotless Braids", "Jumbo knotless braids back length", t(4), 80],
  ["Knotless Braids", "Jumbo knotless braids waist length", t(4, 30), 100],
  ["Knotless Braids", "Jumbo knotless braids bum/hip length", t(5), 120],
  ["Knotless Braids", "Medium knotless braids shoulder length", t(4), 80],
  ["Knotless Braids", "Medium knotless braids back length", t(4, 30), 90],
  ["Knotless Braids", "Medium knotless braids waist length", t(5), 120],
  [
    "Knotless Braids",
    "Medium knotless braids bum/hip length",
    t(6),
    140,
    { old: ["Medium knotless braids bom length"] },
  ],
  ["Knotless Braids", "Small knotless braids shoulder length", t(5), 90],
  ["Knotless Braids", "Small knotless braids back length", t(5), 110],
  ["Knotless Braids", "Small knotless braids waist length", t(6), 140],
  [
    "Knotless Braids",
    "Small knotless braids bum/hip length",
    t(7),
    180,
    { about: D.knotless, old: ["Small Knotless braids bom length"] },
  ],

  // ---- Braids ----
  ["Braids", "Normal braids", t(5), 80, { from: true, featured: true }],
  ["Braids", "Island twist braids", t(4), 100, { from: true, about: D.island }],
  ["Braids", "Boho braids", t(4, 30), 120, { from: true, about: D.boho }],
  ["Braids", "Small boho bob braids", t(6), 120, { from: true }],
  [
    "Braids",
    "Medium boho bob braids",
    t(5),
    100,
    { from: true, about: D.mediumBoho },
  ],
  [
    "Braids",
    "Small/medium boho braids bob",
    t(8),
    120,
    { old: ["Small medium boho braids bob"] },
  ],
  [
    "Braids",
    "Small boho braids bum length",
    t(6),
    200,
    { old: ["Small boho braids bom length"] },
  ],
  ["Braids", "Small boho braids waist length", t(8), 180],
  ["Braids", "Boho french curls bob", t(4), 80, { from: true }],
  ["Braids", "Miracle knots braids", t(4, 30), 90, { from: true }],
  ["Braids", "Milano braids or half braids", t(3), 80, { from: true }],
  [
    "Braids",
    "Jumbo French curls / bone straight",
    t(4, 30),
    100,
    { old: ["Jumbo French curls /bone straight"] },
  ],
  [
    "Braids",
    "Medium French curls / bone straight",
    t(5, 30),
    120,
    { old: ["Medium French curls /bone straight"] },
  ],
  [
    "Braids",
    "Small French curls / bone straight",
    t(6),
    150,
    { old: ["Small French curls /bone straight"] },
  ],
  [
    "Braids",
    "Ghana weaving braids",
    t(1, 30),
    50,
    { from: true, about: D.ghana },
  ],

  // ---- Cornrows ----
  [
    "Cornrows",
    "Cornrow/didi",
    t(1),
    20,
    { from: true, featured: true, about: D.cornrow },
  ],
  ["Cornrows", "Under wig cornrow", t(1), 20],
  ["Cornrows", "Medium cornrow", t(2), 30],
  ["Cornrows", "Tiny cornrow with small extension", t(4), 60],

  // ---- Feed-in, Fulani & Stitches ----
  [
    "Feed-in, Fulani & Stitches Braids",
    "Feed in braids",
    t(3),
    70,
    { from: true, about: D.feedIn },
  ],
  [
    "Feed-in, Fulani & Stitches Braids",
    "Stitches braids",
    t(2),
    50,
    { from: true, about: D.stitches },
  ],
  [
    "Feed-in, Fulani & Stitches Braids",
    "Fulani braids",
    t(3),
    70,
    { from: true, about: D.fulani },
  ],

  // ---- Twists, locs ----
  ["Marley Twist Braids", "Marley twist short", t(3, 30), 80, { from: true }],
  ["Marley Twist Braids", "Marley twist long", t(5), 120, { from: true }],
  [
    "Mini / Kinky Twist",
    "Mini twist",
    t(4, 30),
    80,
    { from: true, featured: true, about: D.miniTwist },
  ],
  ["Micro Twist / Locs", "Sister reloc", t(4), 180, { from: true }],
  ["Micro Twist / Locs", "Sister locs", t(8), 400, { from: true }],
  [
    "Micro Twist / Locs",
    "Micro twist",
    t(9),
    250,
    { from: true, about: D.microTwist },
  ],
  [
    "Natural Hair Styles",
    "Natural twist",
    t(2, 30),
    40,
    { from: true, about: D.naturalTwist },
  ],
  [
    "Dread Locs",
    "Fresh dread locs from start",
    t(6, 30),
    150,
    { from: true, about: D.freshLocs },
  ],
  [
    "Dread Locs",
    "Dread relock",
    t(2),
    50,
    { from: true, about: D.relock, old: ["Dred relock"] },
  ],

  // ---- Crochet, sew-ins, wigs ----
  [
    "Crochet Installations",
    "Single crochet installation",
    t(3, 15),
    70,
    { from: true },
  ],
  [
    "Crochet Installations",
    "Normal crochet",
    t(2, 45),
    50,
    { from: true, old: ["Crochet"] },
  ],
  ["Sew-ins", "Half sew-in with feed in braids", t(2, 30), 70, { from: true }],
  ["Sew-ins", "Sew-in weave", t(2, 15), 80, { from: true, about: D.sewIn }],
  ["Wig Installations", "Pony tail frontal installation", t(2, 15), 70],
  ["Wig Installations", "5 by 5 wig installation", t(1, 45), 60],
  ["Wig Installations", "Closure", t(1, 30), 55, { about: D.closure }],
  [
    "Wig Installations",
    "Frontal installation",
    t(2, 15),
    80,
    { about: D.frontal },
  ],

  // ---- Men, kids, threading ----
  ["Men's Hair Styles & Braids", "Men's cornrow", t(1, 55), 40, { from: true }],
  ["Men's Hair Styles & Braids", "Natural hair twist for men", t(3), 50],
  ["Men's Hair Styles & Braids", "Barrel twist", t(3), 60],
  ["Men's Hair Styles & Braids", "Men's stitches braids", t(1, 30), 40],
  ["Men's Hair Styles & Braids", "Single half head twist", t(1, 30), 50],
  ["Men's Hair Styles & Braids", "Single twist full head", t(2, 30), 60],
  [
    "Kids Hair Styles",
    "Kids braids with extensions",
    t(3),
    50,
    { from: true, featured: true },
  ],
  [
    "Kids Hair Styles",
    "Kids simple styles with no extensions",
    t(2, 15),
    10,
    { from: true, label: "1 hr - 2 hr, 15 min" },
  ],
  ["African Threading", "Threading (kiko)", t(2), 50],

  // ---- Hair, styling, treatments ----
  [
    "Hair & Styling",
    "Washing and blow drying",
    t(1, 30),
    25,
    { from: true, featured: true, about: D.washBlow },
  ],
  ["Hair & Styling", "Blow dry", t(1), 10, { from: true, about: D.blowDry }],
  ["Hair & Styling", "Retouching and blow dry", t(2, 15), 40],
  [
    "Hair & Styling",
    "Retouching and setting",
    t(2, 45),
    60,
    { about: D.setting },
  ],
  ["Hair & Styling", "Packing gel ponytail style", t(2), 50],
  ["Hair & Styling", "Consultation", t(0, 45), 15, { about: D.consult }],
  [
    "Take Down Services",
    "Take down service",
    t(1),
    10,
    { from: true, featured: true, about: D.takeDown },
  ],
  [
    "Natural Hair Treatments",
    "Ayurvedic hair treatment",
    t(1, 50),
    49.99,
    { about: D.ayurvedic },
  ],
  ["Natural Hair Treatments", "Deep Conditioning Treatments", t(1, 50), 49.99],
  ["Natural Hair Treatments", "Hot Oil Treatments", t(1, 50), 45],
  ["Natural Hair Treatments", "Hair Growth & Scalp Treatments", t(1, 50), 45],
  ["Natural Hair Treatments", "Protein treatment", t(1, 50), 49.99],
  ["Relaxed Hair Treatment", "Hair Steaming", t(1), 50],
  [
    "Relaxed Hair Treatment",
    "Protein treatment (relaxed hair)",
    t(2, 15),
    50,
    { from: true },
  ],
];

// ---- read what's in the database -------------------------------------------
const db = createClient(url, secret, { auth: { persistSession: false } });
const { data: existing, error: readError } = await db
  .from("services")
  .select("id, name, price, duration_min, extra_info");
if (readError) {
  console.error("Could not read services:", readError.message);
  process.exit(1);
}
const byName = new Map();
for (const e of existing) {
  const list = byName.get(norm(e.name)) ?? [];
  list.push(e);
  byName.set(norm(e.name), list);
}
const used = new Set();
const find = (names) => {
  for (const n of names)
    for (const e of byName.get(norm(n)) ?? []) if (!used.has(e.id)) return e;
  return null;
};

const plan = SERVICES.map(([category, name, minutes, price, o = {}]) => {
  const match = find([name, ...(o.old ?? [])]);
  if (match) used.add(match.id);
  return {
    category,
    name,
    minutes,
    price,
    from: KEEP_FROM.has(name),
    featured: !!o.featured,
    about: o.about ?? "",
    label: o.label ?? "",
    existing: match,
  };
});

// ---- report ------------------------------------------------------------------
const toAdd = plan.filter((p) => !p.existing);
const toUpdate = plan.filter((p) => p.existing);
const leftovers = existing.filter((e) => !used.has(e.id));

console.log(
  `\n${plan.length} services in the list: ${toUpdate.length} already exist (updated), ${toAdd.length} new.\n`,
);
for (const p of toUpdate) {
  const changes = [];
  if (Number(p.existing.price) !== p.price)
    changes.push(`£${Number(p.existing.price)} → £${p.price}`);
  if (p.existing.duration_min !== p.minutes)
    changes.push(`${p.existing.duration_min} → ${p.minutes} min`);
  if (p.existing.name !== p.name)
    changes.push(`renamed from "${p.existing.name}"`);
  if (changes.length) console.log(`  ~ ${p.name}: ${changes.join(", ")}`);
}
if (toAdd.length)
  console.log(
    "\nNew:\n" + toAdd.map((p) => `  + ${p.name} (${p.category})`).join("\n"),
  );
if (leftovers.length)
  console.log(
    `\nIn the database but not in the list (${leftovers.length}):\n` +
      leftovers.map((e) => `  - ${e.name}`).join("\n") +
      (PRUNE ? "" : "\n  (kept. Add --prune to remove them)"),
  );

const { data: settings } = await db
  .from("salon_settings")
  .select("opening_hours")
  .maybeSingle();
const longestDay = Math.max(
  0,
  ...(settings?.opening_hours ?? [])
    .filter(Boolean)
    .map((d) => d.close - d.open),
);
const tooLong = plan.filter((p) => longestDay && p.minutes > longestDay);
if (tooLong.length)
  console.log(
    `\nWARNING: longer than the longest opening day (${longestDay / 60} hr), so they can't be booked online:\n` +
      tooLong.map((p) => `  ! ${p.name} (${p.minutes / 60} hr)`).join("\n"),
  );

if (!APPLY) {
  console.log(
    "\nPreview only. Nothing was changed. Add --apply to make these changes.",
  );
  process.exit(0);
}

// ---- apply -----------------------------------------------------------------------
if (PRUNE && leftovers.length) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(
    `\nDelete the ${leftovers.length} services listed above? Old bookings keep their service names. Type YES: `,
  );
  rl.close();
  if (answer.trim() !== "YES") {
    console.log("Cancelled. Nothing was changed.");
    process.exit(0);
  }
}

let updated = 0;
for (const [i, p] of plan.entries()) {
  if (!p.existing) continue;
  const patch = {
    name: p.name,
    category: p.category,
    price: p.price,
    duration_min: p.minutes,
    price_is_from: p.from,
    sort_order: i,
  };
  // only fill in the description if the service has none yet
  if (p.about && Object.keys(p.existing.extra_info ?? {}).length === 0)
    patch.extra_info = { About: p.about };
  const { error } = await db
    .from("services")
    .update(patch)
    .eq("id", p.existing.id);
  if (error) {
    console.error(`Could not update "${p.name}":`, error.message);
    process.exit(1);
  }
  updated++;
}

const newRows = plan
  .map((p, i) => ({ p, i }))
  .filter(({ p }) => !p.existing)
  .map(({ p, i }) => ({
    name: p.name,
    category: p.category,
    price: p.price,
    price_is_from: p.from,
    duration_min: p.minutes,
    duration_label: p.label,
    deposit_percent: 30,
    capacity: 2,
    featured: p.featured,
    extra_info: p.about ? { About: p.about } : {},
    sort_order: i,
  }));
for (let i = 0; i < newRows.length; i += 50) {
  const { error } = await db.from("services").insert(newRows.slice(i, i + 50));
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }
}

if (PRUNE && leftovers.length) {
  const { error } = await db
    .from("services")
    .delete()
    .in(
      "id",
      leftovers.map((e) => e.id),
    );
  if (error) {
    console.error("Could not remove leftovers:", error.message);
    process.exit(1);
  }
}

console.log(
  `\nDone. Updated ${updated}, added ${newRows.length}${PRUNE ? `, removed ${leftovers.length}` : ""}.`,
);
