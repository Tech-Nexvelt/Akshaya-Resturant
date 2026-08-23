import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-gold">404</p>
      <h1 className="font-display text-3xl font-medium text-ivory sm:text-4xl">
        This page wandered off the menu
      </h1>
      <p className="mt-4 max-w-md text-sm text-smoke">
        The page you&rsquo;re looking for doesn&rsquo;t exist. Here&rsquo;s where you can go instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/home"
          className="rounded-full bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-void transition-transform hover:scale-[1.02]"
        >
          Home
        </Link>
        <Link
          href="/order"
          className="rounded-full border border-gold/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:border-gold hover:text-gold-bright"
        >
          Order Online
        </Link>
      </div>
    </main>
  );
}
