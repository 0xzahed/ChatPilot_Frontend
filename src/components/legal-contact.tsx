const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function ContactLine() {
  return CONTACT ? (
    <a className="underline" href={`mailto:${CONTACT}`}>
      {CONTACT}
    </a>
  ) : (
    <span>the contact details published on this website</span>
  );
}
