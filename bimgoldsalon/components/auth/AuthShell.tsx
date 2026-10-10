"use client";

import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import type { SignInValues, SignUpValues } from "@/lib/schemas/auth";
import type { SubmitHandler } from "./fields";

type Mode = "signin" | "signup";

// Edit the copy here. `headingClass` sets the size per mode (mobile / desktop).
const COPY = {
  signin: {
    heading: "Hello Friend!",
    headingClass: "text-[35px] md:text-[64px]",
    sub: "Sign up now and enjoy our site",
    prompt: "Are you new?",
    switchLabel: "Sign Up",
  },
  signup: {
    heading: "Welcome to BIM-GOLD Hair & Beauty Salon",
    headingClass: "text-[24px] md:text-[40px]",
    sub: "Sign up now and enjoy our site",
    prompt: "Back to",
    switchLabel: "Sign In",
  },
} as const;

const cx = (...c: (string | false)[]) => c.filter(Boolean).join(" ");

const formBase =
  "transition-all duration-500 ease-in-out motion-reduce:transition-none px-5 py-6 " +
  "md:absolute md:inset-y-0 md:flex md:w-1/2 md:flex-col md:justify-center md:overflow-y-auto md:px-8 md:py-10";
const formActive = "relative translate-x-0 opacity-100 delay-150";
const formInactive =
  "pointer-events-none invisible absolute inset-x-0 top-0 opacity-0";

type Props = {
  initialMode?: Mode;
  onSignIn?: SubmitHandler<SignInValues>;
  onSignUp?: SubmitHandler<SignUpValues>;
};

const AuthShell = ({ initialMode = "signin", onSignIn, onSignUp }: Props) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const isSignIn = mode === "signin";

  const toggle = () => {
    const next: Mode = isSignIn ? "signup" : "signin";
    setMode(next);
    // keep the URL shareable without triggering a navigation
    const { pathname } = window.location;
    window.history.replaceState(
      null,
      "",
      next === "signup" ? `${pathname}?mode=signup` : pathname,
    );
  };

  return (
    <main className="mx-auto w-full max-w-md md:max-w-none mb-12">
      <div className="relative md:min-h-179.5 md:overflow-hidden">
        {/* Blue panel: header on mobile, rounded sliding panel on desktop */}
        <div
          className={cx(
            "relative flex items-center justify-center bg-primary px-6 pb-24 pt-20 text-center text-white",
            "transition-all duration-700 ease-in-out motion-reduce:transition-none",
            "md:absolute md:inset-y-0 md:left-0 md:z-20 md:w-[40%] md:p-8",
            isSignIn
              ? "md:translate-x-[150%] md:rounded-l-[200px]"
              : "md:translate-x-0 md:rounded-r-[200px]",
          )}
        >
          <div className="grid w-full">
            {(Object.keys(COPY) as Mode[]).map((m) => (
              <div
                key={m}
                aria-hidden={mode !== m}
                className={cx(
                  "col-start-1 row-start-1 transition-all duration-500 motion-reduce:transition-none",
                  mode === m ? "opacity-100 delay-300" : "invisible opacity-0",
                )}
              >
                <p
                  className={cx(
                    "mx-auto max-w-120 font-semibold leading-tight",
                    COPY[m].headingClass,
                  )}
                >
                  {COPY[m].heading}
                </p>
                <p className="mt-2 text-[18px] font-medium md:mt-6">
                  {COPY[m].sub}
                </p>
                <button
                  type="button"
                  onClick={toggle}
                  className="mt-8 hidden w-50 rounded-xl border border-white px-8 py-2.5 text-[18px] font-semibold transition hover:bg-white hover:text-primary md:inline-block"
                >
                  {COPY[m].switchLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card on mobile, transparent stage on desktop */}
        <div className="relative -mt-8 overflow-hidden rounded-t-[32px] bg-[#f9f9f9] shadow-[0_2px_6px_rgba(0,0,0,0.25)] md:static md:mt-0 md:overflow-visible md:rounded-none md:bg-transparent md:shadow-none">
          <div
            aria-hidden={!isSignIn}
            className={cx(
              formBase,
              "md:left-0 md:right-auto",
              isSignIn ? formActive : cx(formInactive, "-translate-x-8"),
            )}
          >
            <SignInForm onSubmit={onSignIn} />
          </div>
          <div
            aria-hidden={isSignIn}
            className={cx(
              formBase,
              "md:left-auto md:right-0",
              !isSignIn ? formActive : cx(formInactive, "translate-x-8"),
            )}
          >
            <SignUpForm onSubmit={onSignUp} />
          </div>
        </div>
      </div>

      {/* Mobile switch link (desktop uses the button in the blue panel) */}
      <p className="py-4 text-center text-[14px] md:hidden">
        {COPY[mode].prompt}{" "}
        <button type="button" onClick={toggle} className="font-bold">
          {COPY[mode].switchLabel}
        </button>
      </p>
    </main>
  );
};

export default AuthShell;
