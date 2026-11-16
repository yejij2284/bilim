import "server-only";
import { db } from "./db";
import { CATEGORIES } from "./constants";

const categoryOrder = (c: string) => {
  const i = (CATEGORIES as readonly string[]).indexOf(c);
  return i === -1 ? 99 : i;
};

/** 노출 중인 제품. 종류 순, 같은 종류 안에서는 비싼 순. */
export async function getActiveProducts() {
  const products = await db.product.findMany({ where: { isActive: true } });
  return products.sort(
    (a, b) =>
      categoryOrder(a.category) - categoryOrder(b.category) ||
      b.monthlyPrice - a.monthlyPrice,
  );
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({ where: { slug, isActive: true } });
}

/** 노출 중인 패키지와 구성 제품. */
export async function getActivePackages() {
  return db.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { items: { include: { product: true } } },
  });
}

export type PackageWithItems = Awaited<
  ReturnType<typeof getActivePackages>
>[number];
