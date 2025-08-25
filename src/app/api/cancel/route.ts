export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Ads4u } from "@/lib/ads4u";

export async function POST(req: Request) {
  try {
    const { orders } = await req.json();
    if (!orders) {
      return NextResponse.json({ error: "ต้องส่ง orders (เช่น 1,2,3)" }, { status: 400 });
    }
    const data = await Ads4u.cancel(String(orders));
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[/api/cancel] error:", e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
