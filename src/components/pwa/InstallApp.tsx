"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const noopSubscribe = () => () => {};

/** 이미 설치한 앱으로 열었는지 */
function useStandalone() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
    () => false,
  );
}

/** 아이폰·아이패드인지 (iOS는 설치 버튼을 띄울 수 없어 방법을 안내한다) */
function useIOS() {
  return useSyncExternalStore(
    noopSubscribe,
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    () => false,
  );
}

/**
 * '앱 설치' 버튼.
 * - 안드로이드 크롬·삼성 인터넷·PC 크롬/엣지: 누르면 설치 창이 뜬다.
 * - 아이폰: 공유 버튼 → '홈 화면에 추가' 방법을 보여 준다.
 * - 이미 설치한 앱 안이거나 설치를 지원하지 않는 브라우저에서는 보이지 않는다.
 */
export function InstallApp({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = useTranslations("pwa");
  const standalone = useStandalone();
  const ios = useIOS();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showGuide, setShowGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone) return null;

  const buttonClass =
    tone === "light"
      ? "btn min-h-10 border border-white/60 px-5 text-sm text-white hover:bg-white/10"
      : "btn btn-secondary min-h-10 px-5 text-sm";
  const icon = (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="10" height="16" rx="2" />
      <path d="M10 6v6M7.5 9.5L10 12l2.5-2.5" />
    </svg>
  );

  if (installed) {
    return (
      <p role="status" className="text-sm">
        {t("installed")}
      </p>
    );
  }

  if (deferred) {
    return (
      <button
        type="button"
        className={buttonClass}
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
      >
        {icon}
        {t("install")}
      </button>
    );
  }

  if (ios) {
    return (
      <div>
        <button
          type="button"
          className={buttonClass}
          aria-expanded={showGuide}
          aria-controls="ios-install-guide"
          onClick={() => setShowGuide((v) => !v)}
        >
          {icon}
          {t("install")}
        </button>
        {showGuide && (
          <ol
            id="ios-install-guide"
            className={`mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed ${
              tone === "light" ? "text-white/85" : "text-ink-soft"
            }`}
          >
            <li>{t("ios.step1")}</li>
            <li>{t("ios.step2")}</li>
            <li>{t("ios.step3")}</li>
          </ol>
        )}
      </div>
    );
  }

  return null;
}
