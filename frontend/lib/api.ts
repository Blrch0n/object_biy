/**
 * API client module for the School Online Learning System.
 *
 * OOP Pillars demonstrated (TypeScript/Frontend):
 *   - ENCAPSULATION : ApiClient keeps baseUrl and token logic private;
 *                     callers only see the public API methods
 *   - ABSTRACTION   : internal fetch/error handling is hidden behind clean
 *                     methods (getStudents, createCourse, etc.)
 *   - INHERITANCE   : ApiError extends the built-in Error class — it inherits
 *                     message, stack, and name, then adds a status code
 *   - POLYMORPHISM  : the generic request<T>() method works for any response
 *                     type (Student[], Course, void, …) — same method, many forms
 */

import {
  Assignment,
  Course,
  DashboardStats,
  Enrollment,
  EnrollmentView,
  Instructor,
  Lesson,
  LoginResponse,
  PageResponse,
  Quiz,
  QuizAttempt,
  Student,
  Submission,
  User,
  UserRole,
} from "@/types";
import { clearStoredToken, getStoredToken } from "@/lib/auth";

// ─── ApiError (INHERITANCE: extends built-in Error) ───────────────────────────

/**
 * Thrown whenever the backend returns a non-2xx response.
 * Extends the native Error class — demonstrates INHERITANCE on the frontend.
 */
export class ApiError extends Error {
  /** HTTP status code returned by the server. */
  status: number;

  constructor(message: string, status: number) {
    super(message);           // call parent constructor (inheritance)
    this.name = "ApiError";   // override inherited name field
    this.status = status;     // own field — encapsulated inside this class
  }
}

// ─── Payload types ────────────────────────────────────────────────────────────

type EnrollmentPayload = {
  studentId: string;
  courseId: string;
  progress?: number;
};

type CoursePayload = {
  title: string;
  description: string;
  level: string;
  price: number;
  instructorId: string;
};

type StudentPayload = {
  fullName: string;
  email: string;
  batch: string;
};

type InstructorPayload = {
  fullName: string;
  email: string;
  specialization: string;
};

// ─── ApiClient class (ENCAPSULATION + ABSTRACTION) ───────────────────────────

/**
 * Centralised HTTP client for all backend communication.
 *
 * - All fetch logic is ENCAPSULATED in private methods.
 * - Public methods expose a clean, simple interface (ABSTRACTION).
 * - The generic request<T>() demonstrates POLYMORPHISM — one method,
 *   many possible response shapes.
 */
class ApiClient {
  /** Base URL of the backend API — private, not accessible from outside. */
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ── Private helpers (Encapsulation) ──────────────────────────────────────

  /** Builds the full URL from a relative path. */
  private buildUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }

  /** Extracts a readable error message from any backend response shape. */
  private extractErrorMessage(payload: unknown): string | null {
    if (payload && typeof payload === "object") {
      if ("message" in payload && typeof payload.message === "string") {
        return payload.message;
      }
      if ("error" in payload && typeof payload.error === "string") {
        return payload.error;
      }
    }
    return typeof payload === "string" ? payload : null;
  }

  /** Returns the stored JWT token, or null if the user is not logged in. */
  private getToken(): string | null {
    return getStoredToken();
  }

  /**
   * Core HTTP method — generic over the response type T.
   *
   * POLYMORPHISM: same method is called for Student[], Course, void, etc.
   * The type parameter T tells TypeScript what shape the caller expects.
   */
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response = await this.executeRequest(path, init);

    if (response.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/refresh") {
      try {
        const refreshResponse = await this.executeRequest("/api/auth/refresh", { method: "POST" });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json() as LoginResponse;
          const { setStoredToken } = await import("@/lib/auth");
          setStoredToken(refreshData.token);
          // Retry original request
          response = await this.executeRequest(path, init);
        } else {
          clearStoredToken();
        }
      } catch (err) {
        clearStoredToken();
      }
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload =
      response.status === 204
        ? undefined
        : isJson
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      const backendMessage = this.extractErrorMessage(payload);
      if (response.status === 401) {
        clearStoredToken();
      }
      throw new ApiError(
        backendMessage || `Request failed with status ${response.status}`,
        response.status
      );
    }

    return payload as T;
  }

  private async executeRequest(path: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers ?? {});
    const token = this.getToken();

    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(this.buildUrl(path), { ...init, headers });
  }

  // ── Public API methods (Abstraction) ─────────────────────────────────────
  // Callers use these clean methods — they never touch fetch, headers, or URLs.

  // Auth
  signup(data: { fullName: string; email: string; password: string; role: UserRole }) {
    return this.request<User>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  login(data: { email: string; password: string }) {
    return this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  me() {
    return this.request<User>("/api/auth/me", { cache: "no-store" });
  }

  // Dashboard
  getDashboardStats() {
    return this.request<DashboardStats>("/api/dashboard/stats", { cache: "no-store" });
  }

  // Students
  getStudents(page = 0, size = 10, search?: string) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (search) params.append("search", search);
    return this.request<PageResponse<Student>>(`/api/students?${params.toString()}`, { cache: "no-store" });
  }

  createStudent(data: StudentPayload) {
    return this.request<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateStudent(id: string, data: StudentPayload) {
    return this.request<Student>(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteStudent(id: string) {
    return this.request<void>(`/api/students/${id}`, { method: "DELETE" });
  }

  // Instructors
  getInstructors(page = 0, size = 10) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    return this.request<PageResponse<Instructor>>(`/api/instructors?${params.toString()}`, { cache: "no-store" });
  }

  createInstructor(data: InstructorPayload) {
    return this.request<Instructor>("/api/instructors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateInstructor(id: string, data: InstructorPayload) {
    return this.request<Instructor>(`/api/instructors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteInstructor(id: string) {
    return this.request<void>(`/api/instructors/${id}`, { method: "DELETE" });
  }

  // Courses
  getCourse(id: string) {
    return this.request<Course>(`/api/courses/${id}`, { cache: "no-store" });
  }

  getCourses(page = 0, size = 10, level?: string, search?: string) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (level) params.append("level", level);
    if (search) params.append("search", search);
    return this.request<PageResponse<Course>>(`/api/courses?${params.toString()}`, { cache: "no-store" });
  }

  createCourse(data: CoursePayload) {
    return this.request<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateCourse(id: string, data: CoursePayload) {
    return this.request<Course>(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteCourse(id: string) {
    return this.request<void>(`/api/courses/${id}`, { method: "DELETE" });
  }

  // ==== ASSIGNMENTS (PHASE 3) ====
  getAssignments(courseId: string) {
    return this.request<Assignment[]>(`/api/assignments/course/${courseId}`);
  }


  async downloadSubmission(submissionId: string) {
    const response = await fetch(this.buildUrl(`/api/assignments/submissions/${submissionId}/download`), {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    if (!response.ok) {
      throw new ApiError("Failed to download file", response.status);
    }
    return response.blob();
  }

  addLesson(courseId: string, data: Lesson) {
    return this.request<Course>(`/api/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Enrollments
  getEnrollments(sort?: "progress" | "date") {
    return this.request<EnrollmentView[]>(
      `/api/enrollments${sort ? `?sort=${encodeURIComponent(sort)}` : ""}`,
      { cache: "no-store" }
    );
  }

  createEnrollment(data: EnrollmentPayload) {
    return this.request<Enrollment>("/api/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateEnrollmentProgress(id: string, progress: number) {
    return this.request<EnrollmentView>(
      `/api/enrollments/${id}/progress?value=${encodeURIComponent(progress)}`,
      { method: "PATCH" }
    );
  }

  deleteEnrollment(id: string) {
    return this.request<void>(`/api/enrollments/${id}`, { method: "DELETE" });
  }

  // ------------------------------------------------------------------ //
  //  Assignments
  // ------------------------------------------------------------------ //
  async getAssignmentById(assignmentId: string) {
    return this.request<Assignment>(`/api/assignments/${assignmentId}`);
  }

  async getAssignmentsByCourse(courseId: string) {
    return this.request<Assignment[]>(`/api/assignments/course/${courseId}`);
  }

  async createAssignment(data: Partial<Assignment>) {
    return this.request<Assignment>("/api/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitAssignment(assignmentId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${this.baseUrl}/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Failed to submit assignment: ${res.statusText}`);
    }
    return res.json() as Promise<Submission>;
  }

  async getMySubmission(assignmentId: string) {
    return this.request<Submission>(`/api/assignments/${assignmentId}/my-submission`);
  }

  async getSubmissions(assignmentId: string) {
    return this.request<Submission[]>(`/api/assignments/${assignmentId}/submissions`);
  }

  async gradeSubmission(submissionId: string, score: number, feedback?: string) {
    let url = `/api/assignments/submissions/${submissionId}/grade?score=${score}`;
    if (feedback) {
      url += `&feedback=${encodeURIComponent(feedback)}`;
    }
    return this.request<Submission>(url, {
      method: "PATCH",
    });
  }

  // ------------------------------------------------------------------ //
  //  Quizzes
  // ------------------------------------------------------------------ //
  async getQuizzesByCourse(courseId: string) {
    return this.request<Quiz[]>(`/api/quizzes/course/${courseId}`);
  }

  async getQuizById(quizId: string) {
    return this.request<Quiz>(`/api/quizzes/${quizId}`);
  }

  async createQuiz(data: Partial<Quiz>) {
    return this.request<Quiz>("/api/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitQuizAttempt(quizId: string, answers: Record<number, string>) {
    return this.request<QuizAttempt>(`/api/quizzes/${quizId}/attempt`, {
      method: "POST",
      body: JSON.stringify(answers),
    });
  }

  async getMyQuizAttempt(quizId: string) {
    return this.request<QuizAttempt>(`/api/quizzes/${quizId}/my-attempt`);
  }

  async getQuizAttempts(quizId: string) {
    return this.request<QuizAttempt[]>(`/api/quizzes/${quizId}/attempts`);
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";

/**
 * The single shared ApiClient instance.
 * Exported as `api` so all existing imports continue to work unchanged.
 */
export const api = new ApiClient(API_BASE_URL);

// ─── Named convenience exports (backward-compatible) ─────────────────────────

export const signup                  = api.signup.bind(api);
export const login                   = api.login.bind(api);
export const getMe                   = api.me.bind(api);
export const getDashboardStats       = api.getDashboardStats.bind(api);
export const getStudents             = api.getStudents.bind(api);
export const createStudent           = api.createStudent.bind(api);
export const updateStudent           = api.updateStudent.bind(api);
export const deleteStudent           = api.deleteStudent.bind(api);
export const getInstructors          = api.getInstructors.bind(api);
export const createInstructor        = api.createInstructor.bind(api);
export const updateInstructor        = api.updateInstructor.bind(api);
export const deleteInstructor        = api.deleteInstructor.bind(api);
export const getCourses              = api.getCourses.bind(api);
export const createCourse            = api.createCourse.bind(api);
export const updateCourse            = api.updateCourse.bind(api);
export const deleteCourse            = api.deleteCourse.bind(api);
export const addLesson               = api.addLesson.bind(api);
export const getEnrollments          = api.getEnrollments.bind(api);
export const createEnrollment        = api.createEnrollment.bind(api);
export const updateEnrollmentProgress = api.updateEnrollmentProgress.bind(api);
export const deleteEnrollment        = api.deleteEnrollment.bind(api);

export const getAssignmentsByCourse  = api.getAssignmentsByCourse.bind(api);
export const getAssignmentById       = api.getAssignmentById.bind(api);
export const createAssignment        = api.createAssignment.bind(api);
export const submitAssignment        = api.submitAssignment.bind(api);
export const getMySubmission         = api.getMySubmission.bind(api);
export const getSubmissions          = api.getSubmissions.bind(api);
export const gradeSubmission         = api.gradeSubmission.bind(api);

export const getQuizzesByCourse      = api.getQuizzesByCourse.bind(api);
export const getQuizById             = api.getQuizById.bind(api);
export const createQuiz              = api.createQuiz.bind(api);
export const submitQuizAttempt       = api.submitQuizAttempt.bind(api);
export const getMyQuizAttempt        = api.getMyQuizAttempt.bind(api);
export const getQuizAttempts         = api.getQuizAttempts.bind(api);
