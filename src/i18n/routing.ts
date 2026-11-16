import { defineRouting } from "next-intl/routing";

export const locales = ["ko", "en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  // 브라우저 언어가 ko/en/zh 어느 것도 아니면 영어로 보여 준다.
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true,
  // 고른 언어를 1년 동안 기억한다.
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});
