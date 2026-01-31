"use client";

import { useState } from "react";
import { unenrollFromCourse } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function UnenrollButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUnenroll() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    const result = await unenrollFromCourse(courseId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Te has retirado de "${courseTitle}"`);
    }
    setLoading(false);
    setConfirming(false);
  }

  return (
    <div className="flex items-center gap-2">
      {confirming && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Cancelar
        </Button>
      )}
      <Button
        variant={confirming ? "destructive" : "ghost"}
        size="sm"
        onClick={handleUnenroll}
        disabled={loading}
      >
        <LogOut className="mr-1.5 h-3.5 w-3.5" />
        {confirming ? "Confirmar retiro" : "Retirarse"}
      </Button>
    </div>
  );
}
