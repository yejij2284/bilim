"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { markMyMessagesRead, sendCustomerMessage } from "@/app/actions/my";

type ThreadMessage = {
  id: number;
  sender: string;
  body: string;
  createdAt: string;
  isNew: boolean;
};

const POLL_MS = 20_000;

/**
 * 사이트 안 메시지 창.
 * bilim이 보낸 메시지를 보고 답장할 수 있다. 20초마다 새 메시지를 확인한다.
 */
export function MessageThread({ closed }: { closed: boolean }) {
  const t = useTranslations("my.messages");
  const locale = useLocale();
  const [messages, setMessages] = useState<ThreadMessage[] | null>(null);
  // 이번에 화면을 연 뒤 새로 확인한 메시지 (읽음 처리 뒤에도 '새 메시지' 표시를 유지한다)
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/my/messages", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        signedIn: boolean;
        messages: ThreadMessage[];
      };
      if (!data.signedIn) return;
      setMessages(data.messages);
      const newIds = data.messages.filter((m) => m.isNew).map((m) => m.id);
      if (newIds.length > 0) {
        setFreshIds((prev) => new Set([...prev, ...newIds]));
        await markMyMessagesRead();
        window.dispatchEvent(new Event("bilim:unread-changed"));
      }
    } catch {
      // 다음 확인 때 다시 시도한다.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 서버에서 메시지를 불러와 맞춘다
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // 새 메시지가 오면 맨 아래로 내린다.
  useEffect(() => {
    const count = messages?.length ?? 0;
    if (count !== lastCount.current) {
      lastCount.current = count;
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }
  }, [messages]);

  function send() {
    const body = text.trim();
    if (!body) {
      setError(t("errors.empty"));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await sendCustomerMessage(body);
        if (!result.ok) {
          setError(t(`errors.${result.error}`));
          return;
        }
        setText("");
        await load();
      } catch {
        setError(t("errors.network"));
      }
    });
  }

  const time = (iso: string) =>
    new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));

  return (
    <div>
      <div
        ref={listRef}
        className="bg-mist max-h-[420px] min-h-40 space-y-3 overflow-y-auto rounded-2xl p-4"
        role="log"
        aria-live="polite"
        aria-label={t("title")}
        tabIndex={0}
      >
        {messages === null ? null : messages.length === 0 ? (
          <p className="text-ink-soft py-8 text-center text-[15px]">
            {t("empty")}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender === "CUSTOMER";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <p className="text-ink-soft mb-1 flex items-center gap-2 text-xs">
                  <span className="font-semibold">
                    {mine ? t("fromMe") : t("fromBilim")}
                  </span>
                  <time dateTime={m.createdAt}>{time(m.createdAt)}</time>
                  {freshIds.has(m.id) && (
                    <span className="bg-amber rounded-full px-2 py-0.5 text-[11px] font-bold text-white">
                      {t("newBadge")}
                    </span>
                  )}
                </p>
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
                    mine
                      ? "bg-forest rounded-br-md text-white"
                      : "border-line text-ink rounded-bl-md border bg-white"
                  }`}
                >
                  {m.body}
                </p>
              </div>
            );
          })
        )}
      </div>

      {closed ? (
        <p className="text-ink-soft mt-4 text-sm">{t("closed")}</p>
      ) : (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="my-message" className="field-label">
            {t("inputLabel")}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              id="my-message"
              rows={2}
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("placeholder")}
              className="field-input flex-1"
            />
            <button
              type="submit"
              className="btn btn-primary shrink-0"
              disabled={pending}
            >
              {pending ? t("sending") : t("send")}
            </button>
          </div>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
