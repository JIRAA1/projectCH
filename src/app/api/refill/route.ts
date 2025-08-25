export const preferredRegion = ["sin1"]; // Singapore
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Ads4u } from "@/lib/ads4u";

export async function POST(req: Request) {
  try {
    const { order, orders } = await req.json();
    if (!order && !orders) {
      return NextResponse.json({ error: "ต้องส่ง order หรือ orders" }, { status: 400 });
    }
    const data = order
      ? await Ads4u.refill(String(order))
      : await Ads4u.refillMulti(String(orders));
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[/api/refill] error:", e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
