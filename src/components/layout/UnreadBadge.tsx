"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const POLL_MS = 30_000;

/**
 * 헤더 '내 신청' 옆 새 메시지 배지.
 * 내 신청을 조회한 브라우저에서만 숫자가 나온다.
 */
export function UnreadBadge() {
  const t = useTranslations("my.messages");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/my/messages?count=1", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { unread: number };
        if (alive) setCount(data.unread);
      } catch {
        // 다음 확인 때 다시 시도한다.
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    window.addEventListener("bilim:unread-changed", load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("bilim:unread-changed", load);
    };
  }, []);

  if (count === 0) return null;
  return (
    <span className="bg-amber ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs leading-5 font-bold text-white">
      <span aria-hidden="true">{count}</span>
      <span className="sr-only">{t("unread", { count })}</span>
    </span>
  );
}
