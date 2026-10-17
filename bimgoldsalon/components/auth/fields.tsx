"use client";

import {
  forwardRef,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "@/components/common/PhoneInput";

/** Receives the validated form values. Pass a server action (or any async fn) from your page. */
export type SubmitHandler<T> = (values: T) => Promise<void> | void;

export const inputClass =
  "h-13 w-full rounded-lg border border-black bg-transparent px-3 text-[15px] md:text-[18px] text-[#313c6b] outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-[#313c6b]/40 aria-invalid:border-red-600 aria-invalid:ring-2 aria-invalid:ring-red-500/40 md:h-14 md:border-0 md:bg-[#e0e0e0] md:px-5 md:text-black md:placeholder:text-[#555]";

/** Shared heading styles so every auth page matches. Add a text colour where used. */
export const titleClass =
  "text-[28px] font-semibold md:text-center md:text-[52px] md:leading-tight";
export const subtitleClass =
  "hidden text-center text-[15px] md:text-[18px] md:block";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Validation message from react-hook-form */
  error?: string;
};

const FieldError = ({ id, error }: { id: string; error?: string }) =>
  error ? (
    <p id={id} role="alert" className="mt-1.5 text-[14px] text-red-600">
      {error}
    </p>
  ) : null;

// forwardRef so react-hook-form's `register()` can reach the input
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className = "", placeholder, ...props }, ref) => {
    const id = useId();
    return (
      <div>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          placeholder={placeholder ?? label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass} ${className}`}
          {...props}
        />
        <FieldError id={`${id}-error`} error={error} />
      </div>
    );
  },
);
TextField.displayName = "TextField";

/** Optional phone field with a country-code dropdown. Value looks like "+447123456789". */
export const PhoneField = ({
  value,
  onChange,
  onBlur,
  error,
  label = "Phone number (optional)",
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
}) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <PhoneInput
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        inputClassName={inputClass}
        invalid={!!error}
        placeholder={label}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
};

export const PasswordField = forwardRef<
  HTMLInputElement,
  Omit<TextFieldProps, "type" | "label"> & { label?: string }
>(({ label = "Password", error, className = "", ...props }, ref) => {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          type={show ? "text" : "password"}
          placeholder={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass} pr-16 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 transition hover:text-primary"
        >
          {show ? (
            <EyeOff className="size-5" aria-hidden="true" />
          ) : (
            <Eye className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
});
PasswordField.displayName = "PasswordField";

export const PrimaryButton = ({
  loading,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
  <div className="md:flex md:justify-center">
    <button
      type="submit"
      disabled={loading || disabled}
      className="h-12 w-full rounded-full bg-[#313c6b] text-[15px] md:text-[18px] font-semibold text-white transition hover:bg-[#283258] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:rounded-md md:bg-primary md:px-14 md:hover:bg-primary/90"
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  </div>
);

const socialClass =
  "flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#313c6b] text-[16px] text-[#313c6b] transition hover:bg-[#313c6b]/5";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    fill="currentColor"
    className="text-black"
  >
    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
  </svg>
);

/** TODO: wire these up to your provider, e.g. signIn("google") / signIn("apple"). */
export const SocialButtons = ({ mode }: { mode: "signin" | "signup" }) => (
  <div className="space-y-3 md:hidden">
    <button type="button" className={socialClass}>
      <GoogleIcon /> Continue with Google
    </button>
    <button type="button" className={socialClass}>
      <AppleIcon /> {mode === "signin" ? "Sign in" : "Sign up"} with Apple
    </button>
  </div>
);

export const OrDivider = () => (
  <div
    role="separator"
    className="flex items-center gap-4 text-[14px] text-gray-500 md:hidden"
  >
    <span className="h-px flex-1 bg-gray-300" />
    or
    <span className="h-px flex-1 bg-gray-300" />
  </div>
);
