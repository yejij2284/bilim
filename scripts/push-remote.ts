// 온라인 DB(Turso)에 테이블을 만든다. 비어 있는 새 DB에 한 번만 실행한다.
//
//   1) .env 의 DATABASE_URL, DATABASE_AUTH_TOKEN 을 Turso 값으로 바꾼다.
//   2) npm run db:remote     (테이블 만들기)
//   3) npm run db:seed       (예시 제품·패키지 넣기)
//
// prisma db push 는 Turso 주소(libsql://)에 직접 연결하지 못하므로,
// 스키마를 SQL로 바꾼 뒤 libSQL 클라이언트로 실행한다.
import "dotenv/config";
import { execSync } from "node:child_process";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || url.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL 이 로컬 파일입니다. 로컬 DB는 npm run db:push 를 쓰세요.",
    );
  }

  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script",
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );

  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  await client.executeMultiple(sql);
  client.close();
  console.log("온라인 DB에 테이블을 만들었습니다. 이어서 npm run db:seed 를 실행하세요.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
