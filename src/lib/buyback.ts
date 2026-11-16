import type { Category, SellCondition } from "./constants";

// 예상 매입가 예시 계산식.
// TODO: 실제 가격 — 아래 기준가, 감가율, 상태 계수, 매입 비율은 모두 예시 값이다.

/** 종류별 신품 기준가(원) */
const BASE_PRICE: Record<Category, number> = {
  fridge: 600000,
  washer: 550000,
  microwave: 120000,
  aircon: 700000,
  tv: 500000,
  vacuum: 250000,
  ricecooker: 150000,
};

/** 1년마다 가치가 줄어드는 비율 */
const YEARLY_DEPRECIATION = 0.15;

/** 상태에 따른 계수 */
const CONDITION_FACTOR: Record<SellCondition, number> = {
  good: 1,
  fair: 0.7,
  poor: 0.4,
};

/** 남은 가치 중 bilim이 매입가로 쳐 주는 비율 */
const BUYBACK_RATE = 0.3;

/** 이 연식을 넘으면 매입이 어렵다고 안내한다 */
const MAX_AGE_YEARS = 10;

/** 이 금액보다 낮으면 매입이 어렵다고 안내한다 */
const MIN_BUYBACK = 5000;

export type BuybackEstimate =
  | { buyable: true; min: number; max: number }
  | { buyable: false };

const roundTo1000 = (n: number) => Math.round(n / 1000) * 1000;

export function estimateBuyback(
  category: Category,
  purchaseYear: number,
  condition: SellCondition,
  currentYear: number = new Date().getFullYear(),
): BuybackEstimate {
  const age = Math.max(0, currentYear - purchaseYear);
  if (age > MAX_AGE_YEARS) return { buyable: false };

  const residual =
    BASE_PRICE[category] *
    Math.pow(1 - YEARLY_DEPRECIATION, age) *
    CONDITION_FACTOR[condition];
  const center = residual * BUYBACK_RATE;
  const min = roundTo1000(center * 0.85);
  const max = roundTo1000(center * 1.15);

  if (max < MIN_BUYBACK) return { buyable: false };
  return { buyable: true, min, max };
}
