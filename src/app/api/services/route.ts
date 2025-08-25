export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Ads4u } from "@/lib/ads4u";

export async function GET() {
  try {
    const data = await Ads4u.services();
    return NextResponse.json(data);
  } catch (e: any) {
    // log server
    console.error("[/api/services] error:", e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
