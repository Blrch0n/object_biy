import { z } from "zod";

export const studentSchema = z.object({
  fullName: z.string().min(1, "Овог нэр шаардлагатай"),
  email: z.string().email("Зөв имэйл хаяг оруулна уу"),
  password: z.string().optional(),
  batch: z.string().min(1, "Анги шаардлагатай"),
});
export type StudentFormData = z.infer<typeof studentSchema>;

export const instructorSchema = z.object({
  fullName: z.string().min(1, "Овог нэр шаардлагатай"),
  email: z.string().email("Зөв имэйл хаяг оруулна уу"),
  password: z.string().optional(),
  specialization: z.string().min(1, "Мэргэжил шаардлагатай"),
});
export type InstructorFormData = z.infer<typeof instructorSchema>;

export const courseSchema = z.object({
  title: z.string().min(1, "Гарчиг шаардлагатай"),
  description: z.string().min(1, "Тайлбар шаардлагатай"),
  category: z.string().optional(),
  level: z.string().min(1, "Түвшин шаардлагатай"),
  price: z.number().min(0, "Үнэ 0 болон түүнээс дээш байх ёстой"),
  instructorId: z.string().min(1, "Багш шаардлагатай"),
});
export type CourseFormData = z.infer<typeof courseSchema>;
