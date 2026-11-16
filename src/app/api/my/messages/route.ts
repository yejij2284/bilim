import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMySession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * 내 신청의 메시지 목록과 현재 상태.
 * 메시지 창이 20초마다 불러 새 메시지를 확인한다.
 * ?count=1 이면 읽지 않은 메시지 수만 돌려준다 (헤더 배지용).
 */
export async function GET(request: Request) {
  const applicationId = await getMySession();
  if (!applicationId) {
    return NextResponse.json({ signedIn: false, unread: 0, messages: [] });
  }

  const unread = await db.message.count({
    where: { applicationId, sender: "ADMIN", readAt: null },
  });

  if (new URL(request.url).searchParams.get("count")) {
    return NextResponse.json({ signedIn: true, unread });
  }

  const [application, messages] = await Promise.all([
    db.application.findUnique({
      where: { id: applicationId },
      select: { status: true },
    }),
    db.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
      select: { id: true, sender: true, body: true, createdAt: true, readAt: true },
    }),
  ]);

  return NextResponse.json({
    signedIn: true,
    status: application?.status ?? null,
    unread,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      isNew: m.sender === "ADMIN" && m.readAt === null,
    })),
  });
}
