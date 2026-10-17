import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Privacy Policy | BIM-GOLD" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={BUSINESS.updated}>
      <section>
        <h2>1. Who we are</h2>
        <p>
          {BUSINESS.legalName}, trading as {BUSINESS.name} ({BUSINESS.address}),
          is responsible for your personal information. Contact us about
          anything in this policy at {BUSINESS.email}.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your name, email address, phone
            number and password (stored securely, and we cannot read it).
          </li>
          <li>
            <strong>Bookings:</strong> the service, date and time you choose,
            and any notes we or you add.
          </li>
          <li>
            <strong>Orders:</strong> the items you buy, your delivery address
            and your contact details.
          </li>
          <li>
            <strong>Payments:</strong> handled by our payment provider. We
            receive confirmation of payment, but not your full card number.
          </li>
          <li>
            <strong>Training applications:</strong> the details you submit when
            you apply.
          </li>
          <li>
            <strong>Photos and videos:</strong> we may photograph or film
            hairstyles for our social media, only if you are happy for us to.
            Tell us at any point if you would rather not be featured.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Why we use it</h2>
        <ul>
          <li>To provide the services and products you ask for (contract).</li>
          <li>
            To keep our records, take payment and meet tax and legal duties
            (legal obligation).
          </li>
          <li>
            To run, secure and improve our website and business (legitimate
            interests).
          </li>
          <li>
            To send marketing, only if you have agreed (consent). You can
            withdraw that at any time.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Who we share it with</h2>
        <p>
          We use trusted providers to run our business: our database and sign-in
          provider (Supabase), our website host (Vercel), our payment provider
          (Stripe) and delivery companies. They only receive what they need and
          may process it outside the UK under approved safeguards. We do not
          sell your information.
        </p>
      </section>

      <section>
        <h2>5. How long we keep it</h2>
        <p>
          We keep your account until you ask us to delete it. We keep order and
          payment records for as long as the law requires for tax and
          accounting, normally six years. Booking records are kept for a
          reasonable period afterwards in case of queries.
        </p>
      </section>

      <section>
        <h2>6. Your rights</h2>
        <p>
          You can ask to see, correct, delete or receive a copy of your
          information, and to object to or restrict how we use it. Email{" "}
          {BUSINESS.email}. If you are unhappy with how we handle your data, you
          can complain to the Information Commissioner&apos;s Office at{" "}
          <a href="https://ico.org.uk" rel="noreferrer">
            ico.org.uk
          </a>
          .
        </p>
      </section>

      <section>
        <h2>7. Cookies and similar technologies</h2>
        <p>
          We only use what is needed to run the website: a sign-in cookie that
          keeps you logged in, and your browser&apos;s storage to remember the
          items in your cart. We do not currently use advertising or tracking
          cookies. If that changes, we will update this page and ask for your
          consent first.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use secure connections and access controls to protect your
          information. No system is perfectly secure, so please use a strong
          password and keep it private.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update this policy. The latest version is always on this page,
          with the date at the top.
        </p>
      </section>
    </LegalPage>
  );
}
