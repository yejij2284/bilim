"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import type { Grade } from "@/lib/constants";
import { isGrade } from "@/lib/constants";

// 색만으로 구분하지 않도록 배지에는 항상 등급 글자가 들어간다.
const STYLES: Record<Grade, string> = {
  NEW: "bg-forest text-white border-forest",
  A: "bg-[#dce7d7] text-forest border-sage",
  B: "bg-white text-ink border-sage",
  C: "bg-[#eceef0] text-[#3a4550] border-[#aab3bb]",
};

/**
 * 등급 배지 (사이트 전체 공통).
 * 누르거나 마우스를 올리거나 키보드로 초점을 주면 등급 설명이 보인다.
 */
export function GradeBadge({
  grade,
  size = "md",
  align = "left",
}: {
  grade: string;
  size?: "sm" | "md";
  align?: "left" | "right";
}) {
  const t = useTranslations("grades");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  if (!isGrade(grade)) return null;

  const name = t(`${grade}.name`);
  const label = grade === "NEW" ? name : t("badge", { name });
  const sizeClass =
    size === "sm" ? "min-h-6 px-2.5 text-xs" : "min-h-7 px-3 text-[13px]";

  return (
    <span ref={ref} className="group/grade relative z-10 inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={tipId}
        aria-label={`${label}. ${t("badgeHint", { grade: name })}`}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-full border font-bold ${sizeClass} ${STYLES[grade]}`}
      >
        {label}
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3 opacity-70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6.2" />
          <path d="M8 7.2v3.6M8 5.1v.1" />
        </svg>
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`border-line text-ink absolute top-full z-30 mt-2 w-56 rounded-2xl border bg-white p-3.5 text-left text-[13px] leading-relaxed font-normal shadow-lg ${
          align === "right" ? "right-0" : "left-0"
        } ${
          open
            ? "block"
            : "hidden group-focus-within/grade:block group-hover/grade:block"
        }`}
      >
        <span className="block font-bold">{label}</span>
        <span className="mt-0.5 block">{t(`${grade}.meaning`)}</span>
        <span className="text-ink-soft mt-1.5 block">
          {t("colPrice")}: {t(`${grade}.price`)}
        </span>
      </span>
    </span>
  );
}
