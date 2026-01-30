import Link from "next/link";
import { getSermons, getSermonCategories } from "@/lib/queries/sermons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, User, Search } from "lucide-react";
import { SermonFilters } from "@/components/sermons/sermon-filters";

export const metadata = {
  title: "Prédicas y Devocionales",
  description: "Escucha prédicas inspiradoras y devocionales diarios",
};

export default async function PredicasPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const categories = await getSermonCategories();
  const page = parseInt(sp.page ?? "1");
  const limit = 12;

  const { sermons, count } = await getSermons({
    categorySlug: sp.category,
    search: sp.search,
    limit,
    offset: (page - 1) * limit,
  });

  const totalPages = Math.ceil(count / limit);

  function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match?.[1] ?? null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Video className="mx-auto mb-4 h-12 w-12 text-primary/50" />
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
          Prédicas y Devocionales
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Encuentra prédicas dominicales y devocionales para tu edificación
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8">
        <SermonFilters
          categories={categories}
          currentCategory={sp.category}
          currentSearch={sp.search}
        />
      </div>

      {/* Results */}
      {sermons.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p>No se encontraron prédicas{sp.search ? ` para "${sp.search}"` : ""}.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => {
              const ytId = sermon.video_url ? extractYouTubeId(sermon.video_url) : null;

              return (
                <Link key={sermon.id} href={`/predicas/${sermon.slug}`}>
                  <Card className="group h-full border-border/50 shadow-sm transition-all hover:shadow-lg hover:border-primary/30 overflow-hidden">
                    {/* Thumbnail */}
                    {ytId && (
                      <div className="aspect-video bg-muted">
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                          alt={sermon.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2">{sermon.category?.name}</Badge>
                      <h3 className="font-semibold line-clamp-2">{sermon.title}</h3>
                      {sermon.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{sermon.description}</p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        {sermon.speaker && (
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{sermon.speaker}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sermon.sermon_date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/predicas?${new URLSearchParams({
                    ...(sp.category ? { category: sp.category } : {}),
                    ...(sp.search ? { search: sp.search } : {}),
                    page: String(p),
                  })}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
