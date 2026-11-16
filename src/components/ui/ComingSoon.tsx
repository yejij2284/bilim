import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** 아직 만들지 않은 페이지의 자리 표시. */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("common");
  return (
    <section className="section">
      <div className="container-page">
        <div className="card bg-mist mx-auto max-w-xl text-center">
          <h1 className="text-ink text-2xl font-bold">{title}</h1>
          <p className="text-ink mt-4 font-semibold">{t("comingSoon")}</p>
          <p className="text-ink-soft mt-1 text-sm">{t("comingSoonBody")}</p>
          <Link href="/" className="btn btn-secondary mt-6">
            {t("backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
