"use client";

import { Quiz, QuizAttempt } from "@/types";
import { useRouter } from "next/navigation";

interface QuizPanelProps {
  quizzes: Quiz[];
  courseId: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  attemptMap?: Record<string, QuizAttempt>;
}

export function QuizPanel({ quizzes, courseId, role, attemptMap = {} }: QuizPanelProps) {
  const router = useRouter();

  return (
    <div className="paper p-6">
      <h2 className="section-title text-2xl font-bold text-white mb-4">Шалгалт &amp; Сорил</h2>
      <div className="space-y-4">
        {quizzes.length === 0 && (
          <p className="text-slate-400">Одоогоор сорил алга байна.</p>
        )}
        {quizzes.map((quiz) => {
          const attempt = attemptMap[quiz.id];
          const pct = attempt && attempt.totalQuestions > 0
            ? Math.round((attempt.score / attempt.totalQuestions) * 100) : null;
          const passed = pct !== null && pct >= 50;

          return (
            <div
              key={quiz.id}
              className="p-4 border-2 border-black bg-[var(--brand-magenta)] text-white shadow-[4px_4px_0_0_#000]"
            >
              <div className="flex flex-wrap gap-2 items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl">{quiz.title}</h3>
                  <p className="text-sm mt-1">{quiz.questions?.length || 0} асуулттай</p>
                </div>
                {attempt && (
                  <span className={`badge ${passed ? "bg-[var(--brand-green)]" : "bg-[var(--brand-red)]"}`}>
                    {passed ? "Тэнцсэн ✓" : "Тэнцсэнгүй ✗"}
                  </span>
                )}
              </div>
              {attempt && (
                <p className="mt-2 text-sm font-bold">
                  Оноо: {attempt.score}/{attempt.totalQuestions} ({pct}%)
                </p>
              )}
              <div className="mt-4">
                {role === "STUDENT" && !attempt && (
                  <button
                    onClick={() => router.push(`/courses/${courseId}/quizzes/${quiz.id}/take`)}
                    className="btn-primary bg-yellow-400 text-black py-1 px-4 text-sm"
                  >
                    🎯 Сорил өгөх
                  </button>
                )}
                {role === "STUDENT" && attempt && (
                  <p className="text-xs opacity-80">Нэг оролдлого зөвшөөрнө.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
