// 시드 데이터: 예시 제품과 패키지.
// 실행: npm run db:seed  (기존 제품·패키지를 지우고 다시 넣는다. 신청 내역은 건드리지 않는다.)
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }),
});

const ALL_CHECKS = "cleaning,power,function,safety,exterior,parts";

type SeedProduct = {
  slug: string;
  category: string;
  brand: string;
  nameKo: string;
  nameEn: string;
  nameZh: string;
  grade: string;
  monthlyPrice: number;
  deposit: number;
  installFee: number;
  minMonths: number;
};

// TODO: 실제 가격 — 아래 월 렌탈료·보증금·설치비·최소 이용 기간은 모두 예시 값이다.
// TODO: 실제 제품 — 제품명과 브랜드 구성도 예시다.
const products: SeedProduct[] = [
  // 냉장고
  { slug: "fridge-samsung-new", category: "fridge", brand: "Samsung", nameKo: "2도어 냉장고 300L", nameEn: "2-Door Refrigerator 300L", nameZh: "双门冰箱 300L", grade: "NEW", monthlyPrice: 29000, deposit: 50000, installFee: 20000, minMonths: 6 },
  { slug: "fridge-lg-a", category: "fridge", brand: "LG", nameKo: "2도어 냉장고 260L", nameEn: "2-Door Refrigerator 260L", nameZh: "双门冰箱 260L", grade: "A", monthlyPrice: 22000, deposit: 50000, installFee: 20000, minMonths: 3 },
  { slug: "fridge-samsung-b", category: "fridge", brand: "Samsung", nameKo: "소형 냉장고 150L", nameEn: "Compact Refrigerator 150L", nameZh: "小型冰箱 150L", grade: "B", monthlyPrice: 15000, deposit: 30000, installFee: 10000, minMonths: 3 },
  { slug: "fridge-lg-c", category: "fridge", brand: "LG", nameKo: "소형 냉장고 120L", nameEn: "Compact Refrigerator 120L", nameZh: "小型冰箱 120L", grade: "C", monthlyPrice: 11000, deposit: 30000, installFee: 10000, minMonths: 3 },
  // 세탁기
  { slug: "washer-lg-new", category: "washer", brand: "LG", nameKo: "드럼 세탁기 9kg", nameEn: "Front-Load Washer 9kg", nameZh: "滚筒洗衣机 9kg", grade: "NEW", monthlyPrice: 32000, deposit: 50000, installFee: 30000, minMonths: 6 },
  { slug: "washer-samsung-a", category: "washer", brand: "Samsung", nameKo: "드럼 세탁기 10kg", nameEn: "Front-Load Washer 10kg", nameZh: "滚筒洗衣机 10kg", grade: "A", monthlyPrice: 23000, deposit: 50000, installFee: 30000, minMonths: 3 },
  { slug: "washer-samsung-b", category: "washer", brand: "Samsung", nameKo: "드럼 세탁기 7kg", nameEn: "Front-Load Washer 7kg", nameZh: "滚筒洗衣机 7kg", grade: "B", monthlyPrice: 17000, deposit: 30000, installFee: 30000, minMonths: 3 },
  // 전자레인지
  { slug: "microwave-samsung-a", category: "microwave", brand: "Samsung", nameKo: "전자레인지 23L", nameEn: "Microwave Oven 23L", nameZh: "微波炉 23L", grade: "A", monthlyPrice: 7000, deposit: 10000, installFee: 0, minMonths: 3 },
  { slug: "microwave-lg-b", category: "microwave", brand: "LG", nameKo: "전자레인지 20L", nameEn: "Microwave Oven 20L", nameZh: "微波炉 20L", grade: "B", monthlyPrice: 5000, deposit: 10000, installFee: 0, minMonths: 3 },
  // 에어컨
  { slug: "aircon-lg-new", category: "aircon", brand: "LG", nameKo: "벽걸이 에어컨 6평형", nameEn: "Wall-Mounted Air Conditioner (20㎡)", nameZh: "壁挂式空调(约20㎡)", grade: "NEW", monthlyPrice: 35000, deposit: 100000, installFee: 80000, minMonths: 12 },
  { slug: "aircon-samsung-a", category: "aircon", brand: "Samsung", nameKo: "벽걸이 에어컨 6평형", nameEn: "Wall-Mounted Air Conditioner (20㎡)", nameZh: "壁挂式空调(约20㎡)", grade: "A", monthlyPrice: 27000, deposit: 100000, installFee: 80000, minMonths: 6 },
  // TV
  { slug: "tv-samsung-a", category: "tv", brand: "Samsung", nameKo: "스마트 TV 43인치", nameEn: "Smart TV 43-inch", nameZh: "智能电视 43英寸", grade: "A", monthlyPrice: 19000, deposit: 50000, installFee: 20000, minMonths: 3 },
  { slug: "tv-xiaomi-new", category: "tv", brand: "Xiaomi", nameKo: "스마트 TV 32인치", nameEn: "Smart TV 32-inch", nameZh: "智能电视 32英寸", grade: "NEW", monthlyPrice: 16000, deposit: 30000, installFee: 20000, minMonths: 6 },
  // 청소기
  { slug: "vacuum-xiaomi-new", category: "vacuum", brand: "Xiaomi", nameKo: "무선 청소기", nameEn: "Cordless Vacuum Cleaner", nameZh: "无线吸尘器", grade: "NEW", monthlyPrice: 12000, deposit: 20000, installFee: 0, minMonths: 6 },
  { slug: "vacuum-lg-b", category: "vacuum", brand: "LG", nameKo: "스틱 청소기", nameEn: "Stick Vacuum Cleaner", nameZh: "立式吸尘器", grade: "B", monthlyPrice: 6000, deposit: 10000, installFee: 0, minMonths: 3 },
  // 밥솥
  { slug: "ricecooker-xiaomi-a", category: "ricecooker", brand: "Xiaomi", nameKo: "전기밥솥 6인용", nameEn: "Rice Cooker (6 servings)", nameZh: "电饭煲(6人份)", grade: "A", monthlyPrice: 6000, deposit: 10000, installFee: 0, minMonths: 3 },
  { slug: "ricecooker-samsung-c", category: "ricecooker", brand: "Samsung", nameKo: "전기밥솥 3인용", nameEn: "Rice Cooker (3 servings)", nameZh: "电饭煲(3人份)", grade: "C", monthlyPrice: 3500, deposit: 10000, installFee: 0, minMonths: 3 },
];

// 제품 사진: Unsplash 무료 라이선스 사진 (public/products). 종류를 보여 주는 참고 사진이며
// 실제 모델 사진이 아니다. 관리자 > 제품 관리에서 실제 사진으로 바꿀 수 있다.
// TODO: 실제 제품 사진
const IMAGES: Record<string, string> = {
  "fridge-samsung-new": "/products/fridge-1.jpg",
  "fridge-lg-a": "/products/fridge-1.jpg",
  "fridge-samsung-b": "/products/fridge-2.jpg",
  "fridge-lg-c": "/products/fridge-2.jpg",
  "washer-lg-new": "/products/washer-1.jpg",
  "washer-samsung-a": "/products/washer-2.jpg",
  "washer-samsung-b": "/products/washer-2.jpg",
  "microwave-samsung-a": "/products/microwave-1.jpg",
  "microwave-lg-b": "/products/microwave-2.jpg",
  "aircon-lg-new": "/products/aircon-1.jpg",
  "aircon-samsung-a": "/products/aircon-2.jpg",
  "tv-samsung-a": "/products/tv-1.jpg",
  "tv-xiaomi-new": "/products/tv-1.jpg",
  "vacuum-xiaomi-new": "/products/vacuum-1.jpg",
  "vacuum-lg-b": "/products/vacuum-2.jpg",
  "ricecooker-xiaomi-a": "/products/ricecooker-1.jpg",
  "ricecooker-samsung-c": "/products/ricecooker-1.jpg",
};

// TODO: 실제 가격 — 패키지 가격은 예시 값이다.
// TODO: 프리미엄 구성 확정 필요 — "스탠다드 + 에어컨/TV"를 에어컨과 TV 둘 다 포함으로 넣어 두었다.
const packages = [
  {
    slug: "starter",
    nameKo: "스타터",
    nameEn: "Starter",
    nameZh: "入门套餐",
    descKo: "혼자 사는 첫 달에 꼭 필요한 두 가지",
    descEn: "The two essentials for your first month living alone",
    descZh: "独居第一个月必备的两件家电",
    monthlyPrice: 25000,
    minMonths: 6,
    sortOrder: 1,
    items: ["fridge-lg-a", "microwave-samsung-a"],
  },
  {
    slug: "standard",
    nameKo: "스탠다드",
    nameEn: "Standard",
    nameZh: "标准套餐",
    descKo: "스타터에 세탁기를 더한 기본 생활 구성",
    descEn: "Starter plus a washer for everyday living",
    descZh: "在入门套餐基础上增加洗衣机",
    monthlyPrice: 43000,
    minMonths: 6,
    sortOrder: 2,
    items: ["fridge-lg-a", "microwave-samsung-a", "washer-samsung-a"],
  },
  {
    slug: "premium",
    nameKo: "프리미엄",
    nameEn: "Premium",
    nameZh: "高级套餐",
    descKo: "스탠다드에 에어컨과 TV까지 한 번에",
    descEn: "Standard plus an air conditioner and a TV",
    descZh: "在标准套餐基础上增加空调和电视",
    monthlyPrice: 78000,
    minMonths: 12,
    sortOrder: 3,
    items: [
      "fridge-lg-a",
      "microwave-samsung-a",
      "washer-samsung-a",
      "aircon-samsung-a",
      "tv-samsung-a",
    ],
  },
];

async function main() {
  await db.packageItem.deleteMany();
  await db.package.deleteMany();
  await db.product.deleteMany();

  const idBySlug = new Map<string, number>();
  for (const p of products) {
    const created = await db.product.create({
      data: { ...p, inspection: ALL_CHECKS, imageUrl: IMAGES[p.slug] ?? null },
    });
    idBySlug.set(p.slug, created.id);
  }

  for (const { items, ...pkg } of packages) {
    await db.package.create({
      data: {
        ...pkg,
        items: {
          create: items.map((slug) => ({ productId: idBySlug.get(slug)! })),
        },
      },
    });
  }

  console.log(
    `시드 완료: 제품 ${products.length}개, 패키지 ${packages.length}개`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
