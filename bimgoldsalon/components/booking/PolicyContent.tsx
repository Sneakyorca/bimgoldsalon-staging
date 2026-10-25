import { policy } from "@/lib/salon";

export function PolicyBody({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <div className="text-[16px] leading-snug">
      {showHeading && <p>{policy.important.heading}</p>}
      <p className={showHeading ? "mt-4" : ""}>{policy.important.intro}</p>
      <p className="mt-4">{policy.important.lead}</p>

      {policy.important.sections.map((s) => (
        <div key={s.title} className="mt-5">
          <h4 className="font-medium">{s.title}</h4>
          <ul className="mt-2 space-y-1">
            {s.points.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden="true">*</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-6">{policy.important.closing}</p>
    </div>
  );
}
