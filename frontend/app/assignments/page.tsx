"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingBlock } from "@/components/LoadingBlock";
import { EnrollmentView, Assignment, Submission, AssignmentWithStatus } from "@/types";
import Link from "next/link";

function formatDeadline(dueDate: string): { label: string; cls: string } {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return { label: `Хугацаа ${overdueDays} өдрийн өмнө хэтэрсэн`, cls: "bg-[var(--brand-red)] text-white" };
  }
  if (diffDays === 0) return { label: "Өнөөдөр дуусна!", cls: "bg-[var(--brand-orange)] text-black" };
  if (diffDays === 1) return { label: "Маргааш дуусна", cls: "bg-[var(--brand-orange)] text-black" };
  if (diffDays <= 3) return { label: `${diffDays} өдөр үлдлээ`, cls: "bg-[var(--brand-yellow)] text-black" };
  return { label: `${diffDays} өдөр үлдлээ`, cls: "bg-white text-black" };
}

function statusBadge(status: AssignmentWithStatus["status"]) {
  const map = {
    NOT_SUBMITTED: { label: "Илгээгүй", cls: "bg-white" },
    SUBMITTED: { label: "Илгээсэн", cls: "bg-[var(--brand-blue)]" },
    GRADED: { label: "Дүгнэсэн", cls: "bg-[var(--brand-green)]" },
    OVERDUE: { label: "Хугацаа хэтэрсэн", cls: "bg-[var(--brand-red)] text-white" },
  };
  const { label, cls } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function computeStatus(a: Assignment, sub?: Submission): AssignmentWithStatus["status"] {
  if (sub) return sub.score != null ? "GRADED" : "SUBMITTED";
  if (a.dueDate && new Date(a.dueDate) < new Date()) return "OVERDUE";
  return "NOT_SUBMITTED";
}

function StudentRow({ item, onRefresh }: { item: AssignmentWithStatus; onRefresh: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    if (!item.submission) return;
    setDownloading(true); setErr(null);
    try {
      const blob = await api.downloadSubmission(item.submission.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = item.submission.originalFileName; a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Татаж авахад алдаа гарлаа.");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (file.type !== "application/pdf") { setErr("Зөвхөн PDF файл илгээх боломжтой."); return; }
    setUploading(true); setErr(null);
    try {
      await api.submitAssignment(item.id, file);
      setMsg("Амжилттай илгээгдлээ!"); setFile(null);
      if (ref.current) ref.current.value = "";
      onRefresh();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Алдаа гарлаа."); }
    finally { setUploading(false); }
  };

  return (
    <div className="paper p-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-start justify-between">
        <div>
          {statusBadge(item.status)}
          <h3 className="font-bold mt-1">{item.title}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
          <div className="flex flex-wrap gap-2 mt-1 items-center">
            {item.dueDate && (() => {
              const { label, cls } = formatDeadline(item.dueDate);
              return <span className={`badge text-xs font-bold border-2 border-black ${cls}`}>⏰ {label}</span>;
            })()}
            <span className="text-xs text-[var(--text-muted)]"> Макс: {item.maxScore}</span>
          </div>
        </div>
      </div>
      {item.status === "GRADED" && item.submission && (
        <div className="rounded-md bg-green-50 border-2 border-black p-3">
          <p className="font-bold text-sm">Оноо: {item.submission.score}/{item.maxScore}</p>
          {item.submission.feedback && <p className="text-sm italic mt-1">Санал: {item.submission.feedback}</p>}
        </div>
      )}
      {item.status === "SUBMITTED" && item.submission && (
        <div className="rounded-md border-2 border-[var(--brand-blue)] p-3 space-y-2">
          <p className="text-sm">Илгээгдсэн: {new Date(item.submission.submittedAt).toLocaleDateString("mn-MN")}</p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-xs text-[var(--brand-blue)] hover:underline font-bold disabled:opacity-50"
          >
            {downloading ? "Татаж байна..." : ` ${item.submission.originalFileName} татах`}
          </button>
        </div>
      )}
      {(item.status === "NOT_SUBMITTED" || item.status === "SUBMITTED") && (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input ref={ref} type="file" accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="field text-sm cursor-pointer" />
          <button className="btn-primary py-1 px-4 text-sm flex-shrink-0"
            onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? "Илгээж байна..." : " PDF илгээх"}
          </button>
        </div>
      )}
      {err && <p className="text-sm text-[var(--brand-red)] font-bold">{err}</p>}
      {msg && <p className="text-sm text-[var(--brand-green)] font-bold">{msg}</p>}
    </div>
  );
}

function TeacherRow({ assignment }: { assignment: Assignment }) {
  const [subs, setSubs] = useState<Submission[] | null>(null);
  useEffect(() => {
    api.getSubmissions(assignment.id).then(setSubs).catch(() => setSubs([]));
  }, [assignment.id]);
  const pending = subs?.filter((s) => s.score == null).length ?? 0;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border-2 border-black rounded-lg bg-white">
      <div>
        <p className="font-bold text-sm">{assignment.title}</p>
        <p className="text-xs text-[var(--text-muted)]">
          Макс: {assignment.maxScore}
          {assignment.dueDate && ` · Дуусах: ${new Date(assignment.dueDate).toLocaleDateString("mn-MN")}`}
        </p>
      </div>
      <div className="flex gap-2 items-center flex-shrink-0">
        {subs === null ? <span className="badge badge--neutral">...</span> : (
          <>
            <span className="badge badge--accent">{subs.length} илгээлт</span>
            {pending > 0 && <span className="badge bg-[var(--brand-orange)]">{pending} хүлээгдэж буй</span>}
          </>
        )}
        <Link href="/review-center" className="btn-primary py-1 px-3 text-xs">Шалгах</Link>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [studentItems, setStudentItems] = useState<AssignmentWithStatus[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentView[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<{ courseId: string; courseTitle: string; assignments: Assignment[] }[]>([]);

  const loadStudent = useCallback(async () => {
    const [enrollData, mySubmissions] = await Promise.all([api.getEnrollments(), api.getMySubmissions()]);
    setEnrollments(enrollData);
    const subMap: Record<string, Submission> = {};
    for (const s of mySubmissions) subMap[s.assignmentId] = s;
    const all: Assignment[] = [];
    await Promise.all(enrollData.map(async (e) => {
      const assignments = await api.getAssignmentsByCourse(e.courseId);
      all.push(...assignments);
    }));
    setStudentItems(all.map((a) => ({ ...a, submission: subMap[a.id], status: computeStatus(a, subMap[a.id]) })));
  }, []);

  const loadTeacher = useCallback(async () => {
    const coursesData = await api.getCourses(0, 100);
    const groups = await Promise.all(coursesData.content.map(async (c) => ({
      courseId: c.id, courseTitle: c.title,
      assignments: await api.getAssignmentsByCourse(c.id),
    })));
    setTeacherGroups(groups.filter((g) => g.assignments.length > 0));
  }, []);

  useEffect(() => {
    setLoading(true); setError(null);
    (user?.role === "STUDENT" ? loadStudent() : loadTeacher())
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Алдаа гарлаа"))
      .finally(() => setLoading(false));
  }, [user, loadStudent, loadTeacher, refreshKey]);

  const sorted = [...studentItems].sort((a, b) => {
    const o: Record<string, number> = { OVERDUE: 0, NOT_SUBMITTED: 1, SUBMITTED: 2, GRADED: 3 };
    return (o[a.status] ?? 4) - (o[b.status] ?? 4);
  });

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <div className="paper p-6 bg-[var(--brand-yellow)]">
        <p className="badge badge--neutral mb-3">ДААЛГАВРЫН ТӨВ</p>
        <h1 className="section-title text-3xl">
          {user?.role === "STUDENT" ? "Миний даалгаврууд" : "Даалгаврын удирдлага"}
        </h1>
        <p className="muted-copy text-sm mt-1">
          {user?.role === "STUDENT" ? "Таны бүх хичээлийн даалгаврууд" : "Хичээлүүдийн даалгавар ба илгээлт"}
        </p>
      </div>

      {error && <div className="paper p-4 bg-[var(--brand-red)] text-white font-bold">{error}</div>}
      {loading ? <LoadingBlock label="Даалгаврууд ачаалж байна..." /> : user?.role === "STUDENT" ? (
        <>
          {studentItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(["NOT_SUBMITTED","SUBMITTED","GRADED","OVERDUE"] as const).map((s) => {
                const n = studentItems.filter((i) => i.status === s).length;
                if (!n) return null;
                const labels = { NOT_SUBMITTED:"Илгээгүй", SUBMITTED:"Илгээсэн", GRADED:"Дүгнэсэн", OVERDUE:"Хугацаа хэтэрсэн" };
                const cls = { NOT_SUBMITTED:"badge--neutral", SUBMITTED:"bg-[var(--brand-blue)]", GRADED:"bg-[var(--brand-green)]", OVERDUE:"bg-[var(--brand-red)] text-white" };
                return <span key={s} className={`badge ${cls[s]}`}>{labels[s]}: {n}</span>;
              })}
            </div>
          )}
          {sorted.length === 0 ? (
            <div className="paper p-10 text-center">
              <p className="text-3xl mb-2"></p>
              <p className="section-title text-lg">Даалгавар байхгүй байна</p>
              <p className="muted-copy text-sm mt-1">
                {enrollments.length === 0 ? "Эхлээд хичээлд бүртгүүлнэ үү." : "Хичээлүүдэд одоогоор даалгавар нэмэгдээгүй."}
              </p>
              {enrollments.length === 0 && <Link href="/courses" className="btn-primary mt-4 inline-flex">Хичээлүүд харах</Link>}
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((item) => <StudentRow key={item.id} item={item} onRefresh={() => setRefreshKey((k) => k + 1)} />)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="paper p-4 bg-blue-50 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="font-bold text-sm">Дэлгэрэнгүй дүгнэлт хийхийн тулд Шалгах төвийг ашиглана уу.</p>
            <Link href="/review-center" className="btn-primary py-1 px-4 text-sm self-start">Шалгах төв →</Link>
          </div>
          {teacherGroups.length === 0 ? (
            <div className="paper p-10 text-center"><p className="text-3xl mb-2"></p><p className="section-title text-lg">Даалгавар байхгүй байна</p></div>
          ) : (
            <div className="space-y-6">
              {teacherGroups.map((g) => (
                <div key={g.courseId} className="paper overflow-hidden">
                  <div className="p-4 bg-[var(--brand-yellow)] border-b-2 border-black flex items-center justify-between">
                    <div><h3 className="section-title text-base">{g.courseTitle}</h3><p className="text-sm">{g.assignments.length} даалгавар</p></div>
                    <Link href="/review-center" className="btn-secondary py-1 px-3 text-xs">Шалгах төв →</Link>
                  </div>
                  <div className="p-4 space-y-2">
                    {g.assignments.map((a) => <TeacherRow key={a.id} assignment={a} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
