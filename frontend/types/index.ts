export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export type PageResponse<T> = {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type Student = {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  batch: string;
  xp: number;
};

export type Assignment = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  pdfFilePath: string;
  originalFileName: string;
  score: number;
  feedback: string | null;
  submittedAt: string;
};

export type Question = {
  text: string;
  options: string[];
  correctAnswer: string;
};

export type Quiz = {
  id: string;
  courseId: string;
  title: string;
  questions: Question[];
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<number, string>;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
};

export type Instructor = {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  specialization: string;
};

export type Lesson = {
  title: string;
  durationMinutes: number;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  instructorId: string;
  lessons: Lesson[];
};

export type Enrollment = {
  id: string;
  studentId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
};

export type EnrollmentView = {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  enrolledAt: string;
};

export type DashboardStats = {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  averageProgress: number;
  courseWithMostLessonsTitle: string;
  courseWithMostLessonsCount: number;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type ResourceType = "COURSE" | "ASSIGNMENT" | "QUIZ";

export type Comment = {
  id: string;
  resourceId: string;
  resourceType: ResourceType;
  userId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
};
