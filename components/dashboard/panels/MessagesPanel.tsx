"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MailCheck, MailOpen, RefreshCw, SearchX, Trash2 } from "lucide-react";

import { requestJson } from "@/components/dashboard/api";
import { Alert } from "@/components/ui/dashboard/Alert";
import { Badge } from "@/components/ui/dashboard/Badge";
import { Button } from "@/components/ui/dashboard/Button";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { EmptyState } from "@/components/ui/dashboard/EmptyState";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { ListSkeleton } from "@/components/ui/dashboard/Skeleton";
import { SearchInput, Toolbar } from "@/components/ui/dashboard/Toolbar";
import { cn } from "@/lib/cn";
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

/** Compact list date: time for today, otherwise day + month (+ year if not this year). */
function listDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

function fullDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessagesPanel() {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MessageRecord | null>(null);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  /** Client-side filter over the loaded messages only. */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.name, m.email, m.subject, m.message].some((field) => field.toLowerCase().includes(q)),
    );
  }, [messages, query]);

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
    setError("");
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
    setError("");
    try {
      await requestJson("/api/dashboard/messages", {
        method: "DELETE",
        body: JSON.stringify({ id: message.id }),
      });
      const next = messages.filter((m) => m.id !== message.id);
      setMessages(next);
      setSelectedId(next[0]?.id ?? null);
      setStatus("Message deleted.");
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete message.");
      setDeleteTarget(null);
    } finally {
      setPending(false);
    }
  };

  const countLabel =
    messages.length === 0 ? "No messages" : messages.length === 1 ? "1 message" : `${messages.length} messages`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Contact form submissions from your site. Select a message to read it and reply by email."
        meta={
          loading && !messages.length ? null : (
            <span className="tabular-nums">
              {countLabel}
              {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
            </span>
          )
        }
        actions={
          <Button variant="secondary" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn(loading && "animate-spin")} aria-hidden />
            Refresh
          </Button>
        }
      />

      {error ? (
        <Alert
          tone="danger"
          action={
            <Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}
      {status ? <Alert tone="success">{status}</Alert> : null}

      {loading && !messages.length ? (
        <ListSkeleton rows={5} />
      ) : !messages.length ? (
        error ? null : (
          <EmptyState
            icon={MailOpen}
            title="No messages yet"
            description="Submissions from your site's contact form will show up here."
          />
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-dash-border bg-dash-surface lg:grid lg:min-h-[min(640px,calc(100dvh-16rem))] lg:grid-cols-[minmax(280px,380px)_1fr]">
          {/* List */}
          <aside className="flex max-h-[min(440px,55vh)] flex-col border-b border-dash-border lg:max-h-none lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-dash-border p-3">
              <Toolbar className="mb-0">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Search name, email, subject…"
                  label="Search messages"
                />
              </Toolbar>
              <div className="mt-2 flex items-center gap-2 text-xs text-dash-muted">
                <span className="tabular-nums">
                  {query.trim() ? `${visible.length} of ${messages.length}` : countLabel}
                </span>
                {unreadCount > 0 ? <Badge tone="accent">{unreadCount} unread</Badge> : null}
              </div>
            </div>

            <ul className="min-h-0 flex-1 divide-y divide-dash-border overflow-y-auto" aria-label="Inbox">
              {visible.map((message) => {
                const active = selectedId === message.id;
                const unread = !message.read;
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(message.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative flex w-full gap-3 px-4 py-3 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dash-accent/60",
                        active ? "bg-dash-raised" : "hover:bg-dash-raised",
                      )}
                    >
                      {active ? (
                        <span className="absolute inset-y-0 left-0 w-0.5 bg-dash-accent" aria-hidden />
                      ) : null}
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                          unread
                            ? "border-dash-accent/40 bg-dash-accent-soft text-dash-fg"
                            : "border-dash-border-strong bg-dash-raised text-dash-muted",
                        )}
                        aria-hidden
                      >
                        {initials(message.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              "truncate text-sm",
                              unread ? "font-semibold text-dash-fg" : "font-medium text-dash-fg-2",
                            )}
                          >
                            {message.name}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-xs tabular-nums",
                              unread ? "font-medium text-dash-fg-2" : "text-dash-muted",
                            )}
                          >
                            {listDate(message.createdAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-2">
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[13px]",
                              unread ? "font-medium text-dash-fg" : "text-dash-fg-2",
                            )}
                          >
                            {message.subject || "(No subject)"}
                          </span>
                          {unread ? (
                            <Badge tone="accent" className="h-5 px-1.5">
                              New
                            </Badge>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-dash-muted">{message.message}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {!visible.length ? (
                <li className="p-4">
                  <EmptyState
                    icon={SearchX}
                    title="No matches"
                    description="No loaded messages match your search."
                    action={
                      <Button size="sm" variant="secondary" onClick={() => setQuery("")}>
                        Clear search
                      </Button>
                    }
                  />
                </li>
              ) : null}
            </ul>
          </aside>

          {/* Detail */}
          <section className="flex min-h-[320px] flex-col lg:min-h-0" aria-label="Message">
            {selected ? (
              <>
                <header className="shrink-0 border-b border-dash-border px-5 py-4 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="min-w-0 text-lg font-semibold leading-snug text-dash-fg">
                      {selected.subject || "(No subject)"}
                    </h2>
                    {selected.read ? (
                      <Badge>
                        <MailOpen aria-hidden />
                        Read
                      </Badge>
                    ) : (
                      <Badge tone="accent">
                        <Mail aria-hidden />
                        Unread
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex min-w-0 items-center gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-dash-border-strong bg-dash-raised text-xs font-semibold text-dash-fg-2"
                      aria-hidden
                    >
                      {initials(selected.name)}
                    </span>
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium text-dash-fg">{selected.name}</p>
                      <p className="flex flex-wrap items-center gap-x-2 text-xs text-dash-muted">
                        <a
                          href={`mailto:${selected.email}`}
                          className="truncate rounded text-dash-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
                        >
                          {selected.email}
                        </a>
                        <span aria-hidden>·</span>
                        <time dateTime={selected.createdAt} className="tabular-nums">
                          {fullDate(selected.createdAt)}
                        </time>
                      </p>
                    </div>
                  </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
                  <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-dash-fg-2">
                    {selected.message}
                  </p>
                </div>

                <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-dash-border px-5 py-3 md:px-6">
                  <Button variant="ghost" disabled={pending} onClick={() => setDeleteTarget(selected)}>
                    <Trash2 aria-hidden />
                    Delete
                  </Button>
                  <Button variant="secondary" disabled={pending} onClick={() => void toggleRead(selected)}>
                    {selected.read ? (
                      <>
                        <Mail aria-hidden />
                        Mark unread
                      </>
                    ) : (
                      <>
                        <MailCheck aria-hidden />
                        Mark read
                      </>
                    )}
                  </Button>
                </footer>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState
                  icon={Mail}
                  title="Select a message"
                  description="Choose a message from the inbox to read it."
                />
              </div>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => (deleteTarget ? remove(deleteTarget) : undefined)}
        title="Delete message?"
        message={
          deleteTarget
            ? `Delete the message from ${deleteTarget.name}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        pending={pending}
      />
    </div>
  );
}
