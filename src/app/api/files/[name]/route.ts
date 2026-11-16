import { readImage } from "@/lib/storage";

/** 업로드한 사진 보기 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/files/[name]">,
) {
  const { name } = await ctx.params;
  const image = await readImage(name);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
