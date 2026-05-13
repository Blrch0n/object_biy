"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock } from "@/components/LoadingBlock";
import { StatusMessage } from "@/components/StatusMessage";
import { Submission } from "@/types";

export default function GradingPage({ params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const resolvedParams = use(params);
  const { assignmentId, id: courseId } = resolvedParams;
  const { user } = useAuth();

  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const { data: assignment, isLoading: loadingAssignment } = useSWR(
    `/api/assignments/${assignmentId}`,
    () => api.getAssignmentById(assignmentId)
  );

  const { data: submissions, mutate, isLoading: loadingSubs, error } = useSWR(
    `/api/assignments/${assignmentId}/submissions`,
    () => api.getSubmissions(assignmentId)
  );

  const handleDownload = async (submissionId: string, filename: string) => {
    try {
      const blob = await api.downloadSubmission(submissionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `submission-${submissionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Файл татахад алдаа гарлаа.");
    }
  };

  const handleGrade = async (subId: string) => {
    try {
      await api.gradeSubmission(subId, score, feedback);
      setActiveSub(null);
      setScore(0);
      setFeedback("");
      mutate();
    } catch (e: any) {
      alert("Алдаа: " + e.message);
    }
  };

  if (user?.role !== "TEACHER") {
    return <StatusMessage type="error" message="Хандах эрхгүй." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex gap-4 items-center">
        <button onClick={() => window.location.href = `/courses/${courseId}`} className="text-slate-400 hover:text-white underline">
          &larr; Буцах
        </button>
        <PageHeader title="Оюутнуудын даалгавар шалгах" description="Энэхүү хэсгээс оюутнуудын илгээсэн даалгавруудыг татаж аван шалгах боломжтой" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="paper p-6 bg-slate-800">
          <h2 className="font-bold text-xl mb-2 text-white">Даалгавар: {assignment?.title || "Ачаалж байна..."}</h2>
          <p className="text-sm text-slate-300">{assignment?.description}</p>
          <div className="mt-4 font-bold text-yellow-400">Цаг: {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleString() : ""}</div>
          <div className="font-bold text-green-400">Хамгийн их оноо: {assignment?.maxScore}</div>
        </div>

        <div className="col-span-2 paper p-6">
          <h2 className="font-bold text-xl mb-4 border-b border-white/10 pb-2">Илгээлтүүд</h2>
          
          {loadingSubs && <LoadingBlock label="Ачаалж байна..." />}
          {error && <StatusMessage type="error" message="Илгээлтүүдийг татахад алдаа гарлаа." />}
          
          {submissions?.length === 0 && <p className="text-slate-400 text-center py-4">Одоогоор илгээсэн даалгавар алга.</p>}
          
          <div className="space-y-4">
            {submissions?.map((sub: Submission) => (
              <div key={sub.id} className={`p-4 border-2 shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] rounded bg-slate-900 ${sub.score > 0 ? "border-green-500" : "border-slate-600"}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-lg">Оюутан: {sub.studentId}</span>
                    <div className="text-xs text-slate-400 mt-1">Огноо: {new Date(sub.submittedAt).toLocaleString()}</div>
                  </div>
                  <div>
                    {sub.score > 0 ? (
                      <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Оноо: {sub.score} / {assignment?.maxScore}</span>
                    ) : (
                      <span className="bg-yellow-600 text-black px-3 py-1 rounded text-sm font-bold">Шалгаагүй</span>
                    )}
                  </div>
                </div>
                
                <div className="my-4">
                  <button 
                    onClick={() => handleDownload(sub.id, sub.originalFileName || `submission-${sub.id}.pdf`)} 
                    className="text-blue-400 hover:text-white underline text-sm flex items-center gap-1"
                  >
                    {sub.originalFileName || "Файл татах"}
                  </button>
                </div>

                {activeSub === sub.id ? (
                  <div className="mt-4 p-4 border border-slate-600 bg-slate-800 rounded">
                    <div className="mb-3">
                      <label className="block text-sm font-bold mb-1">Өгөх оноо ({assignment?.maxScore} хүртэл)</label>
                      <input type="number" min="0" max={assignment?.maxScore} value={score} onChange={e => setScore(Number(e.target.value))} className="field w-full" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-1">Сэтгэгдэл / Буцаах хариу</label>
                      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="field w-full" rows={3}></textarea>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleGrade(sub.id)} className="btn-primary py-1 px-4 text-sm">Хадгалах</button>
                      <button onClick={() => setActiveSub(null)} className="btn-secondary py-1 px-4 text-sm bg-slate-600">Цуцлах</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveSub(sub.id); setScore(sub.score || 0); setFeedback(sub.feedback || ""); }}
                    className="btn-secondary py-1 px-4 text-sm mt-2"
                  >
                    {sub.score > 0 ? "Үнэлгээ засах" : "Үнэлгээ өгөх"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}