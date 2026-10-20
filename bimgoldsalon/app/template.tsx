export default function Template({ children }: { children: React.ReactNode }) {
  return <main className="page-in flex flex-1 flex-col">{children}</main>;
}
