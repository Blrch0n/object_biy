"use client";

import { useState } from "react";
import useSWR from "swr";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { StudentForm } from "@/components/forms/StudentForm";
import { StudentTable } from "@/components/tables/StudentTable";
import { Pagination } from "@/components/Pagination";

export default function StudentsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  const { data, error, mutate, isLoading } = useSWR(
    user?.role === "ADMIN" ? `/api/students?page=${page}` : null,
    () => api.getStudents(page, 10)
  );

  const onDeleteStudent = async (id: string) => {
    if (!window.confirm("Энэ оюутныг устгахдаа итгэлтэй байна уу?")) return;
    try {
      await api.deleteStudent(id);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Оюутан устгах үед алдаа гарлаа.");
    }
  };

  const onEditStudent = (student: any) => {
    setEditingStudent(student);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <PageHeader
        title="Оюутнууд 👨‍🎓"
        description="Оюутны бүртгэлийг удирдаж, шинэ оюутан нэмнэ."
      />

      {user?.role !== "ADMIN" ? (
        <div className="paper p-5">
          <StatusMessage type="error" message="Энэ хэсэг зөвхөн админ эрхтэй хэрэглэгчид нээлттэй." />
        </div>
      ) : null}

      {user?.role === "ADMIN" && (
        <div className="relative">
           {editingStudent && (
             <button 
                onClick={() => setEditingStudent(null)}
                className="absolute right-4 top-4 text-sm text-slate-400 hover:text-white"
             >
                Цуцлах ✕
             </button>
           )}
           <StudentForm 
             onSuccess={() => { mutate(); setEditingStudent(null); }} 
             initialData={editingStudent}
             studentId={editingStudent?.id}
           />
        </div>
      )}

      {user?.role === "ADMIN" && (
        <div className="paper p-5 sm:p-6">
          <h2 className="section-title text-xl font-bold text-white">
            Оюутны Жагсаалт
            {data ? (
              <span className="ml-2 badge badge--neutral">{data.totalElements}</span>
            ) : null}
          </h2>
          
          {isLoading && <LoadingBlock label="Оюутнуудыг ачаалж байна..." />}
          {error && <StatusMessage type="error" message="Мэдээлэл татахад алдаа гарлаа." />}
          
          {!isLoading && data && (
            <>
              <StudentTable students={data.content} onDelete={onDeleteStudent} onEdit={onEditStudent} />
              <Pagination
                pageNo={data.pageNo}
                totalPages={data.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
