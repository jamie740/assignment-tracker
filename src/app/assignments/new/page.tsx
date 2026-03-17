"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Course, AssignmentStatus } from "@/lib/types";

type ScanState = "idle" | "scanning" | "done" | "error";

export default function NewAssignment() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    summary: "",
    due_date: "",
    status: "not_started" as AssignmentStatus,
  });
  const [saving, setSaving] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((data: Course[]) => {
      setCourses(data);
      if (data.length > 0) setForm((f) => ({ ...f, course_id: data[0].id }));
    });
  }, []);

  // Convert any image (including HEIC) to a compressed JPEG before uploading
  const toJpeg = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 600;
        let { naturalWidth: w, naturalHeight: h } = img;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round((h / w) * MAX); w = MAX; }
          else { w = Math.round((w / h) * MAX); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Conversion failed")), "image/jpeg", 0.6);
      };
      img.onerror = reject;
      img.src = url;
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setScanState("scanning");

    try {
      const jpeg = await toJpeg(file);
      const fd = new FormData();
      fd.append("image", jpeg, "assignment.jpg");
      const res = await fetch("/api/scan-assignment", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.error ?? "Scan failed");

      const { title, due_date, summary, course_id } = json.data;
      setForm((f) => ({
        ...f,
        title: title ?? f.title,
        due_date: due_date ?? f.due_date,
        summary: summary ?? f.summary,
        course_id: course_id ?? f.course_id,
      }));
      setScanState("done");
    } catch {
      setScanState("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id || !form.title || !form.due_date) return;
    setSaving(true);
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/");
  };

  if (courses.length === 0) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">New Assignment</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          You need to add at least one course first.{" "}
          <a href="/courses" className="font-semibold underline">Go to Courses →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Assignment</h1>

      {/* Photo scan card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-1">Scan from Photo</p>
        <p className="text-xs text-slate-400 mb-4">Take a photo of a printed or written assignment — the form will fill itself in automatically.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />

        {previewUrl && (
          <div className="mb-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Scanned assignment" className="w-full max-h-48 object-contain rounded-lg bg-slate-50 border border-slate-100" />
            {scanState === "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium text-slate-600">Reading assignment...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {scanState === "done" && (
          <p className="text-xs text-green-600 font-medium mb-3">✓ Form filled — review and save below</p>
        )}
        {scanState === "error" && (
          <p className="text-xs text-red-500 mb-3">Couldn't read the photo. Try again or fill in manually.</p>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanState === "scanning"}
          className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          {previewUrl ? "📷 Scan a different photo" : "📷 Take or choose a photo"}
        </button>
      </div>

      {/* Manual form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Assignment Details</p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
          <select
            required
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            required
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Chapter 5 Essay"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Summary <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Any notes about this assignment..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
          <input
            required
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as AssignmentStatus })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Assignment"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
