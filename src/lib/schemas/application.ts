import { z } from "zod";
import {
  APPLICATION_TYPES,
  BUILDING_TYPES,
  CATEGORIES,
  CONTACT_METHODS,
  RENT_MONTH_OPTIONS,
  SELL_CONDITIONS,
  TIME_SLOTS,
  USER_LANGUAGES,
  type ApplicationType,
} from "@/lib/constants";

// 신청 폼 입력값 검사.
// 오류 메시지는 키만 넣고, 화면에서 messages/*.json 의 apply.errors.<키> 로 번역한다.
// 브라우저(단계별 검사)와 서버(제출 시 전체 검사)가 같은 스키마를 쓴다.

export type ApplyFormValues = {
  type: ApplicationType;
  productSlugs: string[];
  packageSlugs: string[];
  sellCategories: string[];
  sellBrandModel: string;
  sellPurchaseYear: string;
  sellCondition: string;
  photoUrls: string[];
  postcode: string;
  address: string;
  addressDetail: string;
  buildingType: string;
  preferredDate: string;
  timeSlot: string;
  rentMonths: string;
  departureDate: string;
  name: string;
  phone: string;
  email: string;
  contactMethod: string;
  contactId: string;
  nationality: string;
  language: string;
  note: string;
  consent: boolean;
};

export const STEP_COUNT = 6;
export const MAX_PHOTOS = 6;

const required = (max = 200) => z.string().trim().min(1, "required").max(max, "tooLong");
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "required");
const todayString = () => new Date().toISOString().slice(0, 10);

/** 전화번호에서 숫자만 남긴다 (조회할 때도 같은 방식으로 비교한다). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function stepSchema(step: number, type: ApplicationType) {
  switch (step) {
    case 1:
      return z.object({ type: z.enum(APPLICATION_TYPES, { error: "required" }) });

    case 2:
      if (type === "RENT") {
        return z
          .object({
            productSlugs: z.array(z.string().max(100)).max(30),
            packageSlugs: z.array(z.string().max(100)).max(10),
          })
          .refine((v) => v.productSlugs.length + v.packageSlugs.length > 0, {
            path: ["productSlugs"],
            message: "selectOne",
          });
      }
      return z.object({
        sellCategories: z.array(z.enum(CATEGORIES)).min(1, "selectOne"),
        sellBrandModel: required(100),
        sellPurchaseYear: z
          .string()
          .regex(/^(19|20)\d{2}$/, "invalidYear")
          .refine((y) => Number(y) <= new Date().getFullYear(), "invalidYear"),
        sellCondition: z.enum(SELL_CONDITIONS, { error: "required" }),
        photoUrls: z
          // 로컬 저장(/api/files/..) 또는 Vercel Blob 주소만 받는다.
          .array(
            z
              .string()
              .regex(
                /^(\/api\/files\/|https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/uploads\/)[a-f0-9-]{36}(-[A-Za-z0-9]+)?\.(jpg|png|webp)$/,
              ),
          )
          .max(MAX_PHOTOS, "tooManyPhotos"),
      });

    case 3:
      return z.object({
        postcode: z.string().trim().regex(/^\d{5}$/, "invalidPostcode"),
        address: required(200),
        addressDetail: required(200),
        buildingType: z.enum(BUILDING_TYPES, { error: "required" }),
      });

    case 4: {
      const base = {
        preferredDate: dateString.refine((d) => d >= todayString(), "pastDate"),
        timeSlot: z.enum(TIME_SLOTS, { error: "required" }),
      };
      if (type === "RENT") {
        return z.object({
          ...base,
          rentMonths: z
            .string()
            .refine(
              (m) => (RENT_MONTH_OPTIONS as readonly number[]).includes(Number(m)),
              "required",
            ),
        });
      }
      return z.object({
        ...base,
        // 출국 예정일은 선택 항목 (출국하지 않고 처분만 하는 사람도 있다)
        departureDate: z.union([z.literal(""), dateString]),
      });
    }

    case 5:
      return z.object({
        name: required(80),
        phone: z
          .string()
          .trim()
          .regex(/^[0-9+\-\s()]+$/, "invalidPhone")
          .refine((p) => {
            const n = normalizePhone(p).length;
            return n >= 9 && n <= 15;
          }, "invalidPhone"),
        email: z.email("invalidEmail").max(200, "tooLong"),
        contactMethod: z.enum(CONTACT_METHODS, { error: "required" }),
        contactId: z.string().trim().max(100, "tooLong"),
        nationality: required(60),
        language: z.enum(USER_LANGUAGES, { error: "required" }),
        note: z.string().trim().max(1000, "tooLong"),
      });

    case 6:
      return z.object({
        consent: z.literal(true, { error: "consentRequired" }),
      });

    default:
      return z.object({});
  }
}

export type FieldErrors = Partial<Record<keyof ApplyFormValues, string>>;

/** 한 단계의 입력값을 검사해 필드별 오류 키를 돌려준다. 오류가 없으면 빈 객체. */
export function validateStep(
  step: number,
  values: ApplyFormValues,
): FieldErrors {
  const result = stepSchema(step, values.type).safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ApplyFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** 모든 단계를 검사한다. 첫 오류가 있는 단계 번호와 오류를 돌려준다. */
export function validateAll(
  values: ApplyFormValues,
): { ok: true } | { ok: false; step: number; errors: FieldErrors } {
  for (let step = 1; step <= STEP_COUNT; step++) {
    const errors = validateStep(step, values);
    if (Object.keys(errors).length > 0) return { ok: false, step, errors };
  }
  return { ok: true };
}
