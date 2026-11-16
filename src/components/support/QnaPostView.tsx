"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { unlockQnaPost } from "@/app/actions/support";

export type QnaPostData = {
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  answer: string | null;
  answeredAt: string | null;
};

/**
 * Q&A 글 보기.
 * 공개 글은 post 를 바로 받아 보여 주고, 비공개 글은 비밀번호를 확인한 뒤 보여 준다.
 */
export function QnaPostView({
  id,
  post: initialPost,
}: {
  id: number;
  post: QnaPostData | null;
}) {
  const t = useTranslations("support.qna");
  const locale = useLocale();
  const [post, setPost] = useState(initialPost);
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);
  const [pending, startTransition] = useTransition();

  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, {
      dateStyle: "medium",
    }).format(new Date(iso));

  if (!post) {
    return (
      <form
        className="card space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setWrong(false);
          startTransition(async () => {
            const result = await unlockQnaPost(id, password);
            if (result.ok) setPost(result.post);
            else setWrong(true);
          });
        }}
      >
        <h1 className="text-ink text-xl font-bold">{t("privateTitle")}</h1>
        <p className="text-ink-soft text-[15px]">{t("unlockIntro")}</p>
        <div>
          <label htmlFor="qna-unlock" className="field-label">
            {t("password")}
          </label>
          <input
            id="qna-unlock"
            type="password"
            required
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
          {wrong && (
            <p role="alert" className="field-error">
              {t("wrongPassword")}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("checking") : t("unlock")}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <article className="card">
        <p className="text-sage-text text-sm font-semibold">{t("question")}</p>
        <h1 className="text-ink mt-1 text-2xl font-bold break-words">
          {post.title}
        </h1>
        <p className="text-ink-soft mt-2 text-sm">
          {post.authorName} · {date(post.createdAt)}
        </p>
        <p className="text-ink mt-5 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
          {post.body}
        </p>
      </article>

      <section className="bg-mist border-line rounded-3xl border p-6 sm:p-8">
        <h2 className="text-forest text-lg font-bold">{t("answer")}</h2>
        {post.answer ? (
          <>
            {post.answeredAt && (
              <p className="text-ink-soft mt-1 text-sm">
                {date(post.answeredAt)}
              </p>
            )}
            <p className="text-ink mt-4 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
              {post.answer}
            </p>
          </>
        ) : (
          <p className="text-ink-soft mt-3 text-[15px]">{t("noAnswer")}</p>
        )}
      </section>
    </div>
  );
}
