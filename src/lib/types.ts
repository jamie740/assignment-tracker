export type DayType = "day1" | "day2" | "both" | "irregular";

export type AssignmentStatus = "not_started" | "in_progress" | "submitted";

export interface Course {
  id: string;
  name: string;
  day_type: DayType;
  color: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  summary: string | null;
  due_date: string;
  status: AssignmentStatus;
  created_at: string;
  course?: Course;
}
