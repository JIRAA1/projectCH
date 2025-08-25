export const preferredRegion = ["sin1"]; // Singapore
export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const mu = Number(process.env.DEFAULT_MARKUP || "1.8");
  return NextResponse.json({
    default_markup: isFinite(mu) ? mu : 1.8,
    currency: "THB",
  });
}
