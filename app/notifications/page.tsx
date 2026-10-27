
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  UserRound,
  CheckCheck,
  Loader2,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type NotificationType = "like" | "comment" | "follow";

interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  post_id: string | null;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  actor_name: string;
  actor_username: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;

      if (!user) {
        setNotifications([]);
        setError("Please log in to view your notifications.");
        return;
      }

      const { data, error: queryError } = await supabase
        .from("notifications")
        .select(
          "id, recipient_id, actor_id, post_id, type, message, is_read, created_at"
        )
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      const rows = data ?? [];
      const actorIds = [
        ...new Set(
          rows
            .map((item) => item.actor_id)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      let profiles: {
        id: string;
        username: string | null;
        display_name: string | null;
      }[] = [];

      if (actorIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", actorIds);

        if (profileError) {
          console.error("Could not load notification profiles:", profileError.message);
        } else {
          profiles = profileRows ?? [];
        }
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile])
      );

      setNotifications(
        rows.map((item) => {
          const profile = item.actor_id
            ? profileMap.get(item.actor_id)
            : undefined;

          return {
            ...item,
            type: item.type as NotificationType,
            actor_name:
              profile?.display_name ||
              profile?.username ||
              "Someone",
            actor_username: profile?.username || "",
          };
        })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function markAsRead(id: string) {
    setBusyId(id);

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
    }

    setBusyId(null);
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    setBusyId("all");

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in again.");
      setBusyId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
    }

    setBusyId(null);
  }

  async function deleteNotification(id: string) {
    setBusyId(id);

    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      );
    }

    setBusyId(null);
  }

  function iconFor(type: NotificationType) {
    if (type === "like") return <Heart size={19} />;
    if (type === "comment") return <MessageCircle size={19} />;
    return <UserRound size={19} />;
  }

  function notificationHref(item: Notification) {
    if (item.post_id && (item.type === "like" || item.type === "comment")) {
      return `/post/${item.post_id}`;
    }

    return item.actor_id ? `/profile?id=${item.actor_id}` : "/notifications";
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-surface-2 p-3">
            <Bell size={24} className="text-accent" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || busyId !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2 disabled:opacity-50"
        >
          <CheckCheck size={16} />
          <span className="hidden sm:inline">Mark all read</span>
          <span className="sm:hidden">Read all</span>
        </button>
      </header>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          Loading notifications...
        </div>
      ) : error ? (
        <div className="space-y-3 rounded-xl border border-border p-5">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => void loadNotifications()}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            Try again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <Bell size={32} className="mx-auto text-muted-foreground" />
          <h2 className="mt-4 font-semibold">You're all caught up!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New likes, comments, and followers will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-4 ${
                item.is_read ? "bg-background" : "bg-surface-2/60"
              }`}
            >
              <div className="mt-1 rounded-full bg-background p-2">
                {iconFor(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={notificationHref(item)}
                  onClick={() => {
                    if (!item.is_read) void markAsRead(item.id);
                  }}
                  className="text-sm hover:underline"
                >
                  <span className="font-semibold">{item.actor_name}</span>{" "}
                  {item.message}
                </Link>

                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </p>

                {!item.is_read && (
                  <button
                    onClick={() => void markAsRead(item.id)}
                    disabled={busyId !== null}
                    className="mt-2 text-xs font-medium text-accent disabled:opacity-50"
                  >
                    Mark as read
                  </button>
                )}
              </div>

              <button
                onClick={() => void deleteNotification(item.id)}
                disabled={busyId !== null}
                aria-label="Delete notification"
                title="Delete notification"
                className="rounded-md p-2 text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-50"
              >
                {busyId === item.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
