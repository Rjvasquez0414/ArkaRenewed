import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseCategoryBySlug, getCoursesByCategory } from "@/lib/queries/courses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const category = await getCourseCategoryBySlug(categorySlug);
  return { title: category?.name ?? "Categoría" };
}

export default async function CategoryCoursesPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const category = await getCourseCategoryBySlug(categorySlug);
  if (!category) notFound();

  const courses = await getCoursesByCategory(category.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cursos"><ArrowLeft className="mr-2 h-4 w-4" />Todas las categorías</Link>
        </Button>
      </div>

      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p>No hay cursos disponibles en esta categoría aún.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/cursos/${categorySlug}/${course.slug}`}>
              <Card className="group h-full border-border/50 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">{category.name}</Badge>
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  {course.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{course.lessons?.length ?? 0} lecciones
                    </span>
                    <span className="flex items-center text-sm font-medium text-primary">
                      Ver curso <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
