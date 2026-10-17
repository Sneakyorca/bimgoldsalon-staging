import AuthActionShell from "@/components/auth/AuthActionShell";
import { signInAction, signUpAction } from "./actions";

type Props = { searchParams: Promise<{ next?: string; reset?: string }> };

const AuthPage = async ({ searchParams }: Props) => {
  const { next, reset } = await searchParams;
  return (
    <>
      {reset === "1" && (
        <p
          role="status"
          className="fixed left-1/2 top-28 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-[14px] text-green-800 shadow"
        >
          Password updated. Sign in with your new password.
        </p>
      )}
      <AuthActionShell
        next={next}
        signInAction={signInAction}
        signUpAction={signUpAction}
      />
    </>
  );
};

export default AuthPage;
