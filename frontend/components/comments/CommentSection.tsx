"use client";

import { useState } from "react";
import useSWR from "swr";
import { Comment, ResourceType } from "@/types";
import { getComments, createComment, deleteComment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingBlock } from "@/components/LoadingBlock";
import { StatusMessage } from "@/components/StatusMessage";

type CommentSectionProps = {
  resourceId: string;
  resourceType: ResourceType;
};

export default function CommentSection({ resourceId, resourceType }: CommentSectionProps) {
  const { user } = useAuth();
  const { data: comments, mutate, isLoading } = useSWR<Comment[]>(
    `/api/comments-${resourceId}`,
    () => getComments(resourceId, resourceType)
  );

  const [newText, setNewText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const rootComments = (comments ?? []).filter((c) => !c.parentCommentId);
  const getReplies = (parentId: string) => (comments ?? []).filter((c) => c.parentCommentId === parentId);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const text = parentId ? replyText : newText;
    if (!text.trim()) return;
    setSubmitErr(null);
    setSubmitting(true);
    try {
      await createComment({ resourceId, resourceType, text, parentCommentId: parentId || undefined });
      if (parentId) { setReplyText(""); setReplyTo(null); }
      else { setNewText(""); }
      mutate();
    } catch (err) {
      setSubmitErr(err instanceof Error ? err.message : "Сэтгэгдэл нэмэхэд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteErr(null);
    try {
      await deleteComment(id);
      mutate();
    } catch (err) {
      setDeleteErr(err instanceof Error ? err.message : "Устгахад алдаа гарлаа.");
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (c: Comment) =>
    user?.id === c.userId || user?.role === "TEACHER" || user?.role === "ADMIN";

  const renderComment = (c: Comment, depth = 0) => {
    const replies = getReplies(c.id);
    const isDeleting = deletingId === c.id;

    return (
      <div key={c.id} className={`flex flex-col ${depth > 0 ? "ml-6 pl-4 border-l-2 border-black/20" : ""}`}>
        <div className="paper p-4 bg-slate-800 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="font-bold text-sm text-white">{c.authorName}</span>
              <span className="ml-2 badge badge--neutral text-xs">{c.authorRole === "TEACHER" ? "Багш" : c.authorRole === "ADMIN" ? "Админ" : "Сурагч"}</span>
              <p className="text-xs text-slate-400 mt-0.5">{new Date(c.createdAt).toLocaleString("mn-MN")}</p>
            </div>
            {canDelete(c) && (
              <button
                onClick={() => handleDelete(c.id)}
                disabled={isDeleting}
                className="text-xs text-[var(--brand-red)] hover:underline font-bold flex-shrink-0 disabled:opacity-50"
              >
                {isDeleting ? "..." : "Устгах"}
              </button>
            )}
          </div>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{c.text}</p>
          {depth < 3 && (
            <button
              onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(""); setSubmitErr(null); }}
              className="text-xs text-[var(--brand-blue)] hover:underline font-bold"
            >
              {replyTo === c.id ? "Цуцлах" : "↩ Хариулах"}
            </button>
          )}
        </div>

        {replyTo === c.id && (
          <form onSubmit={(e) => handleSubmit(e, c.id)} className="mt-2 ml-4 space-y-2">
            <textarea
              className="field w-full text-sm"
              placeholder="Хариулт бичих..."
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary py-1 px-3 text-xs">
                {submitting ? "Илгээж байна..." : "Илгээх"}
              </button>
              <button type="button" onClick={() => { setReplyTo(null); setReplyText(""); }} className="btn-secondary py-1 px-3 text-xs">
                Цуцлах
              </button>
            </div>
          </form>
        )}

        {replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map(r => renderComment(r, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="section-title text-xl"> Хэлэлцүүлэг ({comments?.length ?? 0})</h3>

      {deleteErr && <StatusMessage type="error" message={deleteErr} />}

      {/* New comment form */}
      <form onSubmit={(e) => handleSubmit(e, null)} className="paper p-4 space-y-3">
        <textarea
          className="field w-full text-sm"
          placeholder="Асуулт асуух эсвэл санаа хуваалцах..."
          rows={3}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          required
        />
        {submitErr && <StatusMessage type="error" message={submitErr} />}
        <div className="flex justify-end">
          <button type="submit" disabled={submitting || !newText.trim()} className="btn-primary text-sm disabled:opacity-50">
            {submitting ? "Илгээж байна..." : "Сэтгэгдэл нэмэх"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {isLoading ? (
          <LoadingBlock label="Сэтгэгдлүүд ачаалж байна..." />
        ) : rootComments.length === 0 ? (
          <div className="paper p-6 text-center">
            <p className="text-2xl mb-2"></p>
            <p className="font-bold text-sm">Одоогоор сэтгэгдэл байхгүй байна. Эхний сэтгэгдлийг үлдээгээрэй!</p>
          </div>
        ) : (
          rootComments.map(c => renderComment(c, 0))
        )}
      </div>
    </div>
  );
}
