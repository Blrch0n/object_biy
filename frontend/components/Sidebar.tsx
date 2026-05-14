"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, GraduationCap, BookOpen, ClipboardList, FileCheck,
  CheckSquare, Users, UserPlus, UserCog, ScrollText, Bell, X,
} from "lucide-react";
import useSWR from "swr";
import { api } from "@/lib/api";

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
}

function getNavItems(role?: string): NavItem[] {
  const base: NavItem[] = [
    { href: "/",        label: "Нүүр хуудас",   icon: <LayoutDashboard size={17} /> },
    { href: "/courses", label: "Хичээлүүд",      icon: <GraduationCap  size={17} /> },
  ];

  if (role === "STUDENT") {
    return [
      ...base,
      { href: "/my-learning",  label: "Миний сургалт",  icon: <BookOpen      size={17} /> },
      { href: "/assignments",  label: "Даалгаврууд",     icon: <ClipboardList size={17} /> },
      { href: "/quizzes",      label: "Шалгалтууд",      icon: <FileCheck     size={17} /> },
      { href: "/enrollments",  label: "Элсэлтүүд",       icon: <ScrollText    size={17} /> },
    ];
  }

  if (role === "TEACHER") {
    return [
      ...base,
      { href: "/assignments",  label: "Даалгаврууд",     icon: <ClipboardList size={17} /> },
      { href: "/quizzes",      label: "Шалгалтууд",      icon: <FileCheck     size={17} /> },
      { href: "/review-center",label: "Шалгах төв",      icon: <CheckSquare   size={17} /> },
      { href: "/enrollments",  label: "Элсэлтүүд",       icon: <ScrollText    size={17} /> },
      { href: "/enroll",       label: "Оюутан бүртгэх",  icon: <UserPlus      size={17} /> },
    ];
  }

  if (role === "ADMIN") {
    return [
      ...base,
      { href: "/students",     label: "Оюутнууд",        icon: <Users         size={17} /> },
      { href: "/instructors",  label: "Багш нар",         icon: <UserCog       size={17} /> },
      { href: "/review-center",label: "Шалгах төв",      icon: <CheckSquare   size={17} /> },
      { href: "/enrollments",  label: "Элсэлтүүд",       icon: <ScrollText    size={17} /> },
      { href: "/enroll",       label: "Оюутан бүртгэх",  icon: <UserPlus      size={17} /> },
    ];
  }

  return base;
}

interface SidebarProps {
  open:    boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname  = usePathname();
  const { user, isAuthenticated } = useAuth();

  const { data: unreadData } = useSWR(
    isAuthenticated ? "/api/notifications/unread-count" : null,
    () => api.getUnreadCount(),
    { refreshInterval: 30000 }
  );
  const unreadCount = unreadData?.count ?? 0;

  if (!isAuthenticated) return null;

  const items = getNavItems(user?.role);

  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Гол цэс">
      {/* Logo */}
      <div className="flex items-center justify-between h-[60px] px-4 border-b border-slate-200 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">Сургуулийн LMS</span>
        </Link>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={onClose}
          aria-label="Хаах"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-100",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={isActive ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Notifications */}
        <Link
          href="/notifications"
          onClick={onClose}
          className={[
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-100",
            pathname.startsWith("/notifications")
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          ].join(" ")}
          aria-current={pathname.startsWith("/notifications") ? "page" : undefined}
        >
          <span className={`relative ${pathname.startsWith("/notifications") ? "text-blue-600" : "text-slate-400"}`}>
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          Мэдэгдлүүд
          {unreadCount > 0 && (
            <span className="ml-auto text-xs bg-red-100 text-red-600 font-semibold rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </Link>
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-3 flex-shrink-0">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-700">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500">
              {user?.role === "ADMIN" ? "Админ" : user?.role === "TEACHER" ? "Багш" : "Оюутан"}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
