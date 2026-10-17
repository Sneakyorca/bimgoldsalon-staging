import type { ReactNode } from "react";
export const Th = ({
  children,
  right,
}: {
  children?: ReactNode;
  right?: boolean;
}) => (
  <th
    scope="col"
    className={`px-4 py-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground ${right ? "text-right" : "text-left"}`}
  >
    {children}
  </th>
);
export const Td = ({
  children,
  right,
  strong,
}: {
  children?: ReactNode;
  right?: boolean;
  strong?: boolean;
}) => (
  <td
    className={`px-4 py-3 align-middle ${right ? "text-right" : ""} ${strong ? "font-semibold" : ""}`}
  >
    {children}
  </td>
);
export default function Table({
  caption,
  head,
  children,
  empty = "Nothing here yet.",
  isEmpty,
  cols,
}: {
  caption: string;
  head: ReactNode;
  children: ReactNode;
  empty?: string;
  isEmpty: boolean;
  cols: number;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white">
      <table className="w-full text-[15px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-border bg-[#f9f9f9]">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isEmpty ? (
            <tr>
              <td
                colSpan={cols}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
