"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateCourse, createLesson, updateLesson, deleteLesson, toggleCoursePublish } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Video, FileText, File } from "lucide-react";
import { toast } from "sonner";

interface LessonRow {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  content_type: string;
  video_url: string | null;
  text_content: string | null;
  pdf_url: string | null;
  duration_minutes: number | null;
  is_published: boolean;
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  is_published: boolean;
  lessons: LessonRow[];
}

function LessonForm({
  lesson,
  courseId,
  onClose,
  onRefresh,
}: {
  lesson?: LessonRow;
  courseId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState(lesson?.content_type ?? "video");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("content_type", contentType);
    const result = lesson
      ? await updateLesson(lesson.id, formData)
      : await createLesson(courseId, formData);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(lesson ? "Lección actualizada" : "Lección creada");
      onRefresh();
      onClose();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Título de la lección</Label>
        <Input name="title" defaultValue={lesson?.title} placeholder="Ej: Introducción al curso" required />
      </div>
      <div className="space-y-2">
        <Label>Tipo de contenido</Label>
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {contentType === "video" && (
        <div className="space-y-2">
          <Label>URL del video (YouTube)</Label>
          <Input name="video_url" defaultValue={lesson?.video_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
      )}
      {contentType === "text" && (
        <div className="space-y-2">
          <Label>Contenido</Label>
          <Textarea name="text_content" defaultValue={lesson?.text_content ?? ""} rows={8} placeholder="Escribe el contenido de la lección..." />
        </div>
      )}
      {contentType === "pdf" && (
        <div className="space-y-2">
          <Label>URL del PDF</Label>
          <Input name="pdf_url" defaultValue={lesson?.pdf_url ?? ""} placeholder="URL del archivo PDF" />
        </div>
      )}
      <div className="space-y-2">
        <Label>Duración (minutos)</Label>
        <Input name="duration_minutes" type="number" defaultValue={lesson?.duration_minutes ?? ""} placeholder="15" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {lesson ? "Actualizar" : "Crear lección"}
        </Button>
      </div>
    </form>
  );
}

const contentTypeIcons: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  pdf: File,
};

export default function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonRow | undefined>();
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const supabase = createClient();
    const [courseRes, catsRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", id).single(),
      supabase.from("course_categories").select("id, name").order("sort_order"),
    ]);
    const { data: lessons } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", id)
      .order("sort_order");

    if (courseRes.data) {
      setCourse({ ...courseRes.data, lessons: lessons ?? [] });
    }
    setCategories(catsRes.data ?? []);
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleUpdateCourse(formData: FormData) {
    setSaving(true);
    const result = await updateCourse(id, formData);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else toast.success("Curso actualizado");
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("¿Eliminar esta lección?")) return;
    const result = await deleteLesson(lessonId);
    if (result.error) toast.error(result.error);
    else { toast.success("Lección eliminada"); loadData(); }
  }

  async function handleTogglePublish() {
    if (!course) return;
    const result = await toggleCoursePublish(id, !course.is_published);
    if (result.error) toast.error(result.error);
    else { toast.success(course.is_published ? "Curso despublicado" : "Curso publicado"); loadData(); }
  }

  if (!course) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cursos"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Editar Curso</h2>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <Button variant={course.is_published ? "outline" : "default"} onClick={handleTogglePublish}>
          {course.is_published ? <><EyeOff className="mr-2 h-4 w-4" />Despublicar</> : <><Eye className="mr-2 h-4 w-4" />Publicar</>}
        </Button>
      </div>

      {/* Course info form */}
      <Card>
        <CardHeader><CardTitle>Información general</CardTitle></CardHeader>
        <CardContent>
          <form action={handleUpdateCourse} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" defaultValue={course.title} required />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select name="category_id" defaultValue={course.category_id}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea name="description" defaultValue={course.description ?? ""} rows={4} />
            </div>
            <input type="hidden" name="is_published" value={String(course.is_published)} />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">
            Lecciones ({course.lessons.length})
          </h3>
          <Dialog open={showLessonForm} onOpenChange={(open) => { setShowLessonForm(open); if (!open) setEditingLesson(undefined); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Agregar lección</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingLesson ? "Editar lección" : "Nueva lección"}</DialogTitle>
              </DialogHeader>
              <LessonForm
                lesson={editingLesson}
                courseId={id}
                onClose={() => { setShowLessonForm(false); setEditingLesson(undefined); }}
                onRefresh={loadData}
              />
            </DialogContent>
          </Dialog>
        </div>

        {course.lessons.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay lecciones. Agrega la primera lección para este curso.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {course.lessons.map((lesson, index) => {
              const Icon = contentTypeIcons[lesson.content_type] ?? FileText;
              return (
                <Card key={lesson.id}>
                  <CardContent className="flex items-center gap-4 py-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.content_type}{lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditingLesson(lesson); setShowLessonForm(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
