"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSermon, deleteSermon } from "@/lib/actions/sermons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Video, Loader2, Calendar, User } from "lucide-react";
import { toast } from "sonner";

interface SermonRow {
  id: string;
  title: string;
  speaker: string | null;
  sermon_date: string;
  is_published: boolean;
  video_url: string | null;
  category: { name: string } | null;
}

export default function AdminPredicasPage() {
  const [sermons, setSermons] = useState<SermonRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const supabase = createClient();
    const [sermonsRes, catsRes] = await Promise.all([
      supabase.from("sermons").select("*, sermon_categories(*)").order("created_at", { ascending: false }),
      supabase.from("sermon_categories").select("id, name").order("sort_order"),
    ]);
    setSermons(
      (sermonsRes.data ?? []).map((s) => ({ ...s, category: s.sermon_categories }))
    );
    setCategories(catsRes.data ?? []);
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    const result = await createSermon(formData);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Prédica creada");
      setShowForm(false);
      loadData();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta prédica?")) return;
    const result = await deleteSermon(id);
    if (result.error) toast.error(result.error);
    else { toast.success("Prédica eliminada"); loadData(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Prédicas</h2>
          <p className="text-muted-foreground">Gestiona prédicas y devocionales</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nueva prédica</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nueva prédica</DialogTitle></DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" placeholder="Ej: El poder de la oración" required />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Predicador</Label>
                  <Input name="speaker" placeholder="Ej: Pastor Juan" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input name="sermon_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select name="category_id" required>
                  <SelectTrigger><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL del video (YouTube)</Label>
                <Input name="video_url" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea name="description" placeholder="Breve descripción..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear prédica
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sermons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hay prédicas aún</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sermons.map((sermon) => (
            <Card key={sermon.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{sermon.title}</h3>
                    <Badge variant="secondary">{sermon.category?.name}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {sermon.speaker && <span className="flex items-center gap-1"><User className="h-3 w-3" />{sermon.speaker}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(sermon.sermon_date).toLocaleDateString("es")}</span>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(sermon.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
