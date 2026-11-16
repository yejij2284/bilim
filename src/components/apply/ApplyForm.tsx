"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Link, useRouter } from "@/i18n/navigation";
import { submitApplication } from "@/app/actions/application";
import {
  APPLICATION_TYPES,
  BUILDING_TYPES,
  CATEGORIES,
  CONTACT_METHODS,
  RENT_MONTH_OPTIONS,
  SELL_CONDITIONS,
  TIME_SLOTS,
  USER_LANGUAGES,
} from "@/lib/constants";
import { formatKRW } from "@/lib/format";
import {
  MAX_PHOTOS,
  STEP_COUNT,
  validateStep,
  type ApplyFormValues,
} from "@/lib/schemas/application";
import { GradeBadge } from "@/components/grade/GradeBadge";
import { AddressSearch } from "./AddressSearch";
import { PhotoUploader } from "./PhotoUploader";

export type ApplyProductOption = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  grade: string;
  monthlyPrice: number;
};
export type ApplyPackageOption = {
  slug: string;
  name: string;
  desc: string;
  monthlyPrice: number;
};

type FieldName = keyof ApplyFormValues;

/** label + 입력칸 + 오류 문구 */
function Field({
  name,
  label,
  hint,
  optional,
  error,
  children,
}: {
  name: FieldName;
  label: string;
  hint?: string;
  optional?: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  const t = useTranslations("apply");
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
        {optional && (
          <span className="text-ink-soft font-normal"> ({t("optional")})</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-ink-soft mt-1.5 text-sm">{hint}</p>
      )}
      {error && (
        <p id={`e-${name}`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function ApplyForm({
  initial,
  products,
  packages,
  today,
}: {
  initial: ApplyFormValues;
  products: ApplyProductOption[];
  packages: ApplyPackageOption[];
  today: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    setFocus,
    formState: { errors },
  } = useForm<ApplyFormValues>({ defaultValues: initial });

  const values = watch();
  const isRent = values.type === "RENT";

  // 값을 고치면 그 칸의 오류 표시를 지운다.
  useEffect(() => {
    const sub = watch((_, { name }) => {
      if (name) clearErrors(name as FieldName);
    });
    return () => sub.unsubscribe();
  }, [watch, clearErrors]);

  function goTo(next: number) {
    setFormError(null);
    setStep(next);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ block: "start" });
      headingRef.current?.focus();
    });
  }

  /** 현재 단계를 검사하고, 오류가 있으면 표시한다. */
  function showErrors(stepNo: number, fieldErrors: Record<string, string>) {
    const names = Object.keys(fieldErrors) as FieldName[];
    names.forEach((name) =>
      setError(name, { type: "manual", message: fieldErrors[name] }),
    );
    setFormError(t("apply.errors.fixStep"));
    if (stepNo !== step) setStep(stepNo);
    requestAnimationFrame(() => {
      try {
        setFocus(names[0]);
      } catch {
        // 등록되지 않은 칸(사진 등)은 초점을 줄 수 없다.
      }
    });
  }

  function handleNext() {
    const fieldErrors = validateStep(step, getValues());
    if (Object.keys(fieldErrors).length > 0) {
      showErrors(step, fieldErrors as Record<string, string>);
      return;
    }
    goTo(step + 1);
  }

  function handleSubmit() {
    const fieldErrors = validateStep(STEP_COUNT, getValues());
    if (Object.keys(fieldErrors).length > 0) {
      showErrors(STEP_COUNT, fieldErrors as Record<string, string>);
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const result = await submitApplication(getValues(), locale);
      if (result.ok) {
        router.push({ pathname: "/apply/done", query: { code: result.code } });
        return;
      }
      if (result.error === "validation") {
        showErrors(result.step, result.errors as Record<string, string>);
      } else {
        setFormError(t(`apply.errors.${result.error}`));
      }
    });
  }

  const errorText = (name: FieldName) => {
    const key = errors[name]?.message;
    return key ? t(`apply.errors.${key}`, { max: MAX_PHOTOS }) : null;
  };

  const inputProps = (name: FieldName) => ({
    id: `f-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `e-${name}` : undefined,
    className: "field-input",
    ...register(name),
  });

  const choiceClass = (checked: boolean) =>
    `flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-[15px] transition-colors ${
      checked ? "border-forest bg-mist" : "border-line hover:border-sage bg-white"
    }`;

  const selectedCount =
    values.productSlugs.length + values.packageSlugs.length;

  const selectedLabels = isRent
    ? [
        ...packages
          .filter((p) => values.packageSlugs.includes(p.slug))
          .map((p) => `${t("packages.title")}: ${p.name}`),
        ...products
          .filter((p) => values.productSlugs.includes(p.slug))
          .map((p) => `${p.brand} ${p.name}`),
      ]
    : values.sellCategories.map((c) => t(`categories.${c}`));

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* 진행 표시 */}
      <div className="mb-6">
        <p className="text-sage-text text-sm font-semibold">
          {t("apply.stepOf", { current: step, total: STEP_COUNT })}
        </p>
        <div
          className="bg-mist-deep mt-2 h-2 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEP_COUNT}
          aria-valuenow={step}
          aria-label={t("apply.stepOf", { current: step, total: STEP_COUNT })}
        >
          <div
            className="bg-forest h-full rounded-full transition-all"
            style={{ width: `${(step / STEP_COUNT) * 100}%` }}
          />
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEP_COUNT) handleNext();
          else handleSubmit();
        }}
        className="card"
      >
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-ink text-xl font-bold outline-none"
        >
          {step === STEP_COUNT
            ? t("apply.review.title")
            : t(`apply.steps.${step}`)}
        </h2>

        <div className="mt-6 space-y-5">
          {/* 1. 서비스 종류 */}
          {step === 1 && (
            <fieldset>
              <legend className="field-label">{t("apply.type.legend")}</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {APPLICATION_TYPES.map((type) => (
                  <label key={type} className={choiceClass(values.type === type)}>
                    <input
                      type="radio"
                      value={type}
                      className="accent-forest h-5 w-5"
                      {...register("type")}
                    />
                    <span>
                      <span className="text-ink block font-bold">
                        {t(`apply.type.${type}`)}
                      </span>
                      <span className="text-ink-soft block text-sm">
                        {t(`apply.type.${type}Desc`)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* 2. 제품 선택 (대여) */}
          {step === 2 && isRent && (
            <>
              <p className="text-ink-soft text-[15px]">
                {t("apply.items.rentLegend")}
              </p>
              <fieldset>
                <legend className="field-label">
                  {t("apply.items.packages")}
                </legend>
                <div className="mt-2 grid gap-2">
                  {packages.map((pkg) => (
                    <label
                      key={pkg.slug}
                      className={choiceClass(
                        values.packageSlugs.includes(pkg.slug),
                      )}
                    >
                      <input
                        type="checkbox"
                        value={pkg.slug}
                        className="accent-forest h-5 w-5 shrink-0"
                        {...register("packageSlugs")}
                      />
                      <span className="flex-1">
                        <span className="text-ink block font-bold">
                          {pkg.name}
                        </span>
                        <span className="text-ink-soft block text-sm">
                          {pkg.desc}
                        </span>
                      </span>
                      <span className="text-amber shrink-0 text-sm font-bold">
                        {t("rent.monthly", {
                          price: formatKRW(pkg.monthlyPrice, locale),
                        })}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="field-label">
                  {t("apply.items.products")}
                </legend>
                <div className="mt-2 grid gap-2">
                  {products.map((p) => (
                    <div
                      key={p.slug}
                      className={`${choiceClass(values.productSlugs.includes(p.slug))} !cursor-default`}
                    >
                      <label className="flex flex-1 cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          value={p.slug}
                          className="accent-forest h-5 w-5 shrink-0"
                          {...register("productSlugs")}
                        />
                        <span className="flex-1">
                          <span className="text-ink block font-semibold">
                            {p.name}
                          </span>
                          <span className="text-ink-soft block text-sm">
                            {p.brand} · {t(`categories.${p.category}`)} ·{" "}
                            {t("rent.monthly", {
                              price: formatKRW(p.monthlyPrice, locale),
                            })}
                          </span>
                        </span>
                      </label>
                      <GradeBadge grade={p.grade} size="sm" align="right" />
                    </div>
                  ))}
                </div>
              </fieldset>
              <p className="text-ink-soft text-sm" aria-live="polite">
                {t("apply.items.selected", { count: selectedCount })}
              </p>
              {errorText("productSlugs") && (
                <p role="alert" className="field-error">
                  {errorText("productSlugs")}
                </p>
              )}
            </>
          )}

          {/* 2. 팔 가전 (팔기) */}
          {step === 2 && !isRent && (
            <>
              <fieldset>
                <legend className="field-label">
                  {t("apply.items.sellLegend")}
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c}
                      className={choiceClass(values.sellCategories.includes(c))}
                    >
                      <input
                        type="checkbox"
                        value={c}
                        className="accent-forest h-5 w-5"
                        {...register("sellCategories")}
                      />
                      {t(`categories.${c}`)}
                    </label>
                  ))}
                </div>
                {errorText("sellCategories") && (
                  <p role="alert" className="field-error">
                    {errorText("sellCategories")}
                  </p>
                )}
              </fieldset>
              <Field
                name="sellBrandModel"
                error={errorText("sellBrandModel")}
                label={t("apply.items.brandModel")}
                hint={t("apply.items.brandModelHint")}
              >
                <input type="text" {...inputProps("sellBrandModel")} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  name="sellPurchaseYear"
                  error={errorText("sellPurchaseYear")}
                  label={t("apply.items.purchaseYear")}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder={today.slice(0, 4)}
                    {...inputProps("sellPurchaseYear")}
                  />
                </Field>
                <Field name="sellCondition" error={errorText("sellCondition")} label={t("apply.items.condition")}>
                  <select {...inputProps("sellCondition")}>
                    {SELL_CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {t(`sell.estimator.conditions.${c}`)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <PhotoUploader
                urls={values.photoUrls}
                onChange={(urls) => setValue("photoUrls", urls)}
              />
            </>
          )}

          {/* 3. 주소 */}
          {step === 3 && (
            <>
              <AddressSearch
                onSelect={(postcode, address) => {
                  setValue("postcode", postcode);
                  setValue("address", address);
                  clearErrors(["postcode", "address"]);
                  setFocus("addressDetail");
                }}
              />
              <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
                <Field name="postcode" error={errorText("postcode")} label={t("apply.address.postcode")}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    autoComplete="postal-code"
                    {...inputProps("postcode")}
                  />
                </Field>
                <Field
                  name="address"
                  error={errorText("address")}
                  label={t("apply.address.address")}
                  hint={t("apply.address.addressHint")}
                >
                  <input
                    type="text"
                    autoComplete="address-line1"
                    {...inputProps("address")}
                  />
                </Field>
              </div>
              <Field
                name="addressDetail"
                error={errorText("addressDetail")}
                label={t("apply.address.detail")}
                hint={t("apply.address.detailHint")}
              >
                <input
                  type="text"
                  autoComplete="address-line2"
                  {...inputProps("addressDetail")}
                />
              </Field>
              <Field
                name="buildingType"
                error={errorText("buildingType")}
                label={t("apply.address.buildingType")}
              >
                <select {...inputProps("buildingType")}>
                  {BUILDING_TYPES.map((b) => (
                    <option key={b} value={b}>
                      {t(`apply.address.buildingTypes.${b}`)}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {/* 4. 희망 일정 */}
          {step === 4 && (
            <>
              <Field
                name="preferredDate"
                error={errorText("preferredDate")}
                label={
                  isRent
                    ? t("apply.schedule.dateRent")
                    : t("apply.schedule.dateSell")
                }
              >
                <input type="date" min={today} {...inputProps("preferredDate")} />
              </Field>
              <fieldset>
                <legend className="field-label">
                  {t("apply.schedule.timeSlot")}
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {TIME_SLOTS.map((slot) => (
                    <label
                      key={slot}
                      className={choiceClass(values.timeSlot === slot)}
                    >
                      <input
                        type="radio"
                        value={slot}
                        className="accent-forest h-5 w-5"
                        {...register("timeSlot")}
                      />
                      {t(`apply.schedule.timeSlots.${slot}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              {isRent ? (
                <Field name="rentMonths" error={errorText("rentMonths")} label={t("apply.schedule.rentMonths")}>
                  <select {...inputProps("rentMonths")}>
                    {RENT_MONTH_OPTIONS.map((m) => (
                      <option key={m} value={String(m)}>
                        {t("apply.schedule.months", { months: m })}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field
                  name="departureDate"
                  error={errorText("departureDate")}
                  label={t("apply.schedule.departureDate")}
                  optional
                >
                  <input
                    type="date"
                    min={today}
                    {...inputProps("departureDate")}
                  />
                </Field>
              )}
              <p className="text-ink-soft text-sm">
                {t("apply.schedule.notice")}
              </p>
            </>
          )}

          {/* 5. 연락처와 질문 */}
          {step === 5 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="name" error={errorText("name")} label={t("apply.contact.name")}>
                  <input type="text" autoComplete="name" {...inputProps("name")} />
                </Field>
                <Field
                  name="phone"
                  error={errorText("phone")}
                  label={t("apply.contact.phone")}
                  hint={t("apply.contact.phoneHint")}
                >
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="010-1234-5678"
                    {...inputProps("phone")}
                  />
                </Field>
              </div>
              <Field name="email" error={errorText("email")} label={t("apply.contact.email")}>
                <input
                  type="email"
                  autoComplete="email"
                  {...inputProps("email")}
                />
              </Field>
              <fieldset>
                <legend className="field-label">
                  {t("apply.contact.method")}
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CONTACT_METHODS.map((m) => (
                    <label
                      key={m}
                      className={choiceClass(values.contactMethod === m)}
                    >
                      <input
                        type="radio"
                        value={m}
                        className="accent-forest h-5 w-5"
                        {...register("contactMethod")}
                      />
                      {t(`apply.contact.methods.${m}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field
                name="contactId"
                error={errorText("contactId")}
                label={t("apply.contact.contactId")}
                hint={t("apply.contact.contactIdHint")}
                optional
              >
                <input type="text" {...inputProps("contactId")} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  name="nationality"
                  error={errorText("nationality")}
                  label={t("apply.contact.nationality")}
                >
                  <input
                    type="text"
                    autoComplete="country-name"
                    {...inputProps("nationality")}
                  />
                </Field>
                <Field name="language" error={errorText("language")} label={t("apply.contact.language")}>
                  <select {...inputProps("language")}>
                    {USER_LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {t(`apply.contact.languages.${l}`)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field name="note" error={errorText("note")} label={t("apply.contact.note")} optional>
                <textarea rows={4} maxLength={1000} {...inputProps("note")} />
              </Field>
            </>
          )}

          {/* 6. 확인과 동의 */}
          {step === 6 && (
            <>
              <dl className="divide-line border-line divide-y rounded-2xl border text-[15px]">
                {(
                  [
                    [1, t("apply.steps.1"), [t(`apply.type.${values.type}`)]],
                    [
                      2,
                      t("apply.steps.2"),
                      isRent
                        ? selectedLabels
                        : [
                            selectedLabels.join(", "),
                            `${values.sellBrandModel} · ${values.sellPurchaseYear}`,
                            t(`sell.estimator.conditions.${values.sellCondition}`),
                            t("apply.review.photosCount", {
                              count: values.photoUrls.length,
                            }),
                          ],
                    ],
                    [
                      3,
                      t("apply.steps.3"),
                      [
                        `(${values.postcode}) ${values.address}`,
                        values.addressDetail,
                        t(`apply.address.buildingTypes.${values.buildingType}`),
                      ],
                    ],
                    [
                      4,
                      t("apply.steps.4"),
                      [
                        `${values.preferredDate} · ${t(`apply.schedule.timeSlots.${values.timeSlot}`)}`,
                        isRent
                          ? `${t("apply.schedule.rentMonths")}: ${t("apply.schedule.months", { months: Number(values.rentMonths) })}`
                          : `${t("apply.schedule.departureDate")}: ${values.departureDate || t("apply.review.none")}`,
                      ],
                    ],
                    [
                      5,
                      t("apply.steps.5"),
                      [
                        `${values.name} · ${values.phone}`,
                        values.email,
                        `${t(`apply.contact.methods.${values.contactMethod}`)}${values.contactId ? ` (${values.contactId})` : ""}`,
                        `${values.nationality} · ${t(`apply.contact.languages.${values.language}`)}`,
                        `${t("apply.contact.note")}: ${values.note || t("apply.review.none")}`,
                      ],
                    ],
                  ] as [number, string, string[]][]
                ).map(([stepNo, title, lines]) => (
                  <div
                    key={stepNo}
                    className="flex items-start justify-between gap-4 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <dt className="text-ink-soft text-sm font-semibold">
                        {title}
                      </dt>
                      <dd className="text-ink mt-1 space-y-0.5 break-words">
                        {lines.map((line, i) => (
                          <span key={i} className="block">
                            {line}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo(stepNo)}
                      className="text-forest min-h-10 shrink-0 text-sm font-semibold underline underline-offset-4"
                    >
                      {t("apply.review.edit")}
                    </button>
                  </div>
                ))}
              </dl>

              <div className="bg-mist rounded-2xl p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="accent-forest mt-0.5 h-5 w-5 shrink-0"
                    aria-invalid={errors.consent ? true : undefined}
                    {...register("consent")}
                  />
                  <span className="text-ink text-[15px] font-semibold">
                    {t("apply.review.consent")}
                  </span>
                </label>
                <p className="text-ink-soft mt-2 pl-8 text-sm">
                  {t("apply.review.consentDetail")}{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-forest underline underline-offset-4"
                  >
                    {t("apply.review.privacyLink")}
                  </Link>
                </p>
                {errorText("consent") && (
                  <p role="alert" className="field-error pl-8">
                    {errorText("consent")}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {formError && (
          <p role="alert" className="field-error mt-5">
            {formError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pending}
              onClick={() => goTo(step - 1)}
            >
              {t("apply.prev")}
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn-primary px-8" disabled={pending}>
            {step < STEP_COUNT
              ? t("apply.next")
              : pending
                ? t("apply.submitting")
                : t("apply.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
