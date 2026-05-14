"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Quiz, QuizAttempt } from "@/types";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";

export default function TakeQuizPage() {
  const { id: courseId, quizId } = useParams() as { id: string; quizId: string };
  const router = useRouter();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchQuizData() {
      try {
        setLoading(true);
        const [quizData, attemptData] = await Promise.all([
          api.getQuizById(quizId),
          api.getMyQuizAttempt(quizId).catch(() => null), // If not attempted yet, it throws 404 usually, so catch it
        ]);
        if (active) {
          setQuiz(quizData);
          if (attemptData && attemptData.id) {
            setAttempt(attemptData);
            setAnswers(attemptData.answers || {});
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load quiz");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    fetchQuizData();
    return () => {
      active = false;
    };
  }, [quizId]);

  const handleOptionChange = (questionIndex: number, answer: string) => {
    if (attempt) return; // Prevent changes if already submitted
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    
    setFormError(null);
    // Check if all questions are answered
    if (Object.keys(answers).length < quiz.questions.length) {
      setFormError("Бүх асуултанд хариулна уу.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.submitQuizAttempt(quizId, answers);
      setAttempt(result);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Шалгалт илгээхэд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingBlock label="Шалгалт ачаалж байна..." />;
  if (error) return <StatusMessage type="error" message={error} />;
  if (!quiz) return <StatusMessage type="error" message="Шалгалт олдсонгүй" />;

  const isCompleted = !!attempt;

  return (
    <section className="animate-fade-in-up space-y-6 py-2 max-w-4xl mx-auto">
      <button
        onClick={() => router.push(`/courses/${courseId}`)}
        className="text-slate-400 hover:text-white underline text-sm"
      >
        &larr; Хичээл рүү буцах
      </button>
      <PageHeader
        title={quiz.title}
        description={isCompleted ? "Таны шалгалтын дүн" : "Шалгалтаа амжилттай өгнө үү."}
      />

      {isCompleted && (
        <div className="paper p-6 mb-6 text-center border-green-500 border-2 bg-green-500/10">
          <h2 className="text-2xl font-bold text-white mb-2">Шалгалт өгсөн байна!</h2>
          <p className="text-lg text-slate-200">
            Таны оноо: <span className="font-bold text-emerald-400">{attempt.score} / {attempt.totalQuestions}</span>
          </p>
          <div className="mt-4">
            <button 
              onClick={() => router.push(`/courses/${courseId}`)}
              className="btn btn--primary"
            >
              Хичээл рүү буцах
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={index} className="paper p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">
              {index + 1}. {question.text}
            </h3>
            <div className="space-y-3">
              {question.options.map((option, optIdx) => {
                const isSelected = answers[index] === option;
                const isCorrect = isCompleted && question.correctAnswer === option;
                const isWrongSelected = isCompleted && isSelected && !isCorrect;

                let labelClass = "flex items-center p-3 rounded-lg border cursor-pointer transition-colors ";
                
                if (isCompleted) {
                  labelClass += "cursor-default ";
                  if (isCorrect) {
                    labelClass += "bg-emerald-500/20 border-emerald-500/50 ";
                  } else if (isWrongSelected) {
                    labelClass += "bg-red-500/20 border-red-500/50 ";
                  } else {
                    labelClass += "bg-slate-800/50 border-slate-700 opacity-50 ";
                  }
                } else {
                  labelClass += isSelected 
                    ? "bg-blue-500/20 border-blue-500/50" 
                    : "bg-slate-800/50 border-slate-700 hover:bg-slate-800";
                }

                return (
                  <label key={optIdx} className={labelClass}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleOptionChange(index, option)}
                      disabled={isCompleted || submitting}
                      className="mr-3 w-4 h-4 text-blue-500 bg-slate-900 border-slate-600 focus:ring-blue-500"
                    />
                    <span className={`flex-1 ${isCompleted && (isCorrect || isWrongSelected) ? "font-medium text-white" : "text-slate-200"}`}>
                      {option}
                    </span>
                    {isCompleted && isCorrect && <span className="text-emerald-400 font-bold ml-2">✓ Зөв</span>}
                    {isCompleted && isWrongSelected && <span className="text-red-400 font-bold ml-2">✗ Буруу</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {formError && <StatusMessage type="error" message={formError} />}

        {!isCompleted && user?.role === "STUDENT" && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--primary"
            >
              {submitting ? "Илгээж байна..." : "Шалгалт илгээх"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}