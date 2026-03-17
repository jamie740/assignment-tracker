import { AssignmentStatus } from "./types";

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

export function isOverdue(dateStr: string, status: AssignmentStatus): boolean {
  if (status === "submitted") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return due < today;
}

export function isDueTomorrow(dateStr: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  due.setHours(0, 0, 0, 0);
  return due.getTime() === tomorrow.getTime();
}

export function isDueThisWeek(dateStr: string, status: AssignmentStatus): boolean {
  if (status === "submitted") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekOut = new Date();
  weekOut.setDate(weekOut.getDate() + 7);
  weekOut.setHours(23, 59, 59, 999);
  const due = new Date(dateStr + "T00:00:00");
  return due >= today && due <= weekOut;
}

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  submitted: "Submitted",
};

export const STATUS_STYLES: Record<AssignmentStatus, string> = {
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-700",
  submitted: "bg-green-100 text-green-700",
};

export const DAY_LABELS: Record<string, string> = {
  day1: "Day 1",
  day2: "Day 2",
  both: "Both Days",
  irregular: "Irregular",
};
