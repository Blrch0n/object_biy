"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Course, Student } from "@/types";

export default function EnrollPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [progress, setProgress] = useState("0");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData() {
    setError(null);
    setLoading(true);

    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.getStudents(0, 100),
        api.getCourses(0, 100),
      ]);

      const studentsData = studentsRes.content || [];
      const coursesData = coursesRes.content || [];

      setStudents(studentsData);
      setCourses(coursesData);

      if (studentsData.length > 0) {
        setStudentId((current) => current || studentsData[0].id);
      }

      if (coursesData.length > 0) {
        setCourseId((current) => current || coursesData[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Формын мэдээллийг ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "TEACHER" || user?.role === "ADMIN") {
      void loadData();
      return;
    }

    setLoading(false);
  }, [user?.role]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!studentId || !courseId) {
      setError("Оюутан болон хичээлээ сонгоно уу.");
      return;
    }

    const parsedProgress = Number(progress);

    if (Number.isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
      setError("Ахиц 0-100 хооронд байна.");
      return;
    }

    setSubmitting(true);

    try {
      await api.createEnrollment({
        studentId,
        courseId,
        progress: parsedProgress,
      });
      setSuccess("Элсэлтийг амжилттай үүсгэлээ.");
      setTimeout(() => setSuccess(null), 3000);
      setProgress("0");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Элсэлт үүсгэх үед алдаа гарлаа.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader
        title="Оюутан Бүртгэх 📝"
        description="Оюутан болон хичээл сонгож шинэ элсэлт үүсгэнэ."
      />

      {user?.role !== "TEACHER" && user?.role !== "ADMIN" ? (
        <div className="paper p-5">
          <StatusMessage type="error" message="Энэ хэсэг зөвхөн багш болон админ эрхтэй хэрэглэгчид нээлттэй." />
        </div>
      ) : null}

      {(user?.role === "TEACHER" || user?.role === "ADMIN") && loading ? (
        <LoadingBlock label="Оюутан, хичээлийн мэдээлэл ачаалж байна..." />
      ) : null}

      {(!loading && (user?.role === "TEACHER" || user?.role === "ADMIN")) ? (
        <div className="paper p-5 sm:p-6">
          <h2 className="section-title text-xl font-bold text-white mb-4">Элсэлт Үүсгэх 🚀</h2>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="enroll-student" className="block text-sm font-bold text-slate-300">
                Оюутан
              </label>
              <select
                id="enroll-student"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="field"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.batch})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="enroll-course" className="block text-sm font-bold text-slate-300">
                Хичээл
              </label>
              <select
                id="enroll-course"
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                className="field"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2 sm:max-w-xs">
              <label htmlFor="enroll-progress" className="block text-sm font-bold text-slate-300">
                Эхний Ахиц (%)
              </label>
              <input
                id="enroll-progress"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => setProgress(event.target.value)}
                className="field"
              />
            </div>

            <div className="flex items-end sm:col-span-2">
              <button
                type="submit"
                disabled={submitting || students.length === 0 || courses.length === 0}
                className="btn-primary"
              >
                {submitting ? "Бүртгэж байна..." : "Оюутан Бүртгэх"}
              </button>
            </div>
          </form>

          {students.length === 0 || courses.length === 0 ? (
            <p className="muted-copy mt-4 text-sm">
              Бүртгэл хийхийн өмнө дор хаяж нэг оюутан, нэг хичээл байх шаардлагатай.
            </p>
          ) : null}

          <div className="mt-4 space-y-2">
            {error ? <StatusMessage type="error" message={error} /> : null}
            {success ? <StatusMessage type="success" message={success} /> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
