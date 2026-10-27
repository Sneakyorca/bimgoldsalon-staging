import { splitName } from "@/lib/variants";

/** A product name with its options (colour, type…) on their own line underneath */
export default function ItemName({
  name,
  titleClassName = "",
}: {
  name: string;
  titleClassName?: string;
}) {
  const { title, options } = splitName(name);
  return (
    <>
      <span className={titleClassName}>{title}</span>
      {options && (
        <span className="mt-0.5 block text-[13px] font-normal leading-snug text-gray-600">
          {options}
        </span>
      )}
    </>
  );
}
