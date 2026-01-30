import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserBookmarks } from "@/lib/actions/bookmarks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, BookOpen, Video, Calendar, User } from "lucide-react";

export const metadata = { title: "Mis Favoritos" };

export default async function FavoritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bookmarks = await getUserBookmarks(user.id);
  const courseBookmarks = bookmarks.filter((b) => b.course);
  const sermonBookmarks = bookmarks.filter((b) => b.sermon);

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Mis Favoritos</h1>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos ({bookmarks.length})</TabsTrigger>
          <TabsTrigger value="courses"><BookOpen className="mr-1 h-3 w-3" />Cursos ({courseBookmarks.length})</TabsTrigger>
          <TabsTrigger value="sermons"><Video className="mr-1 h-3 w-3" />Prédicas ({sermonBookmarks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {bookmarks.length === 0 ? (
            <EmptyState />
          ) : (
            bookmarks.map((b) => <BookmarkCard key={b.id} bookmark={b} />)
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-3 mt-4">
          {courseBookmarks.length === 0 ? <EmptyState /> : courseBookmarks.map((b) => <BookmarkCard key={b.id} bookmark={b} />)}
        </TabsContent>

        <TabsContent value="sermons" className="space-y-3 mt-4">
          {sermonBookmarks.length === 0 ? <EmptyState /> : sermonBookmarks.map((b) => <BookmarkCard key={b.id} bookmark={b} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12">
        <Heart className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No tienes favoritos aún.</p>
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BookmarkCard({ bookmark }: { bookmark: any }) {
  if (bookmark.course) {
    return (
      <Link href={`/cursos/${bookmark.course.category?.slug}/${bookmark.course.slug}`}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{bookmark.course.title}</h3>
              <p className="text-xs text-muted-foreground">{bookmark.course.category?.name} · Curso</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (bookmark.sermon) {
    return (
      <Link href={`/predicas/${bookmark.sermon.slug}`}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Video className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{bookmark.sermon.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{bookmark.sermon.category?.name}</span>
                {bookmark.sermon.speaker && <span>· {bookmark.sermon.speaker}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return null;
}
