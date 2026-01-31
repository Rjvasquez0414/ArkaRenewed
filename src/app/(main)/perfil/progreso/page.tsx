import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserEnrollments } from "@/lib/queries/courses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { UnenrollButton } from "@/components/courses/unenroll-button";

export const metadata = { title: "Mis Cursos" };

export default async function ProgresoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enrollments = await getUserEnrollments(user.id);

  // Get lesson counts and progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      if (!enrollment.course) return { ...enrollment, progress: 0, totalLessons: 0, completedLessons: 0 };

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", enrollment.course_id)
        .eq("is_published", true);

      const { data: completed } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("lesson_id", lessons?.map((l) => l.id) ?? []);

      const totalLessons = lessons?.length ?? 0;
      const completedLessons = completed?.length ?? 0;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return { ...enrollment, progress, totalLessons, completedLessons };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Mis Cursos</h1>

      {enrollmentsWithProgress.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No estás inscrito en ningún curso aún.</p>
            <Link href="/cursos" className="mt-4 text-primary hover:underline font-medium">
              Explorar cursos
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollmentsWithProgress.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{enrollment.course?.title}</h3>
                      {enrollment.completed_at ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" />Completado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">En progreso</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.course?.category?.name} · {enrollment.completedLessons}/{enrollment.totalLessons} lecciones
                    </p>
                    <div className="pt-2">
                      <Progress value={enrollment.progress} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground text-right">{enrollment.progress}%</p>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    {enrollment.course?.category && (
                      <Link
                        href={`/cursos/${enrollment.course.category.slug}/${enrollment.course.slug}`}
                        className="text-primary hover:text-primary/80"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    )}
                    {!enrollment.completed_at && (
                      <UnenrollButton
                        courseId={enrollment.course_id}
                        courseTitle={enrollment.course?.title ?? ""}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
