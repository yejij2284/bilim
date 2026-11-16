// FAQ 구성. 질문과 답변 문구는 messages/*.json 의 faq.items.<카테고리>.<번호> 에 있다.
// 질문을 추가하려면 여기 번호를 늘리고 세 언어 파일에 q, a 를 넣는다.
// TODO: 실제 FAQ 내용 — 지금 답변은 예시 문구다 (결제 방법, 서비스 지역, 수리비 기준 등 미정).

export const FAQ_CATEGORIES = ["rent", "sell", "payment", "repair", "etc"] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_ITEMS: Record<FaqCategory, readonly string[]> = {
  rent: ["1", "2", "3"],
  sell: ["1", "2", "3"],
  payment: ["1", "2"],
  repair: ["1", "2"],
  etc: ["1", "2"],
};
