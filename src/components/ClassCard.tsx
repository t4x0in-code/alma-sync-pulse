import { ExternalLink, Users, Calendar, Heart, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnrollDialog } from "./EnrollDialog";
import type { SalsaClass, Enrollment } from "@/lib/api";

const statusMap = {
  open: { label: "Plätze frei", className: "bg-success/20 text-success border-success/30" },
  limited: { label: "Wenige Plätze", className: "bg-warning/20 text-warning border-warning/30" },
  closed: {
    label: "Ausgebucht",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
} as const;

function Avatar({ e }: { e: Enrollment }) {
  const initials = e.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return e.photo ? (
    <img
      src={e.photo}
      alt={e.name}
      className="h-9 w-9 rounded-full border border-border object-cover"
    />
  ) : (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-xs font-semibold ${
        e.gender === "L" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent-foreground"
      }`}
    >
      {initials}
    </div>
  );
}

export function ClassCard({
  klass,
  onUpdated: _onUpdated,
}: {
  klass: SalsaClass;
  onUpdated?: (k: SalsaClass) => void;
}) {
  const pct = Math.min(
    100,
    Math.round((klass.current_enrollment / Math.max(klass.max_capacity, 1)) * 100),
  );
  const s = statusMap[klass.status];
  const { L: leaders, F: followers } = klass.counts_by_gender;
  const enrollMap = new Map(klass.enrollments.map((e) => [e.id, e]));
  const confirmed = klass.pairs.filter((p) => p.status === "confirmed");
  const proposed = klass.pairs.filter((p) => p.status === "proposed");
  const pairedIds = new Set(klass.pairs.flatMap((p) => [p.leader_id, p.follower_id]));
  const soloLeaders = klass.enrollments.filter((e) => e.gender === "L" && !pairedIds.has(e.id));
  const soloFollowers = klass.enrollments.filter((e) => e.gender === "F" && !pairedIds.has(e.id));

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/60 p-4 backdrop-blur transition hover:border-primary/50 hover:shadow-glow sm:p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className={s.className}>
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
            {s.label}
          </Badge>
          <h3 className="mt-2 font-display text-xl leading-tight sm:text-2xl md:mt-3 md:text-3xl">
            {klass.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">mit {klass.instructor}</p>
        </div>
        <a
          href={klass.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border/60 p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
          aria-label="Mehr auf almalatina.de"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground md:mt-4 md:gap-4">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {klass.schedule}
        </span>
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {klass.current_enrollment} / {klass.max_capacity}
        </span>
      </div>

      {/* Gender split */}
      <div className="mt-3 grid grid-cols-2 gap-2.5 md:mt-4 md:gap-3">
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">🕺 Leader</div>
          <div className="mt-1 font-display text-2xl">{leaders}</div>
        </div>
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">💃 Follower</div>
          <div className="mt-1 font-display text-2xl">{followers}</div>
        </div>
      </div>

      {klass.description && (
        <p className="mt-3 text-sm text-muted-foreground md:mt-4">{klass.description}</p>
      )}

      <div className="mt-4 md:mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-fire transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-muted-foreground">{pct}% belegt</div>
      </div>

      {/* Pairs */}
      {(confirmed.length > 0 || proposed.length > 0) && (
        <div className="mt-4 space-y-2 md:mt-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-primary" /> Paare
          </div>
          {confirmed.map((p) => {
            const l = enrollMap.get(p.leader_id);
            const f = enrollMap.get(p.follower_id);
            if (!l || !f) return null;
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-success/30 bg-success/10 p-2"
              >
                <Avatar e={l} />
                <span className="text-sm font-medium">{l.name}</span>
                <Heart className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">{f.name}</span>
                <Avatar e={f} />
                <span className="ml-auto text-[10px] uppercase tracking-widest text-success">
                  bestätigt
                </span>
              </div>
            );
          })}
          {proposed.map((p) => {
            const l = enrollMap.get(p.leader_id);
            const f = enrollMap.get(p.follower_id);
            if (!l || !f) return null;
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-warning/30 bg-warning/5 p-2"
              >
                <Avatar e={l} />
                <span className="text-sm">{l.name}</span>
                <Heart className="h-4 w-4 text-warning" />
                <span className="text-sm">{f.name}</span>
                <Avatar e={f} />
                <span className="ml-auto text-[10px] uppercase tracking-widest text-warning">
                  vorgeschlagen
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Solo / suchend */}
      {(soloLeaders.length > 0 || soloFollowers.length > 0) && (
        <div className="mt-4 space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Sucht Partner
          </div>
          <div className="flex flex-wrap gap-2">
            {[...soloLeaders, ...soloFollowers].map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-2 py-1 text-xs"
                title={e.comment || undefined}
              >
                <Avatar e={e} />
                <span>
                  {e.gender === "L" ? "🕺" : "💃"} {e.name}
                  {e.age ? `, ${e.age}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reserved pairs */}
      {klass.reserved.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Stammplätze
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {klass.reserved.map((r) => (
              <span
                key={r.id}
                title={r.note ?? undefined}
                className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-[11px] tracking-wider text-primary"
              >
                {r.leader_nick}–{r.follower_nick}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col items-stretch gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
        <EnrollDialog klass={klass} />
        <a
          href={klass.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-left"
        >
          Details auf almalatina.de
        </a>
      </div>
    </Card>
  );
}
