"use client";

import { Lesson } from "@/types";

interface LessonListProps {
  lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
  return (
    <div className="paper p-6 bg-slate-800">
      <h2 className="section-title text-2xl font-bold text-white mb-4">Хичээлүүд</h2>
      <div className="space-y-3">
        {lessons.length === 0 && (
          <p className="text-slate-400">Одоогоор хичээл алга байна.</p>
        )}
        {lessons.map((lesson, index) => (
          <div key={index} className="p-4 border-2 border-white bg-slate-700 text-white shadow-[4px_4px_0_0_#fff]">
            <h3 className="font-bold text-lg">{index + 1}. {lesson.title}</h3>
            <p className="mt-1 text-sm text-slate-300">
              ⏱ Үргэлжлэх хугацаа: {lesson.durationMinutes} минут
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
