"use client";

import { useEffect, useState, useCallback } from "react";
import { Assignment, AssignmentStatus } from "@/lib/types";
import { getColor } from "@/lib/colors";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/utils";

export default function CalendarPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/assignments");
    setAssignments(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: AssignmentStatus) => {
    const a = assignments.find((x) => x.id === id);
    if (!a) return;
    await fetch(`/api/assignments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...a, status }),
    });
    setAssignments((prev) => prev.map((x) => x.id === id ? { ...x, status } : x));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const byDate: Record<string, Assignment[]> = {};
  for (const a of assignments) {
    if (!byDate[a.due_date]) byDate[a.due_date] = [];
    byDate[a.due_date].push(a);
  }

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedAssignments = selectedDay ? (byDate[selectedDay] ?? []) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>

      {/* Month nav */}
      <div className="flex items-center gap-4">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
          ←
        </button>
        <h2 className="text-lg font-semibold text-slate-800 min-w-40 text-center">
          {currentDate.toLocaleDateString("en-CA", { month: "long", year: "numeric" })}
        </h2>
        <button onClick={next} className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
          →
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 border-b border-r border-slate-100 bg-slate-50/50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayAssignments = byDate[dateStr] ?? [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDay;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`h-20 p-1.5 border-b border-r border-slate-100 text-left transition-colors hover:bg-slate-50 ${
                  isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-400" : ""
                }`}
              >
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  isToday ? "bg-blue-600 text-white" : "text-slate-600"
                }`}>
                  {day}
                </span>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayAssignments.slice(0, 2).map((a) => {
                    const color = getColor(a.course?.color ?? "blue");
                    return (
                      <span key={a.id} className={`text-[10px] font-medium px-1 rounded truncate ${color.bg} ${color.text}`}>
                        {a.title}
                      </span>
                    );
                  })}
                  {dayAssignments.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{dayAssignments.length - 2} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">
            {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}
          </h3>

          {selectedAssignments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No assignments due this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedAssignments.map((a) => {
                const color = getColor(a.course?.color ?? "blue");
                return (
                  <div key={a.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                        {a.course?.name}
                      </span>
                      <p className="font-medium text-slate-900 text-sm mt-1">{a.title}</p>
                      {a.summary && <p className="text-xs text-slate-500 mt-0.5">{a.summary}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value as AssignmentStatus)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_STYLES[a.status]}`}
                      >
                        {(Object.keys(STATUS_LABELS) as AssignmentStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <a href={`/assignments/${a.id}/edit`} className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                        Edit
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
