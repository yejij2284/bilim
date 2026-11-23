"use client";

import { useEffect } from "react";

/**
 * 서비스 워커(public/sw.js)를 등록한다.
 * 개발 중(npm run dev)에는 화면이 저장돼 헷갈리지 않도록 등록하지 않는다.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // 등록에 실패해도 사이트는 평소대로 동작한다.
      });
  }, []);
  return null;
}
