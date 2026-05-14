"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingBlock } from "@/components/LoadingBlock";
import { EnrollmentView, Assignment, Submission, Quiz, QuizAttempt, AssignmentWithStatus } from "@/types";

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress-track mt-2">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
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

function computeStatus(assignment: Assignment, submission?: Submission): AssignmentWithStatus["status"] {
  if (submission) {
    return submission.score !== null && submission.score !== undefined ? "GRADED" : "SUBMITTED";
  }
  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return "OVERDUE";
  return "NOT_SUBMITTED";
}

export default function MyLearningPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [enrollments, setEnrollments] = useState<EnrollmentView[]>([]);
  const [assignmentsWithStatus, setAssignmentsWithStatus] = useState<AssignmentWithStatus[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [quizzesMap, setQuizzesMap] = useState<Record<string, Quiz>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [enrollData, mySubmissions, myAttempts] = await Promise.all([
        api.getEnrollments(),
        api.getMySubmissions(),
        api.getMyQuizAttempts(),
      ]);
      setEnrollments(enrollData);
      setQuizAttempts(myAttempts);

      // Build submission map: assignmentId → Submission
      const submissionMap: Record<string, Submission> = {};
      for (const s of mySubmissions) submissionMap[s.assignmentId] = s;

      // Fetch assignments for each enrolled course
      const allAssignments: Assignment[] = [];
      await Promise.all(
        enrollData.map(async (enroll) => {
          const courseAssignments = await api.getAssignmentsByCourse(enroll.courseId);
          allAssignments.push(...courseAssignments);
        })
      );

      const withStatus: AssignmentWithStatus[] = allAssignments.map((a) => ({
        ...a,
        submission: submissionMap[a.id],
        status: computeStatus(a, submissionMap[a.id]),
      }));
      setAssignmentsWithStatus(withStatus);

      // Fetch quiz info for each attempt
      const qMap: Record<string, Quiz> = {};
      await Promise.all(
        myAttempts.map(async (attempt) => {
          if (!qMap[attempt.quizId]) {
            try {
              qMap[attempt.quizId] = await api.getQuizById(attempt.quizId);
            } catch { /* ignore */ }
          }
        })
      );
      setQuizzesMap(qMap);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Өгөгдөл ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "STUDENT") {
      router.replace("/");
      return;
    }
    void loadData();
  }, [user, router, loadData]);

  if (!user) return null;

  const upcoming = assignmentsWithStatus
    .filter((a) => a.status === "NOT_SUBMITTED" && a.dueDate && new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const missing = assignmentsWithStatus.filter((a) => a.status === "OVERDUE");
  const graded = assignmentsWithStatus.filter((a) => a.status === "GRADED");
  const submitted = assignmentsWithStatus.filter((a) => a.status === "SUBMITTED");

  return (
    <section className="animate-fade-in-up space-y-8 py-2">
      {/* Header */}
      <div className="paper p-6 sm:p-8 bg-[var(--brand-yellow)]">
        <p className="badge badge--neutral mb-3">МИНИЙ СУРГАЛТ</p>
        <h1 className="section-title text-3xl sm:text-4xl">Миний сургалт</h1>
        <p className="muted-copy text-sm mt-2">Таны хичээл, даалгавар, сорилын мэдээлэл</p>
      </div>

      {loading ? <LoadingBlock label="Мэдээлэл ачаалж байна..." /> : null}
      {error ? (
        <div className="paper p-4 bg-[var(--brand-red)] text-white font-bold">{error}</div>
      ) : null}

      {!loading && !error && (
        <>
          {/* Enrolled Courses */}
          <div className="space-y-4">
            <h2 className="section-title text-xl"> Миний хичээлүүд</h2>
            {enrollments.length === 0 ? (
              <div className="paper p-8 text-center">
                <p className="text-3xl mb-2"></p>
                <p className="font-bold">Та одоогоор ямар ч хичээлд бүртгэгдээгүй байна.</p>
                <Link href="/courses" className="btn-primary mt-4 inline-flex">Хичээлүүд харах</Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((e) => (
                  <Link key={e.id} href={`/courses/${e.courseId}`}>
                    <div className="paper p-5 hover:-translate-y-1 hover:shadow-lg transition-transform h-full">
                      <p className="badge badge--accent text-xs mb-2">
                        {Math.round(e.progress)}% дууссан
                      </p>
                      <h3 className="font-bold text-base">{e.courseTitle}</h3>
                      <ProgressBar value={e.progress} />
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        Бүртгэгдсэн: {new Date(e.enrolledAt).toLocaleDateString("mn-MN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Assignments */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="section-title text-xl">⏰ Ойрын даалгаврууд</h2>
              <div className="space-y-2">
                {upcoming.map((a) => (
                  <div key={a.id} className="paper p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      {statusBadge(a.status)}
                      <p className="font-bold mt-1">{a.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Дуусах: {new Date(a.dueDate).toLocaleDateString("mn-MN")}
                      </p>
                    </div>
                    <Link href={`/assignments`} className="btn-primary py-1 px-4 text-xs self-start sm:self-auto">
                      Илгээх
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing/Overdue */}
          {missing.length > 0 && (
            <div className="space-y-3">
              <h2 className="section-title text-xl"> Хугацаа хэтэрсэн даалгаврууд</h2>
              <div className="space-y-2">
                {missing.map((a) => (
                  <div key={a.id} className="paper p-4 border-2 border-[var(--brand-red)]">
                    {statusBadge(a.status)}
                    <p className="font-bold mt-1">{a.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Хугацаа: {new Date(a.dueDate).toLocaleDateString("mn-MN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted (pending grade) */}
          {submitted.length > 0 && (
            <div className="space-y-3">
              <h2 className="section-title text-xl"> Илгээсэн (хүлээгдэж буй)</h2>
              <div className="space-y-2">
                {submitted.map((a) => (
                  <div key={a.id} className="paper p-4 border-2 border-[var(--brand-blue)]">
                    {statusBadge(a.status)}
                    <p className="font-bold mt-1">{a.title}</p>
                    {a.submission?.submittedAt && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Илгээсэн: {new Date(a.submission.submittedAt).toLocaleDateString("mn-MN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graded */}
          {graded.length > 0 && (
            <div className="space-y-3">
              <h2 className="section-title text-xl"> Дүгнэгдсэн даалгаврууд</h2>
              <div className="space-y-2">
                {graded.map((a) => (
                  <div key={a.id} className="paper p-4 border-2 border-[var(--brand-green)]">
                    <div className="flex flex-wrap gap-2 items-center">
                      {statusBadge(a.status)}
                      <span className="badge bg-[var(--brand-green)]">
                        {a.submission?.score ?? 0}/{a.maxScore} оноо
                      </span>
                    </div>
                    <p className="font-bold mt-1">{a.title}</p>
                    {a.submission?.feedback && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1 italic">
                        Багшийн санал: {a.submission.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Attempts */}
          <div className="space-y-3">
            <h2 className="section-title text-xl"> Сорилын оролдлогууд</h2>
            {quizAttempts.length === 0 ? (
              <div className="paper p-6 text-center">
                <p className="font-bold">Та одоогоор ямар ч сорил өгөөгүй байна.</p>
                <Link href="/quizzes" className="btn-secondary mt-3 inline-flex">Шалгалт харах</Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {quizAttempts.map((attempt) => {
                  const quiz = quizzesMap[attempt.quizId];
                  const pct = attempt.totalQuestions > 0
                    ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                    : 0;
                  const passed = pct >= 50;
                  return (
                    <div key={attempt.id} className="paper p-4">
                      <div className="flex gap-2 flex-wrap">
                        <span className={`badge ${passed ? "bg-[var(--brand-green)]" : "bg-[var(--brand-red)] text-white"}`}>
                          {passed ? "Тэнцсэн " : "Тэнцсэнгүй "}
                        </span>
                        <span className="badge badge--accent">
                          {attempt.score}/{attempt.totalQuestions}
                        </span>
                      </div>
                      <p className="font-bold mt-1">{quiz?.title ?? "Сорил"}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {new Date(attempt.attemptedAt).toLocaleDateString("mn-MN")}
                      </p>
                      <ProgressBar value={pct} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
