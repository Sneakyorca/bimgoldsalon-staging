import type { Metadata } from "next";
import StatusPage from "@/components/site/StatusPage";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="We can't find that page"
      actions={[
        { label: "Back home", href: "/" },
        { label: "Book a service", href: "/booking", variant: "outline" },
      ]}
    >
      <p>The link may be old, or the page may have moved.</p>
    </StatusPage>
  );
}
