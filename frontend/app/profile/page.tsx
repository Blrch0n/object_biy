"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingBlock } from "@/components/LoadingBlock";
import { StatusMessage } from "@/components/StatusMessage";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "STUDENT") return <StudentProfile userId={user.id} />;
  if (user.role === "TEACHER") return <TeacherProfile userId={user.id} />;
  return <AdminProfile name={user.fullName} email={user.email} />;
}

function StudentProfile({ userId }: { userId: string }) {
  const { data: profile, mutate, isLoading } = useSWR(
    `/api/students/me`,
    () => api.getMyStudentProfile()
  );

  const [fullName, setFullName] = useState("");
  const [batch, setBatch] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const openEdit = () => {
    setFullName(profile?.fullName ?? "");
    setBatch(profile?.batch ?? "");
    setErr(null);
    setSuccess(null);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !batch.trim()) { setErr("Бүх талбарыг бөглөнө үү."); return; }
    setSaving(true); setErr(null);
    try {
      await api.updateMyStudentProfile({ fullName: fullName.trim(), batch: batch.trim() });
      await mutate();
      setSuccess("Профайл амжилттай шинэчлэгдлээ.");
      setEditing(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Хадгалахад алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingBlock label="Профайл ачаалж байна..." />;

  return (
    <section className="animate-fade-in-up space-y-6 py-2 max-w-2xl mx-auto">
      <div className="paper p-6 sm:p-8 bg-[var(--brand-yellow)]">
        <p className="badge badge--neutral mb-3">ПРОФАЙЛ</p>
        <h1 className="section-title text-3xl">{profile?.fullName ?? "—"}</h1>
        <p className="muted-copy text-sm mt-1">{profile?.email}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="badge badge--neutral">Сурагч</span>
          <span className="badge badge--accent">Анги: {profile?.batch}</span>
          <span className="badge bg-[var(--brand-yellow)] text-black border-2 border-black font-black">
             {profile?.xp ?? 0} XP
          </span>
        </div>
      </div>

      {success && <StatusMessage type="success" message={success} />}

      {!editing ? (
        <div className="paper p-6 space-y-4">
          <h2 className="section-title text-lg">Мэдээлэл засах</h2>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">НЭР</p>
              <p className="font-bold">{profile?.fullName}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">И-МЭЙЛ</p>
              <p className="font-bold">{profile?.email}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">АНГИ/БҮЛЭГ</p>
              <p className="font-bold">{profile?.batch}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">ТУРШЛАГЫН ОНО</p>
              <p className="font-bold"> {profile?.xp ?? 0} XP</p>
            </div>
          </div>
          <button onClick={openEdit} className="btn-primary text-sm">Засах </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="paper p-6 space-y-4">
          <h2 className="section-title text-lg">Профайл засах</h2>
          {err && <StatusMessage type="error" message={err} />}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-300">Нэр</label>
            <input className="field w-full" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-300">Анги/Бүлэг</label>
            <input className="field w-full" value={batch} onChange={e => setBatch(e.target.value)} required />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">
              Цуцлах
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function TeacherProfile({ userId }: { userId: string }) {
  const { data: profile, mutate, isLoading } = useSWR(
    `/api/instructors/me`,
    () => api.getMyInstructorProfile()
  );

  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const openEdit = () => {
    setFullName(profile?.fullName ?? "");
    setSpecialization(profile?.specialization ?? "");
    setErr(null);
    setSuccess(null);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !specialization.trim()) { setErr("Бүх талбарыг бөглөнө үү."); return; }
    setSaving(true); setErr(null);
    try {
      await api.updateMyInstructorProfile({ fullName: fullName.trim(), specialization: specialization.trim() });
      await mutate();
      setSuccess("Профайл амжилттай шинэчлэгдлээ.");
      setEditing(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Хадгалахад алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingBlock label="Профайл ачаалж байна..." />;

  return (
    <section className="animate-fade-in-up space-y-6 py-2 max-w-2xl mx-auto">
      <div className="paper p-6 sm:p-8 bg-[var(--brand-blue)]">
        <p className="badge badge--neutral mb-3">ПРОФАЙЛ</p>
        <h1 className="section-title text-3xl">{profile?.fullName ?? "—"}</h1>
        <p className="muted-copy text-sm mt-1">{profile?.email}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="badge badge--neutral">Багш</span>
          <span className="badge badge--accent">{profile?.specialization}</span>
        </div>
      </div>

      {success && <StatusMessage type="success" message={success} />}

      {!editing ? (
        <div className="paper p-6 space-y-4">
          <h2 className="section-title text-lg">Мэдээлэл засах</h2>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">НЭР</p>
              <p className="font-bold">{profile?.fullName}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">И-МЭЙЛ</p>
              <p className="font-bold">{profile?.email}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">МЭРГЭЖИЛ</p>
              <p className="font-bold">{profile?.specialization}</p>
            </div>
          </div>
          <button onClick={openEdit} className="btn-primary text-sm">Засах </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="paper p-6 space-y-4">
          <h2 className="section-title text-lg">Профайл засах</h2>
          {err && <StatusMessage type="error" message={err} />}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-300">Нэр</label>
            <input className="field w-full" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-300">Мэргэжил</label>
            <input className="field w-full" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">
              Цуцлах
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function AdminProfile({ name, email }: { name: string; email: string }) {
  return (
    <section className="animate-fade-in-up space-y-6 py-2 max-w-2xl mx-auto">
      <div className="paper p-6 sm:p-8 bg-[var(--brand-orange)]">
        <p className="badge badge--neutral mb-3">ПРОФАЙЛ</p>
        <h1 className="section-title text-3xl">{name}</h1>
        <p className="muted-copy text-sm mt-1">{email}</p>
        <div className="mt-3">
          <span className="badge badge--neutral">Админ</span>
        </div>
      </div>
      <div className="paper p-6">
        <p className="text-sm text-[var(--text-muted)]">Админ бүртгэлийг засах боломжгүй байна.</p>
      </div>
    </section>
  );
}
