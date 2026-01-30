import { createClient } from "@/lib/supabase/server";
import type { SermonCategory, Sermon } from "@/lib/types";

export async function getSermonCategories(): Promise<SermonCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sermon_categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getSermons(options?: {
  categorySlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ sermons: Sermon[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("sermons")
    .select("*, sermon_categories(*)", { count: "exact" })
    .eq("is_published", true)
    .order("sermon_date", { ascending: false });

  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from("sermon_categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,speaker.ilike.%${options.search}%,description.ilike.%${options.search}%`
    );
  }

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 12) - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    sermons: (data ?? []).map((s) => ({ ...s, category: s.sermon_categories })),
    count: count ?? 0,
  };
}

export async function getSermonBySlug(slug: string): Promise<Sermon | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sermons")
    .select("*, sermon_categories(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return { ...data, category: data.sermon_categories };
}

export async function getAllSermonsAdmin(): Promise<Sermon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sermons")
    .select("*, sermon_categories(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((s) => ({ ...s, category: s.sermon_categories }));
}
