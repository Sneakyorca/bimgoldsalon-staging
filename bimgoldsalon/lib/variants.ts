import { z } from "zod";

export type OptionValue = { label: string; swatch: string };
export type OptionGroup = { name: string; values: OptionValue[] };
export type VariantInput = { key: string; priceDelta: number; stock: number };
export type AdminOptions = { groups: OptionGroup[]; variants: VariantInput[] };

export type PublicVariant = {
  id: number;
  name: string;
  selections: Record<string, string>;
  price: number;
  originalPrice: number;
  discountPercent: number;
  stock: number;
};
export type ProductOptions = {
  groups: OptionGroup[];
  variants: PublicVariant[];
};

export const MAX_GROUPS = 3;
export const MAX_VALUES = 30;
export const MAX_COMBINATIONS = 100;

/** "Colour=Black|Type=Soft" */
export const keyOf = (groups: OptionGroup[], picks: string[]) =>
  groups.map((g, i) => `${g.name}=${picks[i]}`).join("|");

export const selectionsFromKey = (key: string): Record<string, string> =>
  Object.fromEntries(
    key.split("|").map((part) => {
      const i = part.indexOf("=");
      return [part.slice(0, i), part.slice(i + 1)];
    }),
  );

/** "Black / Soft" */
export const labelFromKey = (key: string) =>
  Object.values(selectionsFromKey(key)).join(" / ");

/** "Colour: Black, Type: Soft" */
export const optionsText = (key: string) =>
  Object.entries(selectionsFromKey(key))
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

/** "Braiding Hair (Colour: Black, Type: Soft)". The title is shortened if needed, never the options. */
export function variantName(title: string, key: string, max = 120) {
  const opts = ` (${optionsText(key)})`;
  const room = Math.max(10, max - opts.length);
  const t =
    title.length > room ? `${title.slice(0, room - 1).trimEnd()}…` : title;
  return `${t}${opts}`;
}

const VARIANT_NAME =
  /^(.*?) \(((?:[^:()]+: [^,()]+)(?:, [^:()]+: [^,()]+)*)\)$/;

/** Splits a name back into the product title and its options (options is "" for normal products) */
export function splitName(name: string): { title: string; options: string } {
  const m = name.match(VARIANT_NAME);
  return m ? { title: m[1], options: m[2] } : { title: name, options: "" };
}

/** Every combination as the list of chosen labels, in option order */
export function combinations(groups: OptionGroup[]): string[][] {
  if (groups.length === 0) return [];
  return groups.reduce<string[][]>(
    (acc, g) =>
      acc.flatMap((picks) => g.values.map((v) => [...picks, v.label])),
    [[]],
  );
}

const plain = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} can't be empty.`)
    .max(max, `${label} is too long.`)
    .regex(/^[^|=,():]+$/, `${label} can't contain | = , : ( or )`);

export const optionsSchema = z
  .object({
    groups: z
      .array(
        z.object({
          name: plain("Option name", 30),
          values: z
            .array(
              z.object({
                label: plain("Option value", 40),
                swatch: z
                  .string()
                  .trim()
                  .regex(/^(#[0-9a-fA-F]{6})?$/, "Use a colour like #1a1a1a."),
              }),
            )
            .min(1, "Add at least one value to every option.")
            .max(MAX_VALUES),
        }),
      )
      .max(MAX_GROUPS),
    variants: z
      .array(
        z.object({
          key: z.string().max(400),
          priceDelta: z.number().min(0).max(1000),
          stock: z.number().int().min(0).max(100000),
        }),
      )
      .max(MAX_COMBINATIONS),
  })
  .superRefine((v, ctx) => {
    const names = v.groups.map((g) => g.name.toLowerCase());
    if (new Set(names).size !== names.length)
      ctx.addIssue({
        code: "custom",
        message: "Two options have the same name.",
      });
    for (const g of v.groups) {
      const labels = g.values.map((x) => x.label.toLowerCase());
      if (new Set(labels).size !== labels.length)
        ctx.addIssue({
          code: "custom",
          message: `"${g.name}" lists a value twice.`,
        });
    }
    const total = v.groups.reduce(
      (n, g) => n * g.values.length,
      v.groups.length ? 1 : 0,
    );
    if (total > MAX_COMBINATIONS)
      ctx.addIssue({
        code: "custom",
        message: `That makes ${total} combinations. The limit is ${MAX_COMBINATIONS}.`,
      });
  });
export type OptionsInput = z.infer<typeof optionsSchema>;
