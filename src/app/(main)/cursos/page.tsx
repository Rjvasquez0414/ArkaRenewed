import Link from "next/link";
import { getCourseCategories } from "@/lib/queries/courses";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Cursos Bíblicos",
  description: "Explora nuestros cursos bíblicos organizados por categorías",
};

export default async function CursosPage() {
  const categories = await getCourseCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-primary/50" />
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
          Cursos Bíblicos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Selecciona una categoría para comenzar tu aprendizaje
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">
          <p>Los cursos estarán disponibles próximamente.</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/cursos/${category.slug}`}>
              <Card className="group h-full border-border/50 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="flex flex-col justify-between p-6 h-full">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    {category.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary">
                    Ver cursos
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
