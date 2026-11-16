import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { normalizeApplicationCode } from "@/lib/application-code";
import { CopyCode } from "@/components/apply/CopyCode";

export const dynamic = "force-dynamic";

export default async function ApplyDonePage({
  params,
  searchParams,
}: PageProps<"/[locale]/apply/done">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const raw = Array.isArray(query.code) ? query.code[0] : query.code;
  const code = raw ? normalizeApplicationCode(raw) : "";

  // 실제로 있는 신청번호일 때만 완료 화면을 보여 준다.
  const exists = code
    ? await db.application.findUnique({ where: { code }, select: { id: true } })
    : null;
  if (!exists) redirect({ href: "/apply", locale });

  const t = await getTranslations("apply.done");

  return (
    <section className="bg-mist py-14 sm:py-24">
      <div className="container-page max-w-xl">
        <div className="card text-center">
          <span className="bg-forest mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5l4.5 4.5L19 7.500" />
            </svg>
          </span>
          <h1 className="text-ink mt-5 text-2xl font-extrabold">
            {t("title")}
          </h1>
          <p className="text-ink mt-2 text-lg font-semibold">{t("body")}</p>

          <div className="bg-mist mt-6 rounded-2xl p-5">
            <p className="text-ink-soft text-sm">{t("codeLabel")}</p>
            <p className="text-forest mt-1 text-2xl font-extrabold tracking-wide break-all">
              {code}
            </p>
          </div>
          <p className="text-ink-soft mt-4 text-sm leading-relaxed">
            {t("codeHint")}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <CopyCode code={code} />
            <Link
              href={{ pathname: "/my", query: { code } }}
              className="btn btn-primary"
            >
              {t("toMy")}
            </Link>
          </div>
          <Link
            href="/"
            className="text-forest mt-5 inline-block text-sm font-semibold underline underline-offset-4"
          >
            {t("toHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
