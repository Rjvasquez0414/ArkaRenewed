"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(type: "sermon" | "course", id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const column = type === "sermon" ? "sermon_id" : "course_id";

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq(column, id)
    .single();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
  } else {
    await supabase.from("bookmarks").insert({
      user_id: user.id,
      [column]: id,
    });
  }

  revalidatePath("/perfil/favoritos");
  return { success: true, bookmarked: !existing };
}

export async function getUserBookmarks(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookmarks")
    .select("*, sermons(*, sermon_categories(*)), courses(*, course_categories(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((b) => ({
    ...b,
    sermon: b.sermons ? { ...b.sermons, category: b.sermons.sermon_categories } : undefined,
    course: b.courses ? { ...b.courses, category: b.courses.course_categories } : undefined,
  }));
}

export async function isBookmarked(userId: string, type: "sermon" | "course", id: string) {
  const supabase = await createClient();
  const column = type === "sermon" ? "sermon_id" : "course_id";

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq(column, id)
    .single();

  return !!data;
}
