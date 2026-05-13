"use client";

import { useState } from "react";
import useSWR from "swr";
import { Comment, ResourceType } from "@/types";
import { getComments, createComment, deleteComment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type CommentSectionProps = {
  resourceId: string;
  resourceType: ResourceType;
};

export default function CommentSection({ resourceId, resourceType }: CommentSectionProps) {
  const { user } = useAuth();
  const { data: comments, mutate } = useSWR<Comment[]>(
    `/api/comments-${resourceId}`,
    () => getComments(resourceId, resourceType)
  );

  const [newText, setNewText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  if (!comments) return <div className="text-gray-500">Loading comments...</div>;

  const rootComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentCommentId === parentId);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      await createComment({
        resourceId,
        resourceType,
        text: newText,
        parentCommentId: parentId || undefined
      });
      setNewText("");
      setReplyTo(null);
      mutate(); // refresh
    } catch (err) {
      alert("Failed to add comment.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteComment(id);
      mutate();
    } catch (err) {
      alert("Failed to delete comment.");
    }
  };

  const canDelete = (c: Comment) => user?.id === c.userId || user?.role === "TEACHER" || user?.role === "ADMIN";

  const renderComment = (c: Comment, depth = 0) => {
    const replies = getReplies(c.id);
    return (
      <div key={c.id} className={`flex flex-col mb-4 ${depth > 0 ? "ml-8 border-l-2 pl-4 border-gray-200" : ""}`}>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">{c.authorName} <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded text-gray-600">{c.authorRole}</span></span>
              <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            {canDelete(c) && (
              <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
            )}
          </div>
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{c.text}</p>
          
          <button 
            onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
            className="text-sm text-blue-600 hover:underline"
          >
            Reply
          </button>
        </div>

        {replyTo === c.id && (
          <form onSubmit={(e) => handleSubmit(e, c.id)} className="mt-3 ml-8">
            <textarea
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Write a reply..."
              rows={2}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              required
            />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">Post Reply</button>
              <button type="button" onClick={() => setReplyTo(null)} className="bg-gray-200 px-3 py-1 text-sm rounded hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        )}

        {replies.length > 0 && <div className="mt-4">{replies.map(r => renderComment(r, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div className="my-8">
      <h3 className="text-xl font-bold mb-4">Discussion ({comments.length})</h3>
      
      {/* Root input */}
      <form onSubmit={(e) => handleSubmit(e, null)} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <textarea
          className="w-full border rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ask a question or share your thoughts..."
          rows={3}
          value={replyTo === null ? newText : ""}
          onChange={(e) => {
            if (replyTo !== null) {
              setReplyTo(null);
            }
            setNewText(e.target.value);
          }}
          required
        />
        <div className="mt-2 flex justify-end">
          <button type="submit" disabled={replyTo !== null && !newText.trim()} className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 disabled:opacity-50">Post Comment</button>
        </div>
      </form>

      <div className="space-y-4 border-t pt-4">
        {rootComments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to start the discussion!</p>
        ) : (
          rootComments.map(c => renderComment(c, 0))
        )}
      </div>
    </div>
  );
}
