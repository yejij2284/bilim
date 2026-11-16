// DB에 문자열로 저장하는 값들의 허용 목록.
// 화면에 보이는 이름은 messages/*.json 에 있다.

export const CATEGORIES = [
  "fridge",
  "washer",
  "microwave",
  "aircon",
  "tv",
  "vacuum",
  "ricecooker",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const GRADES = ["NEW", "A", "B", "C"] as const;
export type Grade = (typeof GRADES)[number];
export function isGrade(value: string): value is Grade {
  return (GRADES as readonly string[]).includes(value);
}

/** 제품 점검 항목 */
export const INSPECTION_ITEMS = [
  "cleaning",
  "power",
  "function",
  "safety",
  "exterior",
  "parts",
] as const;
export type InspectionItem = (typeof INSPECTION_ITEMS)[number];

export const APPLICATION_TYPES = ["RENT", "SELL"] as const;
export type ApplicationType = (typeof APPLICATION_TYPES)[number];

/** 진행 상태. 대여는 ACTIVE(이용 중), 팔기는 SETTLED(정산 완료)로 끝난다. */
export const STATUS_FLOW: Record<ApplicationType, readonly string[]> = {
  RENT: ["RECEIVED", "CONSULTING", "SCHEDULED", "DELIVERED", "ACTIVE"],
  SELL: ["RECEIVED", "CONSULTING", "SCHEDULED", "DELIVERED", "SETTLED"],
};
export const ALL_STATUSES = [
  "RECEIVED",
  "CONSULTING",
  "SCHEDULED",
  "DELIVERED",
  "ACTIVE",
  "SETTLED",
  "CANCELED",
] as const;

/** 상태 이름 번역 키. '배송/수거 완료'만 대여·팔기에 따라 다르다. */
export function statusKey(status: string, type: string): string {
  if (status === "DELIVERED") {
    return type === "SELL" ? "DELIVERED_SELL" : "DELIVERED_RENT";
  }
  return status;
}

export const BUILDING_TYPES = [
  "oneroom",
  "officetel",
  "dormitory",
  "apartment",
  "villa",
  "other",
] as const;

export const TIME_SLOTS = ["morning", "afternoon", "evening"] as const;

export const CONTACT_METHODS = [
  "kakao",
  "wechat",
  "whatsapp",
  "email",
] as const;

export const USER_LANGUAGES = ["ko", "en", "zh", "other"] as const;

export const SELL_CONDITIONS = ["good", "fair", "poor"] as const;
export type SellCondition = (typeof SELL_CONDITIONS)[number];

// TODO: 실제 이용 기간 선택지
export const RENT_MONTH_OPTIONS = [3, 6, 12, 24] as const;
