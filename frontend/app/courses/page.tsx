"use client";

import { useState, FormEvent } from "react";
import useSWR from "swr";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CourseForm } from "@/components/forms/CourseForm";
import { Pagination } from "@/components/Pagination";

export default function CoursesPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; durationMinutes: string }>>({});
  const [submittingLessonFor, setSubmittingLessonFor] = useState<string | null>(null);

  // Fetch courses with pagination
  const { data: coursesData, error: coursesError, mutate: mutateCourses, isLoading: loadingCourses } = useSWR(
    `/api/courses?page=${page}&level=${filterLevel === "ALL" ? "" : filterLevel}`,
    () => api.getCourses(page, 10, filterLevel === "ALL" ? undefined : filterLevel)
  );

  // Fetch instructors for displaying names instead of IDs
  const { data: instructorsData } = useSWR(
    "/api/instructors?size=100", 
    () => api.getInstructors(0, 100)
  );
  const instructors = instructorsData?.content || [];

  const courses = coursesData?.content || [];

  const levels = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"]; // Predefined for simplicity since we paginate

  async function onDeleteCourse(courseId: string) {
    if (!window.confirm("Энэ хичээлийг устгахдаа итгэлтэй байна уу?")) return;
    try {
      await api.deleteCourse(courseId);
      mutateCourses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Хичээл устгах үед алдаа гарлаа.");
    }
  }

  async function onAddLesson(courseId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lesson = lessonForms[courseId] ?? { title: "", durationMinutes: "" };
    const title = lesson.title.trim();
    const durationMinutes = Number(lesson.durationMinutes);

    if (!title || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      alert("Сэдвийн нэр болон зөв хугацаа оруулна уу.");
      return;
    }

    setSubmittingLessonFor(courseId);
    try {
      await api.addLesson(courseId, { title, durationMinutes });
      setLessonForms((prev) => ({ ...prev, [courseId]: { title: "", durationMinutes: "" } }));
      mutateCourses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Сэдэв нэмэх үед алдаа гарлаа.");
    } finally {
      setSubmittingLessonFor(null);
    }
  }

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader title="Хичээлүүд 📚" description="Хичээлүүдийг харах, багш эрхтэй хэрэглэгч нэмэлт удирдлага хийнэ." />

      <div className="paper p-5">
        <div className="sm:max-w-xs space-y-1">
          <label htmlFor="filter-level" className="block text-sm font-bold text-slate-300">Түвшнээр шүүх 🔍</label>
          <select
            id="filter-level"
            value={filterLevel}
            onChange={(event) => { setFilterLevel(event.target.value); setPage(0); }}
            className="field"
          >
            {levels.map((level) => (
              <option key={level} value={level}>{level === "ALL" ? "Бүгд" : level}</option>
            ))}
          </select>
        </div>
      </div>

      {user?.role === "TEACHER" && (
        <div className="relative">
           {editingCourse && (
             <button 
                onClick={() => setEditingCourse(null)}
                className="absolute right-4 top-4 text-sm text-slate-400 hover:text-white"
             >
                Цуцлах ✕
             </button>
           )}
           <CourseForm 
             onSuccess={() => { mutateCourses(); setEditingCourse(null); }} 
             initialData={editingCourse}
             courseId={editingCourse?.id}
           />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="section-title text-lg font-semibold">
          Хичээлийн Жагсаалт
          {coursesData ? <span className="ml-2 badge badge--neutral">{coursesData.totalElements}</span> : null}
        </h2>
        
        {loadingCourses && <LoadingBlock label="Хичээлүүдийг ачаалж байна..." />}
        {coursesError && <StatusMessage type="error" message="Хичээл татахад алдаа гарлаа." />}
        
        {!loadingCourses && courses.length === 0 && (
          <div className="paper muted-copy p-5 text-sm">Одоогоор хичээл бүртгэгдээгүй байна.</div>
        )}

        {!loadingCourses && courses.map((course) => {
          const lessonForm = lessonForms[course.id] ?? { title: "", durationMinutes: "" };
          const instructor = instructors.find((item) => item.id === course.instructorId);

          return (
            <article key={course.id} className="paper p-5 sm:p-6 relative group">
              {user?.role === "TEACHER" && (
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button 
                    onClick={() => { setEditingCourse(course); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline px-2 py-1 bg-slate-800 rounded border border-slate-600"
                  >
                    Засах
                  </button>
                  <button 
                    onClick={() => onDeleteCourse(course.id)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline px-2 py-1 bg-slate-800 rounded border border-slate-600"
                  >
                    Устгах
                  </button>
                  <a 
                    href={`/courses/${course.id}/assignments`}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline px-2 py-1 bg-slate-800 rounded border border-slate-600"
                  >
                    Даалгавар шалгах
                  </a>
                </div>
              )}
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="section-title text-xl font-bold text-white">{course.title}</h3>
                <span className="badge badge--neutral">{course.lessons.length} сэдэв</span>
              </div>
              <p className="muted-copy mt-2 text-sm leading-relaxed">{course.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span className="badge badge--accent">{course.level}</span>
                <span className="text-slate-300"><span className="font-bold text-white">Үнэ:</span> ${course.price.toFixed(2)}</span>
                <span className="text-slate-300"><span className="font-bold text-white">Багш:</span> {instructor?.fullName ?? course.instructorId}</span>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-bold text-white">Сэдвүүд 📖</h4>
                {course.lessons.length === 0 ? (
                  <p className="muted-copy mt-2 text-sm">Сэдэв нэмэгдээгүй байна.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {course.lessons.map((lesson, index) => (
                      <li key={`${course.id}-${index}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm border border-white/10 hover:bg-white/10 transition-colors">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue)] text-[0.65rem] font-bold text-white border-2 border-black">{index + 1}</span>
                        <span className="flex-1 text-slate-200">{lesson.title}</span>
                        <span className="text-xs text-slate-400">{lesson.durationMinutes} мин</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {user?.role === "TEACHER" && (
                <div className="mt-4 border-t border-amber-900/10 pt-4">
                  <form onSubmit={(event) => void onAddLesson(course.id, event)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1">
                      <label className="block text-xs font-bold text-slate-400">Сэдвийн нэр</label>
                      <input type="text" placeholder="Шинэ сэдэв..." value={lessonForm.title} onChange={(e) => setLessonForms((prev) => ({ ...prev, [course.id]: { ...lessonForm, title: e.target.value } }))} className="field" />
                    </div>
                    <div className="w-full sm:w-32 space-y-1">
                      <label className="block text-xs font-bold text-slate-400">Хугацаа (мин)</label>
                      <input type="number" min={1} placeholder="45" value={lessonForm.durationMinutes} onChange={(e) => setLessonForms((prev) => ({ ...prev, [course.id]: { ...lessonForm, durationMinutes: e.target.value } }))} className="field" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={submittingLessonFor === course.id} className="btn-secondary">{submittingLessonFor === course.id ? "..." : "Сэдэв Нэмэх"}</button>
                      <button type="button" className="btn-danger" onClick={() => void onDeleteCourse(course.id)}>Устгах</button>
                    </div>
                  </form>
                </div>
              )}
            </article>
          );
        })}
        
        {coursesData && (
          <Pagination pageNo={coursesData.pageNo} totalPages={coursesData.totalPages} onPageChange={(p) => setPage(p)} />
        )}
      </div>
    </section>
  );
}
