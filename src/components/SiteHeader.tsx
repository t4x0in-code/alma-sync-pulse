import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteHeader({ live }: { live?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <a
            href="https://almalatina.de"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-muted-foreground transition hover:text-foreground sm:block"
          >
            almalatina.de
          </a>
          {live !== undefined && (
            <span
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"
              title={
                live
                  ? "Live: Telegram-Bot verbunden"
                  : "Local-Modus: Demo ohne Bot (Daten im Browser)"
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  live ? "bg-success animate-pulse-dot" : "bg-warning"
                }`}
              />
              {live ? "Live" : "Local"}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
