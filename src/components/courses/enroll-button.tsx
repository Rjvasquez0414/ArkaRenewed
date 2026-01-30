"use client";

import { useState } from "react";
import { enrollInCourse } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnroll() {
    setLoading(true);
    const result = await enrollInCourse(courseId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Te has inscrito exitosamente");
      router.refresh();
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="font-medium">Inscríbete en este curso</p>
          <p className="text-sm text-muted-foreground">Registra tu progreso y obtén un certificado al completar</p>
        </div>
        <Button onClick={handleEnroll} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
          Inscribirme
        </Button>
      </CardContent>
    </Card>
  );
}
