"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { triggerConfetti } from "@/lib/gamification";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/comments/CommentSection";

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user } = useAuth();

  const { data: assignments, mutate: mutateAssignments } = useSWR(`/api/assignments/course/${courseId}`, () => api.getAssignmentsByCourse(courseId));
  const { data: quizzes, mutate: mutateQuizzes } = useSWR(`/api/quizzes/course/${courseId}`, () => api.getQuizzesByCourse(courseId));
  const { data: course, mutate: mutateCourse } = useSWR(`/api/courses/${courseId}`, () => api.getCourse(courseId));

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Teacher UI state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonData, setLessonData] = useState<{ title: string; durationMinutes: number }>({ title: "", durationMinutes: 10 });
  
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentData, setAssignmentData] = useState<{ title: string; description: string; maxScore: number; dueDate: string }>({ title: "", description: "", maxScore: 100, dueDate: "" });

  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizData, setQuizData] = useState<{ title: string; maxScore: number; passingScore: number }>({ title: "", maxScore: 100, passingScore: 60 });


  const handleUpload = async (assignmentId: string) => {
    if (!file) return;
    setUploading(true);
    try {
      await api.submitAssignment(assignmentId, file);
      triggerConfetti();
      alert("Даалгавар амжилттай илгээгдлээ!");
      setFile(null);
    } catch {
      alert("Даалгавар илгээхэд алдаа гарлаа.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addLesson(courseId, lessonData);
      setShowLessonForm(false);
      setLessonData({ title: "", durationMinutes: 10 });
      mutateCourse();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAssignment({ courseId, ...assignmentData });
      setShowAssignmentForm(false);
      setAssignmentData({ title: "", description: "", maxScore: 100, dueDate: "" });
      mutateAssignments();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createQuiz({ courseId, ...quizData });
      setShowQuizForm(false);
      setQuizData({ title: "", maxScore: 100, passingScore: 60 });
      mutateQuizzes();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!course) return <div className="p-10 text-white">Ачаалж байна...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="paper p-8 bg-[var(--brand-yellow)] text-black">
        <h1 className="text-4xl font-black uppercase tracking-tight">{course.title}</h1>
        <p className="mt-2 text-lg font-bold">{course.description}</p>
      </div>

      {user?.role === "TEACHER" && (
        <div className="flex gap-4">
          <button onClick={() => setShowLessonForm(!showLessonForm)} className="btn-secondary">
            {showLessonForm ? "Цуцлах" : "+ Хичээл нэмэх"}
          </button>
          <button onClick={() => setShowAssignmentForm(!showAssignmentForm)} className="btn-secondary">
            {showAssignmentForm ? "Цуцлах" : "+ Даалгавар нэмэх"}
          </button>
          <button onClick={() => setShowQuizForm(!showQuizForm)} className="btn-secondary">
            {showQuizForm ? "Цуцлах" : "+ Сорил нэмэх"}
          </button>
        </div>
      )}

      {showLessonForm && (
        <form onSubmit={handleAddLesson} className="paper p-4 space-y-4 bg-white text-black">
          <h3 className="font-bold text-xl">Шинэ хичээл нэмэх</h3>
          <div>
            <label className="block text-sm font-bold">Гарчиг</label>
            <input required type="text" className="field w-full border-black" value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold">Үргэлжлэх хугацаа (Минутаар)</label>
            <input required type="number" min="1" className="field w-full border-black" value={lessonData.durationMinutes} onChange={e => setLessonData({...lessonData, durationMinutes: Number(e.target.value)})} />
          </div>
          <button type="submit" className="btn-primary">Хадгалах</button>
        </form>
      )}

      {showAssignmentForm && (
        <form onSubmit={handleAddAssignment} className="paper p-4 space-y-4 bg-white text-black">
          <h3 className="font-bold text-xl">Шинэ даалгавар нэмэх</h3>
          <div>
            <label className="block text-sm font-bold">Гарчиг</label>
            <input required type="text" className="field w-full border-black" value={assignmentData.title} onChange={e => setAssignmentData({...assignmentData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold">Тайлбар</label>
            <textarea required className="field w-full border-black" value={assignmentData.description} onChange={e => setAssignmentData({...assignmentData, description: e.target.value})} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold">Дээд оноо</label>
              <input required type="number" min="0" className="field w-full border-black" value={assignmentData.maxScore} onChange={e => setAssignmentData({...assignmentData, maxScore: Number(e.target.value)})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold">Эцсийн хугацаа</label>
              <input required type="datetime-local" className="field w-full border-black" value={assignmentData.dueDate} onChange={e => setAssignmentData({...assignmentData, dueDate: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Хадгалах</button>
        </form>
      )}

      {showQuizForm && (
        <form onSubmit={handleAddQuiz} className="paper p-4 space-y-4 bg-white text-black">
          <h3 className="font-bold text-xl">Шинэ Сорил нэмэх</h3>
          <div>
            <label className="block text-sm font-bold">Гарчиг</label>
            <input required type="text" className="field w-full border-black" value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold">Оноо</label>
              <input required type="number" min="0" className="field w-full border-black" value={quizData.maxScore} onChange={e => setQuizData({...quizData, maxScore: Number(e.target.value)})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold">Тэнцэх оноо</label>
              <input required type="number" min="0" className="field w-full border-black" value={quizData.passingScore} onChange={e => setQuizData({...quizData, passingScore: Number(e.target.value)})} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Хадгалах</button>
        </form>
      )}

      {/* Lessons Section */}
      <div className="paper p-6 bg-slate-800">
        <h2 className="section-title text-2xl font-bold text-white mb-4">Хичээлүүд</h2>
        <div className="space-y-4">
          {course?.lessons?.length === 0 && <p className="text-slate-400">Одоогоор хичээл алга байна.</p>}
          {course?.lessons?.map((lesson, index) => (
            <div key={index} className="p-4 border-2 border-white bg-slate-700 text-white shadow-[4px_4px_0_0_#fff]">
              <h3 className="font-bold text-xl">{index + 1}. {lesson.title}</h3>
              <p className="mt-2 text-sm text-slate-300">Үргэлжлэх хугацаа: {lesson.durationMinutes} минут</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments Section */}
      <div className="paper p-6">
        <h2 className="section-title text-2xl font-bold text-white mb-4">Даалгаврууд</h2>
        <div className="space-y-4">
          {assignments?.length === 0 && <p className="text-slate-400">Одоогоор даалгавар алга байна.</p>}
          {assignments?.map((assignment) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={assignment.id}
              className="p-4 border-2 border-black bg-[var(--brand-cyan)] text-black shadow-[4px_4px_0_0_#000]"
            >
              <h3 className="font-bold text-xl">{assignment.title}</h3>
              <p>{assignment.description}</p>
              <div className="mt-4 flex flex-col gap-2">
                {user?.role === "STUDENT" && (
                  <div className="flex gap-2 items-center">
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-white p-1 border-2 border-black" />
                    <button
                      disabled={uploading || !file}
                      onClick={() => handleUpload(assignment.id)}
                      className="btn-primary py-1 px-4 text-sm"
                    >
                      {uploading ? "Илгээж байна..." : "PDF илгээх"}
                    </button>
                  </div>
                )}
                {user?.role === "TEACHER" && (
                  <button onClick={() => window.location.href = `/courses/${courseId}/assignments/${assignment.id}/grade`} className="btn-secondary py-1 px-4 w-max">
                    Даалгавар дүгнэх
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="paper p-6">
        <h2 className="section-title text-2xl font-bold text-white mb-4">Шалгалт & Сорил</h2>
        <div className="space-y-4">
          {quizzes?.length === 0 && <p className="text-slate-400">Одоогоор сорил алга байна.</p>}
          {quizzes?.map((quiz) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={quiz.id}
              className="p-4 border-2 border-black bg-[var(--brand-magenta)] text-white shadow-[4px_4px_0_0_#000]"
            >
              <h3 className="font-bold text-xl">{quiz.title}</h3>
              <p>{quiz.questions?.length || 0} Асуулттай</p>
              <div className="mt-4">
                {user?.role === "STUDENT" && (
                  <button onClick={() => window.location.href = `/courses/${courseId}/quizzes/${quiz.id}/take`} className="btn-primary bg-yellow-400 text-black py-1 px-4">
                    Сорил өгөх
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="mt-12 bg-white/10 p-6 shadow-[4px_4px_0_0_#000] border-2 border-black rounded-xl">
        <CommentSection resourceId={courseId} resourceType="COURSE" />
      </div>
    </motion.div>
  );
}
