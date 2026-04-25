import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, Check, Plus, Lock, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useClasses } from "@/hooks/useClasses";
import { api, type SalsaClass, type Enrollment } from "@/lib/api";

export const Route = createFileRoute("/tony-admin")({
  head: () => ({
    meta: [
      { title: "Tony · Admin · AlmaLatina" },
      { name: "description", content: "Admin-Panel für Tony" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TonyAdmin,
});

function TonyAdmin() {
  const { classes, live, reload } = useClasses(3000);
  const [token, setToken] = useState(
    () =>
      (typeof window !== "undefined" && localStorage.getItem("admin_token")) || "",
  );

  const saveToken = (t: string) => {
    setToken(t);
    if (typeof window !== "undefined") localStorage.setItem("admin_token", t);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader live={live} />
      <Toaster theme="dark" position="top-center" />

      <section className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary">
              Tony · Coordinates
            </span>
            <h1 className="mt-1 font-display text-4xl md:text-5xl">Admin Cockpit</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Synchronisiert mit Telegram-Bot.
            </p>
          </div>
          <Button variant="outline" onClick={reload}>
            Refresh
          </Button>
        </div>

        <Card className="mb-6 p-4">
          <Label
            htmlFor="token"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Admin Token (X-Admin-Token)
          </Label>
          <Input
            id="token"
            type="password"
            value={token}
            onChange={(e) => saveToken(e.target.value)}
            placeholder="Aus .env des Bots: ADMIN_TOKEN"
            className="mt-2"
          />
        </Card>

        <div className="space-y-8">
          {classes.map((k) => (
            <ClassAdmin key={k.id} klass={k} token={token} onChange={reload} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ClassAdmin({
  klass,
  token,
  onChange,
}: {
  klass: SalsaClass;
  token: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [maxCap, setMaxCap] = useState(klass.max_capacity);
  const [reservedDraft, setReservedDraft] = useState({ l: "", f: "", note: "" });

  const enrollMap = new Map(klass.enrollments.map((e) => [e.id, e]));
  const pairedIds = new Set(klass.pairs.flatMap((p) => [p.leader_id, p.follower_id]));
  const freeLeaders = klass.enrollments.filter((e) => e.gender === "L" && !pairedIds.has(e.id));
  const freeFollowers = klass.enrollments.filter((e) => e.gender === "F" && !pairedIds.has(e.id));

  const guard = () => {
    if (!token) {
      toast.error("Admin Token fehlt");
      return false;
    }
    return true;
  };

  const wrap = async (fn: () => Promise<unknown>, ok = "Aktualisiert") => {
    if (!guard()) return;
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  };

  const [pairDraft, setPairDraft] = useState<{ l: number | null; f: number | null }>({
    l: null,
    f: null,
  });

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{klass.title}</h2>
          <p className="text-sm text-muted-foreground">
            {klass.schedule} · {klass.current_enrollment}/{klass.max_capacity} ·{" "}
            <span className="text-primary">🕺 {klass.counts_by_gender.L}</span>{" "}
            <span className="text-accent-foreground">💃 {klass.counts_by_gender.F}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={maxCap}
            onChange={(e) => setMaxCap(Number(e.target.value))}
            className="w-24"
          />
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => wrap(() => api.admin.updateClass(klass.id, { max_capacity: maxCap }, token))}
          >
            Plätze
          </Button>
          {klass.status === "closed" ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => wrap(() => api.admin.updateClass(klass.id, { status: "open" }, token))}
            >
              /open
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => wrap(() => api.admin.updateClass(klass.id, { status: "closed" }, token))}
            >
              /block
            </Button>
          )}
        </div>
      </div>

      {/* Pairs */}
      <div className="mt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
          <Heart className="h-4 w-4 text-primary" /> Paare
        </h3>
        <div className="space-y-2">
          {klass.pairs.length === 0 && (
            <p className="text-xs text-muted-foreground">Noch keine Paare.</p>
          )}
          {klass.pairs.map((p) => {
            const l = enrollMap.get(p.leader_id);
            const f = enrollMap.get(p.follower_id);
            if (!l || !f) return null;
            const isConfirmed = p.status === "confirmed";
            return (
              <div
                key={p.id}
                className={`flex flex-wrap items-center gap-2 rounded-md border p-2 ${
                  isConfirmed
                    ? "border-success/40 bg-success/10"
                    : "border-warning/40 bg-warning/5"
                }`}
              >
                <span className="text-sm">
                  🕺 <strong>{l.name}</strong>
                </span>
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  💃 <strong>{f.name}</strong>
                </span>
                <Badge variant="outline" className="ml-2">
                  {p.status}
                </Badge>
                <div className="ml-auto flex gap-1">
                  {!isConfirmed && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => wrap(() => api.admin.setPairStatus(p.id, "confirmed", token), "Bestätigt")}
                    >
                      <Check className="h-3 w-3" /> bestätigen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => wrap(() => api.admin.deletePair(p.id, token), "Paar entfernt")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pair builder */}
        {(freeLeaders.length > 0 && freeFollowers.length > 0) && (
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <select
              className="rounded-md border border-input bg-input px-3 py-2 text-sm"
              value={pairDraft.l ?? ""}
              onChange={(e) => setPairDraft({ ...pairDraft, l: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">— Leader wählen —</option>
              {freeLeaders.map((e) => (
                <option key={e.id} value={e.id}>
                  🕺 {e.name}{e.age ? `, ${e.age}` : ""}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-input bg-input px-3 py-2 text-sm"
              value={pairDraft.f ?? ""}
              onChange={(e) => setPairDraft({ ...pairDraft, f: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">— Follower wählen —</option>
              {freeFollowers.map((e) => (
                <option key={e.id} value={e.id}>
                  💃 {e.name}{e.age ? `, ${e.age}` : ""}
                </option>
              ))}
            </select>
            <Button
              disabled={busy || !pairDraft.l || !pairDraft.f}
              className="bg-gradient-fire"
              onClick={() =>
                wrap(async () => {
                  await api.admin.createPair(pairDraft.l!, pairDraft.f!, token);
                  setPairDraft({ l: null, f: null });
                }, "Paar erstellt")
              }
            >
              <Plus className="h-3 w-3" /> Paar
            </Button>
          </div>
        )}
      </div>

      {/* Enrollments */}
      <div className="mt-6">
        <h3 className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">
          Anmeldungen ({klass.enrollments.length})
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {klass.enrollments.map((e) => (
            <EnrollmentRow
              key={e.id}
              e={e}
              busy={busy}
              onDelete={() => wrap(() => api.admin.deleteEnrollment(e.id, token), "Entfernt")}
            />
          ))}
        </div>
      </div>

      {/* Reserved */}
      <div className="mt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
          <Lock className="h-4 w-4" /> Stammplätze
        </h3>
        <div className="flex flex-wrap gap-2">
          {klass.reserved.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2 py-1"
            >
              <span className="font-mono text-xs tracking-wider text-primary">
                {r.leader_nick}–{r.follower_nick}
              </span>
              {r.note && <span className="text-xs text-muted-foreground">{r.note}</span>}
              <button
                onClick={() => wrap(() => api.admin.deleteReserved(r.id, token), "Entfernt")}
                disabled={busy}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Entfernen"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[80px_80px_1fr_auto]">
          <Input
            placeholder="LL"
            maxLength={2}
            value={reservedDraft.l}
            onChange={(e) => setReservedDraft({ ...reservedDraft, l: e.target.value.toUpperCase() })}
            className="text-center font-mono"
          />
          <Input
            placeholder="FF"
            maxLength={2}
            value={reservedDraft.f}
            onChange={(e) => setReservedDraft({ ...reservedDraft, f: e.target.value.toUpperCase() })}
            className="text-center font-mono"
          />
          <Input
            placeholder="Notiz (optional)"
            value={reservedDraft.note}
            onChange={(e) => setReservedDraft({ ...reservedDraft, note: e.target.value })}
          />
          <Button
            disabled={busy || reservedDraft.l.length !== 2 || reservedDraft.f.length !== 2}
            onClick={() =>
              wrap(async () => {
                await api.admin.addReserved(
                  {
                    class_id: klass.id,
                    leader_nick: reservedDraft.l,
                    follower_nick: reservedDraft.f,
                    note: reservedDraft.note || undefined,
                  },
                  token,
                );
                setReservedDraft({ l: "", f: "", note: "" });
              }, "Reserviert")
            }
          >
            <Plus className="h-3 w-3" /> Stamm
          </Button>
        </div>
      </div>
    </Card>
  );
}

function EnrollmentRow({
  e,
  busy,
  onDelete,
}: {
  e: Enrollment;
  busy: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background/30 p-2">
      {e.photo ? (
        <img src={e.photo} alt={e.name} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${
            e.gender === "L" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent-foreground"
          }`}
        >
          {e.gender === "L" ? "🕺" : "💃"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          #{e.id} {e.name}
          {e.age ? `, ${e.age}` : ""}
        </div>
        {e.comment && (
          <div className="truncate text-xs italic text-muted-foreground">{e.comment}</div>
        )}
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {e.source}
        </div>
      </div>
      <Button size="sm" variant="outline" disabled={busy} onClick={onDelete}>
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
