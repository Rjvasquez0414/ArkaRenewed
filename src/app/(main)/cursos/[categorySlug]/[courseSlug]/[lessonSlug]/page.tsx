import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, getLessonBySlug, getUserEnrollment, getUserLessonProgress } from "@/lib/queries/courses";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Video, FileText, File } from "lucide-react";
import { LessonCompleteButton } from "@/components/courses/lesson-complete-button";

export async function generateMetadata({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  // Simple metadata - lesson title would require course lookup
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

  // Find prev/next lessons
  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  const youtubeId = lesson.video_url ? extractYouTubeId(lesson.video_url) : null;

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
        </div>
      </div>

      <Separator className="my-6" />

      {/* Content */}
      <div className="space-y-8">
        {/* Video */}
        {lesson.content_type === "video" && youtubeId && (
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Text content */}
        {lesson.content_type === "text" && lesson.text_content && (
          <Card>
            <CardContent className="prose prose-lg max-w-none py-6">
              <div className="whitespace-pre-wrap">{lesson.text_content}</div>
            </CardContent>
          </Card>
        )}

        {/* PDF */}
        {lesson.content_type === "pdf" && lesson.pdf_url && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <File className="h-16 w-16 text-primary/50" />
              <p className="text-muted-foreground">Material de estudio en PDF</p>
              <Button asChild>
                <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                  Descargar PDF
                </a>
              </Button>
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
