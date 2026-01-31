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

// ==================== CATEGORY ACTIONS ====================

export async function createCourseCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("course_categories").insert({
    name,
    slug: slugify(name),
    description: description || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/cursos");
  return { success: true };
}

export async function updateCourseCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("course_categories")
    .update({ name, slug: slugify(name), description: description || null })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/cursos");
  return { success: true };
}

export async function deleteCourseCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("course_categories").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/cursos");
  return { success: true };
}

// ==================== COURSE ACTIONS ====================

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("category_id") as string;

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug: slugify(title),
      description: description || null,
      category_id: categoryId,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/cursos");
  return { success: true, courseId: data.id };
}

export async function updateCourse(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("category_id") as string;
  const isPublished = formData.get("is_published") === "true";

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      slug: slugify(title),
      description: description || null,
      category_id: categoryId,
      is_published: isPublished,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  return { success: true };
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  return { success: true };
}

export async function toggleCoursePublish(id: string, isPublished: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  return { success: true };
}

// ==================== LESSON ACTIONS ====================

export async function createLesson(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const contentType = formData.get("content_type") as string;
  const videoUrl = formData.get("video_url") as string;
  const textContent = formData.get("text_content") as string;
  const pdfUrl = formData.get("pdf_url") as string;
  const duration = formData.get("duration_minutes") as string;

  // Get next sort order
  const { data: existing } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing?.[0] ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    slug: slugify(title),
    sort_order: nextOrder,
    content_type: contentType || "text",
    video_url: videoUrl || null,
    text_content: textContent || null,
    pdf_url: pdfUrl || null,
    duration_minutes: duration ? parseInt(duration) : null,
    is_published: true,
  });

  if (error) return { error: error.message };
  revalidatePath(`/admin/cursos/${courseId}`);
  return { success: true };
}

export async function updateLesson(lessonId: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const contentType = formData.get("content_type") as string;
  const videoUrl = formData.get("video_url") as string;
  const textContent = formData.get("text_content") as string;
  const pdfUrl = formData.get("pdf_url") as string;
  const duration = formData.get("duration_minutes") as string;

  const { error } = await supabase
    .from("lessons")
    .update({
      title,
      slug: slugify(title),
      content_type: contentType || "text",
      video_url: videoUrl || null,
      text_content: textContent || null,
      pdf_url: pdfUrl || null,
      duration_minutes: duration ? parseInt(duration) : null,
    })
    .eq("id", lessonId);

  if (error) return { error: error.message };
  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) return { error: error.message };
  revalidatePath("/admin/cursos");
  return { success: true };
}

// ==================== ENROLLMENT & PROGRESS ====================

export async function enrollInCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("user_course_enrollments").insert({
    user_id: user.id,
    course_id: courseId,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya estás inscrito en este curso" };
    return { error: error.message };
  }

  revalidatePath("/perfil/progreso");
  return { success: true };
}

export async function markLessonComplete(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("user_lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) return { error: error.message };

  // Check if course is fully completed
  const { data: lesson } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("id", lessonId)
    .single();

  if (lesson) {
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", lesson.course_id)
      .eq("is_published", true);

    const { data: completedLessons } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
      .in("lesson_id", allLessons?.map((l) => l.id) ?? []);

    if (allLessons && completedLessons && completedLessons.length >= allLessons.length) {
      await supabase
        .from("user_course_enrollments")
        .update({ completed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id);
    }
  }

  revalidatePath("/perfil/progreso");
  return { success: true };
}

export async function unenrollFromCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Delete progress for lessons in this course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  if (lessons && lessons.length > 0) {
    await supabase
      .from("user_lesson_progress")
      .delete()
      .eq("user_id", user.id)
      .in("lesson_id", lessons.map((l) => l.id));
  }

  // Delete enrollment
  const { error } = await supabase
    .from("user_course_enrollments")
    .delete()
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  if (error) return { error: error.message };

  revalidatePath("/perfil/progreso");
  revalidatePath("/cursos");
  return { success: true };
}
