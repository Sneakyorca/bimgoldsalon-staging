export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-in flex flex-1 flex-col focus:outline-none"
    >
      {children}
    </main>
  );
}
