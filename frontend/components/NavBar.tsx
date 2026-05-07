"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const publicLinks = [
  { href: "/login", label: "🔑 Нэвтрэх" },
  { href: "/signup", label: "✨ Бүртгүүлэх" },
];

export function NavBar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = isAuthenticated
    ? [
        { href: "/", label: "🏠 Нүүр" },
        { href: "/courses", label: "📚 Хичээлүүд" },
        { href: "/enrollments", label: "📈 Элсэлт" },
        ...(["ADMIN", "TEACHER"].includes(user?.role || "")
          ? [
              { href: "/enroll", label: "📝 Бүртгэх" },
            ]
          : []),
        ...(user?.role === "ADMIN"
          ? [
              { href: "/students", label: "👨‍🎓 Оюутнууд" },
              { href: "/instructors", label: "👩‍🏫 Багш нар" },
            ]
          : []),
      ]
    : publicLinks;

  return (
    <nav className="top-nav">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="brand-title text-lg font-bold sm:text-xl"
        >
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
              style={{
                transform: menuOpen ? "rotate(45deg) translate(2px, 2px)" : "none",
              }}
            />
            <span
              className="hamburger-line"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="hamburger-line"
              style={{
                transform: menuOpen ? "rotate(-45deg) translate(2px, -2px)" : "none",
              }}
            />
          </div>
        </button>

        {/* Desktop nav */}
        <ul className="hidden flex-wrap items-center gap-2 sm:flex">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`nav-pill ${
                    isActive ? "nav-pill--active text-white" : "nav-pill--idle"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {isAuthenticated ? (
            <li className="ml-4 flex items-center gap-3 border-l border-black pl-4">
              <span className="badge badge--accent text-xs">
                {user?.fullName}
                <span className="ml-1 opacity-70">
                  ({user?.role === "ADMIN" ? "Админ 👑" : user?.role === "TEACHER" ? "Багш 📘" : "Сурагч 🎒"})
                </span>
              </span>
              <button
                type="button"
                className="nav-pill nav-pill--idle"
                onClick={logout}
              >
                Гарах ✌️
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
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`nav-pill block w-full text-left ${
                      isActive ? "nav-pill--active" : "nav-pill--idle"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {isAuthenticated ? (
              <li className="mt-4 flex flex-col gap-3 border-t border-black pt-4">
                <span className="badge badge--accent text-xs self-start">
                  {user?.fullName} ({user?.role === "ADMIN" ? "Админ 👑" : user?.role === "TEACHER" ? "Багш 📘" : "Сурагч 🎒"})
                </span>
                <button
                  type="button"
                  className="nav-pill nav-pill--idle text-left w-full"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  Гарах ✌️
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
