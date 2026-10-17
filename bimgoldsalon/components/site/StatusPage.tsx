import Link from "next/link";
import type { ReactNode } from "react";

export const pillPrimary =
  "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90";
export const pillOutline =
  "inline-flex items-center justify-center rounded-full border border-primary px-5 py-2.5 text-[14px] font-semibold text-primary hover:bg-card";

type Action = { label: string; href: string; variant?: "outline" };
type Props = {
  code?: string;
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  actions?: Action[];
};

export default function StatusPage({
  code,
  icon,
  title,
  children,
  actions = [],
}: Props) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-160 flex-col items-center justify-center px-5 py-16 text-center">
      <div className="grid size-18 place-items-center rounded-full bg-card text-primary">
        {icon ?? <span className="text-xl font-bold">{code}</span>}
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-primary md:text-4xl">
        {title}
      </h1>
      <div className="mt-3 max-w-xl text-gray-600">{children}</div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={action.variant === "outline" ? pillOutline : pillPrimary}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
