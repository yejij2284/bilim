# bilim

한국에 사는 외국인을 위한 가전 순환 렌탈 플랫폼. 테크노경영학 5팀 프로젝트.

- 한국어 / 영어 / 중국어(간체) 지원 (`/ko`, `/en`, `/zh`)
- 대여(제품 목록·필터·상세·패키지), 팔기(예상 매입가), 6단계 상담 신청, 내 신청(진행 상태·메시지), 고객센터(FAQ·Q&A·1:1 문의)

## 기술 스택

| 항목 | 사용 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 스타일 | Tailwind CSS 4 |
| 다국어 | next-intl (`messages/ko.json`, `en.json`, `zh.json`) |
| DB | Prisma 7 + SQLite(로컬) / Turso(배포) |
| 폼 | react-hook-form + zod |

## 실행 방법

Node.js 20 이상이 필요합니다.

```bash
npm install
```

`.env.example`을 복사해 `.env`를 만듭니다.

```bash
copy .env.example .env
```

DB 테이블을 만들고 예시 데이터를 넣습니다.

```bash
npm run db:setup
```

개발 서버를 켭니다. 브라우저에서 http://localhost:3000 을 엽니다.

```bash
npm run dev
```

## 환경변수

| 이름 | 설명 | 로컬 | 배포 |
|---|---|---|---|
| `DATABASE_URL` | DB 주소 | `file:./dev.db` | `libsql://...turso.io` |
| `DATABASE_AUTH_TOKEN` | Turso 접속 토큰 | 필요 없음 | 필수 |
| `SESSION_SECRET` | 내 신청 조회 쿠키 서명용 비밀 값(16자 이상) | 아무 값 | 필수 |
| `BLOB_READ_WRITE_TOKEN` | 사진 업로드 저장소(Vercel Blob) | 필요 없음 | Blob 연결 시 자동 생성 |

## 시드 데이터

예시 제품 17개와 패키지 3개가 `prisma/seed.ts`에 있습니다. 가격과 구성은 모두 예시 값입니다.

```bash
npm run db:seed
```

이 명령은 제품과 패키지를 지우고 다시 넣습니다. 신청, 메시지, Q&A는 건드리지 않습니다.
제품이나 가격을 바꾸려면 `prisma/seed.ts`를 고친 뒤 다시 실행합니다.

## 운영 방법 (관리자 화면 대신)

관리자 화면은 만들지 않았습니다. 신청 확인, 고객에게 메시지 보내기, 상태 변경, Q&A 답변은 명령줄 도구로 합니다.

| 하는 일 | 명령 |
|---|---|
| 최근 신청 보기 | `npm run manage -- list` |
| 고객에게 메시지 보내기 | `npm run manage -- message BL-R-261116-XXXX "내용"` |
| 진행 상태 바꾸기 | `npm run manage -- status BL-R-261116-XXXX CONSULTING` |
| Q&A 글 보기 | `npm run manage -- qna` |
| Q&A 답변 달기 | `npm run manage -- answer 1 "답변 내용"` |
| 1:1 문의 보기 | `npm run manage -- inquiries` |

상태 값: `RECEIVED`(접수) → `CONSULTING`(상담 중) → `SCHEDULED`(일정 확정) → `DELIVERED`(배송/수거 완료) → `ACTIVE`(이용 중, 대여) 또는 `SETTLED`(정산 완료, 팔기). 취소는 `CANCELED`.

`.env`의 `DATABASE_URL`이 가리키는 DB에 적용됩니다. 배포한 사이트의 데이터를 다루려면 `.env`를 Turso 값으로 바꾼 뒤 실행합니다.

## 배포 (Vercel)

Vercel은 파일을 저장하지 못하므로 SQLite 파일 대신 온라인 DB(Turso)를 씁니다. Turso는 SQLite와 호환되어 코드를 바꿀 필요가 없습니다.

1. **Turso DB 만들기**: https://turso.tech 에 가입하고 DB를 하나 만든 뒤, DB 주소(`libsql://...`)와 토큰을 복사합니다.
2. **테이블과 예시 데이터 넣기**: `.env`의 `DATABASE_URL`, `DATABASE_AUTH_TOKEN`을 Turso 값으로 바꾸고 아래 두 명령을 실행합니다.

   ```bash
   npm run db:remote
   ```

   ```bash
   npm run db:seed
   ```

3. **GitHub에 올리기**: GitHub에 새 저장소를 만들고 이 폴더를 올립니다.
4. **Vercel에 연결하기**: https://vercel.com 에서 그 저장소를 Import 하고, 환경변수 `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `SESSION_SECRET`을 넣은 뒤 Deploy 합니다.
5. **사진 업로드 저장소 연결**: Vercel 프로젝트의 Storage 탭에서 Blob 저장소를 만들어 연결하면 `BLOB_READ_WRITE_TOKEN`이 자동으로 생깁니다. 다시 배포하면 팔기 신청의 사진 업로드가 동작합니다. 연결하지 않으면 사진 업로드만 실패하고 나머지는 정상입니다.

배포 후 로컬 개발로 돌아가려면 `.env`의 `DATABASE_URL`을 `file:./dev.db`로 되돌립니다.

## 앱으로 설치하기 (PWA)

배포한 주소(https)에서 휴대폰에 앱처럼 설치할 수 있습니다. 앱 스토어는 거치지 않습니다.

- **안드로이드(크롬·삼성 인터넷)**: 사이트 맨 아래 **앱 설치** 버튼을 누르거나, 브라우저 메뉴의 "앱 설치" / "홈 화면에 추가"를 누릅니다.
- **아이폰(Safari)**: 맨 아래 **앱 설치** 버튼을 누르면 방법이 나옵니다. 공유 버튼 → "홈 화면에 추가" → "추가".
- 설치한 앱은 주소창 없이 전체 화면으로 열리고, 인터넷이 끊기면 세 언어로 된 오프라인 안내 화면이 나옵니다.

| 파일 | 하는 일 |
|---|---|
| `src/app/manifest.ts` | 앱 이름, 아이콘, 테마 색, 바로가기(대여·팔기·내 신청) |
| `public/sw.js` | 서비스 워커: 정적 파일 저장, 오프라인 화면. 고치면 맨 위 `VERSION`을 올린다 |
| `public/offline.html` | 오프라인 안내 화면 |
| `public/icons/` | 앱 아이콘. `node scripts/make-icons.mjs`로 다시 만든다 |
| `src/components/pwa/` | 서비스 워커 등록, 앱 설치 버튼 |

서비스 워커는 `npm run build` 후 `npm run start`로 실행할 때만 등록됩니다. 개발 서버(`npm run dev`)에서는 화면이 저장돼 헷갈리지 않도록 등록하지 않습니다.

## 폴더 구조

```
messages/            화면 문구 (ko, en, zh)
prisma/              DB 스키마, 시드 데이터
public/products/     제품 참고 사진 (Unsplash 무료 라이선스)
scripts/             manage.ts(운영 도구), push-remote.ts(온라인 DB 준비)
src/app/[locale]/    페이지 (홈, about, rent, sell, apply, my, support, terms, privacy)
src/app/actions/     서버 액션 (신청, 내 신청, 고객센터)
src/app/api/         사진 업로드·보기, 메시지 조회
src/components/      화면 컴포넌트
src/i18n/            next-intl 설정
src/lib/             DB, 검사 스키마, 매입가 계산, 저장소, 세션
src/proxy.ts         언어 감지와 기억 (Next.js 16의 middleware)
```

## 문구와 디자인 고치기

- 화면 문구: `messages/*.json` 세 파일에서 같은 키를 고칩니다. 코드 안에는 문구가 없습니다.
- 색: `src/app/globals.css`의 `@theme`.
- 로고 캐릭터: `src/components/brand/Mascot.tsx`의 SVG만 바꾸면 됩니다.
- 등급 기준: `messages/*.json`의 `grades`.
- 예상 매입가 계산식: `src/lib/buyback.ts`.
- FAQ: `src/lib/faq.ts`(구성)와 `messages/*.json`의 `faq`(내용).

## 정해지지 않은 것 (TODO)

코드에서 `TODO`로 검색하면 위치를 찾을 수 있습니다.

- 가격: 월 렌탈료, 보증금, 설치비, 패키지 가격, 가격 필터 구간 (`prisma/seed.ts`, `ProductBrowser.tsx`)
- 제품 구성과 최소 이용 기간, 이용 기간 선택지 (`prisma/seed.ts`, `src/lib/constants.ts`)
- 프리미엄 패키지 구성: "스탠다드 + 에어컨/TV"를 에어컨과 TV 둘 다 포함으로 넣어 둠 (`prisma/seed.ts`)
- 예상 매입가 계산식의 기준가, 감가율, 상태 계수 (`src/lib/buyback.ts`)
- 실제 제품 사진: 지금은 종류를 보여 주는 참고 사진 (`public/products`, `prisma/seed.ts`)
- 전자레인지 캐릭터 (`Mascot.tsx`, 앱 아이콘은 `scripts/make-icons.mjs`)
- FAQ 답변: 결제 방법, 서비스 지역, 수리비 기준, 해지·연장 규정 (`messages/*.json`)
- 회사 정보, 이용약관, 개인정보처리방침 내용 (`Footer.tsx`, `/terms`, `/privacy`)
- 광고 자리: 광고주가 정해지면 배너로 교체 (`AdSlot.tsx`)
- 방문 시간대 구분 (`messages/*.json`의 `apply.schedule.timeSlots`)

## 알아 둘 점

- 새 메시지 확인은 실시간이 아니라 20~30초마다 확인하는 방식입니다.
- 사진 업로드와 문의·Q&A 작성에는 횟수 제한이 없습니다. 실제 서비스로 쓰려면 제한을 추가해야 합니다.
- 우편번호 검색은 카카오(Daum) 우편번호 서비스를 씁니다. 불러오지 못하면 주소를 직접 입력할 수 있습니다.
