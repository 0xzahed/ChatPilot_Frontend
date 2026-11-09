import type { Metadata } from "next";
import { ContactLine } from "@/components/legal-contact";

export const metadata: Metadata = { title: "Terms of Service — ChatPilot" };

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: November 8, 2026</p>
      <p>
        By using ChatPilot you agree to these terms. ChatPilot provides a shared inbox and automation tools for
        business messaging.
      </p>
      <h2>Your account</h2>
      <p>You are responsible for your account, for the Pages and channels you connect, and for activity under them.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Follow the policies of Meta and every channel you connect, including messaging-window rules.</li>
        <li>Do not use the service for spam, unlawful content or to collect data without a legal basis.</li>
      </ul>
      <h2>Availability</h2>
      <p>The service is provided &ldquo;as is&rdquo; without warranty, and features may change.</p>
      <h2>Termination</h2>
      <p>You may stop using the service and disconnect your channels at any time. We may suspend accounts that violate these terms.</p>
      <h2>Contact</h2>
      <p>
        Questions: <ContactLine />.
      </p>
    </>
  );
}
