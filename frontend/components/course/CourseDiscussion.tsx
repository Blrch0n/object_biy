"use client";

import CommentSection from "@/components/comments/CommentSection";

interface CourseDiscussionProps {
  courseId: string;
}

export function CourseDiscussion({ courseId }: CourseDiscussionProps) {
  return (
    <div className="mt-4 bg-white/10 p-6 shadow-[4px_4px_0_0_#000] border-2 border-black rounded-xl">
      <CommentSection resourceId={courseId} resourceType="COURSE" />
    </div>
  );
}
