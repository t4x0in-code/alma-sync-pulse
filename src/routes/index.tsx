import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ClassCard } from "@/components/ClassCard";
import { useClasses } from "@/hooks/useClasses";
import heroImg from "@/assets/hero-salsa.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AlmaLatina · Live Kurs-Status" },
      {
        name: "description",
        content:
          "Live-Verfügbarkeit für Salsa-Kurse bei AlmaLatina — direkt synchronisiert mit Tony.",
      },
      { property: "og:title", content: "AlmaLatina · Live Kurs-Status" },
      {
        property: "og:description",
        content: "Echtzeit-Plätze für Salsa Cubana mit Tony.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { classes, live, reload } = useClasses();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader live={live} />
      <Toaster theme="dark" position="top-center" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="container mx-auto px-4 py-10 sm:py-14 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            Live Sync
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight tracking-wide sm:text-4xl md:mt-6 md:text-6xl lg:text-7xl">
            Tanz das <span className="text-gradient-fire">Leben</span>
            <br />
            mit AlmaLatina
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground md:mt-6 md:text-lg">
            Echtzeit-Verfügbarkeit für Tonys Salsa-Stunden. Sieh sofort, wie viele Plätze noch frei
            sind — direkt synchronisiert über Telegram.
          </p>
        </div>
      </section>

      {/* Classes */}
      <section className="container mx-auto px-4 pb-8 sm:pb-10 md:pb-12">
        <div className="mb-5 flex items-end justify-between sm:mb-6 md:mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl">Aktuelle Kurse</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Updates alle 5 Sekunden vom Studio.
            </p>
          </div>
          <button
            onClick={reload}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
          >
            Aktualisieren
          </button>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
          {classes.map((k) => (
            <ClassCard key={k.id} klass={k} />
          ))}
        </div>

        {!live && (
          <p className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
            ℹ <strong>Demo-Modus (Local).</strong> Telegram-Bot nicht verbunden — Daten werden nur
            in deinem Browser gespeichert. Setze{" "}
            <code className="rounded bg-background/40 px-1">VITE_BOT_API_URL</code> auf deinen
            Docker-Bot, um live zu schalten.
          </p>
        )}

        <div className="mt-7 text-center text-xs text-muted-foreground sm:mt-8 md:mt-10">
          <Link to="/tony-admin" className="underline-offset-4 hover:text-primary hover:underline">
            Tony · Admin
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
