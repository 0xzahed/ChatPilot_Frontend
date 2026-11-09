import type { Metadata } from "next";
import { ContactLine } from "@/components/legal-contact";

export const metadata: Metadata = { title: "Privacy Policy — ChatPilot" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: November 8, 2026</p>
      <p>
        ChatPilot (&ldquo;we&rdquo;, &ldquo;the service&rdquo;) is a customer-messaging platform that lets
        businesses read and answer messages from their Facebook Pages, Instagram, WhatsApp and website chat in one inbox.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account details of business users: name, email address and encrypted password hash.</li>
        <li>
          When a business connects a Facebook Page: the Page ID and name, and a Page access token (stored
          encrypted) used to receive and send messages for that Page.
        </li>
        <li>
          Messages sent to the connected Page and the sender&rsquo;s Facebook-scoped ID, display name and profile
          picture when Facebook provides them.
        </li>
      </ul>
      <h2>How we use it</h2>
      <p>
        We use this information only to show conversations to the business that owns the Page, to let that
        business (or its configured automation) reply, and to provide analytics inside its workspace. We do not
        sell personal data and we do not use it for advertising.
      </p>
      <h2>Sharing</h2>
      <p>
        Data is visible only to members of the business workspace it belongs to. We share data with service
        providers strictly needed to run the service (hosting, and an AI provider if the business enables AI
        replies) and when required by law.
      </p>
      <h2>Retention and deletion</h2>
      <p>
        Data is kept while the business account is active. A person can ask for their data to be deleted at any
        time &mdash; see <a className="underline" href="/data-deletion">Data Deletion</a>. Businesses can disconnect a
        Page at any time, which removes its access token.
      </p>
      <h2>Security</h2>
      <p>Credentials are encrypted at rest and traffic is served over HTTPS.</p>
      <h2>Contact</h2>
      <p>
        Questions about this policy: <ContactLine />.
      </p>
    </>
  );
}
