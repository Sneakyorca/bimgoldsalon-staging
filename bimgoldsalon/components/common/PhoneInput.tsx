"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { COUNTRIES, joinPhone, splitPhone } from "@/lib/countries";

type Props = {
  /** "+447123456789", or "" when empty */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Same classes you'd give a normal text input in that form */
  inputClassName: string;
  invalid?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

export default function PhoneInput({
  value,
  onChange,
  onBlur,
  inputClassName,
  invalid,
  placeholder = "7123 456789",
  disabled,
  id,
}: Props) {
  const [iso, setIso] = useState(() => splitPhone(value).iso);
  const [national, setNational] = useState(() => splitPhone(value).national);
  const last = useRef(value);

  // If the form changes the value from outside (reset, saved data), follow it
  useEffect(() => {
    if (value === last.current) return;
    last.current = value;
    if (value === joinPhone(iso, national)) return;
    const s = splitPhone(value);
    setIso(s.iso);
    setNational(s.national);
  }, [value, iso, national]);

  const emit = (nextIso: string, nextNational: string) => {
    const v = joinPhone(nextIso, nextNational);
    last.current = v;
    onChange(v);
  };

  const dial = COUNTRIES.find((c) => c.iso === iso)?.dial ?? "44";

  return (
    <div className="flex md:gap-0.5">
      <div className="relative w-24 shrink-0">
        {/* What you see: just the code. The real dropdown sits invisibly on top. */}
        <div
          aria-hidden="true"
          className={`${inputClassName} flex h-full items-center justify-between rounded-r-none border-r-0`}
        >
          <span>+{dial}</span>
          <ChevronDown className="size-4 shrink-0" />
        </div>
        <select
          aria-label="Country code"
          value={iso}
          disabled={disabled}
          onChange={(e) => {
            setIso(e.target.value);
            emit(e.target.value, national);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.name} (+{c.dial})
            </option>
          ))}
        </select>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={national}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={invalid ? true : undefined}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
          setNational(cleaned);
          emit(iso, cleaned);
        }}
        onBlur={onBlur}
        className={`${inputClassName} min-w-0 rounded-l-none`}
      />
    </div>
  );
}
