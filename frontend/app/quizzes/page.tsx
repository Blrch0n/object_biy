"use client";

import useSWR from "swr";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { LoadingBlock } from "@/components/LoadingBlock";

export default function GlobalQuizzesPage() {
  const { data: coursesData, isLoading } = useSWR(`/api/courses?page=0`, () => api.getCourses(0, 100));
  const courses = coursesData?.content || [];

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader title="Шалгалтууд" description="Хичээлээ сонгож шалгалт өгнө үү." />
      {isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <div className="paper p-5 hover:-translate-y-1 hover:shadow-lg transition-transform cursor-pointer h-full">
                <h3 className="font-bold text-lg text-[var(--brand-yellow)]">{course.title}</h3>
                <p className="text-sm opacity-80 mt-2">Энэ хичээлийн шалгалтыг өгөх болон харах</p>
              </div>
            </Link>
          ))}
          {courses.length === 0 && (
             <div className="col-span-full paper p-5 text-center opacity-70">
                Хичээл олдсонгүй
             </div>
          )}
        </div>
      )}
    </section>
  );
}
