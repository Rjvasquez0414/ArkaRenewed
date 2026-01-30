"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==================== SERMON CATEGORY ACTIONS ====================

export async function createSermonCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("sermon_categories").insert({
    name,
    slug: slugify(name),
    description: description || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/predicas");
  return { success: true };
}

export async function updateSermonCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("sermon_categories")
    .update({ name, slug: slugify(name), description: description || null })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/predicas");
  return { success: true };
}

export async function deleteSermonCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sermon_categories").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/predicas");
  return { success: true };
}

// ==================== SERMON ACTIONS ====================

export async function createSermon(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const videoUrl = formData.get("video_url") as string;
  const speaker = formData.get("speaker") as string;
  const sermonDate = formData.get("sermon_date") as string;
  const categoryId = formData.get("category_id") as string;

  const { error } = await supabase.from("sermons").insert({
    title,
    slug: slugify(title),
    description: description || null,
    video_url: videoUrl || null,
    speaker: speaker || null,
    sermon_date: sermonDate || new Date().toISOString().split("T")[0],
    category_id: categoryId,
    created_by: user?.id,
    is_published: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/predicas");
  revalidatePath("/predicas");
  return { success: true };
}

export async function updateSermon(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const videoUrl = formData.get("video_url") as string;
  const speaker = formData.get("speaker") as string;
  const sermonDate = formData.get("sermon_date") as string;
  const categoryId = formData.get("category_id") as string;
  const isPublished = formData.get("is_published") === "true";

  const { error } = await supabase
    .from("sermons")
    .update({
      title,
      slug: slugify(title),
      description: description || null,
      video_url: videoUrl || null,
      speaker: speaker || null,
      sermon_date: sermonDate,
      category_id: categoryId,
      is_published: isPublished,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/predicas");
  revalidatePath("/predicas");
  return { success: true };
}

export async function deleteSermon(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sermons").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/predicas");
  revalidatePath("/predicas");
  return { success: true };
}
