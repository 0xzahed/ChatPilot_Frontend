import type { Metadata } from "next";
import { ContactLine } from "@/components/legal-contact";

export const metadata: Metadata = { title: "Data Deletion — ChatPilot" };

export default function DataDeletionPage() {
  return (
    <>
      <h1>Data Deletion Instructions</h1>
      <p>
        If you messaged a business that uses ChatPilot and want the data we hold about you deleted, you can
        request it in either of these ways:
      </p>
      <ul>
        <li>
          Contact us at <ContactLine /> with your Facebook name and the Page you messaged. We will delete the
          conversations and profile information linked to you within 30 days and confirm by reply.
        </li>
        <li>
          Remove the app in Facebook: Settings &amp; privacy &rarr; Settings &rarr; Business integrations &rarr;
          remove the integration. Then send us the request above so we can delete data already stored.
        </li>
      </ul>
      <p>
        Businesses that use ChatPilot can also delete a customer and their conversations from the Customers
        page of their workspace.
      </p>
    </>
  );
}
