import { NextRequest, NextResponse } from "next/server";
import { parseInvoiceFromBase64 } from "@/lib/anthropic";
import { routeHandlerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { canParse } from "@/lib/usage";

const MAX_BYTES = 10 * 1024 * 1024;

const MEDIA_TYPES = new Map([
  ["application/pdf", "application/pdf"],
  ["image/jpeg", "image/jpeg"],
  ["image/jpg", "image/jpeg"],
  ["image/png", "image/png"],
  ["image/webp", "image/webp"],
] as const);

type SupportedMediaType = "application/pdf" | "image/jpeg" | "image/png" | "image/webp";

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = routeHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to parse invoices." }, { status: 401 });
  }

  // Quota check
  const { allowed, reason } = await canParse(user.id);
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 402 });
  }

  // File validation
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 413 });
  }

  const rawType = file.type.toLowerCase();
  const mediaType = MEDIA_TYPES.get(rawType as keyof typeof MEDIA_TYPES) as
    | SupportedMediaType
    | undefined;

  if (!mediaType) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF, JPG, PNG, or WebP." },
      { status: 415 }
    );
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  // Parse with Claude
  let result;
  try {
    result = await parseInvoiceFromBase64(base64, mediaType);
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: "Failed to extract invoice data" }, { status: 500 });
  }

  // Save to DB
  await supabaseAdmin().from("parse_results").insert({
    user_id: user.id,
    file_name: file.name,
    data: result,
  });

  return NextResponse.json({ result });
}
