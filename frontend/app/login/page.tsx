"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Нэвтрэх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="animate-fade-in-up mx-auto max-w-md space-y-6 py-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="section-title text-4xl sm:text-5xl tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-main)', WebkitBackgroundClip: 'text' }}>Нэвтрэх </h1>
        <p className="muted-copy">Welcome back! Системд нэвтэрнэ үү.</p>
      </div>

      <div className="paper p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundImage: 'var(--gradient-main)' }} />
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-300">
              Имэйл
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-300">
              Нууц үг
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={submitting}>
            {submitting ? "Нэвтэрч байна..." : "Let's Go "}
          </button>
        </form>

        {error ? (
          <div className="mt-5 animate-fade-in">
            <StatusMessage type="error" message={error} />
          </div>
        ) : null}

        <p className="muted-copy mt-6 text-center text-sm">
          Бүртгэлгүй юу?{" "}
          <Link href="/signup" className="font-bold hover:underline transition-all text-[var(--brand-blue)]">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </section>
  );
}
