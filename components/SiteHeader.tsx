"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Lessons", icon: "◆" },
  { href: "/fidel", label: "Fidel", icon: "▦" },
  { href: "/review", label: "Review", icon: "↻" },
  { href: "/progress", label: "Progress", icon: "▲" },
];

function useNav() {
  const pathname = usePathname();
  // The lesson player is full-screen; the studio has its own header.
  const hidden = pathname.startsWith("/lesson/") || pathname.startsWith("/studio") || pathname.startsWith("/welcome");
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return { hidden, isActive };
}

export function SiteHeader() {
  const { hidden, isActive } = useNav();
  if (hidden) return null;
  return (
    <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="font-display text-xl font-semibold text-berbere">
          Amharic
        </Link>
        <nav className="hidden gap-1 text-sm sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 ${isActive(l.href) ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="tibeb-thin" />
    </header>
  );
}

/** Tab bar along the bottom of the screen on phones. */
export function BottomNav() {
  const { hidden, isActive } = useNav();
  if (hidden) return null;
  return (
    <>
      <div className="h-20 sm:hidden" aria-hidden />
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${isActive(l.href) ? "text-berbere" : "text-muted"}`}
          >
            <span className="text-base leading-none">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
