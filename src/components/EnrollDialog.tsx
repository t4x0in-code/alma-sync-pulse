import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { api, type SalsaClass } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Name zu kurz").max(80),
  email: z.string().trim().email("Ungültige E-Mail").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

export function EnrollDialog({
  klass,
  onEnrolled,
}: {
  klass: SalsaClass;
  onEnrolled?: (k: SalsaClass) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const closed = klass.status === "closed";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const res = await api.enroll({
        class_id: klass.id,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
      });
      toast.success("¡Bienvenida! Du bist eingetragen.");
      onEnrolled?.(res.class);
      setOpen(false);
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Anmeldung fehlgeschlagen",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={closed}
          className="bg-gradient-fire shadow-glow hover:opacity-90"
        >
          {closed ? "Ausgebucht" : "Jetzt anmelden"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Anmeldung · {klass.title}
          </DialogTitle>
          <DialogDescription>
            {klass.schedule} · mit {klass.instructor}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (optional)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              maxLength={40}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={busy}
              className="bg-gradient-fire w-full"
            >
              {busy ? "Sende..." : "Platz reservieren"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
