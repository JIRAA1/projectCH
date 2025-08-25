export const preferredRegion = ["sin1"]; // Singapore
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Auth } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  const ok = password && password === process.env.ADMIN_PASSWORD;
  if (!ok) return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });

  const token = await Auth.sign({ role: "admin", iat: Date.now() });

  const res = NextResponse.json({ ok: true });

  // ตั้งค่า cookie ให้ใช้ได้ใน dev (ไม่ใส่ Secure ตอน NODE_ENV !== 'production')
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: "session",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProd,           // prod เท่านั้นค่อยใส่ Secure
    maxAge: 60 * 60 * 24 * 30 // 30 วัน
  });

  return res;
}
