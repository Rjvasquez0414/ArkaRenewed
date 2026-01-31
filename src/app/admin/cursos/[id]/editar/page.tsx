"use client";

import { useState, useEffect, useRef, use } from "react";
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
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Video, FileText, File, Upload, X, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface Attachment {
  name: string;
  url: string;
  type: string;
}

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
  supplementary_video_url: string | null;
  attachments: Attachment[];
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

async function uploadFile(file: globalThis.File, path: string): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("lesson-files")
    .upload(path, file, { upsert: true });

  if (error) {
    toast.error(`Error subiendo ${file.name}: ${error.message}`);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("lesson-files")
    .getPublicUrl(path);

  return publicUrl;
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
  const [pdfFile, setPdfFile] = useState<globalThis.File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<globalThis.File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(lesson?.attachments ?? []);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  function removeExistingAttachment(index: number) {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewAttachment(index: number) {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("content_type", contentType);

    // Upload PDF file if selected
    if (contentType === "pdf" && pdfFile) {
      const timestamp = Date.now();
      const path = `${courseId}/${timestamp}-${pdfFile.name}`;
      const url = await uploadFile(pdfFile, path);
      if (url) {
        formData.set("pdf_url", url);
      } else {
        setLoading(false);
        return;
      }
    }

    // Upload new attachment files
    const allAttachments: Attachment[] = [...existingAttachments];
    for (const file of attachmentFiles) {
      const timestamp = Date.now();
      const path = `${courseId}/attachments/${timestamp}-${file.name}`;
      const url = await uploadFile(file, path);
      if (url) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "file";
        allAttachments.push({ name: file.name, url, type: ext });
      }
    }
    formData.set("attachments", JSON.stringify(allAttachments));

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
    <form action={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label>Título de la lección</Label>
        <Input name="title" defaultValue={lesson?.title} placeholder="Ej: Introducción al curso" required />
      </div>

      <div className="space-y-2">
        <Label>Tipo de contenido principal</Label>
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
          <Label>URL del video principal (YouTube)</Label>
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
        <div className="space-y-3">
          <Label>Archivo PDF</Label>
          {lesson?.pdf_url && !pdfFile && (
            <p className="text-xs text-muted-foreground">
              PDF actual: <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver PDF</a>
            </p>
          )}
          <div className="flex gap-2">
            <Input
              name="pdf_url"
              defaultValue={lesson?.pdf_url ?? ""}
              placeholder="URL del PDF o sube un archivo"
              className={pdfFile ? "hidden" : ""}
            />
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPdfFile(f);
              }}
            />
            {pdfFile ? (
              <div className="flex items-center gap-2 flex-1 rounded-md border px-3 py-2 text-sm">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="truncate flex-1">{pdfFile.name}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setPdfFile(null); if (pdfInputRef.current) pdfInputRef.current.value = ""; }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="icon" onClick={() => pdfInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Duración (minutos)</Label>
        <Input name="duration_minutes" type="number" defaultValue={lesson?.duration_minutes ?? ""} placeholder="15" />
      </div>

      <Separator />

      {/* Supplementary video */}
      <div className="space-y-2">
        <Label>Video complementario (opcional)</Label>
        <Input
          name="supplementary_video_url"
          defaultValue={lesson?.supplementary_video_url ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">Video adicional de apoyo para esta lección</p>
      </div>

      {/* Attachments */}
      <div className="space-y-2">
        <Label>Material adjunto (diapositivas, PDFs, documentos)</Label>

        {/* Existing attachments */}
        {existingAttachments.map((att, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            <a href={att.url} target="_blank" rel="noopener noreferrer" className="truncate flex-1 text-primary underline">{att.name}</a>
            <Badge variant="secondary" className="text-[10px]">{att.type}</Badge>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingAttachment(i)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {/* New files to upload */}
        {attachmentFiles.map((file, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm">
            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate flex-1">{file.name}</span>
            <Badge variant="outline" className="text-[10px]">nuevo</Badge>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewAttachment(i)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <input
          ref={attachInputRef}
          type="file"
          multiple
          accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setAttachmentFiles((prev) => [...prev, ...files]);
            if (attachInputRef.current) attachInputRef.current.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => attachInputRef.current?.click()}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Agregar archivo
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
      setCourse({
        ...courseRes.data,
        lessons: (lessons ?? []).map((l) => ({
          ...l,
          attachments: l.attachments ?? [],
        })),
      });
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
              const hasExtras = lesson.supplementary_video_url || (lesson.attachments && lesson.attachments.length > 0);
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
                        {hasExtras && " · "}
                        {lesson.supplementary_video_url && <span className="text-blue-600">+video</span>}
                        {lesson.attachments && lesson.attachments.length > 0 && (
                          <span className="text-green-600"> +{lesson.attachments.length} archivo{lesson.attachments.length > 1 ? "s" : ""}</span>
                        )}
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
