import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// 서명된 쿠키로 만든 간단한 세션.
// - 내 신청: 신청번호+전화번호 조회에 성공하면 그 신청의 id를 쿠키에 담는다.
// 쿠키 값은 SESSION_SECRET으로 서명하므로 사용자가 고칠 수 없다.

const MY_COOKIE = "bilim_my";
const MY_MAX_AGE = 60 * 60 * 24 * 7; // 7일

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET 환경변수를 16자 이상으로 설정해 주세요.");
  }
  return "dev-only-secret-change-me";
}

function sign(payload: string): string {
  const mac = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const index = token.lastIndexOf(".");
  if (index < 1) return null;
  const payload = token.slice(0, index);
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(token);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  // payload = "<값>|<만료 시각(ms)>"
  const [value, expires] = payload.split("|");
  if (!value || !expires || Number(expires) < Date.now()) return null;
  return value;
}

async function setCookie(name: string, value: string, maxAge: number) {
  const store = await cookies();
  store.set(name, sign(`${value}|${Date.now() + maxAge * 1000}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

/* 내 신청 */

export async function setMySession(applicationId: number) {
  await setCookie(MY_COOKIE, String(applicationId), MY_MAX_AGE);
}

export async function getMySession(): Promise<number | null> {
  const store = await cookies();
  const value = verify(store.get(MY_COOKIE)?.value);
  const id = Number(value);
  return value && Number.isInteger(id) ? id : null;
}

export async function clearMySession() {
  (await cookies()).delete(MY_COOKIE);
}
