import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TAGS = ["projects", "skills"] as const;
type AllowedTag = (typeof ALLOWED_TAGS)[number];

function isAllowedTag(value: unknown): value is AllowedTag {
  return typeof value === "string" && (ALLOWED_TAGS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tag = (payload as { tag?: unknown })?.tag;
  if (!isAllowedTag(tag)) {
    return NextResponse.json(
      { error: `tag must be one of: ${ALLOWED_TAGS.join(", ")}` },
      { status: 400 }
    );
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
