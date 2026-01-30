"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { deleteCourse, toggleCoursePublish } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  category: { name: string } | null;
  lesson_count: number;
}

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);

  async function loadCourses() {
    const supabase = createClient();
    const { data } = await supabase
      .from("courses")
      .select("*, course_categories(*), lessons(id)")
      .order("created_at", { ascending: false });

    setCourses(
      (data ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        is_published: c.is_published,
        created_at: c.created_at,
        category: c.course_categories,
        lesson_count: c.lessons?.length ?? 0,
      }))
    );
  }

  useEffect(() => { loadCourses(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este curso y todas sus lecciones?")) return;
    const result = await deleteCourse(id);
    if (result.error) toast.error(result.error);
    else { toast.success("Curso eliminado"); loadCourses(); }
  }

  async function handleTogglePublish(id: string, current: boolean) {
    const result = await toggleCoursePublish(id, !current);
    if (result.error) toast.error(result.error);
    else { toast.success(current ? "Curso despublicado" : "Curso publicado"); loadCourses(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Cursos</h2>
          <p className="text-muted-foreground">Gestiona los cursos bíblicos</p>
        </div>
        <Button asChild>
          <Link href="/admin/cursos/nuevo"><Plus className="mr-2 h-4 w-4" />Nuevo curso</Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hay cursos creados aún</p>
            <Button className="mt-4" asChild>
              <Link href="/admin/cursos/nuevo">Crear primer curso</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{course.title}</h3>
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                      {course.is_published ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.category?.name ?? "Sin categoría"} · {course.lesson_count} lecciones
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleTogglePublish(course.id, course.is_published)}
                    title={course.is_published ? "Despublicar" : "Publicar"}>
                    {course.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <Link href={`/admin/cursos/${course.id}/editar`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
