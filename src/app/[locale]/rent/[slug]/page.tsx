import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { INSPECTION_ITEMS, isGrade } from "@/lib/constants";
import { formatKRW, localName } from "@/lib/format";
import { GradeBadge } from "@/components/grade/GradeBadge";
import { ProductImage } from "@/components/rent/ProductImage";

export const dynamic = "force-dynamic";

type Props = PageProps<"/[locale]/rent/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: `${localName(product, locale)} | bilim` };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const name = localName(product, locale);
  const passed = product.inspection.split(",").filter(Boolean);
  const checks = INSPECTION_ITEMS.filter((item) => passed.includes(item));
  const money = (n: number) =>
    n === 0 ? t("product.free") : formatKRW(n, locale);

  return (
    <section className="py-8 sm:py-14">
      <div className="container-page">
        <Link
          href="/rent"
          className="text-forest inline-flex min-h-10 items-center gap-1 text-sm font-semibold"
        >
          <span aria-hidden="true">←</span> {t("product.back")}
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImage
            category={product.category}
            imageUrl={product.imageUrl}
            alt={name}
            className="rounded-3xl"
          />

          <div>
            <p className="text-ink-soft text-sm">
              {product.brand} · {t(`categories.${product.category}`)}
            </p>
            <h1 className="text-ink mt-1 text-3xl font-extrabold tracking-tight">
              {name}
            </h1>
            <div className="mt-3">
              <GradeBadge grade={product.grade} />
            </div>

            <div className="bg-mist mt-6 rounded-3xl p-6">
              <p className="text-ink-soft text-sm">{t("product.monthlyFee")}</p>
              <p className="text-amber mt-1 text-3xl font-extrabold">
                {t("rent.monthly", {
                  price: formatKRW(product.monthlyPrice, locale),
                })}
              </p>
              <Link
                href={{
                  pathname: "/apply",
                  query: { type: "rent", product: product.slug },
                }}
                className="btn btn-primary mt-5 w-full"
              >
                {t("product.apply")}
              </Link>
              <p className="text-ink-soft mt-3 text-xs">
                {t("rent.priceNotice")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <section className="card">
            <h2 className="text-ink text-lg font-bold">
              {t("product.gradeTitle")}
            </h2>
            {isGrade(product.grade) && (
              <dl className="mt-4 space-y-3 text-[15px]">
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("grades.colMeaning")}
                  </dt>
                  <dd className="text-ink">
                    {t(`grades.${product.grade}.meaning`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("grades.colPrice")}
                  </dt>
                  <dd className="text-ink">
                    {t(`grades.${product.grade}.price`)}
                  </dd>
                </div>
              </dl>
            )}
          </section>

          <section className="card">
            <h2 className="text-ink text-lg font-bold">
              {t("product.inspectionTitle")}
            </h2>
            <p className="text-ink-soft mt-1 text-sm">
              {t("product.inspectionIntro")}
            </p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {checks.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg
                    viewBox="0 0 20 20"
                    className="text-forest mt-0.5 h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                  </svg>
                  <span>{t(`inspection.${item}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2 className="text-ink text-lg font-bold">
              {t("product.termsTitle")}
            </h2>
            <dl className="mt-4 space-y-3 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{t("product.deposit")}</dt>
                <dd className="text-ink font-semibold">
                  {money(product.deposit)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{t("product.installFee")}</dt>
                <dd className="text-ink font-semibold">
                  {money(product.installFee)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{t("product.minPeriod")}</dt>
                <dd className="text-ink font-semibold">
                  {t("product.months", { months: product.minMonths })}
                </dd>
              </div>
            </dl>
            <p className="text-ink-soft mt-4 text-xs">
              {t("product.depositNote")}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
