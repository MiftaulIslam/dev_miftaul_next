"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Mail, MailCheck, MailOpen, RefreshCw, Trash2, User } from "lucide-react";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import type { MessageRecord } from "@/lib/dashboard/types";

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MessagesPanel() {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await requestJson<MessageRecord[]>("/api/dashboard/messages");
      setMessages(data);
      setSelectedId((prev) => {
        if (prev && data.some((m) => m.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleRead = async (message: MessageRecord) => {
    setPending(true);
    setStatus("");
    try {
      const updated = await requestJson<MessageRecord>("/api/dashboard/messages", {
        method: "PUT",
        body: JSON.stringify({ id: message.id, read: !message.read }),
      });
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setStatus(updated.read ? "Marked as read." : "Marked as unread.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update message.");
    } finally {
      setPending(false);
    }
  };

  const remove = async (message: MessageRecord) => {
    setPending(true);
    setStatus("");
    try {
      await requestJson("/api/dashboard/messages", {
        method: "DELETE",
        body: JSON.stringify({ id: message.id }),
      });
      const next = messages.filter((m) => m.id !== message.id);
      setMessages(next);
      setSelectedId(next[0]?.id ?? null);
      setStatus("Message deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete message.");
    } finally {
      setPending(false);
    }
  };

  const countLabel =
    messages.length === 0 ? "No messages" : messages.length === 1 ? "1 message" : `${messages.length} messages`;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(139,92,246,0.08),transparent_50%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inbox</p>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200 ring-1 ring-blue-400/30">
                  {unreadCount} unread
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Messages</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              Contact form submissions in a simple inbox. Select a thread to read the full message.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 self-start border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white sm:self-auto"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {(status || error) && (
        <div className="flex flex-wrap gap-2">
          {status ? (
            <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
              {status}
            </span>
          ) : null}
          {error ? (
            <span className="inline-flex items-center rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1 text-sm text-rose-200">
              {error}
            </span>
          ) : null}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 shadow-[0_24px_80px_rgba(2,8,30,0.35)] ring-1 ring-white/4 lg:grid lg:min-h-[min(640px,calc(100dvh-14rem))] lg:grid-cols-[minmax(280px,380px)_1fr]">
        {/* List */}
        <aside className="flex max-h-[min(420px,50vh)] flex-col border-b border-white/10 lg:max-h-none lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/6 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/25">
                <Inbox className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Inbox</h3>
                <p className="text-[11px] text-slate-500">{countLabel}</p>
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-600" aria-hidden />
                Loading…
              </div>
            ) : null}
            {!loading &&
              messages.map((message) => {
                const active = selectedId === message.id;
                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => setSelectedId(message.id)}
                    className={`group relative w-full overflow-hidden rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? "border-blue-400/35 bg-linear-to-r from-blue-500/15 to-cyan-500/5 shadow-[inset_3px_0_0_0_rgba(59,130,246,0.85)]"
                        : "border-transparent bg-transparent hover:bg-white/4"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                          message.read
                            ? "bg-slate-800/80 text-slate-400 ring-1 ring-white/10"
                            : "bg-linear-to-br from-blue-500/30 to-cyan-500/20 text-white ring-1 ring-blue-400/35"
                        }`}
                      >
                        {initials(message.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`truncate text-sm leading-snug ${
                              message.read ? "font-medium text-slate-300" : "font-semibold text-white"
                            }`}
                          >
                            {message.subject || "(No subject)"}
                          </p>
                          {!message.read ? (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                          ) : null}
                        </div>
                        <p className={`mt-0.5 truncate text-xs ${message.read ? "text-slate-500" : "text-slate-300"}`}>
                          {message.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">{message.email}</p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                          {new Date(message.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            {!loading && !messages.length ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/3 text-slate-500">
                  <MailOpen className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-400">No messages yet</p>
                <p className="max-w-[220px] text-xs leading-relaxed text-slate-600">
                  Submissions from your site contact form will show up here.
                </p>
              </div>
            ) : null}
          </div>
        </aside>

        {/* Detail */}
        <main className="flex min-h-[320px] flex-col bg-slate-950/30 lg:min-h-0">
          {selected ? (
            <>
              <div className="shrink-0 border-b border-white/6 px-5 py-4 md:px-6 md:py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/25 to-violet-500/20 text-sm font-semibold text-white ring-1 ring-white/10">
                      {initials(selected.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold leading-snug text-white md:text-xl">
                        {selected.subject || "(No subject)"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-1.5 text-slate-200">
                          <User className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          {selected.name}
                        </span>
                        <a
                          href={`mailto:${selected.email}`}
                          className="truncate text-cyan-300/90 underline-offset-2 hover:text-cyan-200 hover:underline"
                        >
                          {selected.email}
                        </a>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(selected.createdAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {selected.read ? (
                          <span className="ml-2 rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Read
                          </span>
                        ) : (
                          <span className="ml-2 rounded-md bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cyan-200 ring-1 ring-cyan-400/25">
                            Unread
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5">
                <article className="rounded-xl border border-white/8 bg-slate-900/40 px-4 py-5 shadow-inner shadow-black/20 md:px-6 md:py-6">
                  <p className="whitespace-pre-wrap text-sm leading-[1.7] text-slate-200">{selected.message}</p>
                </article>
              </div>

              <div className="shrink-0 border-t border-white/6 bg-slate-950/40 px-5 py-3 md:px-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => void toggleRead(selected)}
                    className="border-white/15 bg-white/5 hover:bg-white/10"
                  >
                    {selected.read ? (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Mark unread
                      </>
                    ) : (
                      <>
                        <MailCheck className="mr-2 h-4 w-4" />
                        Mark read
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="danger" disabled={pending} onClick={() => void remove(selected)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/3 text-slate-500">
                <Mail className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-slate-400">Select a message</p>
              <p className="max-w-xs text-xs leading-relaxed text-slate-600">
                Choose a conversation from the inbox to read the full message and reply by email.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
