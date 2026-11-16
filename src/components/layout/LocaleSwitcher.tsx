"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

/** 언어 전환. 고른 언어는 NEXT_LOCALE 쿠키에 저장되어 다음 방문에도 유지된다. */
export function LocaleSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === locale) return;
    const query = searchParams.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        locale: next,
      });
    });
  }

  const base =
    tone === "light"
      ? "border-white/40 text-white"
      : "border-line text-ink-soft";
  const active =
    tone === "light" ? "bg-white text-forest" : "bg-forest text-white";

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={`inline-flex rounded-full border p-0.5 ${base}`}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          disabled={pending}
          aria-pressed={l === locale}
          onClick={() => change(l)}
          className={`min-h-8 rounded-full px-2.5 text-[13px] font-semibold transition-colors ${
            l === locale ? active : "hover:opacity-70"
          }`}
        >
          {t(`localeNames.${l}`)}
        </button>
      ))}
    </div>
  );
}
