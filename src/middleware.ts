import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Auth } from "./lib/auth";

// ป้องกันเฉพาะ /admin ทั้งหมด
export const config = { matcher: ["/admin/:path*"] };

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // อนุญาตหน้า login ผ่านได้ (ไม่งั้นจะวนลูป)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ตรวจสิทธิ์ admin จาก cookie
  const token = req.cookies.get("session")?.value || "";
  const payload = await Auth.verify(token);

  if (!payload || payload.role !== "admin") {
    // ไปหน้า login
    const url = new URL("/admin/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
