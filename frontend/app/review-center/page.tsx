"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingBlock } from "@/components/LoadingBlock";
import { Course, Assignment, Submission } from "@/types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface SubmissionRowProps {
  submission: Submission;
  assignment: Assignment;
  onGraded: () => void;
}

function SubmissionRow({ submission, assignment, onGraded }: SubmissionRowProps) {
  const [score, setScore] = useState<string>(submission.score != null ? String(submission.score) : "");
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await api.downloadSubmission(submission.id);
      downloadBlob(blob, submission.originalFileName ?? "submission.pdf");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Татаж авахад алдаа гарлаа");
    } finally {
      setDownloading(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > assignment.maxScore) {
      setErr(`Оноо 0 - ${assignment.maxScore} хооронд байх ёстой.`);
      return;
    }
    if (feedback.length > 1000) {
      setErr("Санал хүсэлт 1000 тэмдэгтээс хэтрэхгүй байх ёстой.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await api.gradeSubmission(submission.id, scoreNum, feedback || undefined);
      setMsg("Амжилттай дүгнэгдлээ!");
      onGraded();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Дүгнэхэд алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const isGraded = submission.score != null;

  return (
    <div className={`border-2 border-black rounded-lg p-4 space-y-3 ${isGraded ? "border-[var(--brand-green)]" : "border-white/20"}`}>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <span className={`badge ${isGraded ? "bg-[var(--brand-green)]" : "badge--neutral"}`}>
            {isGraded ? `Дүгнэгдсэн: ${submission.score}/${assignment.maxScore}` : "Дүгнэгдэлгүй"}
          </span>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Илгээсэн: {new Date(submission.submittedAt).toLocaleDateString("mn-MN")}
          </p>
          <p className="text-xs font-medium">{submission.originalFileName}</p>
        </div>
        <button
          className="btn-secondary py-1 px-3 text-xs"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "..." : "📥 Татах"}
        </button>
      </div>

      {err && <p className="text-xs text-[var(--brand-red)] font-bold">{err}</p>}
      {msg && <p className="text-xs text-[var(--brand-green)] font-bold">{msg}</p>}

      <form onSubmit={handleGrade} className="space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold mb-1">
              Оноо (макс: {assignment.maxScore})
            </label>
            <input
              type="number"
              min={0}
              max={assignment.maxScore}
              className="field text-sm"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Санал хүсэлт (заавал биш)</label>
          <textarea
            className="field text-sm"
            rows={2}
            maxLength={1000}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Сурагчид хариу өгнө үү..."
          />
          <p className="text-xs text-[var(--text-muted)] text-right">{feedback.length}/1000</p>
        </div>
        <button type="submit" className="btn-primary py-1 px-4 text-sm" disabled={saving}>
          {saving ? "Хадгалж байна..." : "✓ Дүгнэх"}
        </button>
      </form>
    </div>
  );
}

interface AssignmentPanelProps {
  assignment: Assignment;
  courseTitle: string;
  onRefresh: () => void;
}

function AssignmentSectionPanel({ assignment, courseTitle, onRefresh }: AssignmentPanelProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions(assignment.id);
      setSubmissions(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [assignment.id]);

  const handleToggle = () => {
    if (!open) void loadSubmissions();
    setOpen(!open);
  };

  const pending = submissions.filter((s) => s.score == null).length;

  return (
    <div className="border-2 border-black rounded-lg">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors"
      >
        <div>
          <p className="font-bold text-sm">{assignment.title}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {courseTitle} · Макс оноо: {assignment.maxScore}
            {assignment.dueDate && ` · Дуусах: ${new Date(assignment.dueDate).toLocaleDateString("mn-MN")}`}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-shrink-0">
          {pending > 0 && (
            <span className="badge bg-[var(--brand-orange)]">{pending} хүлээгдэж буй</span>
          )}
          <span className="text-lg">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t-2 border-black p-4 space-y-3">
          {loading ? (
            <LoadingBlock label="Илгээлтүүд ачаалж байна..." />
          ) : submissions.length === 0 ? (
            <p className="text-sm text-center text-[var(--text-muted)] py-4">
              Одоогоор илгээлт байхгүй байна.
            </p>
          ) : (
            submissions.map((sub) => (
              <SubmissionRow
                key={sub.id}
                submission={sub}
                assignment={assignment}
                onGraded={() => { void loadSubmissions(); onRefresh(); }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface CourseBlock {
  course: Course;
  assignments: Assignment[];
}

export default function ReviewCenterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courseBlocks, setCourseBlocks] = useState<CourseBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesData = await api.getCourses(0, 100);
      const courses = coursesData.content;

      const blocks = await Promise.all(
        courses.map(async (course) => {
          const assignments = await api.getAssignmentsByCourse(course.id);
          return { course, assignments };
        })
      );

      setCourseBlocks(blocks.filter((b) => b.assignments.length > 0));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Өгөгдөл ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "STUDENT") {
      router.replace("/");
      return;
    }
    void loadData();
  }, [user, router, loadData, refreshKey]);

  if (!user) return null;

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <section className="animate-fade-in-up space-y-8 py-2">
      {/* Header */}
      <div className="paper p-6 sm:p-8 bg-[var(--brand-orange)]">
        <p className="badge badge--neutral mb-3">ШАЛГАХ ТӨВ</p>
        <h1 className="section-title text-3xl sm:text-4xl">Шалгах төв</h1>
        <p className="muted-copy text-sm mt-2">
          Хичээлүүдийн даалгаврын илгээлтийг шалгаж, дүнгийн мэдээлэл оруулна уу.
        </p>
      </div>

      {error && (
        <div className="paper p-4 bg-[var(--brand-red)] text-white font-bold">{error}</div>
      )}

      {loading ? (
        <LoadingBlock label="Хичээл ба даалгаврууд ачаалж байна..." />
      ) : courseBlocks.length === 0 ? (
        <div className="paper p-10 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="section-title text-lg">Даалгавар байхгүй байна</p>
          <p className="muted-copy text-sm mt-1">Эхлээд хичээлд даалгавар нэмнэ үү.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {courseBlocks.map(({ course, assignments }) => (
            <div key={course.id} className="paper overflow-hidden">
              <div className="p-4 bg-[var(--brand-yellow)] border-b-2 border-black">
                <h2 className="section-title text-lg">{course.title}</h2>
                <p className="text-sm font-medium">
                  {assignments.length} даалгавар
                </p>
              </div>
              <div className="p-4 space-y-3">
                {assignments.map((a) => (
                  <AssignmentSectionPanel
                    key={a.id}
                    assignment={a}
                    courseTitle={course.title}
                    onRefresh={handleRefresh}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
