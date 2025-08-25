export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  const hasUrl = !!process.env.ADS4U_API_URL;
  const hasKey = !!process.env.ADS4U_API_KEY;
  return NextResponse.json({
    ADS4U_API_URL_present: hasUrl,
    ADS4U_API_KEY_present: hasKey,
    // อย่าโชว์ค่า key จริง
  });
}
