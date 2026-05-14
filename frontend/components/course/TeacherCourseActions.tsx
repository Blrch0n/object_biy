"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface TeacherCourseActionsProps {
  courseId: string;
  onCourseMutate: () => void;
  onAssignmentMutate: () => void;
  onQuizMutate: () => void;
}

export function TeacherCourseActions({
  courseId,
  onCourseMutate,
  onAssignmentMutate,
  onQuizMutate,
}: TeacherCourseActionsProps) {
  const [showLesson, setShowLesson] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [lessonData, setLessonData] = useState({ title: "", durationMinutes: 10 });
  const [assignmentData, setAssignmentData] = useState({ title: "", description: "", maxScore: 100, dueDate: "" });
  const [quizData, setQuizData] = useState({ title: "", maxScore: 100, passingScore: 60 });

  const [lessonErr, setLessonErr] = useState<string | null>(null);
  const [assignmentErr, setAssignmentErr] = useState<string | null>(null);
  const [quizErr, setQuizErr] = useState<string | null>(null);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault(); setLessonErr(null);
    try {
      await api.addLesson(courseId, lessonData);
      setShowLesson(false);
      setLessonData({ title: "", durationMinutes: 10 });
      onCourseMutate();
    } catch (err: unknown) { setLessonErr(err instanceof Error ? err.message : "Алдаа гарлаа"); }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault(); setAssignmentErr(null);
    try {
      await api.createAssignment({ courseId, ...assignmentData });
      setShowAssignment(false);
      setAssignmentData({ title: "", description: "", maxScore: 100, dueDate: "" });
      onAssignmentMutate();
    } catch (err: unknown) { setAssignmentErr(err instanceof Error ? err.message : "Алдаа гарлаа"); }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault(); setQuizErr(null);
    try {
      await api.createQuiz({ courseId, ...quizData });
      setShowQuiz(false);
      setQuizData({ title: "", maxScore: 100, passingScore: 60 });
      onQuizMutate();
    } catch (err: unknown) { setQuizErr(err instanceof Error ? err.message : "Алдаа гарлаа"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button onClick={() => { setShowLesson(!showLesson); setShowAssignment(false); setShowQuiz(false); setLessonErr(null); }} className="btn-secondary">
          {showLesson ? "Цуцлах" : "+ Хичээл нэмэх"}
        </button>
        <button onClick={() => { setShowAssignment(!showAssignment); setShowLesson(false); setShowQuiz(false); setAssignmentErr(null); }} className="btn-secondary">
          {showAssignment ? "Цуцлах" : "+ Даалгавар нэмэх"}
        </button>
        <button onClick={() => { setShowQuiz(!showQuiz); setShowLesson(false); setShowAssignment(false); setQuizErr(null); }} className="btn-secondary">
          {showQuiz ? "Цуцлах" : "+ Сорил нэмэх"}
        </button>
      </div>

      {showLesson && (
        <form onSubmit={handleAddLesson} className="paper p-4 space-y-4 bg-white text-black">
          <h3 className="font-bold text-xl">Шинэ хичээл нэмэх</h3>
          {lessonErr && <p className="text-sm text-[var(--brand-red)] font-bold">{lessonErr}</p>}
          <div>
            <label className="block text-sm font-bold mb-1">Гарчиг</label>
            <input required type="text" className="field w-full" value={lessonData.title}
              onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Үргэлжлэх хугацаа (минут)</label>
            <input required type="number" min="1" className="field w-full" value={lessonData.durationMinutes}
              onChange={(e) => setLessonData({ ...lessonData, durationMinutes: Number(e.target.value) })} />
          </div>
          <button type="submit" className="btn-primary">Хадгалах</button>
        </form>
      )}

      {showAssignment && (
        <form onSubmit={handleAddAssignment} className="paper p-4 space-y-4 bg-white text-black">
          <h3 className="font-bold text-xl">Шинэ даалгавар нэмэх</h3>
          {assignmentErr && <p className="text-sm text-[var(--brand-red)] font-bold">{assignmentErr}</p>}
          <div>
            <label className="block text-sm font-bold mb-1">Гарчиг</label>
            <input required type="text" className="field w-full" value={assignmentData.title}
              onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Тайлбар</label>
            <textarea required className="field w-full" value={assignmentData.description}
              onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Дээд оноо</label>
              <input required type="number" min="0" className="field w-full" value={assignmentData.maxScore}
                onChange={(e) => setAssignmentData({ ...assignmentData, maxScore: Number(e.target.value) })} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Эцсийн хугацаа</label>
              <input required type="datetime-local" className="field w-full" value={assignmentData.dueDate}
                onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Хадгалах</button>
        </form>
      )}

      {showQuiz && (
        <form onSubmit={handleAddQuiz} className="paper p-4 space-y-4 bg-white text-black">
          <h3 className="font-bold text-xl">Шинэ сорил нэмэх</h3>
          {quizErr && <p className="text-sm text-[var(--brand-red)] font-bold">{quizErr}</p>}
          <div>
            <label className="block text-sm font-bold mb-1">Гарчиг</label>
            <input required type="text" className="field w-full" value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Оноо</label>
              <input required type="number" min="0" className="field w-full" value={quizData.maxScore}
                onChange={(e) => setQuizData({ ...quizData, maxScore: Number(e.target.value) })} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Тэнцэх оноо</label>
              <input required type="number" min="0" className="field w-full" value={quizData.passingScore}
                onChange={(e) => setQuizData({ ...quizData, passingScore: Number(e.target.value) })} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Хадгалах</button>
        </form>
      )}
    </div>
  );
}
