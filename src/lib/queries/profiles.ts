import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [profiles, courses, sermons, enrollments] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("sermons").select("id", { count: "exact", head: true }),
    supabase
      .from("user_course_enrollments")
      .select("id", { count: "exact", head: true })
      .not("completed_at", "is", null),
  ]);

  return {
    totalUsers: profiles.count ?? 0,
    totalCourses: courses.count ?? 0,
    totalSermons: sermons.count ?? 0,
    completedCourses: enrollments.count ?? 0,
  };
}
