export const preferredRegion = ["sin1"]; // Singapore
import { NextResponse } from "next/server";
import { Ads4u } from "@/lib/ads4u";

export async function POST(req: Request) {
  try {
    const { service, link, quantity, runs, interval } = await req.json();
    if (!service || !link || !quantity) {
      return NextResponse.json({ error: "service, link, quantity จำเป็น" }, { status: 400 });
    }
    const data = await Ads4u.addOrder({ service, link, quantity, runs, interval });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
