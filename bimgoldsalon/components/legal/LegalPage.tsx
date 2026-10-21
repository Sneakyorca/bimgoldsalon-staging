import type { ReactNode } from "react";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-20 pt-8 lg:px-0">
      <h1 className="text-[32px] font-semibold md:text-[44px]">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">Last updated: {updated}</p>
      <div className="mt-8 space-y-8 text-[16px] leading-relaxed [&_a]:underline [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:font-semibold [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}
