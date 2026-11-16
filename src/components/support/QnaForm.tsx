"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Link, useRouter } from "@/i18n/navigation";
import { createQnaPost } from "@/app/actions/support";

type Values = {
  authorName: string;
  title: string;
  body: string;
  visibility: "public" | "private";
  password: string;
  website: string;
};

/** Q&A 질문 쓰기 */
export function QnaForm() {
  const t = useTranslations("support.qna");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      authorName: "",
      title: "",
      body: "",
      visibility: "public",
      password: "",
      website: "",
    },
  });
  const isPrivate = watch("visibility") === "private";

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createQnaPost(
        {
          authorName: values.authorName,
          title: values.title,
          body: values.body,
          isPrivate: values.visibility === "private",
          password: values.visibility === "private" ? values.password : "",
          website: values.website,
        },
        locale,
      );
      if (result.ok) {
        router.push(result.id ? `/support/qna/${result.id}` : "/support/qna");
        router.refresh();
        return;
      }
      for (const [field, message] of Object.entries(result.errors)) {
        if (field === "form") setFormError(t(`errors.${message}`));
        else setError(field as keyof Values, { message });
      }
    });
  });

  const err = (name: keyof Values) => {
    const key = errors[name]?.message;
    return key ? (
      <p role="alert" className="field-error">
        {t(`errors.${key}`)}
      </p>
    ) : null;
  };

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5">
      <div>
        <label htmlFor="qna-name" className="field-label">
          {t("form.name")}
        </label>
        <input
          id="qna-name"
          type="text"
          className="field-input"
          {...register("authorName", { required: "required" })}
        />
        {err("authorName")}
      </div>
      <div>
        <label htmlFor="qna-title" className="field-label">
          {t("form.subject")}
        </label>
        <input
          id="qna-title"
          type="text"
          maxLength={100}
          className="field-input"
          {...register("title", { required: "required" })}
        />
        {err("title")}
      </div>
      <div>
        <label htmlFor="qna-body" className="field-label">
          {t("form.body")}
        </label>
        <textarea
          id="qna-body"
          rows={6}
          maxLength={2000}
          className="field-input"
          {...register("body", { required: "required" })}
        />
        {err("body")}
      </div>

      <fieldset>
        <legend className="field-label">{t("form.visibility")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(["public", "private"] as const).map((v) => (
            <label
              key={v}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${
                watch("visibility") === v
                  ? "border-forest bg-mist"
                  : "border-line bg-white"
              }`}
            >
              <input
                type="radio"
                value={v}
                className="accent-forest mt-0.5 h-5 w-5"
                {...register("visibility")}
              />
              <span>
                <span className="text-ink block font-bold">{t(`form.${v}`)}</span>
                <span className="text-ink-soft block text-sm">
                  {t(`form.${v}Desc`)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {isPrivate && (
        <div>
          <label htmlFor="qna-password" className="field-label">
            {t("form.password")}
          </label>
          <input
            id="qna-password"
            type="password"
            autoComplete="new-password"
            className="field-input"
            aria-describedby="qna-password-hint"
            {...register("password", {
              validate: (v) => v.length >= 4 || "passwordShort",
            })}
          />
          <p id="qna-password-hint" className="text-ink-soft mt-1.5 text-sm">
            {t("form.passwordHint")}
          </p>
          {err("password")}
        </div>
      )}

      {/* 스팸 방지용 숨은 칸. 사람은 비워 둔다. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {formError && (
        <p role="alert" className="field-error">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Link href="/support/qna" className="btn btn-secondary">
          {t("form.cancel")}
        </Link>
        <button type="submit" className="btn btn-primary px-8" disabled={pending}>
          {pending ? t("form.submitting") : t("form.submit")}
        </button>
      </div>
    </form>
  );
}
