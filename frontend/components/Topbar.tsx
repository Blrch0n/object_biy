"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import { api } from "@/lib/api";

const PAGE_TITLES: Record<string, string> = {
  "/":             "Нүүр хуудас",
  "/courses":      "Хичээлүүд",
  "/my-learning":  "Миний сургалт",
  "/assignments":  "Даалгаврууд",
  "/quizzes":      "Шалгалтууд",
  "/review-center":"Шалгах төв",
  "/enrollments":  "Элсэлтүүд",
  "/enroll":       "Оюутан бүртгэх",
  "/students":     "Оюутнууд",
  "/instructors":  "Багш нар",
  "/notifications":"Мэдэгдлүүд",
  "/profile":      "Профайл",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (prefix !== "/" && pathname.startsWith(prefix)) return title;
  }
  return "Сургуулийн LMS";
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const { data: unreadData } = useSWR(
    isAuthenticated ? "/api/notifications/unread-count" : null,
    () => api.getUnreadCount(),
    { refreshInterval: 30000 }
  );
  const unreadCount = unreadData?.count ?? 0;

  if (!isAuthenticated) return null;

  return (
    <header className="topbar">
      {/* Mobile hamburger */}
      <button
        type="button"
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        onClick={onMenuClick}
        aria-label="Цэс нээх"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-sm font-semibold text-slate-900 truncate">
        {getPageTitle(pathname)}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label={`Мэдэгдлүүд${unreadCount > 0 ? ` (${unreadCount} уншаагүй)` : ""}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
          )}
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Профайл"
        >
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-blue-700">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
            {user?.fullName}
          </span>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Системээс гарах"
          title="Гарах"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
