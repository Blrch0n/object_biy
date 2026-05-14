"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгттэй байна.");
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.push("/");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Бүртгүүлэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="animate-fade-in-up mx-auto max-w-md space-y-6 py-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="section-title text-4xl sm:text-5xl tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-main)', WebkitBackgroundClip: 'text' }}>Бүртгүүлэх </h1>
        <p className="muted-copy">Шинэ хэрэглэгч үүсгээд систем рүү нэвтэрнэ.</p>
      </div>

      <div className="paper p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundImage: 'var(--gradient-main)' }} />
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="block text-sm font-semibold text-slate-300">
              Овог нэр
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder="Бат Болд"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="field"
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-300">
              Имэйл
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-300">
              Нууц үг
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="Хамгийн багадаа 6 тэмдэгт"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">
              Эрхийн төрөл
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`py-2 px-3 text-sm font-medium rounded-md transition-all ${
                  role === "STUDENT"
                    ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Сурагч
              </button>
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`py-2 px-3 text-sm font-medium rounded-md transition-all ${
                  role === "TEACHER"
                    ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Багш
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={submitting}>
            {submitting ? "Бүртгэж байна..." : "Sign Up "}
          </button>
        </form>

        {error ? (
          <div className="mt-5 animate-fade-in">
            <StatusMessage type="error" message={error} />
          </div>
        ) : null}

        <p className="muted-copy mt-6 text-center text-sm">
          Бүртгэлтэй юу?{" "}
          <Link href="/login" className="font-bold hover:underline transition-all text-[var(--brand-blue)]">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </section>
  );
}
