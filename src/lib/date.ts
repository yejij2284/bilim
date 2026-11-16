/** 한국 시간 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 날짜와 시각을 화면 언어에 맞게 표시한다 (한국 시간). */
export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}
