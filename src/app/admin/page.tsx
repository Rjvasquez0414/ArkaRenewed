import { getAdminStats } from "@/lib/queries/profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Video, Users, Award } from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const items = [
    { title: "Usuarios", value: stats.totalUsers, icon: Users, description: "Usuarios registrados" },
    { title: "Cursos", value: stats.totalCourses, icon: BookOpen, description: "Cursos creados" },
    { title: "Prédicas", value: stats.totalSermons, icon: Video, description: "Prédicas subidas" },
    { title: "Completados", value: stats.completedCourses, icon: Award, description: "Cursos completados" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
