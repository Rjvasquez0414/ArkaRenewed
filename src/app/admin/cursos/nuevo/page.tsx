"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createCourse } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NuevoCursoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("course_categories").select("id, name").order("sort_order");
      setCategories(data ?? []);
    }
    load();
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createCourse(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Curso creado exitosamente");
      router.push(`/admin/cursos/${result.courseId}/editar`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/cursos"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Nuevo Curso</h2>
          <p className="text-muted-foreground">Crea un nuevo curso bíblico</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Información del curso</CardTitle></CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del curso</Label>
              <Input id="title" name="title" placeholder="Ej: Fundamentos de la Fe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" placeholder="Describe de qué trata este curso..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría</Label>
              <Select name="category_id" required>
                <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild><Link href="/admin/cursos">Cancelar</Link></Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear curso
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
