import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { QnaPostView } from "@/components/support/QnaPostView";

export const dynamic = "force-dynamic";

export default async function QnaPostPage({
  params,
}: PageProps<"/[locale]/support/qna/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const post = await db.qnaPost.findUnique({ where: { id: postId } });
  if (!post) notFound();
  const t = await getTranslations("support.qna");

  return (
    <section className="bg-mist py-10 sm:py-16">
      <div className="container-page max-w-2xl">
        <Link
          href="/support/qna"
          className="text-forest mb-4 inline-flex min-h-10 items-center gap-1 text-sm font-semibold"
        >
          <span aria-hidden="true">←</span> {t("back")}
        </Link>
        {/* 비공개 글의 내용은 브라우저로 보내지 않는다. 비밀번호가 맞을 때만 서버가 돌려준다. */}
        <QnaPostView
          id={post.id}
          post={
            post.isPrivate
              ? null
              : {
                  title: post.title,
                  body: post.body,
                  authorName: post.authorName,
                  createdAt: post.createdAt.toISOString(),
                  answer: post.answer,
                  answeredAt: post.answeredAt?.toISOString() ?? null,
                }
          }
        />
      </div>
    </section>
  );
}
