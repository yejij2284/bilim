import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActivePackages } from "@/lib/catalog";
import { formatKRW, localDesc, localName } from "@/lib/format";
import { GradeBadge } from "@/components/grade/GradeBadge";

/** 패키지 카드 목록. 낱개 합계와 비교한 절약액을 자동으로 계산한다. */
export async function PackageList() {
  const [t, locale, packages] = await Promise.all([
    getTranslations(),
    getLocale(),
    getActivePackages(),
  ]);

  if (packages.length === 0) return null;

  return (
    <ul className="grid gap-5 lg:grid-cols-3">
      {packages.map((pkg, index) => {
        const separate = pkg.items.reduce(
          (sum, item) => sum + item.product.monthlyPrice,
          0,
        );
        const saving = Math.max(0, separate - pkg.monthlyPrice);
        const percent =
          separate > 0 ? Math.round((saving / separate) * 100) : 0;
        const featured = index === packages.length - 1;

        return (
          <li
            key={pkg.id}
            className={`flex flex-col rounded-3xl border p-6 sm:p-8 ${
              featured ? "border-forest bg-mist border-2" : "border-line bg-white"
            }`}
          >
            <h3 className="text-forest text-xl font-extrabold">
              {localName(pkg, locale)}
            </h3>
            <p className="text-ink-soft mt-1 text-sm">
              {localDesc(pkg, locale)}
            </p>

            <p className="text-ink-soft mt-6 text-sm font-semibold">
              {t("packages.includes")}
            </p>
            <ul className="mt-2 space-y-2.5">
              {pkg.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-[15px]"
                >
                  <span className="text-ink">
                    {t(`categories.${item.product.category}`)}
                    <span className="text-ink-soft"> · {item.product.brand}</span>
                  </span>
                  <GradeBadge
                    grade={item.product.grade}
                    size="sm"
                    align="right"
                  />
                </li>
              ))}
            </ul>

            <div className="border-line mt-6 border-t pt-5">
              <p className="text-ink-soft flex justify-between text-sm">
                <span>{t("packages.separately")}</span>
                <span className="line-through">
                  {formatKRW(separate, locale)}
                </span>
              </p>
              <p className="mt-1 flex items-baseline justify-between">
                <span className="text-ink text-sm font-semibold">
                  {t("packages.packagePrice")}
                </span>
                <span className="text-ink text-2xl font-extrabold">
                  {t("rent.monthly", {
                    price: formatKRW(pkg.monthlyPrice, locale),
                  })}
                </span>
              </p>
              {saving > 0 && (
                <p className="text-amber mt-2 text-right text-sm font-bold">
                  {t("packages.save", {
                    amount: formatKRW(saving, locale),
                    percent,
                  })}
                </p>
              )}
              <p className="text-ink-soft mt-1 text-right text-xs">
                {t("packages.minMonths", { months: pkg.minMonths })}
              </p>
            </div>

            <Link
              href={{
                pathname: "/apply",
                query: { type: "rent", package: pkg.slug },
              }}
              className={`btn mt-6 w-full ${featured ? "btn-primary" : "btn-secondary"}`}
            >
              {t("packages.apply")}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
