"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function AssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [gradingSub, setGradingSub] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [downloadErr, setDownloadErr] = useState<string | null>(null);
  const [gradeErr, setGradeErr] = useState<string | null>(null);

  const { data: assignments, error, isLoading } = useSWR(
    `/api/assignments/course/${id}`,
    () => api.getAssignmentsByCourse(id)
  );

  const { data: submissions, mutate: mutateSubmissions, isLoading: loadingSubs } = useSWR(
    selectedAssignment ? `/api/assignments/${selectedAssignment}/submissions` : null,
    () => selectedAssignment ? api.getSubmissions(selectedAssignment) : Promise.resolve([])
  );

  const handleDownload = async (submissionId: string, fileName: string) => {
    setDownloadErr(null);
    try {
      const blob = await api.downloadSubmission(submissionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadErr("Файл татахад алдаа гарлаа.");
    }
  };

  const submitGrade = async (submissionId: string) => {
    setGradeErr(null);
    try {
      await api.gradeSubmission(submissionId, score, feedback);
      setGradingSub(null);
      setScore(0);
      setFeedback("");
      mutateSubmissions();
    } catch (e: unknown) {
      setGradeErr(e instanceof Error ? e.message : "Үнэлгээ өгөхөд алдаа гарлаа.");
    }
  };

  if (user?.role !== "TEACHER") {
    return <div className="p-10"><StatusMessage type="error" message="Хандах эрхгүй байна." /></div>;
  }

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader
        title="Даалгавар шалгах"
        description="Оюутнуудын илгээсэн даалгаврыг шалгаж үнэлгээ өгөх."
      />

      {isLoading && <LoadingBlock label="Ачаалж байна..." />}
      {error && <StatusMessage type="error" message="Даалгаврыг ачаалж чадсангүй." />}
      {downloadErr && <StatusMessage type="error" message={downloadErr} />}

      {assignments && assignments.length === 0 && (
        <div className="paper p-6 muted-copy text-center">Энэ хичээлд даалгавар байхгүй байна.</div>
      )}

      {assignments && assignments.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="col-span-1 space-y-2">
            {assignments.map(a => (
              <button
                key={a.id}
                onClick={() => { setSelectedAssignment(a.id); setDownloadErr(null); setGradeErr(null); }}
                className={`w-full text-left p-4 rounded border transition-colors ${selectedAssignment === a.id ? "bg-slate-700 border-[var(--brand-blue)]" : "bg-slate-800 border-white/10 hover:bg-slate-700/50"}`}
              >
                <div className="font-bold text-white">{a.title}</div>
                <div className="text-xs text-slate-400 mt-1">Оноо: {a.maxScore}</div>
              </button>
            ))}
          </div>

          <div className="col-span-2 paper p-6">
            {!selectedAssignment ? (
               <div className="muted-copy text-center py-10">Жагсаалтаас даалгавар сонгоно уу</div>
            ) : loadingSubs ? (
               <LoadingBlock label="Илгээлтүүдийг ачаалж байна..." />
            ) : submissions?.length === 0 ? (
               <div className="muted-copy text-center py-10">Одоогоор илгээсэн даалгавар алга байна.</div>
            ) : (
              <div className="space-y-4">
                <h3 className="section-title text-lg font-bold border-b border-white/10 pb-2 mb-4">Илгээлтүүд</h3>
                {gradeErr && <StatusMessage type="error" message={gradeErr} />}
                {submissions?.map(sub => (
                  <div key={sub.id} className="bg-slate-900 border border-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-white">Оюутны ID: {sub.studentId}</div>
                        <div className="text-xs text-slate-400">Илгээсэн: {new Date(sub.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        {(sub.score ?? 0) > 0 ? (
                           <div className="badge badge--success">Оноо: {sub.score}</div>
                        ) : (
                           <div className="badge badge--accent">Шалгаагүй</div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(sub.id, sub.originalFileName)}
                      className="text-sm flex items-center gap-2 text-blue-400 hover:text-blue-300 underline mb-4"
                    >
                      {sub.originalFileName} татах
                    </button>

                    {gradingSub === sub.id ? (
                      <div className="bg-slate-800 p-4 rounded border border-slate-700 mt-2 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Оноо</label>
                          <input type="number" min={0} value={score} onChange={e => setScore(Number(e.target.value))} className="field w-32" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Санал хүсэлт (Сонголттой)</label>
                          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="field w-full" rows={2} />
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => submitGrade(sub.id)} className="btn-primary py-1 px-3 text-sm">Хадгалах</button>
                           <button onClick={() => { setGradingSub(null); setGradeErr(null); }} className="text-slate-400 text-sm hover:text-white px-2">Цуцлах</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setGradingSub(sub.id); setScore(sub.score ?? 0); setFeedback(sub.feedback || ""); }}
                        className="text-xs border border-slate-600 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-white transition-colors"
                      >
                        {(sub.score ?? 0) > 0 ? "Үнэлгээ засах" : "Үнэлгээ өгөх"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
