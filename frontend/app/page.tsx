"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DashboardStats, ActivityItem } from "@/types";

const teacherCards = [
  { href: "/courses", title: "Хичээлүүд", description: "Хөтөлбөр, сэдэв удирдах", icon: "📚" },
  { href: "/review-center", title: "Шалгах төв", description: "Илгээлтийг шалгаж дүгнэх", icon: "✅" },
  { href: "/students", title: "Оюутнууд", description: "Оюутны мэдээлэл удирдах", icon: "👥" },
  { href: "/instructors", title: "Багш нар", description: "Багшийн баг болон мэргэжил", icon: "🎓" },
  { href: "/enroll", title: "Бүртгэл", description: "Оюутныг хичээлд бүртгэх", icon: "📝" },
  { href: "/enrollments", title: "Элсэлт", description: "Ахиц шинэчилж хянах", icon: "📊" },
];

const studentCards = [
  { href: "/my-learning", title: "Миний сургалт", description: "Хичээлийн ахиц, даалгавар, сорил", icon: "🎯" },
  { href: "/courses", title: "Хичээлүүд", description: "Нээлттэй бүх хичээл харах", icon: "📚" },
  { href: "/assignments", title: "Даалгаврууд", description: "Даалгавруудаа харж илгээх", icon: "📋" },
  { href: "/quizzes", title: "Шалгалтууд", description: "Шалгалт өгөх, үр дүн харах", icon: "🏆" },
  { href: "/enrollments", title: "Элсэлт", description: "Өөрийн элсэлт ба ахиц", icon: "📊" },
];

const activityIcons: Record<string, string> = {
  SUBMISSION: "📤",
  QUIZ_ATTEMPT: "🎯",
  GRADE: "🏆",
  COMMENT: "💬",
  ASSIGNMENT_CREATED: "📋",
};

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="paper p-6 text-center">
        <p className="text-2xl mb-2">📭</p>
        <p className="font-bold text-sm">Одоогоор үйл ажиллагаа байхгүй байна.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="paper p-3 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">{activityIcons[item.type] ?? "🔔"}</span>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{item.title}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {item.actorName} · {new Date(item.createdAt).toLocaleDateString("mn-MN")}
            </p>
          </div>
          {item.link && (
            <Link href={item.link} className="btn-secondary py-0.5 px-2 text-xs flex-shrink-0 ml-auto">
              →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      setLoading(true); setError(null);
      try {
        const data = await api.getDashboardStats();
        if (active) setStats(data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Статистик ачаалж чадсангүй.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadStats();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadActivity() {
      setActivityLoading(true);
      try {
        const data = await api.getDashboardActivity();
        if (active) setActivity(data.items);
      } catch { /* activity feed is non-critical */ }
      finally { if (active) setActivityLoading(false); }
    }
    void loadActivity();
    return () => { active = false; };
  }, []);

  const cards = user?.role === "TEACHER" ? teacherCards : studentCards;

  return (
    <section className="animate-fade-in-up space-y-8 py-2">
      {/* Welcome banner */}
      <div className="paper p-6 sm:p-8 bg-[var(--brand-yellow)]">
        <p className="badge badge--neutral mb-4 bg-white">СУРГУУЛИЙН УДИРДЛАГЫН ХЯНАЛТ</p>
        <h1 className="section-title text-3xl sm:text-4xl lg:text-5xl tracking-tight text-black">
          Сайн байна уу, {user?.fullName}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base font-bold text-black">
          Таны эрх:{" "}
          <span className="inline-block border-2 border-black bg-white px-2 py-0.5 rounded-sm">
            {user?.role === "TEACHER" ? "БАГШ" : "СУРАГЧ"}
          </span>
          . Системийн хяналт таны гарт байна. Эхэлцгээе!
        </p>
      </div>

      {/* Stats */}
      {loading ? <LoadingBlock label="Самбарын статистик ачаалж байна..." /> : null}
      {error ? <div className="paper p-4 bg-[var(--brand-red)] text-white font-bold">{error}</div> : null}
      {stats ? (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="stat-card bg-[var(--brand-blue)] border-2 border-black shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-black/70">Нийт оюутан</p>
              <span className="text-2xl" aria-hidden="true">👤</span>
            </div>
            <p className="section-title text-4xl font-black text-black">{stats.totalStudents}</p>
            <p className="text-xs text-black/60 mt-1 font-semibold">Бүртгэлтэй сурагч</p>
          </article>
          <article className="stat-card bg-[var(--brand-yellow)] border-2 border-black shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-black/70">Нийт хичээл</p>
              <span className="text-2xl" aria-hidden="true">📚</span>
            </div>
            <p className="section-title text-4xl font-black text-black">{stats.totalCourses}</p>
            <p className="text-xs text-black/60 mt-1 font-semibold truncate" title={stats.courseWithMostLessonsTitle}>
              Хамгийн их: {stats.courseWithMostLessonsTitle} ({stats.courseWithMostLessonsCount} хичээл)
            </p>
          </article>
          <article className="stat-card bg-[var(--brand-orange)] border-2 border-black shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-black/70">Нийт элсэлт</p>
              <span className="text-2xl" aria-hidden="true">📊</span>
            </div>
            <p className="section-title text-4xl font-black text-black">{stats.totalEnrollments}</p>
            <p className="text-xs text-black/60 mt-1 font-semibold">Идэвхтэй бүртгэл</p>
          </article>
          <article className="stat-card bg-[var(--brand-green)] border-2 border-black shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-black/70">Дундаж ахиц</p>
              <span className="text-2xl" aria-hidden="true">🎯</span>
            </div>
            <p className="section-title text-4xl font-black text-black">{Math.round(stats.averageProgress)}%</p>
            <div className="progress-track mt-2 bg-black/20 border-black/30">
              <div className="progress-fill bg-black/40" style={{ width: `${Math.max(0, Math.min(100, Math.round(stats.averageProgress)))}%` }} />
            </div>
          </article>
        </div>
      ) : null}

      {/* Navigation Cards */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}
            className="paper group flex items-start gap-4 p-5 transition-all hover:-translate-y-1 hover:shadow-lg">
            <span className="flex-shrink-0 text-2xl" aria-hidden="true">{card.icon}</span>
            <div>
              <h2 className="section-title text-lg font-bold group-hover:text-[var(--brand-blue)] transition-colors">
                {card.title}
              </h2>
              <p className="muted-copy mt-1 text-sm leading-relaxed">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Activity Feed + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity feed (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="section-title text-xl">⚡ Сүүлийн үйл ажиллагаа</h2>
          {activityLoading ? (
            <LoadingBlock label="Үйл ажиллагаа ачаалж байна..." />
          ) : (
            <ActivityFeed items={activity} />
          )}
        </div>

        {/* Quick links (1/3 width) */}
        <div className="space-y-3">
          <h2 className="section-title text-xl">🔗 Шуурхай холбоосууд</h2>
          <div className="space-y-2">
            {user?.role === "STUDENT" ? (
              <>
                <Link href="/my-learning" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>🎯</span><span className="font-bold text-sm">Миний сургалт</span>
                </Link>
                <Link href="/assignments" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>📋</span><span className="font-bold text-sm">Ойрын даалгаврууд</span>
                </Link>
                <Link href="/quizzes" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>🏆</span><span className="font-bold text-sm">Шалгалт өгөх</span>
                </Link>
                <Link href="/notifications" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>🔔</span><span className="font-bold text-sm">Мэдэгдлүүд</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/review-center" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>✅</span><span className="font-bold text-sm">Шалгах шаардлагатай ажил</span>
                </Link>
                <Link href="/assignments" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>📋</span><span className="font-bold text-sm">Даалгаврын удирдлага</span>
                </Link>
                <Link href="/courses" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>📚</span><span className="font-bold text-sm">Хичээлүүд</span>
                </Link>
                <Link href="/notifications" className="paper flex items-center gap-3 p-3 hover:-translate-y-1 transition-transform">
                  <span>🔔</span><span className="font-bold text-sm">Мэдэгдлүүд</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
