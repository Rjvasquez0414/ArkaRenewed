import { createClient } from "@/lib/supabase/server";
import type { CourseCategory, Course, Lesson } from "@/lib/types";

export async function getCourseCategories(): Promise<CourseCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getCourseCategoryBySlug(slug: string): Promise<CourseCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getCoursesByCategory(categoryId: string): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, course_categories(*)")
    .eq("category_id", categoryId)
    .eq("is_published", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map((c) => ({ ...c, category: c.course_categories }));
}

export async function getCourseBySlug(slug: string): Promise<(Course & { lessons: Lesson[] }) | null> {
  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*, course_categories(*)")
    .eq("slug", slug)
    .single();

  if (error || !course) return null;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order");

  return {
    ...course,
    category: course.course_categories,
    lessons: lessons ?? [],
  };
}

export async function getLessonBySlug(
  courseId: string,
  lessonSlug: string
): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("slug", lessonSlug)
    .single();

  if (error) return null;
  return data;
}

export async function getUserEnrollment(userId: string, courseId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_course_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  return data;
}

export async function getUserLessonProgress(userId: string, courseId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("*, lessons!inner(course_id)")
    .eq("user_id", userId)
    .eq("lessons.course_id", courseId);

  return data ?? [];
}

export async function getUserEnrollments(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_course_enrollments")
    .select("*, courses(*, course_categories(*))")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  return (data ?? []).map((e) => ({
    ...e,
    course: e.courses ? { ...e.courses, category: e.courses.course_categories } : undefined,
  }));
}

// Admin queries (include unpublished)
export async function getAllCoursesAdmin(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, course_categories(*), lessons(id)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((c) => ({
    ...c,
    category: c.course_categories,
    lesson_count: c.lessons?.length ?? 0,
  }));
}

export async function getCourseByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*, course_categories(*)")
    .eq("id", id)
    .single();

  if (error || !course) return null;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("sort_order");

  return {
    ...course,
    category: course.course_categories,
    lessons: lessons ?? [],
  };
}
