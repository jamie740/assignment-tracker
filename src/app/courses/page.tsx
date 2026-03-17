"use client";

import { useEffect, useState, useCallback } from "react";
import { Course, DayType } from "@/lib/types";
import { getColor, COURSE_COLORS } from "@/lib/colors";
import { DAY_LABELS } from "@/lib/utils";

const BLANK: Omit<Course, "id" | "created_at"> = { name: "", day_type: "day1", color: "blue" };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/courses");
    setCourses(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      const res = await fetch(`/api/courses/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setCourses((prev) => prev.map((c) => c.id === editing ? updated : c));
    } else {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setCourses((prev) => [...prev, created]);
    }
    setForm(BLANK);
    setEditing(null);
  };

  const handleEdit = (course: Course) => {
    setEditing(course.id);
    setForm({ name: course.name, day_type: course.day_type, color: course.color });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? Assignments linked to it will also be deleted.")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCancel = () => { setForm(BLANK); setEditing(null); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Courses</h1>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">{editing ? "Edit Course" : "Add Course"}</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Math, English, Careers"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Schedule</label>
          <select
            value={form.day_type}
            onChange={(e) => setForm({ ...form, day_type: e.target.value as DayType })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Object.keys(DAY_LABELS) as DayType[]).map((d) => (
              <option key={d} value={d}>{DAY_LABELS[d]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COURSE_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setForm({ ...form, color: c.value })}
                className={`w-7 h-7 rounded-full ${c.dot} ring-2 ring-offset-1 transition-all ${
                  form.color === c.value ? "ring-slate-900 scale-110" : "ring-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editing ? "Save Changes" : "Add Course"}
          </button>
          {editing && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Course list */}
      <div className="space-y-2">
        {courses.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No courses yet — add one above.</p>
        ) : (
          courses.map((course) => {
            const color = getColor(course.color);
            return (
              <div
                key={course.id}
                className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${color.dot}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{course.name}</p>
                    <p className="text-xs text-slate-400">{DAY_LABELS[course.day_type]}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(course)} className="text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(course.id)} className="text-xs text-slate-400 hover:text-red-600 transition-colors px-2 py-1 rounded">Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
