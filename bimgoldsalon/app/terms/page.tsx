import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { policy } from "@/lib/salon";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Terms & Conditions | BIM-GOLD" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated={BUSINESS.updated}>
      <section>
        <h2>1. About us</h2>
        <p>
          This website is run by {BUSINESS.legalName}, trading as{" "}
          {BUSINESS.name}, {BUSINESS.address}. You can contact us at{" "}
          {BUSINESS.email} or {BUSINESS.phone}. By using this website, creating
          an account, placing an order or booking an appointment, you agree to
          these terms.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <p>
          You are responsible for keeping your password secure and for activity
          on your account. Please give accurate details and let us know if they
          change. We may suspend accounts that are used fraudulently or
          abusively.
        </p>
      </section>

      <section>
        <h2>3. Shop orders</h2>
        <ul>
          <li>
            Prices are in pounds sterling. The price shown at checkout, after
            any discount, is the price you pay.
          </li>
          <li>
            Products are subject to availability. If an item is out of stock
            after you order, we will tell you and refund you for it.
          </li>
          <li>
            Your order is accepted when we confirm it by email or dispatch your
            goods. We may decline an order, for example if there is a pricing
            error.
          </li>
          <li>
            Payments are processed securely by our payment provider. We do not
            see or store your card details.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Delivery</h2>
        <p>
          Delivery options and costs are shown at checkout, and you can choose
          local pickup where offered. Delivery times are estimates. If your
          order is delayed or arrives damaged, please contact us as soon as
          possible.
        </p>
      </section>

      <section>
        <h2>5. Cancellations and returns</h2>
        <ul>
          <li>
            If you buy goods online, you can usually cancel and return them
            within 14 days of receiving them. Contact us first, and return items
            unused and in their original packaging.
          </li>
          <li>
            For hygiene reasons we cannot accept returns of opened hair
            products, or items that have been used, unless they are faulty.
          </li>
          <li>
            If goods are faulty or not as described, you have legal rights under
            the Consumer Rights Act 2015, and we will repair, replace or refund
            them.
          </li>
          <li>
            Refunds are made to the original payment method, usually within 14
            days of us receiving the goods back.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Appointments</h2>
        <ul>
          <li>
            A deposit is required to secure your appointment. The balance is
            paid at the salon when your service is complete.
          </li>
          <li>
            To cancel or reschedule, please give us at least{" "}
            {BUSINESS.cancellationHours} hours&apos; notice.{" "}
            {BUSINESS.depositPolicy}
          </li>
          <li>
            Please arrive on time. If you are late, we may need to shorten or
            rearrange your appointment so we do not affect other clients.
          </li>
          <li>
            We may need to rearrange an appointment, for example due to illness.
            If we do, we will offer you another time or a refund of your
            deposit.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Salon policy</h2>
        <p>
          The salon policy below is also shown when you book, and forms part of
          these terms.
        </p>
        {policy.important.sections.map((s) => (
          <div key={s.title} className="mt-4">
            <h3 className="font-semibold">{s.title}</h3>
            <ul>
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>8. Our responsibility</h2>
        <p>
          We take reasonable care to provide our products and services, but
          nothing in these terms limits any rights you have by law, including
          for death or personal injury caused by our negligence. Subject to
          that, we are not liable for losses that were not reasonably
          foreseeable.
        </p>
      </section>

      <section>
        <h2>9. Your information</h2>
        <p>
          How we use your personal information is explained in our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>10. Changes and law</h2>
        <p>
          We may update these terms from time to time. The version on this page
          applies when you place an order or make a booking. These terms are
          governed by the law of England and Wales, and the courts of England
          and Wales have jurisdiction.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about these terms? Contact {BUSINESS.email} or visit us at{" "}
          {BUSINESS.address}.
        </p>
      </section>
    </LegalPage>
  );
}
