import { ExternalLink, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnrollDialog } from "./EnrollDialog";
import type { SalsaClass } from "@/lib/api";

const statusMap = {
  open: { label: "Plätze frei", className: "bg-success/20 text-success border-success/30" },
  limited: { label: "Wenige Plätze", className: "bg-warning/20 text-warning border-warning/30" },
  closed: { label: "Ausgebucht", className: "bg-destructive/20 text-destructive border-destructive/30" },
} as const;

export function ClassCard({
  klass,
  onUpdated,
}: {
  klass: SalsaClass;
  onUpdated?: (k: SalsaClass) => void;
}) {
  const pct = Math.min(
    100,
    Math.round((klass.current_enrollment / Math.max(klass.max_capacity, 1)) * 100),
  );
  const s = statusMap[klass.status];

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/60 p-6 backdrop-blur transition hover:border-primary/50 hover:shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className={s.className}>
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
            {s.label}
          </Badge>
          <h3 className="mt-3 font-display text-2xl md:text-3xl">{klass.title}</h3>
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

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {klass.schedule}
        </span>
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {klass.current_enrollment} / {klass.max_capacity}
        </span>
      </div>

      {klass.description && (
        <p className="mt-4 text-sm text-muted-foreground">{klass.description}</p>
      )}

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-fire transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-muted-foreground">{pct}% belegt</div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <EnrollDialog klass={klass} onEnrolled={onUpdated} />
        <a
          href={klass.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Details auf almalatina.de
        </a>
      </div>
    </Card>
  );
}
