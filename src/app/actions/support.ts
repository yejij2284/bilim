"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";

const safeLocale = (locale: string) =>
  (locales as readonly string[]).includes(locale) ? locale : "en";

/* Q&A 게시판 */

const qnaSchema = z
  .object({
    authorName: z.string().trim().min(1, "required").max(40, "tooLong"),
    title: z.string().trim().min(1, "required").max(100, "tooLong"),
    body: z.string().trim().min(1, "required").max(2000, "tooLong"),
    isPrivate: z.boolean(),
    password: z.string().max(72, "tooLong"),
  })
  .refine((v) => !v.isPrivate || v.password.length >= 4, {
    path: ["password"],
    message: "passwordShort",
  });

export type QnaInput = z.input<typeof qnaSchema> & { website?: string };
export type QnaResult =
  | { ok: true; id: number }
  | { ok: false; errors: Record<string, string> };

/** 질문 등록. 비공개 글은 비밀번호를 해시로 저장한다. */
export async function createQnaPost(
  input: QnaInput,
  locale: string,
): Promise<QnaResult> {
  // 사람 눈에 안 보이는 칸(website)이 채워져 있으면 스팸으로 보고 조용히 무시한다.
  if (input.website) return { ok: true, id: 0 };

  const parsed = qnaSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  try {
    const { authorName, title, body, isPrivate, password } = parsed.data;
    const post = await db.qnaPost.create({
      data: {
        authorName,
        title,
        body,
        isPrivate,
        passwordHash: isPrivate ? await bcrypt.hash(password, 10) : "",
        locale: safeLocale(locale),
      },
    });
    return { ok: true, id: post.id };
  } catch (e) {
    console.error("createQnaPost failed", e);
    return { ok: false, errors: { form: "server" } };
  }
}

export type UnlockResult =
  | {
      ok: true;
      post: {
        title: string;
        body: string;
        authorName: string;
        createdAt: string;
        answer: string | null;
        answeredAt: string | null;
      };
    }
  | { ok: false };

/** 비공개 글을 비밀번호로 확인한다. */
export async function unlockQnaPost(
  id: number,
  password: string,
): Promise<UnlockResult> {
  const post = await db.qnaPost.findUnique({ where: { id } });
  if (!post || !post.isPrivate || !post.passwordHash) return { ok: false };
  if (!(await bcrypt.compare(password, post.passwordHash))) return { ok: false };
  return {
    ok: true,
    post: {
      title: post.title,
      body: post.body,
      authorName: post.authorName,
      createdAt: post.createdAt.toISOString(),
      answer: post.answer,
      answeredAt: post.answeredAt?.toISOString() ?? null,
    },
  };
}

/* 1:1 문의 */

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(60),
  contact: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
});

/** 떠 있는 상담 버튼에서 남기는 문의 */
export async function createInquiry(
  input: { name: string; contact: string; body: string; website?: string },
  locale: string,
): Promise<{ ok: boolean }> {
  if (input.website) return { ok: true };
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  try {
    await db.inquiry.create({
      data: { ...parsed.data, locale: safeLocale(locale) },
    });
    return { ok: true };
  } catch (e) {
    console.error("createInquiry failed", e);
    return { ok: false };
  }
}
