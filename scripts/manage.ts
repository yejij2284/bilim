// 관리자 화면 대신 쓰는 간단한 명령줄 도구.
//
//   npm run manage -- list                          최근 신청 20건
//   npm run manage -- message <신청번호> "<내용>"    고객에게 메시지 보내기 (내 신청 화면에 표시)
//   npm run manage -- status <신청번호> <상태>       진행 상태 바꾸기
//   npm run manage -- qna                           Q&A 글 목록
//   npm run manage -- answer <글번호> "<답변>"       Q&A 답변 달기
//   npm run manage -- inquiries                     1:1 문의 목록
//
// 상태: RECEIVED CONSULTING SCHEDULED DELIVERED ACTIVE(대여) SETTLED(팔기) CANCELED
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }),
});

const STATUSES = [
  "RECEIVED",
  "CONSULTING",
  "SCHEDULED",
  "DELIVERED",
  "ACTIVE",
  "SETTLED",
  "CANCELED",
];

async function findApplication(code: string | undefined) {
  if (!code) throw new Error("신청번호를 적어 주세요.");
  const application = await db.application.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!application) throw new Error(`신청번호 ${code} 를 찾을 수 없습니다.`);
  return application;
}

async function main() {
  const [command, a, b] = process.argv.slice(2);

  switch (command) {
    case "list": {
      const rows = await db.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: true },
      });
      for (const r of rows) {
        console.log(
          `${r.code}  ${r.type}  ${r.status}  ${r.name} (${r.phone}, ${r.contactMethod})  ${r.items.map((i) => i.label).join(", ")}`,
        );
      }
      if (rows.length === 0) console.log("신청이 없습니다.");
      break;
    }
    case "message": {
      const application = await findApplication(a);
      if (!b) throw new Error("보낼 내용을 따옴표 안에 적어 주세요.");
      await db.message.create({
        data: { applicationId: application.id, sender: "ADMIN", body: b },
      });
      console.log(`${application.code} 에 메시지를 보냈습니다.`);
      break;
    }
    case "status": {
      const application = await findApplication(a);
      const status = (b ?? "").toUpperCase();
      if (!STATUSES.includes(status)) {
        throw new Error(`상태는 다음 중 하나여야 합니다: ${STATUSES.join(" ")}`);
      }
      await db.application.update({
        where: { id: application.id },
        data: { status, statusLogs: { create: { status } } },
      });
      console.log(`${application.code} 상태를 ${status} 로 바꿨습니다.`);
      break;
    }
    case "qna": {
      const posts = await db.qnaPost.findMany({ orderBy: { createdAt: "desc" } });
      for (const p of posts) {
        console.log(
          `#${p.id}  ${p.answer ? "답변완료" : "미답변"}  ${p.isPrivate ? "비공개" : "공개"}  ${p.authorName}: ${p.title}\n    ${p.body.replace(/\n/g, "\n    ")}`,
        );
      }
      if (posts.length === 0) console.log("글이 없습니다.");
      break;
    }
    case "answer": {
      const id = Number(a);
      if (!Number.isInteger(id) || !b) {
        throw new Error('사용법: answer <글번호> "<답변>"');
      }
      await db.qnaPost.update({
        where: { id },
        data: { answer: b, answeredAt: new Date() },
      });
      console.log(`#${id} 글에 답변을 달았습니다.`);
      break;
    }
    case "inquiries": {
      const rows = await db.inquiry.findMany({ orderBy: { createdAt: "desc" } });
      for (const r of rows) {
        console.log(
          `#${r.id}  ${r.createdAt.toISOString().slice(0, 16)}  ${r.name} (${r.contact}, ${r.locale})\n    ${r.body.replace(/\n/g, "\n    ")}`,
        );
      }
      await db.inquiry.updateMany({ data: { isRead: true } });
      if (rows.length === 0) console.log("문의가 없습니다.");
      break;
    }
    default:
      console.log(
        "사용법: npm run manage -- <list | message | status | qna | answer | inquiries>  (자세한 설명은 scripts/manage.ts 맨 위)",
      );
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
