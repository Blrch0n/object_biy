"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { StatusMessage } from "@/components/StatusMessage";
import { api } from "@/lib/api";
import { studentSchema, StudentFormData } from "@/lib/validations";

interface StudentFormProps {
  onSuccess: () => void;
  initialData?: any;
  studentId?: string;
}

export function StudentForm({ onSuccess, initialData, studentId }: StudentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEdit = Boolean(studentId && initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      batch: initialData?.batch || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        batch: initialData.batch || "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: StudentFormData) => {
    setError(null);
    setSuccess(null);
    try {
      if (isEdit && studentId) {
        await api.updateStudent(studentId, data);
        setSuccess("Оюутны мэдээллийг амжилттай шинэчиллээ.");
      } else {
        await api.createStudent(data);
        setSuccess("Оюутны мэдээллийг амжилттай нэмлээ.");
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
      <h2 className="section-title text-xl font-bold text-white">{isEdit ? "Оюутан Засах " : "Оюутан Нэмэх "}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="fullName" className="block text-sm font-bold text-slate-300">
            Овог нэр
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Бат Дорж"
            {...register("fullName")}
            className="field"
          />
          {errors.fullName && <p className="text-red-500 text-xs font-bold">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-bold text-slate-300">
            Имэйл
          </label>
          <input
            id="email"
            type="email"
            placeholder="student@example.com"
            {...register("email")}
            className="field"
          />
          {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-bold text-slate-300">
            Нууц үг
          </label>
          <input
            id="password"
            type="password"
            placeholder="Нууц үг (заавал биш)"
            {...register("password")}
            className="field"
          />
          {errors.password && <p className="text-red-500 text-xs font-bold">{errors.password.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="batch" className="block text-sm font-bold text-slate-300">
            Анги
          </label>
          <input
            id="batch"
            type="text"
            placeholder="CS-2024"
            {...register("batch")}
            className="field"
          />
          {errors.batch && <p className="text-red-500 text-xs font-bold">{errors.batch.message}</p>}
        </div>
        <div className="flex items-end lg:col-span-4 mt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
            {isSubmitting ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Оюутан Нэмэх"}
          </button>
        </div>
      </form>
      <div className="mt-4 space-y-2">
        {error ? <StatusMessage type="error" message={error} /> : null}
        {success ? <StatusMessage type="success" message={success} /> : null}
      </div>
    </div>
  );
}
