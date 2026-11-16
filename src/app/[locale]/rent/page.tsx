import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActiveProducts } from "@/lib/catalog";
import { localName } from "@/lib/format";
import { ProductBrowser } from "@/components/rent/ProductBrowser";
import { PackageList } from "@/components/rent/PackageList";
import { GradeTable } from "@/components/grade/GradeTable";

// 관리자가 고친 내용이 바로 보이도록 요청마다 DB를 읽는다.
export const dynamic = "force-dynamic";

export default async function RentPage({ params }: PageProps<"/[locale]/rent">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const products = await getActiveProducts();

  return (
    <>
      <section className="bg-mist">
        <div className="container-page py-12 sm:py-16">
          <h1 className="text-ink text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("rent.title")}
          </h1>
          <p className="text-ink-soft mt-3 max-w-2xl">{t("rent.intro")}</p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-page">
          <ProductBrowser
            products={products.map((p) => ({
              slug: p.slug,
              category: p.category,
              brand: p.brand,
              name: localName(p, locale),
              grade: p.grade,
              monthlyPrice: p.monthlyPrice,
              minMonths: p.minMonths,
              imageUrl: p.imageUrl,
            }))}
          />
        </div>
      </section>

      <section id="packages" className="section bg-mist scroll-mt-20">
        <div className="container-page">
          <p className="eyebrow">{t("packages.title")}</p>
          <h2 className="section-title">{t("packages.slogan")}</h2>
          <p className="text-ink-soft mt-2 mb-10">{t("packages.intro")}</p>
          <PackageList />
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl">
          <h2 className="section-title mb-6">{t("grades.tableTitle")}</h2>
          <GradeTable />
        </div>
      </section>
    </>
  );
}
