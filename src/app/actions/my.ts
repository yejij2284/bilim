"use server";

import { db } from "@/lib/db";
import { normalizeApplicationCode } from "@/lib/application-code";
import { normalizePhone } from "@/lib/schemas/application";
import { clearMySession, getMySession, setMySession } from "@/lib/session";

export type LookupState = { error: "required" | "notFound" } | null;

/** 신청번호와 전화번호로 조회한다. 맞으면 이 브라우저에서 7일 동안 다시 묻지 않는다. */
export async function lookupApplication(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const code = normalizeApplicationCode(String(formData.get("code") ?? ""));
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!code || !phone) return { error: "required" };

  const application = await db.application.findUnique({
    where: { code },
    select: { id: true, phone: true },
  });
  // 번호가 틀렸는지 전화번호가 틀렸는지는 알려 주지 않는다.
  if (!application || application.phone !== phone) return { error: "notFound" };

  await setMySession(application.id);
  return null;
}

/** 다른 신청을 조회할 수 있게 조회 상태를 지운다. */
export async function leaveMyApplication() {
  await clearMySession();
}

export type SendState = { ok: true } | { ok: false; error: "empty" | "tooLong" | "session" | "closed" };

/** 고객이 메시지 창에서 답장을 보낸다. */
export async function sendCustomerMessage(body: string): Promise<SendState> {
  const applicationId = await getMySession();
  if (!applicationId) return { ok: false, error: "session" };

  const text = body.trim();
  if (!text) return { ok: false, error: "empty" };
  if (text.length > 1000) return { ok: false, error: "tooLong" };

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { status: true },
  });
  if (!application) return { ok: false, error: "session" };
  if (application.status === "CANCELED") return { ok: false, error: "closed" };

  await db.message.create({
    data: { applicationId, sender: "CUSTOMER", body: text },
  });
  return { ok: true };
}

/** 화면에 보인 관리자 메시지를 읽음으로 표시한다. */
export async function markMyMessagesRead() {
  const applicationId = await getMySession();
  if (!applicationId) return;
  await db.message.updateMany({
    where: { applicationId, sender: "ADMIN", readAt: null },
    data: { readAt: new Date() },
  });
}
