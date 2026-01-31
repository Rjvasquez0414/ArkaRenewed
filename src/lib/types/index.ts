export type UserRole = "superadmin" | "admin" | "user";
export type ContentType = "video" | "text" | "pdf" | "quiz";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Course {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: CourseCategory;
  lessons?: Lesson[];
  lesson_count?: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  sort_order: number;
  content_type: ContentType;
  video_url: string | null;
  text_content: string | null;
  pdf_url: string | null;
  duration_minutes: number | null;
  supplementary_video_url: string | null;
  attachments: LessonAttachment[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  sort_order: number;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  quiz_score: number | null;
  created_at: string;
}

export interface UserCourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  certificate_url: string | null;
  course?: Course;
}

export interface SermonCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Sermon {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  speaker: string | null;
  sermon_date: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: SermonCategory;
}

export interface Bookmark {
  id: string;
  user_id: string;
  sermon_id: string | null;
  course_id: string | null;
  created_at: string;
  sermon?: Sermon;
  course?: Course;
}
