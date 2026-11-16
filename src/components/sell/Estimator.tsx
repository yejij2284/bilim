"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  CATEGORIES,
  SELL_CONDITIONS,
  type Category,
  type SellCondition,
} from "@/lib/constants";
import { estimateBuyback } from "@/lib/buyback";
import { formatKRW } from "@/lib/format";

/** 예상 매입가 안내 (예시 계산식: src/lib/buyback.ts) */
export function Estimator({ currentYear }: { currentYear: number }) {
  const t = useTranslations();
  const locale = useLocale();
  const id = useId();
  const [category, setCategory] = useState<Category>("fridge");
  const [year, setYear] = useState(currentYear - 2);
  const [condition, setCondition] = useState<SellCondition>("good");

  const years = Array.from({ length: 13 }, (_, i) => currentYear - i);
  const estimate = estimateBuyback(category, year, condition, currentYear);

  return (
    <div className="card">
      <h2 className="text-ink text-xl font-bold">
        {t("sell.estimator.title")}
      </h2>
      <p className="text-ink-soft mt-1 text-sm">{t("sell.estimator.body")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-category`} className="field-label">
            {t("sell.estimator.category")}
          </label>
          <select
            id={`${id}-category`}
            className="field-input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`categories.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-year`} className="field-label">
            {t("sell.estimator.year")}
          </label>
          <select
            id={`${id}-year`}
            className="field-input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-condition`} className="field-label">
            {t("sell.estimator.condition")}
          </label>
          <select
            id={`${id}-condition`}
            className="field-input"
            value={condition}
            onChange={(e) => setCondition(e.target.value as SellCondition)}
          >
            {SELL_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {t(`sell.estimator.conditions.${c}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-mist mt-6 rounded-2xl p-5" aria-live="polite">
        <p className="text-ink-soft text-sm">{t("sell.estimator.result")}</p>
        {estimate.buyable ? (
          <p className="text-amber mt-1 text-2xl font-extrabold sm:text-3xl">
            {t("sell.estimator.range", {
              min: formatKRW(estimate.min, locale),
              max: formatKRW(estimate.max, locale),
            })}
          </p>
        ) : (
          <p className="text-ink mt-1 font-semibold">
            {t("sell.estimator.notBuyable")}
          </p>
        )}
        <p className="text-ink-soft mt-2 text-xs">
          {t("sell.estimator.disclaimer")}
        </p>
      </div>

      <Link
        href={{
          pathname: "/apply",
          query: { type: "sell", category, year: String(year), condition },
        }}
        className="btn btn-primary mt-6 w-full sm:w-auto"
      >
        {t("sell.estimator.applyWith")}
      </Link>
    </div>
  );
}
