import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function QnaListPage({
  params,
}: PageProps<"/[locale]/support/qna">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");

  const posts = await db.qnaPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      authorName: true,
      isPrivate: true,
      answer: true,
      createdAt: true,
    },
  });

  const date = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, {
    dateStyle: "medium",
    timeZone: "Asia/Seoul",
  });

  return (
    <section className="bg-mist py-10 sm:py-16">
      <div className="container-page max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/support"
              className="text-forest text-sm font-semibold"
            >
              <span aria-hidden="true">←</span> {t("title")}
            </Link>
            <h1 className="text-ink mt-1 text-3xl font-extrabold tracking-tight">
              {t("qnaTitle")}
            </h1>
          </div>
          <Link href="/support/qna/new" className="btn btn-primary">
            {t("qna.write")}
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="card text-ink-soft text-center">{t("qna.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/support/qna/${post.id}`}
                  className="border-line hover:border-sage flex items-center justify-between gap-4 rounded-2xl border bg-white px-5 py-4 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="text-ink block truncate text-[15px] font-semibold">
                      {post.isPrivate ? t("qna.privateTitle") : post.title}
                    </span>
                    <span className="text-ink-soft mt-0.5 block text-sm">
                      {post.isPrivate ? t("qna.private") : post.authorName} ·{" "}
                      {date.format(post.createdAt)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
                      post.answer
                        ? "border-forest bg-forest text-white"
                        : "border-sage text-sage-text bg-white"
                    }`}
                  >
                    {post.answer ? t("qna.answered") : t("qna.waiting")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
