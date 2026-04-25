import { useState, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { api, type SalsaClass, type Gender } from "@/lib/api";
import { Camera, X } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Name zu kurz").max(80),
  gender: z.enum(["L", "F"]),
  age: z
    .number({ invalid_type_error: "Alter fehlt" })
    .int()
    .min(10, "min 10")
    .max(99, "max 99")
    .optional(),
  email: z.string().trim().email("Ungültige E-Mail").max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  comment: z.string().trim().max(400, "max 400 Zeichen").optional().or(z.literal("")),
});

const MAX_PHOTO_BYTES = 800_000; // matches bot default

async function fileToDataURL(file: File, maxSize = 600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.78);
}

export function EnrollDialog({
  klass,
  onEnrolled,
}: {
  klass: SalsaClass;
  onEnrolled?: (k: SalsaClass) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gender, setGender] = useState<Gender>("L");
  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    comment: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const closed = klass.status === "closed";

  const onPhoto = async (file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataURL(file);
      if (dataUrl.length > MAX_PHOTO_BYTES) {
        toast.error("Foto zu groß — bitte kleineres wählen");
        return;
      }
      setPhoto(dataUrl);
    } catch {
      toast.error("Foto konnte nicht geladen werden");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      name: form.name,
      gender,
      age: form.age ? Number(form.age) : undefined,
      email: form.email,
      phone: form.phone,
      comment: form.comment,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const res = await api.enroll({
        class_id: klass.id,
        name: parsed.data.name,
        gender: parsed.data.gender,
        age: parsed.data.age,
        email: parsed.data.email || undefined,
        phone: parsed.data.phone || undefined,
        comment: parsed.data.comment || undefined,
        photo: photo || undefined,
      });
      toast.success(
        gender === "L"
          ? "¡Bienvenido, caballero! Du bist eingetragen."
          : "¡Bienvenida, dama! Du bist eingetragen.",
      );
      onEnrolled?.(res.class);
      setOpen(false);
      setForm({ name: "", age: "", email: "", phone: "", comment: "" });
      setPhoto(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={closed} className="bg-gradient-fire shadow-glow hover:opacity-90">
          {closed ? "Ausgebucht" : "Jetzt anmelden"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Anmeldung · {klass.title}</DialogTitle>
          <DialogDescription>
            {klass.schedule} · mit {klass.instructor}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {/* Role picker */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Ich tanze als
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender("L")}
                className={`rounded-md border p-3 text-sm transition ${
                  gender === "L"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                🕺 Leader (M)
              </button>
              <button
                type="button"
                onClick={() => setGender("F")}
                className={`rounded-md border p-3 text-sm transition ${
                  gender === "F"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                💃 Follower (F)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={80}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="age">Alter</Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                min={10}
                max={99}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail (optional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="comment">Kommentar / Wunschpartner (optional)</Label>
            <Textarea
              id="comment"
              rows={3}
              maxLength={400}
              placeholder="z.B. Anfänger, suche Partner mit ähnlichem Level"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Foto (optional)
            </Label>
            {photo ? (
              <div className="relative inline-block">
                <img
                  src={photo}
                  alt="Vorschau"
                  className="h-24 w-24 rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                  aria-label="Foto entfernen"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Camera className="h-6 w-6" />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              hidden
              onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={busy} className="bg-gradient-fire w-full">
              {busy ? "Sende..." : "Platz reservieren"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
