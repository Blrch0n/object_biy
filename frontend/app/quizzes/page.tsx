"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingBlock } from "@/components/LoadingBlock";
import { Quiz, QuizAttempt, EnrollmentView } from "@/types";

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress-track mt-2">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

interface StudentQuizCardProps {
  quiz: Quiz;
  attempt?: QuizAttempt;
}

function StudentQuizCard({ quiz, attempt }: StudentQuizCardProps) {
  const pct = attempt && attempt.totalQuestions > 0
    ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
  const passed = pct >= 50;

  return (
    <div className="paper p-5 space-y-3">
      <div className="flex flex-wrap gap-2 items-start justify-between">
        <div>
          <h3 className="font-bold text-base">{quiz.title}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {quiz.questions?.length ?? 0} асуулт
          </p>
        </div>
        {attempt ? (
          <span className={`badge ${passed ? "bg-[var(--brand-green)]" : "bg-[var(--brand-red)] text-white"}`}>
            {passed ? "Тэнцсэн " : "Тэнцсэнгүй "}
          </span>
        ) : (
          <span className="badge badge--neutral">Өгөөгүй</span>
        )}
      </div>

      {attempt ? (
        <>
          <div className="flex gap-2 flex-wrap">
            <span className="badge badge--accent">
              {attempt.score}/{attempt.totalQuestions} оноо
            </span>
            <span className="badge bg-white">{pct}%</span>
          </div>
          <ProgressBar value={pct} />
          <p className="text-xs text-[var(--text-muted)]">
            Өгсөн: {new Date(attempt.attemptedAt).toLocaleDateString("mn-MN")}
          </p>
          <p className="text-xs text-[var(--text-muted)] italic">
            Нэг оролдлого зөвшөөрнө. Дахин өгөх боломжгүй.
          </p>
        </>
      ) : (
        <Link
          href={`/courses/${quiz.courseId}/quizzes/${quiz.id}/take`}
          className="btn-primary py-1 px-4 text-sm inline-flex"
        >
          Сорил өгөх →
        </Link>
      )}
    </div>
  );
}

function TeacherQuizRow({ quiz }: { quiz: Quiz }) {
  const [attempts, setAttempts] = useState<QuizAttempt[] | null>(null);
  useEffect(() => {
    api.getQuizAttempts(quiz.id).then(setAttempts).catch(() => setAttempts([]));
  }, [quiz.id]);

  const avg = attempts && attempts.length > 0 && attempts[0].totalQuestions > 0
    ? Math.round((attempts.reduce((s, a) => s + a.score, 0) / attempts.length / attempts[0].totalQuestions) * 100)
    : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border-2 border-black rounded-lg bg-white">
      <div>
        <p className="font-bold text-sm">{quiz.title}</p>
        <p className="text-xs text-[var(--text-muted)]">{quiz.questions?.length ?? 0} асуулт</p>
      </div>
      <div className="flex gap-2 items-center flex-shrink-0">
        {attempts === null ? (
          <span className="badge badge--neutral">...</span>
        ) : (
          <>
            <span className="badge badge--accent">{attempts.length} оролдлого</span>
            {avg !== null && <span className="badge bg-[var(--brand-green)]">Дундаж: {avg}%</span>}
          </>
        )}
        <Link href={`/courses/${quiz.courseId}`} className="btn-secondary py-1 px-3 text-xs">
          Удирдах
        </Link>
      </div>
    </div>
  );
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student state
  const [studentQuizzes, setStudentQuizzes] = useState<{ quiz: Quiz; attempt?: QuizAttempt }[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentView[]>([]);

  // Teacher state
  const [teacherGroups, setTeacherGroups] = useState<{ courseTitle: string; courseId: string; quizzes: Quiz[] }[]>([]);

  const loadStudent = useCallback(async () => {
    const [enrollData, myAttempts] = await Promise.all([
      api.getEnrollments(),
      api.getMyQuizAttempts(),
    ]);
    setEnrollments(enrollData);

    const attemptMap: Record<string, QuizAttempt> = {};
    for (const a of myAttempts) attemptMap[a.quizId] = a;

    const allQuizzes: Quiz[] = [];
    await Promise.all(enrollData.map(async (e) => {
      const quizzes = await api.getQuizzesByCourse(e.courseId);
      allQuizzes.push(...quizzes);
    }));

    setStudentQuizzes(allQuizzes.map((q) => ({ quiz: q, attempt: attemptMap[q.id] })));
  }, []);

  const loadTeacher = useCallback(async () => {
    const coursesData = await api.getCourses(0, 100);
    const groups = await Promise.all(coursesData.content.map(async (c) => ({
      courseId: c.id,
      courseTitle: c.title,
      quizzes: await api.getQuizzesByCourse(c.id),
    })));
    setTeacherGroups(groups.filter((g) => g.quizzes.length > 0));
  }, []);

  useEffect(() => {
    setLoading(true); setError(null);
    (user?.role === "STUDENT" ? loadStudent() : loadTeacher())
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Алдаа гарлаа"))
      .finally(() => setLoading(false));
  }, [user, loadStudent, loadTeacher]);

  const completed = studentQuizzes.filter((q) => q.attempt);
  const available = studentQuizzes.filter((q) => !q.attempt);

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <div className="paper p-6 bg-[var(--brand-blue)] text-black">
        <p className="badge badge--neutral mb-3">ШАЛГАЛТЫН ТӨВ</p>
        <h1 className="section-title text-3xl">
          {user?.role === "STUDENT" ? "Миний шалгалтууд" : "Шалгалтын удирдлага"}
        </h1>
        <p className="muted-copy text-sm mt-1">
          {user?.role === "STUDENT" ? "Таны бүх хичээлийн шалгалтууд" : "Хичээлүүдийн шалгалт ба оролдлогууд"}
        </p>
      </div>

      {error && <div className="paper p-4 bg-[var(--brand-red)] text-white font-bold">{error}</div>}
      {loading ? (
        <LoadingBlock label="Шалгалтууд ачаалж байна..." />
      ) : user?.role === "STUDENT" ? (
        <>
          {studentQuizzes.length === 0 ? (
            <div className="paper p-10 text-center">
              <p className="text-3xl mb-2"></p>
              <p className="section-title text-lg">Шалгалт байхгүй байна</p>
              <p className="muted-copy text-sm mt-1">
                {enrollments.length === 0 ? "Эхлээд хичээлд бүртгүүлнэ үү." : "Хичээлүүдэд одоогоор шалгалт нэмэгдээгүй."}
              </p>
              {enrollments.length === 0 && (
                <Link href="/courses" className="btn-primary mt-4 inline-flex">Хичээлүүд харах</Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {available.length > 0 && (
                <div className="space-y-3">
                  <h2 className="section-title text-xl"> Өгөх боломжтой шалгалтууд ({available.length})</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {available.map(({ quiz }) => (
                      <StudentQuizCard key={quiz.id} quiz={quiz} />
                    ))}
                  </div>
                </div>
              )}
              {completed.length > 0 && (
                <div className="space-y-3">
                  <h2 className="section-title text-xl"> Өгсөн шалгалтууд ({completed.length})</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {completed.map(({ quiz, attempt }) => (
                      <StudentQuizCard key={quiz.id} quiz={quiz} attempt={attempt} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {teacherGroups.length === 0 ? (
            <div className="paper p-10 text-center">
              <p className="text-3xl mb-2"></p>
              <p className="section-title text-lg">Шалгалт байхгүй байна</p>
              <p className="muted-copy text-sm mt-1">Хичээлийн дэлгэрэнгүй хуудсаас шалгалт нэмнэ үү.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {teacherGroups.map((g) => (
                <div key={g.courseId} className="paper overflow-hidden">
                  <div className="p-4 bg-[var(--brand-yellow)] border-b-2 border-black flex items-center justify-between">
                    <div>
                      <h3 className="section-title text-base">{g.courseTitle}</h3>
                      <p className="text-sm">{g.quizzes.length} шалгалт</p>
                    </div>
                    <Link href={`/courses/${g.courseId}`} className="btn-secondary py-1 px-3 text-xs">
                      Хичээл →
                    </Link>
                  </div>
                  <div className="p-4 space-y-2">
                    {g.quizzes.map((q) => <TeacherQuizRow key={q.id} quiz={q} />)}
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
