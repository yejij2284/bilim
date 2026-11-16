import { getTranslations, setRequestLocale } from "next-intl/server";
import { QnaForm } from "@/components/support/QnaForm";

export default async function QnaNewPage({
  params,
}: PageProps<"/[locale]/support/qna/new">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support.qna.form");

  return (
    <section className="bg-mist py-10 sm:py-16">
      <div className="container-page max-w-2xl">
        <h1 className="text-ink mb-6 text-3xl font-extrabold tracking-tight">
          {t("title")}
        </h1>
        <QnaForm />
      </div>
    </section>
  );
}
