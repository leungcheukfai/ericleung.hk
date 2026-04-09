import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-5 py-10">
      <section className="w-full rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg">
        <p className="text-muted-foreground text-sm">404</p>
        <h1 className="mt-3 font-cal text-4xl">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          This site only exposes the homepage and the private admin panel.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-medium text-primary-foreground transition hover:opacity-90"
        >
          Back to homepage
        </Link>
      </section>
    </main>
  );
}
