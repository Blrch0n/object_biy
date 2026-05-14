"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { StatusMessage } from "@/components/StatusMessage";
import { api } from "@/lib/api";
import { courseSchema, CourseFormData } from "@/lib/validations";

interface CourseFormProps {
  onSuccess: () => void;
  initialData?: any;
  courseId?: string;
}

export function CourseForm({ onSuccess, initialData, courseId }: CourseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEdit = Boolean(courseId && initialData);

  const { data: instructorsData } = useSWR("/api/instructors?size=100", () => api.getInstructors(0, 100));
  const instructors = instructorsData?.content || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      level: initialData?.level || "BEGINNER",
      price: initialData?.price || 0,
      instructorId: initialData?.instructorId || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        level: initialData.level || "BEGINNER",
        price: initialData.price || 0,
        instructorId: initialData.instructorId || "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: CourseFormData) => {
    setError(null);
    setSuccess(null);
    try {
      if (isEdit && courseId) {
        await api.updateCourse(courseId, data);
        setSuccess("Хичээлийг амжилттай шинэчиллээ.");
      } else {
        await api.createCourse(data);
        setSuccess("Хичээлийг амжилттай үүсгэлээ.");
        reset();
      }
      setTimeout(() => setSuccess(null), 3000);
      onSuccess();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Үйлдэл гүйцэтгэх үед алдаа гарлаа.");
    }
  };

  return (
    <div className="paper p-5 sm:p-6">
      <h2 className="section-title text-lg font-semibold">{isEdit ? "Хичээл Засах 🛠️" : "Хичээл Үүсгэх 🛠️"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-bold text-slate-300">Хичээлийн нэр</label>
          <input type="text" placeholder="Програмчлалын үндэс" {...register("title")} className="field" />
          {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-bold text-slate-300">Ангилал (Сонголт)</label>
          <input type="text" placeholder="IT, Design..." {...register("category")} className="field" />
          {errors.category && <p className="text-red-500 text-xs font-bold">{errors.category.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-bold text-slate-300">Түвшин</label>
          <input type="text" placeholder="BEGINNER, INTERMEDIATE..." {...register("level")} className="field" />
          {errors.level && <p className="text-red-500 text-xs font-bold">{errors.level.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-bold text-slate-300">Үнэ ($)</label>
          <input type="number" min={0} step="0.01" {...register("price", { valueAsNumber: true })} className="field" />
          {errors.price && <p className="text-red-500 text-xs font-bold">{errors.price.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-bold text-slate-300">Багш</label>
          <select {...register("instructorId")} className="field">
            <option value="">Сонгоно уу</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.fullName}</option>
            ))}
          </select>
          {errors.instructorId && <p className="text-red-500 text-xs font-bold">{errors.instructorId.message}</p>}
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="block text-sm font-bold text-slate-300">Тайлбар</label>
          <textarea placeholder="Дэлгэрэнгүй..." {...register("description")} className="field" rows={3} />
          {errors.description && <p className="text-red-500 text-xs font-bold">{errors.description.message}</p>}
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Хичээл Үүсгэх"}
          </button>
        </div>
      </form>
      <div className="mt-4 space-y-2">
        {error && <StatusMessage type="error" message={error} />}
        {success && <StatusMessage type="success" message={success} />}
      </div>
    </div>
  );
}
