import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mis Certificados" };

export default async function CertificadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: completedCourses } = await supabase
    .from("user_course_enrollments")
    .select("*, courses(title, course_categories(name))")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Mis Certificados</h1>

      {!completedCourses || completedCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aún no has completado ningún curso.</p>
            <p className="text-sm text-muted-foreground mt-1">Completa un curso para obtener tu certificado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {completedCourses.map((enrollment) => (
            <Card key={enrollment.id} className="border-gold/30 bg-gradient-to-br from-gold-light/10 to-transparent">
              <CardContent className="py-6 text-center space-y-4">
                <Award className="mx-auto h-12 w-12 text-gold" />
                <div>
                  <h3 className="font-semibold text-lg">{enrollment.courses?.title}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {enrollment.courses?.course_categories?.name}
                  </Badge>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Completado el{" "}
                  {new Date(enrollment.completed_at!).toLocaleDateString("es", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                {enrollment.certificate_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={enrollment.certificate_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />Descargar certificado
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
