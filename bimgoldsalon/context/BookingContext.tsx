"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createBookingAction, getCatalogAction } from "@/app/booking/actions";
import {
  depositFor,
  isISODate,
  salonToday,
  servicesByIds,
  totalsFor,
} from "@/lib/booking";
import type { Service } from "@/lib/services";

export type Confirmed = {
  id: string;
  serviceIds: string[];
  date: string;
  time: number;
  duration: number;
  total: number;
  deposit: number;
};
type Draft = { serviceIds: string[]; date: string | null; time: number | null };

export type ConfirmResult =
  | { ok: true; paymentUrl?: string }
  | { ok: false; error: string; code?: "login" | "phone" };
const STORAGE_KEY = "bimgold_booking_v2";
/** The homepage service cards leave a service id here for the booking page to pick up */
export const PRESELECT_KEY = "bimgold_booking_preselect";
const emptyDraft: Draft = { serviceIds: [], date: null, time: null };

const validIds = (ids: unknown, catalog: Service[]): string[] =>
  Array.isArray(ids)
    ? ids.filter(
        (id): id is string =>
          typeof id === "string" && catalog.some((s) => s.id === id),
      )
    : [];
const validTime = (t: unknown): number | null =>
  typeof t === "number" && Number.isInteger(t) && t >= 0 && t < 1440 ? t : null;
const validDate = (d: unknown): string | null =>
  isISODate(d) && d >= salonToday().date ? d : null; // ISO dates sort as strings

/** Reads the saved booking, ignoring anything stale or malformed */
const load = (
  catalog: Service[],
): { draft: Draft; confirmed: Confirmed | null } => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { draft: emptyDraft, confirmed: null };
    const s = JSON.parse(raw);
    const date = validDate(s?.draft?.date);
    const c = s?.confirmed;
    const cTime = validTime(c?.time);
    const cIds = validIds(c?.serviceIds, catalog);
    return {
      draft: {
        serviceIds: validIds(s?.draft?.serviceIds, catalog),
        date,
        time: date ? validTime(s?.draft?.time) : null,
      },
      confirmed:
        typeof c?.id === "string" &&
        isISODate(c?.date) &&
        cTime !== null &&
        cIds.length > 0
          ? {
              id: c.id,
              serviceIds: cIds,
              date: c.date,
              time: cTime,
              duration: Number(c.duration) || 0,
              total: Number(c.total) || 0,
              deposit: Number(c.deposit) || 0,
            }
          : null,
    };
  } catch {
    return { draft: emptyDraft, confirmed: null };
  }
};

type BookingContextValue = {
  /** false until the services and the saved booking have loaded */
  ready: boolean;
  loadError: string;
  /** every service the salon offers */
  catalog: Service[];
  services: Service[];
  duration: number;
  price: number;
  deposit: number;
  date: string | null;
  time: number | null;
  confirmed: Confirmed | null;
  toggleService: (id: string) => void;
  setDate: (iso: string) => void;
  setSlot: (iso: string, time: number) => void;
  confirmBooking: () => Promise<ConfirmResult>;
  /** clears the in-progress selection but keeps the confirmed booking for the success page */
  clearDraft: () => void;
  reset: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const inBooking = pathname.startsWith("/booking");

  const [catalog, setCatalog] = useState<Service[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [restored, setRestored] = useState(false);

  // Load the services the first time someone reaches a booking page
  useEffect(() => {
    if (!inBooking || catalog) return;
    let cancelled = false;
    getCatalogAction()
      .then((list) => {
        if (!cancelled) setCatalog(list);
      })
      .catch(() => {
        if (!cancelled)
          setLoadError(
            "We couldn't load our services. Please refresh the page.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [inBooking, catalog]);

  // Then restore the saved draft, checked against the real services
  useEffect(() => {
    if (!catalog || restored) return;
    const saved = load(catalog);
    setDraft(saved.draft);
    setConfirmed(saved.confirmed);
    setRestored(true);
  }, [catalog, restored]);

  // The homepage service cards leave a service id for the booking page to tick.
  // This runs every time someone arrives at a booking page, not only the first
  // time, because the provider stays mounted while you move around the site.
  useEffect(() => {
    if (!inBooking || !restored || !catalog) return;
    try {
      const wanted = sessionStorage.getItem(PRESELECT_KEY);
      if (!wanted) return;
      sessionStorage.removeItem(PRESELECT_KEY);
      if (!catalog.some((s) => s.id === wanted)) return;
      setDraft((d) =>
        d.serviceIds.includes(wanted)
          ? d
          : { ...d, time: null, serviceIds: [...d.serviceIds, wanted] },
      );
    } catch {
      // ignore storage errors
    }
  }, [inBooking, restored, catalog, pathname]);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, confirmed }));
    } catch {
      // ignore storage errors
    }
  }, [draft, confirmed, restored]);

  const allServices = useMemo(() => catalog ?? [], [catalog]);
  const services = useMemo(
    () => servicesByIds(allServices, draft.serviceIds),
    [allServices, draft.serviceIds],
  );
  const { duration, price } = useMemo(() => totalsFor(services), [services]);
  const deposit = useMemo(() => depositFor(services), [services]);

  // Changing services changes the duration, so a chosen time may no longer fit: clear it
  const toggleService = useCallback((id: string) => {
    setDraft((d) => ({
      ...d,
      time: null,
      serviceIds: d.serviceIds.includes(id)
        ? d.serviceIds.filter((x) => x !== id)
        : [...d.serviceIds, id],
    }));
  }, []);

  const setDate = useCallback(
    (iso: string) => setDraft((d) => ({ ...d, date: iso, time: null })),
    [],
  );
  const setSlot = useCallback(
    (iso: string, time: number) => setDraft((d) => ({ ...d, date: iso, time })),
    [],
  );

  const confirmBooking = useCallback(async (): Promise<ConfirmResult> => {
    if (!draft.date || draft.time === null || services.length === 0)
      return { ok: false, error: "Your booking is incomplete." };
    try {
      const res = await createBookingAction({
        serviceIds: draft.serviceIds,
        date: draft.date,
        time: draft.time,
      });
      if (!res.ok) return res;
      setConfirmed({
        id: res.booking.id,
        serviceIds: draft.serviceIds,
        date: draft.date,
        time: draft.time,
        duration: res.booking.duration,
        total: res.booking.total,
        deposit: res.booking.deposit,
      });
      return { ok: true, paymentUrl: res.booking.paymentUrl };
    } catch {
      return {
        ok: false,
        error: "We couldn't confirm your booking. Please try again.",
      };
    }
  }, [draft, services.length]);

  const clearDraft = useCallback(() => setDraft(emptyDraft), []);
  const reset = useCallback(() => {
    setDraft(emptyDraft);
    setConfirmed(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        ready: restored,
        loadError,
        catalog: allServices,
        services,
        duration,
        price,
        deposit,
        date: draft.date,
        time: draft.time,
        confirmed,
        toggleService,
        setDate,
        setSlot,
        confirmBooking,
        clearDraft,
        reset,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
};
