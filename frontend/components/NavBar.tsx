"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const publicLinks = [
  { href: "/login", label: "Нэвтрэх" },
  { href: "/signup", label: "Бүртгүүлэх" },
];

export function NavBar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isManager = user?.role === "ADMIN" || user?.role === "TEACHER";

  // Poll unread notification count every 30 seconds
  const { data: unreadData } = useSWR(
    isAuthenticated ? "/api/notifications/unread-count" : null,
    () => api.getUnreadCount(),
    { refreshInterval: 30000 }
  );
  const unreadCount = unreadData?.count ?? 0;

  // Fetch XP for students
  const { data: studentProfile } = useSWR(
    isAuthenticated && user?.role === "STUDENT" ? "/api/students/me" : null,
    () => api.getMyStudentProfile()
  );
  const xp = studentProfile?.xp ?? null;

  const links = isAuthenticated
    ? [
        { href: "/", label: "Нүүр" },
        { href: "/courses", label: "Хичээлүүд" },
        ...(user?.role === "STUDENT"
          ? [{ href: "/my-learning", label: "Миний сургалт" }]
          : []),
        { href: "/assignments", label: "Даалгавар" },
        { href: "/quizzes", label: "Шалгалт" },
        { href: "/enrollments", label: "Элсэлт" },
        ...(user?.role !== "ADMIN"
          ? [{ href: "/profile", label: "Профайл" }]
          : []),
        ...(isManager
          ? [
              { href: "/enroll", label: "Бүртгэх" },
              { href: "/students", label: "Оюутнууд" },
              { href: "/instructors", label: "Багш нар" },
              { href: "/review-center", label: "Шалгах төв" },
            ]
          : []),
      ]
    : publicLinks;

  return (
    <nav className="top-nav">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="brand-title text-lg font-bold sm:text-xl">
          Сургуулийн LMS ⚡
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="mobile-nav-toggle flex sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Цэс"
        >
          <div className="flex flex-col gap-1">
            <span
              className="hamburger-line"
              style={{ transform: menuOpen ? "rotate(45deg) translate(2px, 2px)" : "none" }}
            />
            <span className="hamburger-line" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span
              className="hamburger-line"
              style={{ transform: menuOpen ? "rotate(-45deg) translate(2px, -2px)" : "none" }}
            />
          </div>
        </button>

        {/* Desktop nav */}
        <ul className="hidden flex-wrap items-center gap-2 sm:flex">
          {links.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`nav-pill ${isActive ? "nav-pill--active text-white" : "nav-pill--idle"}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}

          {/* Notification Bell */}
          {isAuthenticated && (
            <li className="relative">
              <Link
                href="/notifications"
                className={`nav-pill relative ${pathname.startsWith("/notifications") ? "nav-pill--active" : "nav-pill--idle"}`}
                aria-label="Мэдэгдлүүд"
              >
                <span>🔔</span>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-orange)] text-[10px] font-black text-white border border-black"
                    style={{ lineHeight: 1 }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <li className="ml-4 flex items-center gap-3 border-l border-black pl-4">
              <span className="badge badge--accent text-xs">
                {user?.fullName}
                <span className="ml-1 opacity-70">
                  ({user?.role === "ADMIN" ? "Админ" : user?.role === "TEACHER" ? "Багш" : "Сурагч"})
                </span>
              </span>
              {xp !== null && (
                <span className="badge bg-[var(--brand-yellow)] text-black text-xs font-black border-2 border-black">
                  ⚡ {xp} XP
                </span>
              )}
              <button type="button" className="nav-pill nav-pill--idle" onClick={logout}>
                Гарах
              </button>
            </li>
          ) : null}
        </ul>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen ? (
        <div className="animate-fade-in border-t-[3px] border-black bg-[var(--brand-blue)] px-4 pb-4 sm:hidden">
          <ul className="flex flex-col gap-2 pt-4">
            {links.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`nav-pill block w-full text-left ${isActive ? "nav-pill--active" : "nav-pill--idle"}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {/* Mobile notification bell */}
            {isAuthenticated && (
              <li>
                <Link
                  href="/notifications"
                  onClick={() => setMenuOpen(false)}
                  className={`nav-pill block w-full text-left ${pathname.startsWith("/notifications") ? "nav-pill--active" : "nav-pill--idle"}`}
                >
                  🔔 Мэдэгдлүүд
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-orange)] text-[10px] font-black text-white border border-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )}
            {isAuthenticated ? (
              <li className="mt-4 flex flex-col gap-3 border-t border-black pt-4">
                <span className="badge badge--accent text-xs self-start">
                  {user?.fullName} ({user?.role === "ADMIN" ? "Админ" : user?.role === "TEACHER" ? "Багш" : "Сурагч"})
                </span>
                {xp !== null && (
                  <span className="badge bg-[var(--brand-yellow)] text-black text-xs font-black border-2 border-black self-start">
                    ⚡ {xp} XP
                  </span>
                )}
                <button
                  type="button"
                  className="nav-pill nav-pill--idle text-left w-full"
                  onClick={() => { setMenuOpen(false); logout(); }}
                >
                  Гарах
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
