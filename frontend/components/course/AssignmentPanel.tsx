"use client";

import { useState, useRef } from "react";
import { Assignment, Submission } from "@/types";
import { api } from "@/lib/api";
import { triggerConfetti } from "@/lib/gamification";

interface AssignmentPanelProps {
  assignments: Assignment[];
  courseId: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  onMutate: () => void;
}

export function AssignmentPanel({ assignments, courseId, role, onMutate }: AssignmentPanelProps) {
  const [fileMap, setFileMap] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, string>>({});
  const [errs, setErrs] = useState<Record<string, string>>({});

  const setMsg = (id: string, m: string) => setMsgs((p) => ({ ...p, [id]: m }));
  const setErr = (id: string, e: string) => setErrs((p) => ({ ...p, [id]: e }));

  const handleUpload = async (assignmentId: string) => {
    const file = fileMap[assignmentId];
    if (!file) return;
    if (file.type !== "application/pdf") { setErr(assignmentId, "Зөвхөн PDF файл илгээх боломжтой."); return; }
    setUploading(assignmentId); setErr(assignmentId, "");
    try {
      await api.submitAssignment(assignmentId, file);
      triggerConfetti();
      setMsg(assignmentId, "Амжилттай илгээгдлээ!");
      setFileMap((p) => { const n = { ...p }; delete n[assignmentId]; return n; });
      onMutate();
    } catch (e: unknown) {
      setErr(assignmentId, e instanceof Error ? e.message : "Илгээхэд алдаа гарлаа.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="paper p-6">
      <h2 className="section-title text-2xl font-bold text-white mb-4">Даалгаврууд</h2>
      <div className="space-y-4">
        {assignments.length === 0 && (
          <p className="text-slate-400">Одоогоор даалгавар алга байна.</p>
        )}
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="p-4 border-2 border-black bg-[var(--brand-cyan)] text-black shadow-[4px_4px_0_0_#000]"
          >
            <h3 className="font-bold text-xl">{assignment.title}</h3>
            <p className="mt-1 text-sm">{assignment.description}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs font-bold">
              {assignment.dueDate && (
                <span className="badge badge--neutral">
                  ⏰ {new Date(assignment.dueDate).toLocaleDateString("mn-MN")}
                </span>
              )}
              <span className="badge badge--neutral"> Макс: {assignment.maxScore}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {role === "STUDENT" && (
                <>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFileMap((p) => ({ ...p, [assignment.id]: f }));
                      }}
                      className="bg-white p-1 border-2 border-black text-sm"
                    />
                    <button
                      disabled={uploading === assignment.id || !fileMap[assignment.id]}
                      onClick={() => handleUpload(assignment.id)}
                      className="btn-primary py-1 px-4 text-sm"
                    >
                      {uploading === assignment.id ? "Илгээж байна..." : " PDF илгээх"}
                    </button>
                  </div>
                  {errs[assignment.id] && (
                    <p className="text-xs text-[var(--brand-red)] font-bold">{errs[assignment.id]}</p>
                  )}
                  {msgs[assignment.id] && (
                    <p className="text-xs text-[var(--brand-green)] font-bold">{msgs[assignment.id]}</p>
                  )}
                </>
              )}
              {role === "TEACHER" && (
                <a
                  href={`/review-center`}
                  className="btn-secondary py-1 px-4 w-max text-sm"
                >
                  Шалгах төв →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
