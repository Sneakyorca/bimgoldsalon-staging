import {
  Car,
  PoundSterling,
  UserX,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { parking, welcome } from "@/lib/salon";
import PolicyDialogButton from "./PolicyDialog";

const ICONS: Record<string, LucideIcon> = {
  guest: UserX,
  team: Users,
  deposit: PoundSterling,
};

function Item({
  Icon,
  title,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-tight">{title}</p>
        <p className="mt-1 text-[14px] leading-snug text-gray-700">
          {children}
        </p>
      </div>
    </li>
  );
}

export default function BookingWelcome() {
  return (
    <section
      aria-labelledby="booking-welcome"
      className="mb-5 rounded-2xl border border-black/60 bg-[#f9f9f9] p-5 md:p-6"
    >
      <h2
        id="booking-welcome"
        className="text-[22px] font-semibold leading-tight md:text-[24px]"
      >
        {welcome.title}
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-gray-700">
        {welcome.intro}
      </p>

      <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {welcome.notes.map((n) => (
          <Item key={n.title} Icon={ICONS[n.icon] ?? Users} title={n.title}>
            {n.text}
          </Item>
        ))}
        <Item Icon={Car} title="Parking">
          Nearest car park: {parking.name}, {parking.postcode}. {parking.note}{" "}
          <a
            href={parking.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Open in Maps
          </a>
        </Item>
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/10 pt-4">
        <PolicyDialogButton className="rounded-full border border-primary px-5 py-2 text-[14px] font-semibold text-primary hover:bg-card">
          Read the booking policy
        </PolicyDialogButton>
        <span className="text-[13px] text-gray-600">
          Booking means you agree to it.
        </span>
      </div>
    </section>
  );
}
