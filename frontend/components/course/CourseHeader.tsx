"use client";

import { Course } from "@/types";

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="paper p-8 bg-[var(--brand-yellow)] text-black">
      <p className="badge badge--neutral mb-3">{course.level}</p>
      <h1 className="text-4xl font-black uppercase tracking-tight">{course.title}</h1>
      <p className="mt-2 text-lg font-bold">{course.description}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
        <span className="inline-block border-2 border-black bg-white px-3 py-1 rounded-sm">
           {course.price > 0 ? `${course.price.toLocaleString()}₮` : "Үнэгүй"}
        </span>
        <span className="inline-block border-2 border-black bg-white px-3 py-1 rounded-sm">
           {course.lessons?.length ?? 0} хичээл
        </span>
      </div>
    </div>
  );
}
