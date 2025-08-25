import { NextResponse } from "next/server";
import { Ads4u } from "@/lib/ads4u";

export async function POST(req: Request) {
  try {
    const { order, orders } = await req.json();
    if (!order && !orders) {
      return NextResponse.json({ error: "ต้องส่ง order หรือ orders" }, { status: 400 });
    }
    const data = order
      ? await Ads4u.status(String(order))
      : await Ads4u.statusMulti(String(orders));
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
