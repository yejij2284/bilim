import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActivePackages, getActiveProducts } from "@/lib/catalog";
import {
  CATEGORIES,
  RENT_MONTH_OPTIONS,
  SELL_CONDITIONS,
} from "@/lib/constants";
import { todayKST } from "@/lib/date";
import { localDesc, localName } from "@/lib/format";
import type { ApplyFormValues } from "@/lib/schemas/application";
import { ApplyForm } from "@/components/apply/ApplyForm";

export const dynamic = "force-dynamic";

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export default async function ApplyPage({
  params,
  searchParams,
}: PageProps<"/[locale]/apply">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const t = await getTranslations("apply");
  const [products, packages] = await Promise.all([
    getActiveProducts(),
    getActivePackages(),
  ]);

  // 다른 페이지에서 넘어온 값으로 미리 선택해 둔다.
  // 예: /apply?type=rent&product=fridge-lg-a, /apply?type=sell&category=tv&year=2022&condition=good
  const qType = first(query.type)?.toLowerCase();
  const qProduct = first(query.product);
  const qPackage = first(query.package);
  const qCategory = first(query.category);
  const qYear = first(query.year);
  const qCondition = first(query.condition);

  const initial: ApplyFormValues = {
    type: qType === "sell" ? "SELL" : "RENT",
    productSlugs: products.some((p) => p.slug === qProduct) ? [qProduct!] : [],
    packageSlugs: packages.some((p) => p.slug === qPackage) ? [qPackage!] : [],
    sellCategories: (CATEGORIES as readonly string[]).includes(qCategory ?? "")
      ? [qCategory!]
      : [],
    sellBrandModel: "",
    sellPurchaseYear: qYear && /^(19|20)\d{2}$/.test(qYear) ? qYear : "",
    sellCondition: (SELL_CONDITIONS as readonly string[]).includes(
      qCondition ?? "",
    )
      ? qCondition!
      : "good",
    photoUrls: [],
    postcode: "",
    address: "",
    addressDetail: "",
    buildingType: "oneroom",
    preferredDate: "",
    timeSlot: "afternoon",
    rentMonths: String(RENT_MONTH_OPTIONS[1]),
    departureDate: "",
    name: "",
    phone: "",
    email: "",
    contactMethod: locale === "zh" ? "wechat" : "kakao",
    contactId: "",
    nationality: "",
    language: locale,
    note: "",
    consent: false,
  };

  const today = todayKST();

  return (
    <section className="bg-mist py-10 sm:py-16">
      <div className="container-page max-w-3xl">
        <h1 className="text-ink text-3xl font-extrabold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-ink-soft mt-2 mb-8">{t("intro")}</p>
        <ApplyForm
          initial={initial}
          today={today}
          products={products.map((p) => ({
            slug: p.slug,
            name: localName(p, locale),
            brand: p.brand,
            category: p.category,
            grade: p.grade,
            monthlyPrice: p.monthlyPrice,
          }))}
          packages={packages.map((p) => ({
            slug: p.slug,
            name: localName(p, locale),
            desc: localDesc(p, locale),
            monthlyPrice: p.monthlyPrice,
          }))}
        />
      </div>
    </section>
  );
}
