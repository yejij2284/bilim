import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default async function Page({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return <ComingSoon title={t("legal.termsTitle")} />;
}