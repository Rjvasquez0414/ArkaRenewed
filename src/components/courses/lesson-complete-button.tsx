"use client";

import { useState } from "react";
import { markLessonComplete } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LessonCompleteButton({
  lessonId,
  isCompleted,
}: {
  lessonId: string;
  isCompleted: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (isCompleted) {
    return (
      <Button variant="outline" className="text-green-700 border-green-200 bg-green-50" disabled>
        <CheckCircle className="mr-2 h-4 w-4" />
        Lección completada
      </Button>
    );
  }

  async function handleComplete() {
    setLoading(true);
    const result = await markLessonComplete(lessonId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lección marcada como completada");
      router.refresh();
    }
  }

  return (
    <Button onClick={handleComplete} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Marcar como completada
    </Button>
  );
}
