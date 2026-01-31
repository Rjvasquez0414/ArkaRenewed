import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, getLessonBySlug, getUserEnrollment, getUserLessonProgress } from "@/lib/queries/courses";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Video, FileText, File, Download, Paperclip, ExternalLink } from "lucide-react";
import { LessonCompleteButton } from "@/components/courses/lesson-complete-button";

export async function generateMetadata({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  return { title: lessonSlug.replace(/-/g, " ") };
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match?.[1] ?? null;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ categorySlug: string; courseSlug: string; lessonSlug: string }>;
}) {
  const { categorySlug, courseSlug, lessonSlug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  const enrollment = await getUserEnrollment(user.id, course.id);
  if (!enrollment) redirect(`/cursos/${categorySlug}/${courseSlug}`);

  const lesson = await getLessonBySlug(course.id, lessonSlug);
  if (!lesson) notFound();

  const lessonProgress = await getUserLessonProgress(user.id, course.id);
  const isCompleted = lessonProgress.some((p) => p.lesson_id === lesson.id && p.completed);

  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  const youtubeId = lesson.video_url ? extractYouTubeId(lesson.video_url) : null;
  const supplementaryYoutubeId = lesson.supplementary_video_url ? extractYouTubeId(lesson.supplementary_video_url) : null;
  const attachments = lesson.attachments ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/cursos/${categorySlug}/${courseSlug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />Volver al curso
          </Link>
        </Button>
      </div>

      {/* Lesson header */}
      <div className="space-y-2">
        <Badge variant="secondary">{course.title}</Badge>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold sm:text-3xl">
          {lesson.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Lección {currentIndex + 1} de {course.lessons.length}</span>
          {lesson.duration_minutes && <span>· {lesson.duration_minutes} min</span>}
          {isCompleted && <Badge className="bg-green-100 text-green-700">Completada</Badge>}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Content */}
      <div className="space-y-8">
        {/* Main video */}
        {lesson.content_type === "video" && youtubeId && (
          <div>
            <h2 className="mb-3 font-semibold text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Video de la lección
            </h2>
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Text content */}
        {lesson.content_type === "text" && lesson.text_content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Contenido de la lección
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap">{lesson.text_content}</div>
            </CardContent>
          </Card>
        )}

        {/* Main PDF */}
        {lesson.content_type === "pdf" && lesson.pdf_url && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <File className="h-5 w-5 text-primary" />
                Material de estudio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Embedded PDF viewer */}
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                <iframe
                  src={lesson.pdf_url}
                  className="h-[600px] w-full"
                  title="PDF de la lección"
                />
              </div>
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supplementary video */}
        {supplementaryYoutubeId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5 text-blue-600" />
                Video complementario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${supplementaryYoutubeId}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paperclip className="h-5 w-5 text-green-600" />
                Material complementario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:bg-accent/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {att.type === "pdf" ? (
                        <File className="h-5 w-5 text-primary" />
                      ) : att.type === "pptx" || att.type === "ppt" ? (
                        <FileText className="h-5 w-5 text-orange-600" />
                      ) : (
                        <File className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{att.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{att.type}</p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete button */}
        <div className="flex justify-center">
          <LessonCompleteButton lessonId={lesson.id} isCompleted={isCompleted} />
        </div>

        <Separator />

        {/* Prev/Next navigation */}
        <div className="flex items-center justify-between">
          {prevLesson ? (
            <Button variant="outline" asChild>
              <Link href={`/cursos/${categorySlug}/${courseSlug}/${prevLesson.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />{prevLesson.title}
              </Link>
            </Button>
          ) : <div />}
          {nextLesson ? (
            <Button asChild>
              <Link href={`/cursos/${categorySlug}/${courseSlug}/${nextLesson.slug}`}>
                {nextLesson.title}<ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href={`/cursos/${categorySlug}/${courseSlug}`}>
                Volver al curso
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
