import AuthShell from "@/components/auth/AuthShell";

// Next 15+: searchParams is a Promise. On Next 14, use `searchParams.mode` directly.
type Props = { searchParams: Promise<{ mode?: string }> };

const AuthPage = async ({ searchParams }: Props) => {
  const { mode } = await searchParams;
  return <AuthShell initialMode={mode === "signup" ? "signup" : "signin"} />;
};

export default AuthPage;
