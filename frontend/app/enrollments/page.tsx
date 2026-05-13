"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { EnrollmentView } from "@/types";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function EnrollmentsPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentView[]>([]);
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<"date" | "progress">("date");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await api.getEnrollments(user?.role === "TEACHER" ? sort : undefined);
      setEnrollments(data);
      setProgressInputs((prev) => {
        const next = { ...prev };
        for (const enrollment of data) {
          if (!next[enrollment.id]) {
            next[enrollment.id] = String(enrollment.progress);
          }
        }
        return next;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Элсэлтүүдийг ачаалж чадсангүй.",
      );
    } finally {
      setLoading(false);
    }
  }, [sort, user?.role]);

  useEffect(() => {
    if (user) {
      void loadEnrollments();
    }
  }, [user, loadEnrollments]);

  async function onDeleteEnrollment(id: string) {
    if (!window.confirm("Энэ элсэлтийг устгахдаа итгэлтэй байна уу?")) return;
    setError(null);
    setSuccess(null);

    try {
      await api.deleteEnrollment(id);
      setSuccess("Элсэлтийг амжилттай устгалаа.");
      setTimeout(() => setSuccess(null), 3000);
      await loadEnrollments();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Элсэлт устгах үед алдаа гарлаа.");
    }
  }

  async function onUpdateProgress(
    enrollmentId: string,
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const value = Number(progressInputs[enrollmentId]);

    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError("Ахиц 0-100 хооронд байна.");
      return;
    }

    setUpdatingId(enrollmentId);

    try {
      await api.updateEnrollmentProgress(enrollmentId, value);
      setSuccess("Элсэлтийн ахицыг амжилттай шинэчиллээ.");
      setTimeout(() => setSuccess(null), 3000);
      await loadEnrollments();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Ахиц шинэчлэх үед алдаа гарлаа.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader
        title={user?.role === "TEACHER" ? "Элсэлтүүд" : "Миний Элсэлт"}
        description={
          user?.role === "TEACHER"
            ? "Оюутан-хичээлийн элсэлтийг хянаж, сургалтын ахицыг шинэчилнэ."
            : "Өөрийн элссэн хичээлүүдийн явц, ахицыг хянаарай."
        }
      />

      <div className="paper p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title text-xl font-bold text-white">
            Элсэлтийн Жагсаалт
            {!loading && enrollments.length > 0 ? (
              <span className="ml-2 badge badge--neutral">{enrollments.length}</span>
            ) : null}
          </h2>
          {user?.role === "TEACHER" ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="muted-copy text-xs font-bold text-slate-300">Эрэмбэлэх:</span>
              <button
                type="button"
                className={`nav-pill ${sort === "date" ? "nav-pill--active" : "nav-pill--idle"}`}
                onClick={() => setSort("date")}
              >
                Огноо
              </button>
              <button
                type="button"
                className={`nav-pill ${sort === "progress" ? "nav-pill--active" : "nav-pill--idle"}`}
                onClick={() => setSort("progress")}
              >
                Ахиц
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-3 space-y-2">
          {error ? <StatusMessage type="error" message={error} /> : null}
          {success ? <StatusMessage type="success" message={success} /> : null}
        </div>

        <div className="mt-4">
          {loading ? <LoadingBlock label="Элсэлтүүдийг ачаалж байна..." /> : null}
          {!loading && enrollments.length === 0 ? (
            <p className="muted-copy text-sm">Одоогоор элсэлт бүртгэгдээгүй байна.</p>
          ) : null}

          {!loading && enrollments.length > 0 ? (
            <div className="stagger-children space-y-3">
              {enrollments.map((enrollment) => (
                <article
                  key={enrollment.id}
                  className="enrollment-card"
                >
                  <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <p className="text-slate-400">
                      <span className="font-bold text-white">Оюутан:</span>{" "}
                      {enrollment.studentName}
                    </p>
                    <p className="text-slate-400">
                      <span className="font-bold text-white">Хичээл:</span>{" "}
                      {enrollment.courseTitle}
                    </p>
                    <p className="text-slate-400">
                      <span className="font-bold text-white">Элссэн:</span>{" "}
                      {formatDate(enrollment.enrolledAt)}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="progress-track flex-1">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.max(0, Math.min(100, enrollment.progress))}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[var(--brand-blue)] tabular-nums min-w-[3rem] text-right">
                      {enrollment.progress}%
                    </span>
                  </div>

                  {/* Teacher Actions */}
                  {user?.role === "TEACHER" ? (
                    <form
                      onSubmit={(event) => void onUpdateProgress(enrollment.id, event)}
                      className="mt-3 flex flex-col gap-2 border-t border-amber-900/8 pt-3 sm:flex-row sm:items-end"
                    >
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-400">
                          Шинэ ахиц (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={progressInputs[enrollment.id] ?? String(enrollment.progress)}
                          onChange={(event) =>
                            setProgressInputs((prev) => ({
                              ...prev,
                              [enrollment.id]: event.target.value,
                            }))
                          }
                          className="field w-full sm:w-28"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={updatingId === enrollment.id}
                          className="btn-secondary"
                        >
                          {updatingId === enrollment.id ? "Шинэчилж байна..." : "Ахиц Шинэчлэх"}
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => void onDeleteEnrollment(enrollment.id)}
                        >
                          Устгах
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
