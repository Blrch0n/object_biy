"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingBlock } from "@/components/LoadingBlock";
import { Notification } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("mn-MN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const typeLabel: Record<string, string> = {
  ASSIGNMENT_CREATED: "📋 Даалгавар",
  SUBMISSION: "📤 Илгээлт",
  GRADE: "🏆 Дүн",
  COMMENT: "💬 Сэтгэгдэл",
  QUIZ_ATTEMPT: "🎯 Сорил",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getNotifications()
      .then((data) => { if (active) setNotifications(data); })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Мэдэгдэл ачаалж чадсангүй."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? updated : n));
    } catch {
      // silently ignore
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setMsg("Бүх мэдэгдэл уншигдсан гэж тэмдэглэгдлээ.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setMarkingAll(false);
    }
  };

  if (!user) return null;

  const unread = notifications.filter((n) => !n.read);

  return (
    <section className="animate-fade-in-up space-y-6 py-2">
      <div className="paper p-6 bg-[var(--brand-blue)] text-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="badge badge--neutral mb-2">МЭДЭГДЛҮҮД</p>
          <h1 className="section-title text-2xl">Мэдэгдлүүд</h1>
          <p className="muted-copy text-sm mt-1">
            {unread.length > 0 ? `${unread.length} уншаагүй мэдэгдэл байна.` : "Бүх мэдэгдэл уншигдсан."}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            className="btn-secondary self-start sm:self-auto"
            onClick={handleMarkAll}
            disabled={markingAll}
          >
            {markingAll ? "..." : "Бүгдийг уншсан гэж тэмдэглэх"}
          </button>
        )}
      </div>

      {msg && (
        <div className="paper p-3 bg-[var(--brand-green)] text-black font-bold text-sm">{msg}</div>
      )}
      {error && (
        <div className="paper p-3 bg-[var(--brand-red)] text-white font-bold text-sm">{error}</div>
      )}

      {loading ? (
        <LoadingBlock label="Мэдэгдлүүд ачаалж байна..." />
      ) : notifications.length === 0 ? (
        <div className="paper p-10 text-center">
          <p className="text-3xl mb-2">🔔</p>
          <p className="section-title text-lg">Мэдэгдэл алга байна</p>
          <p className="muted-copy text-sm mt-1">Шинэ үйлдэл хийгдэх үед энд харагдана.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`paper p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 transition-all ${
                !n.read ? "border-2 border-[var(--brand-orange)]" : "opacity-70"
              }`}
            >
              <div className="flex gap-3 items-start">
                <span className="text-lg">{typeLabel[n.type] ?? "🔔"}</span>
                <div>
                  <p className="font-bold text-sm">{n.title}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center flex-shrink-0">
                {n.link && (
                  <Link href={n.link} className="btn-secondary py-1 px-3 text-xs">
                    Харах
                  </Link>
                )}
                {!n.read && (
                  <button
                    className="btn-primary py-1 px-3 text-xs"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    Уншсан
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
