/** 원화 금액 표시. 예: ₩29,000 */
export function formatKRW(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale, {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

type Named = { nameKo: string; nameEn: string; nameZh: string };

/** DB에 언어별로 저장된 이름 중 현재 언어의 것을 고른다. */
export function localName(item: Named, locale: string): string {
  if (locale === "ko") return item.nameKo;
  if (locale === "zh") return item.nameZh;
  return item.nameEn;
}

type Described = { descKo: string; descEn: string; descZh: string };

export function localDesc(item: Described, locale: string): string {
  if (locale === "ko") return item.descKo;
  if (locale === "zh") return item.descZh;
  return item.descEn;
}
