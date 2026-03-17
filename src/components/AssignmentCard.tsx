"use client";

import Link from "next/link";
import { Assignment, AssignmentStatus } from "@/lib/types";
import { getColor } from "@/lib/colors";
import { formatDate, isOverdue, STATUS_LABELS, STATUS_STYLES } from "@/lib/utils";

interface Props {
  assignment: Assignment;
  onStatusChange?: (id: string, status: AssignmentStatus) => void;
}

export default function AssignmentCard({ assignment, onStatusChange }: Props) {
  const color = getColor(assignment.course?.color ?? "blue");
  const overdue = isOverdue(assignment.due_date, assignment.status);

  return (
    <div className={`bg-white rounded-xl border ${overdue ? "border-red-200" : "border-slate-200"} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Course tag */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${color.bg} ${color.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
            {assignment.course?.name ?? "Unknown"}
          </span>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">
            {assignment.title}
          </h3>

          {/* Summary */}
          {assignment.summary && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{assignment.summary}</p>
          )}

          {/* Due date */}
          <p className={`text-xs mt-2 font-medium ${overdue ? "text-red-600" : "text-slate-400"}`}>
            {overdue ? "⚠ Overdue — " : "Due "}
            {formatDate(assignment.due_date)}
          </p>
        </div>

        {/* Status + Edit */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <select
            value={assignment.status}
            onChange={(e) => onStatusChange?.(assignment.id, e.target.value as AssignmentStatus)}
            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_STYLES[assignment.status]}`}
          >
            {(Object.keys(STATUS_LABELS) as AssignmentStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <Link
            href={`/assignments/${assignment.id}/edit`}
            className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
