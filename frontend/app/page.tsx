"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/LoadingBlock";
import { StatusMessage } from "@/components/StatusMessage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DashboardStats } from "@/types";

const teacherCards = [
  { href: "/students", title: "Оюутнууд", description: "Оюутны мэдээлэл удирдах", icon: "" },
  { href: "/courses", title: "Хичээлүүд", description: "Хөтөлбөр, сэдэв, үнийг шинэчлэх", icon: "" },
  { href: "/instructors", title: "Багш нар", description: "Багшийн баг болон мэргэжил", icon: "" },
  { href: "/enroll", title: "Бүртгэл", description: "Оюутныг хичээлд шууд бүртгэх", icon: "" },
  { href: "/enrollments", title: "Элсэлт", description: "Ахиц шинэчилж хянах", icon: "" },
];

const studentCards = [
  { href: "/courses", title: "Хичээлүүд", description: "Нээлттэй бүх хичээл харах", icon: "" },
  { href: "/enrollments", title: "Миний элсэлт", description: "Өөрийн элсэлт ба ахиц", icon: "" },
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError(null);

      try {
        const data = await api.getDashboardStats();
        if (active) {
          setStats(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Статистик ачаалж чадсангүй.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  const cards = user?.role === "TEACHER" ? teacherCards : studentCards;

  return (
    <section className="animate-fade-in-up space-y-8 py-2">
      {/* Welcome banner */}
      <div className="paper p-6 sm:p-8 bg-[var(--brand-yellow)]">
        <p className="badge badge--neutral mb-4 bg-white">
          СУРГУУЛИЙН УДИРДЛАГЫН ХЯНАЛТ
        </p>
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

      {/* Loading / Error states */}
      {loading ? <LoadingBlock label="Самбарын статистик ачаалж байна..." /> : null}
      {error ? <StatusMessage type="error" message={error} /> : null}

      {/* Stats Grid */}
      {stats ? (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="stat-card">
            <p className="muted-copy text-xs font-medium uppercase tracking-wider">Нийт оюутан</p>
            <p className="section-title mt-2 text-3xl font-bold">{stats.totalStudents}</p>
          </article>
          <article className="stat-card">
            <p className="muted-copy text-xs font-medium uppercase tracking-wider">Нийт хичээл</p>
            <p className="section-title mt-2 text-3xl font-bold">{stats.totalCourses}</p>
          </article>
          <article className="stat-card">
            <p className="muted-copy text-xs font-medium uppercase tracking-wider">Нийт элсэлт</p>
            <p className="section-title mt-2 text-3xl font-bold">{stats.totalEnrollments}</p>
          </article>
          <article className="stat-card">
            <p className="muted-copy text-xs font-medium uppercase tracking-wider">Дундаж ахиц</p>
            <p className="section-title mt-2 text-3xl font-bold">{Math.round(stats.averageProgress)}%</p>
            <div className="progress-track mt-3">
              <div
                className="progress-fill"
                style={{ width: `${Math.max(0, Math.min(100, Math.round(stats.averageProgress)))}%` }}
              />
            </div>
          </article>
        </div>
      ) : null}

      {/* Navigation Cards */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="paper group flex items-start gap-4 p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex-shrink-0 text-2xl" aria-hidden="true">
              {card.icon}
            </span>
            <div>
              <h2 className="section-title text-lg font-bold group-hover:text-[var(--brand-blue)] transition-colors">
                {card.title}
              </h2>
              <p className="muted-copy mt-1 text-sm leading-relaxed">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
