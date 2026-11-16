import { randomInt } from "node:crypto";
import type { ApplicationType } from "./constants";

// 헷갈리기 쉬운 글자(0/O, 1/I/L)는 뺀다.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** 신청번호 예: BL-R-261116-4F7K (R=대여, S=팔기) */
export function generateApplicationCode(
  type: ApplicationType,
  now: Date = new Date(),
): string {
  // 한국 시간 기준 날짜
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const yymmdd = kst.toISOString().slice(2, 10).replace(/-/g, "");
  let random = "";
  for (let i = 0; i < 4; i++) random += ALPHABET[randomInt(ALPHABET.length)];
  return `BL-${type === "RENT" ? "R" : "S"}-${yymmdd}-${random}`;
}

/** 사용자가 입력한 신청번호를 비교용으로 정리한다. */
export function normalizeApplicationCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
