import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="mb-8 flex gap-4 text-sm text-muted-foreground">
        <Link href="/">ChatPilot</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/data-deletion">Data Deletion</Link>
      </nav>
      <article className="space-y-4 leading-7 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </article>
    </div>
  );
}
