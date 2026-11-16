import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Estimator } from "@/components/sell/Estimator";

export const dynamic = "force-dynamic";

const POINTS = ["pickup", "fast", "circular"] as const;

export default async function SellPage({ params }: PageProps<"/[locale]/sell">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sell");

  return (
    <>
      <section className="bg-forest text-white">
        <div className="container-page py-14 sm:py-20">
          <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">
            {t("title")}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            {t("headline")}
          </h1>
          <p className="mt-4 max-w-xl text-white/85 sm:text-lg">{t("intro")}</p>
          <Link
            href={{ pathname: "/apply", query: { type: "sell" } }}
            className="btn btn-light mt-8 px-8"
          >
            {t("applyCta")}
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <ul className="grid gap-5 md:grid-cols-3">
            {POINTS.map((key, i) => (
              <li key={key} className="card">
                <span className="bg-mist-deep text-forest inline-flex h-10 w-10 items-center justify-center rounded-full font-bold">
                  {i + 1}
                </span>
                <h2 className="text-ink mt-4 text-lg font-bold">
                  {t(`points.${key}.title`)}
                </h2>
                <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">
                  {t(`points.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-mist pb-16 pt-16 sm:pb-24 sm:pt-20">
        <div className="container-page max-w-3xl">
          <Estimator currentYear={new Date().getFullYear()} />
        </div>
      </section>
    </>
  );
}
