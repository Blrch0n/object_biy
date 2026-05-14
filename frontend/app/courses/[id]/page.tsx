"use client";

import { use } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CourseHeader } from "@/components/course/CourseHeader";
import { LessonList } from "@/components/course/LessonList";
import { AssignmentPanel } from "@/components/course/AssignmentPanel";
import { QuizPanel } from "@/components/course/QuizPanel";
import { TeacherCourseActions } from "@/components/course/TeacherCourseActions";
import { CourseDiscussion } from "@/components/course/CourseDiscussion";

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user } = useAuth();

  const { data: course, mutate: mutateCourse } = useSWR(
    `/api/courses/${courseId}`,
    () => api.getCourse(courseId)
  );
  const { data: assignments, mutate: mutateAssignments } = useSWR(
    `/api/assignments/course/${courseId}`,
    () => api.getAssignmentsByCourse(courseId)
  );
  const { data: quizzes, mutate: mutateQuizzes } = useSWR(
    `/api/quizzes/course/${courseId}`,
    () => api.getQuizzesByCourse(courseId)
  );

  if (!course) {
    return <div className="p-10 text-center font-bold">Ачаалж байна...</div>;
  }

  const role = user?.role ?? "STUDENT";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Course Header */}
      <CourseHeader course={course} />

      {/* Teacher management actions */}
      {role === "TEACHER" && (
        <TeacherCourseActions
          courseId={courseId}
          onCourseMutate={mutateCourse}
          onAssignmentMutate={mutateAssignments}
          onQuizMutate={mutateQuizzes}
        />
      )}

      {/* Lessons */}
      <LessonList lessons={course.lessons ?? []} />

      {/* Assignments */}
      <AssignmentPanel
        assignments={assignments ?? []}
        courseId={courseId}
        role={role as "STUDENT" | "TEACHER" | "ADMIN"}
        onMutate={mutateAssignments}
      />

      {/* Quizzes */}
      <QuizPanel
        quizzes={quizzes ?? []}
        courseId={courseId}
        role={role as "STUDENT" | "TEACHER" | "ADMIN"}
      />

      {/* Discussion */}
      <CourseDiscussion courseId={courseId} />
    </motion.div>
  );
}
