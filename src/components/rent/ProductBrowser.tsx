"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CATEGORIES, GRADES } from "@/lib/constants";
import { formatKRW } from "@/lib/format";
import { GradeBadge } from "@/components/grade/GradeBadge";
import { ProductImage } from "./ProductImage";

export type ProductCardData = {
  slug: string;
  category: string;
  brand: string;
  name: string;
  grade: string;
  monthlyPrice: number;
  minMonths: number;
  imageUrl: string | null;
};

// TODO: 실제 가격 — 가격 필터 구간도 예시 값이다.
const PRICE_CAPS = [10000, 20000, 30000] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
        active
          ? "border-forest bg-forest text-white"
          : "border-line text-ink hover:border-sage bg-white"
      }`}
    >
      {children}
    </button>
  );
}

/** 제품 목록과 필터(종류, 등급, 월 렌탈료) */
export function ProductBrowser({ products }: { products: ProductCardData[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [category, setCategory] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [priceCap, setPriceCap] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (!category || p.category === category) &&
          (!grade || p.grade === grade) &&
          (!priceCap || p.monthlyPrice <= priceCap),
      ),
    [products, category, grade, priceCap],
  );

  const hasFilter = category || grade || priceCap;

  return (
    <div>
      <section
        aria-label={t("rent.filters.title")}
        className="bg-mist space-y-4 rounded-3xl p-5 sm:p-6"
      >
        <div>
          <h3 className="text-ink-soft mb-2 text-sm font-semibold">
            {t("rent.filters.category")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Chip active={!category} onClick={() => setCategory(null)}>
              {t("rent.filters.all")}
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {t(`categories.${c}`)}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-ink-soft mb-2 text-sm font-semibold">
              {t("rent.filters.grade")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Chip active={!grade} onClick={() => setGrade(null)}>
                {t("rent.filters.all")}
              </Chip>
              {GRADES.map((g) => (
                <Chip key={g} active={grade === g} onClick={() => setGrade(g)}>
                  {t(`grades.${g}.name`)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-ink-soft mb-2 text-sm font-semibold">
              {t("rent.filters.price")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Chip active={!priceCap} onClick={() => setPriceCap(null)}>
                {t("rent.filters.all")}
              </Chip>
              {PRICE_CAPS.map((cap) => (
                <Chip
                  key={cap}
                  active={priceCap === cap}
                  onClick={() => setPriceCap(cap)}
                >
                  {t("rent.filters.priceUnder", {
                    price: formatKRW(cap, locale),
                  })}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex min-h-10 items-center justify-between gap-4">
        <p className="text-ink-soft text-sm" role="status" aria-live="polite">
          {t("rent.count", { count: filtered.length })}
        </p>
        {hasFilter && (
          <button
            type="button"
            className="text-forest text-sm font-semibold underline underline-offset-4"
            onClick={() => {
              setCategory(null);
              setGrade(null);
              setPriceCap(null);
            }}
          >
            {t("rent.filters.reset")}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="card text-ink-soft mt-4 text-center">{t("rent.empty")}</p>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li
              key={p.slug}
              className="border-line hover:border-sage relative flex flex-col rounded-3xl border bg-white p-4 transition-colors"
            >
              <ProductImage
                category={p.category}
                imageUrl={p.imageUrl}
                alt={p.name}
              />
              <div className="flex flex-1 flex-col px-1 pt-4 pb-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-ink-soft text-sm">
                    {p.brand} · {t(`categories.${p.category}`)}
                  </p>
                  <GradeBadge grade={p.grade} size="sm" align="right" />
                </div>
                <h3 className="text-ink mt-1 text-lg font-bold">
                  {/* 카드 전체를 누를 수 있게 링크 영역을 넓힌다 */}
                  <Link
                    href={`/rent/${p.slug}`}
                    className="after:absolute after:inset-0 after:rounded-3xl"
                  >
                    {p.name}
                  </Link>
                </h3>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-amber text-xl font-extrabold">
                    {t("rent.monthly", {
                      price: formatKRW(p.monthlyPrice, locale),
                    })}
                  </p>
                  <p className="text-ink-soft text-sm">
                    {t("rent.minMonths", { months: p.minMonths })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-ink-soft mt-6 text-xs">{t("rent.priceNotice")}</p>
    </div>
  );
}
