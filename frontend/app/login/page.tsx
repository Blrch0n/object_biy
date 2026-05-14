"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Имэйл болон нууц үгээ оруулна уу.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нэвтрэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--primary)] rounded-xl mb-4 shadow-md">
          <GraduationCap size={24} className="text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Нэвтрэх</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Системд нэвтэрнэ үү</p>
      </div>

      <div className="paper p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-sm font-medium text-[var(--text-primary)]">
              Имэйл
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-[var(--text-primary)]">
              Нууц үг
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-0.5"
                aria-label={showPw ? "Нууц үг нуух" : "Нууц үг харуулах"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={submitting}
          >
            {submitting ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>

        {error && (
          <div className="mt-4 animate-fade-in">
            <StatusMessage type="error" message={error} />
          </div>
        )}

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Бүртгэлгүй юу?{" "}
          <Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}
