import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-card/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Tanzschule für authentische kubanische Salsa, Bachata und Latin Vibes in Deutschland.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-lg">Kontakt</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>info@almalatina.de</li>
            <li>
              <a
                href="https://almalatina.de"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-primary"
              >
                almalatina.de
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display text-lg">Unterricht</h4>
          <p className="text-sm text-muted-foreground">
            Donnerstag · 20:00 – 21:30
            <br />
            Open Level · Salsa Cubana
          </p>
        </div>
      </div>
      <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AlmaLatina · Live Sync Portal
      </div>
    </footer>
  );
}
