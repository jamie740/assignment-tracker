"use client";

import { useEffect, useState, useCallback } from "react";
import { Assignment, AssignmentStatus } from "@/lib/types";
import { isOverdue, isDueTomorrow, isDueThisWeek } from "@/lib/utils";
import AssignmentCard from "@/components/AssignmentCard";

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/assignments");
    const data = await res.json();
    setAssignments(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: AssignmentStatus) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) return;
    await fetch(`/api/assignments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...assignment, status }),
    });
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const overdue = assignments.filter((a) => isOverdue(a.due_date, a.status));
  const tomorrow = assignments.filter((a) => isDueTomorrow(a.due_date) && a.status !== "submitted");
  const thisWeek = assignments.filter((a) => isDueThisWeek(a.due_date, a.status) && !isDueTomorrow(a.due_date));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <Section
        title="Overdue"
        count={overdue.length}
        color="red"
        empty="Nothing overdue."
        assignments={overdue}
        onStatusChange={handleStatusChange}
      />
      <Section
        title="Due Tomorrow"
        count={tomorrow.length}
        color="orange"
        empty="Nothing due tomorrow."
        assignments={tomorrow}
        onStatusChange={handleStatusChange}
      />
      <Section
        title="Due This Week"
        count={thisWeek.length}
        color="blue"
        empty="Nothing else due this week."
        assignments={thisWeek}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function Section({
  title, count, color, empty, assignments, onStatusChange,
}: {
  title: string;
  count: number;
  color: "red" | "orange" | "blue";
  empty: string;
  assignments: Assignment[];
  onStatusChange: (id: string, status: AssignmentStatus) => void;
}) {
  const badge = {
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
  }[color];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-slate-700">{title}</h2>
        {count > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{count}</span>
        )}
      </div>
      {assignments.length === 0 ? (
        <p className="text-sm text-slate-400 italic">{empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {assignments.map((a) => (
            <AssignmentCard key={a.id} assignment={a} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </section>
  );
}
