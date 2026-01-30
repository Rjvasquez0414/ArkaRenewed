import Link from "next/link";
import { notFound } from "next/navigation";
import { getSermonBySlug } from "@/lib/queries/sermons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User } from "lucide-react";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match?.[1] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);
  return { title: sermon?.title ?? "Prédica" };
}

export default async function SermonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);
  if (!sermon) notFound();

  const youtubeId = sermon.video_url ? extractYouTubeId(sermon.video_url) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/predicas"><ArrowLeft className="mr-2 h-4 w-4" />Volver a prédicas</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Badge variant="secondary">{sermon.category?.name}</Badge>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
          {sermon.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {sermon.speaker && (
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{sermon.speaker}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(sermon.sermon_date).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Video */}
      {youtubeId && (
        <div className="aspect-video overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Description */}
      {sermon.description && (
        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-4">Descripción</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{sermon.description}</p>
        </div>
      )}
    </div>
  );
}
