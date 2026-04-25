import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useClasses } from "@/hooks/useClasses";
import { api, type SalsaClass } from "@/lib/api";

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
    () => (typeof window !== "undefined" && localStorage.getItem("admin_token")) || "",
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
          <Label htmlFor="token" className="text-xs uppercase tracking-widest text-muted-foreground">
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

        <div className="grid gap-4">
          {classes.map((k) => (
            <AdminRow key={k.id} klass={k} token={token} onChange={reload} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function AdminRow({
  klass,
  token,
  onChange,
}: {
  klass: SalsaClass;
  token: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: klass.title,
    instructor: klass.instructor,
    schedule: klass.schedule,
    max_capacity: klass.max_capacity,
    current_enrollment: klass.current_enrollment,
    status: klass.status,
    external_url: klass.external_url,
  });

  const patch = async (data: Partial<SalsaClass>) => {
    if (!token) return toast.error("Admin Token fehlt");
    setBusy(true);
    try {
      await api.admin.update(klass.id, data, token);
      toast.success("Aktualisiert");
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Titel" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Field label="Trainer" value={form.instructor} onChange={(v) => setForm({ ...form, instructor: v })} />
        <Field label="Zeitplan" value={form.schedule} onChange={(v) => setForm({ ...form, schedule: v })} />
        <Field label="Externe URL" value={form.external_url} onChange={(v) => setForm({ ...form, external_url: v })} />
        <Field
          label="Max Plätze"
          type="number"
          value={String(form.max_capacity)}
          onChange={(v) => setForm({ ...form, max_capacity: Number(v) })}
        />
        <Field
          label="Aktuell angemeldet"
          type="number"
          value={String(form.current_enrollment)}
          onChange={(v) => setForm({ ...form, current_enrollment: Number(v) })}
        />
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as SalsaClass["status"] })}
            className="mt-2 w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
          >
            <option value="open">open</option>
            <option value="limited">limited</option>
            <option value="closed">closed</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => patch(form)} disabled={busy} className="bg-gradient-fire">
          Speichern
        </Button>
        <Button variant="outline" onClick={() => patch({ status: "closed" })} disabled={busy}>
          /block
        </Button>
        <Button
          variant="outline"
          onClick={() => patch({ max_capacity: klass.max_capacity + 1 })}
          disabled={busy}
        >
          /add_spot
        </Button>
        <Button variant="outline" onClick={() => patch({ status: "open" })} disabled={busy}>
          /open
        </Button>
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2"
      />
    </div>
  );
}
