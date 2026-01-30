import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getUserEnrollment, getUserLessonProgress } from "@/lib/queries/courses";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Circle, Video, FileText, File, Lock } from "lucide-react";
import { EnrollButton } from "@/components/courses/enroll-button";

const contentTypeIcons: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  pdf: File,
};

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  return { title: course?.title ?? "Curso" };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; courseSlug: string }>;
}) {
  const { categorySlug, courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let enrollment = null;
  let lessonProgress: { lesson_id: string; completed: boolean }[] = [];

  if (user) {
    enrollment = await getUserEnrollment(user.id, course.id);
    if (enrollment) {
      lessonProgress = await getUserLessonProgress(user.id, course.id);
    }
  }

  const completedCount = lessonProgress.filter((p) => p.completed).length;
  const totalLessons = course.lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/cursos/${categorySlug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />Volver
          </Link>
        </Button>
      </div>

      {/* Course header */}
      <div className="space-y-4">
        <Badge variant="secondary">{course.category?.name}</Badge>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
          {course.title}
        </h1>
        {course.description && (
          <p className="text-lg text-muted-foreground">{course.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalLessons} lecciones</span>
          {enrollment?.completed_at && <Badge className="bg-green-100 text-green-700">Completado</Badge>}
        </div>
      </div>

      {/* Enrollment + Progress */}
      <div className="mt-8">
        {!user ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Inicia sesión para inscribirte</p>
                <p className="text-sm text-muted-foreground">Registra tu progreso y obtén un certificado</p>
              </div>
              <Button asChild><Link href="/login">Iniciar sesión</Link></Button>
            </CardContent>
          </Card>
        ) : !enrollment ? (
          <EnrollButton courseId={course.id} />
        ) : (
          <Card>
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tu progreso</p>
                <p className="text-sm text-muted-foreground">{completedCount}/{totalLessons} lecciones</p>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lessons list */}
      <div className="mt-8 space-y-2">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-4">Lecciones</h2>
        {course.lessons.map((lesson, index) => {
          const Icon = contentTypeIcons[lesson.content_type] ?? FileText;
          const isCompleted = lessonProgress.some((p) => p.lesson_id === lesson.id && p.completed);
          const canAccess = !!enrollment;

          const content = (
            <Card className={`transition-all ${canAccess ? "hover:shadow-md hover:border-primary/30 cursor-pointer" : "opacity-70"}`}>
              <CardContent className="flex items-center gap-4 py-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                  isCompleted ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.content_type}{lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ""}
                  </p>
                </div>
                {!canAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
              </CardContent>
            </Card>
          );

          if (canAccess) {
            return (
              <Link key={lesson.id} href={`/cursos/${categorySlug}/${courseSlug}/${lesson.slug}`}>
                {content}
              </Link>
            );
          }
          return <div key={lesson.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
