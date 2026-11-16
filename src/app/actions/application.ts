"use server";

import { db } from "@/lib/db";
import { generateApplicationCode } from "@/lib/application-code";
import {
  normalizePhone,
  validateAll,
  type ApplyFormValues,
  type FieldErrors,
} from "@/lib/schemas/application";
import { locales } from "@/i18n/routing";

export type SubmitResult =
  | { ok: true; code: string }
  | { ok: false; error: "validation"; step: number; errors: FieldErrors }
  | { ok: false; error: "items" | "server" };

/** 상담 신청 제출. 서버에서 다시 한 번 전체 검사한 뒤 저장하고 신청번호를 발급한다. */
export async function submitApplication(
  values: ApplyFormValues,
  locale: string,
): Promise<SubmitResult> {
  const checked = validateAll(values);
  if (!checked.ok) {
    return {
      ok: false,
      error: "validation",
      step: checked.step,
      errors: checked.errors,
    };
  }

  const isRent = values.type === "RENT";

  try {
    // 고른 제품·패키지가 실제로 있는지 확인하고, 신청 당시 이름을 남긴다.
    const items: {
      kind: string;
      productId?: number;
      packageId?: number;
      category?: string;
      label: string;
    }[] = [];

    if (isRent) {
      const [products, packages] = await Promise.all([
        db.product.findMany({
          where: { slug: { in: values.productSlugs }, isActive: true },
        }),
        db.package.findMany({
          where: { slug: { in: values.packageSlugs }, isActive: true },
        }),
      ]);
      for (const pkg of packages) {
        items.push({ kind: "PACKAGE", packageId: pkg.id, label: `[패키지] ${pkg.nameKo}` });
      }
      for (const p of products) {
        items.push({
          kind: "PRODUCT",
          productId: p.id,
          label: `${p.brand} ${p.nameKo} (${p.grade})`,
        });
      }
      if (items.length === 0) return { ok: false, error: "items" };
    } else {
      for (const category of values.sellCategories) {
        items.push({ kind: "CATEGORY", category, label: category });
      }
    }

    const data = {
      type: values.type,
      locale: (locales as readonly string[]).includes(locale) ? locale : "en",
      postcode: values.postcode.trim(),
      address: values.address.trim(),
      addressDetail: values.addressDetail.trim(),
      buildingType: values.buildingType,
      preferredDate: values.preferredDate,
      timeSlot: values.timeSlot,
      rentMonths: isRent ? Number(values.rentMonths) : null,
      name: values.name.trim(),
      phone: normalizePhone(values.phone),
      email: values.email.trim().toLowerCase(),
      contactMethod: values.contactMethod,
      contactId: values.contactId.trim(),
      nationality: values.nationality.trim(),
      language: values.language,
      note: values.note.trim(),
      consentAt: new Date(),
      sellBrandModel: isRent ? null : values.sellBrandModel.trim(),
      sellPurchaseYear: isRent ? null : Number(values.sellPurchaseYear),
      sellCondition: isRent ? null : values.sellCondition,
      departureDate: isRent ? null : values.departureDate || null,
      items: { create: items },
      photos: isRent
        ? undefined
        : { create: values.photoUrls.map((url) => ({ url })) },
      statusLogs: { create: { status: "RECEIVED" } },
    };

    // 신청번호가 겹치면 다시 만든다.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateApplicationCode(values.type);
      const exists = await db.application.findUnique({ where: { code } });
      if (exists) continue;
      await db.application.create({ data: { ...data, code } });
      return { ok: true, code };
    }
    return { ok: false, error: "server" };
  } catch (e) {
    console.error("submitApplication failed", e);
    return { ok: false, error: "server" };
  }
}
