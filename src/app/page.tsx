"use client";
import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/Spinner";
import Section from "@/components/Section";

/** โครงสร้างบริการจาก Ads4u (rate = THB ต่อ 1,000 หน่วย) */
type Service = {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string; // ต้นทุน/1k (บาท)
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
};

const BRAND = "CHIRA";
const MIN_ORDER_PRICE_THB = 59; // ขั้นต่ำต่อออเดอร์ที่แสดงลูกค้า
const FIXED_FEE_THB = 9;        // ค่าธรรมเนียมคงที่ที่บวกจากราคาเดิม API

/** ===== ไอคอนแพลตฟอร์ม (inline SVG) ===== */
const PLATFORM_ORDER = [
  "all",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "line",
  "telegram",
  "spotify",
  "website",
  "other",
] as const;
type PlatformKey = (typeof PLATFORM_ORDER)[number];

function Icon({ kind, className = "w-5 h-5" }: { kind: PlatformKey; className?: string }) {
  const common = "stroke-current";
  switch (kind) {
    case "facebook":
      return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M13.5 9H15V6h-2a4 4 0 0 0-4 4v2H7v3h2v7h3v-7h2.1l.9-3H12v-2a1 1 0 0 1 1-1Z"/></svg>;
    case "instagram":
      return <svg viewBox="0 0 24 24" className={className} fill="none"><rect x="3" y="3" width="18" height="18" rx="5" className={common} strokeWidth="1.8"/><circle cx="12" cy="12" r="3.5" className={common} strokeWidth="1.8"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>;
    case "tiktok":
      return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M14 3h3c.2 2 1.7 3.7 4 4v3c-1.8-.1-3.5-.8-4.9-2v6.6a5.6 5.6 0 1 1-3.9-5.3v3a2.6 2.6 0 1 0 1.8 2.5V3Z"/></svg>;
    case "youtube":
      return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M23 8.3v7.4c0 1.3-1 2.3-2.3 2.3H3.3C2 18 1 17 1 15.7V8.3C1 7 2 6 3.3 6h17.4C22 6 23 7 23 8.3ZM10 15l6-3-6-3v6Z"/></svg>;
    case "twitter": // ไอคอน X แบบเรียบ
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" className={common} strokeWidth="1.6" />
          <path d="M7 7l10 10M17 7L7 17" className={common} strokeWidth="1.6" />
        </svg>
      );
    case "line":
      return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M12 3c-5 0-9 3.5-9 7.8 0 3 2 5.5 5 6.8l-.3 2.7c-.1.6.5 1 1 .8l3.5-1.9h-.2c5 0 9-3.5 9-7.8C21 6.5 17 3 12 3Zm-4 9h2V8H8v4Zm3 0h2V8h-2v4Zm3 0h2V8h-2v4Z"/></svg>;
    case "telegram":
      return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M21.5 3.3 2.6 10.6c-1 .4-.9 1.8.1 2.1l4.8 1.5 1.8 5.1c.3.9 1.5 1.1 2.1.3l2.6-3.2 4.8 3.6c.8.6 2 .2 2.3-.8l3-14.9c.3-1-.7-1.8-1.6-1.4ZM8.7 16.3l-.3 3 1.7-2.1 7.8-7.6-9.2 6.7Z"/></svg>;
    case "spotify":
      return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm4.6 13.6a.9.9 0 0 1-1.2.3c-3.2-2-7.1-2.4-11.7-1.2a.9.9 0 1 1-.4-1.8c5.1-1.3 9.5-.9 13.1 1.4.4.2.5.8.2 1.3Z"/></svg>;
    case "website":
      return <svg viewBox="0 0 24 24" className={className} fill="none"><circle cx="12" cy="12" r="9" className={common} strokeWidth="1.8"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" className={common} strokeWidth="1.8"/></svg>;
    case "all":
    case "other":
    default:
      return <svg viewBox="0 0 24 24" className={className} fill="none"><circle cx="12" cy="12" r="9" className={common} strokeWidth="1.8"/><path d="M8 12h8" className={common} strokeWidth="1.8"/></svg>;
  }
}

function detectPlatform(s: Service): PlatformKey {
  const t = `${s.name} ${s.category} ${s.type}`.toLowerCase();
  if (/\b(ig|insta|instagram)\b/.test(t)) return "instagram";
  if (/\b(tiktok|tt)\b/.test(t)) return "tiktok";
  if (/\b(youtube|yt|views|subs)\b/.test(t)) return "youtube";
  if (/\b(fb|facebook)\b/.test(t)) return "facebook";
  if (/\b(twitter|x )\b|\bx\b/.test(t)) return "twitter";
  if (/\bline\b/.test(t)) return "line";
  if (/\btelegram|tg\b/.test(t)) return "telegram";
  if (/\bspotify\b/.test(t)) return "spotify";
  if (/\bwebsite|web|seo\b/.test(t)) return "website";
  return "other";
}
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t border-black/10 bg-gradient-to-b from-blue-950 via-blue-900 to-black text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* ซ้าย: โลโก้ + ชื่อร้าน */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-white/10 grid place-items-center text-sm md:text-base font-bold">
              {BRAND[0]}
            </div>
            <div className="leading-tight">
              <div className="font-heading text-base md:text-lg tracking-tight">{BRAND}</div>
              <div className="text-xs opacity-80">
                แคตตาล็อกบริการ • เริ่มต้น {MIN_ORDER_PRICE_THB} บาท
              </div>
            </div>
          </div>

          {/* ขวา: ปุ่มลัด */}
          <div className="flex flex-wrap gap-2">
            <a href="#price-calc" className="btn btn-primary">คำนวณราคา</a>
            <a href="#" className="btn border-white/30 text-white hover:bg-white/10">ทักอินบ็อกซ์</a>
          </div>
        </div>

        {/* บรรทัดอธิบาย / ลิขสิทธิ์ */}

        <div className="mt-2 text-[11px] md:text-xs opacity-70">
          © {year} {BRAND}. สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
}

export default function CatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟิลเตอร์/เรียง/แพลตฟอร์ม
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<"name_asc" | "cost_asc" | "cost_desc">("name_asc");
  const [pf, setPf] = useState<PlatformKey>("all");

  // เครื่องคิดราคา
  const [calcSid, setCalcSid] = useState<string>("");
  const [calcQty, setCalcQty] = useState<string>("1000");

  useEffect(() => {
    setLoading(true);
    fetch("/api/services")
      .then((r) => r.json())
      .then((sv) => !sv?.error && setServices(sv))
      .finally(() => setLoading(false));
  }, []);

  /** ===== Helper ราคาตามโจทย์: ราคา = (ต้นทุนตาม API) + 9 บาท แล้วค่อยบังคับขั้นต่ำ 59 ===== */
  function apiCostPer1kTHB(s: Service) {
    return parseFloat(s.rate || "0");
  }
  function costForQtyTHB(s: Service, qty: string) {
    const cost1k = apiCostPer1kTHB(s);
    const qn = parseFloat(qty || "0");
    return cost1k * (qn / 1000);
  }
  function saleForQtyTHB_apiPlus9(s: Service, qty: string) {
    const raw = costForQtyTHB(s, qty) + FIXED_FEE_THB;
    if (!isFinite(raw) || raw <= 0) return 0;
    return Math.max(raw, MIN_ORDER_PRICE_THB);
  }

  /** จุดที่ทำให้ “ราคาสุทธิ” มากกว่า 59 เมื่อใช้สูตร (API + 9) */
  function breakQtyStrictGtMin(s: Service) {
    const per1k = apiCostPer1kTHB(s);
    // ต้องการ: per1k * (q/1000) + 9 > 59  ->  per1k * q/1000 > 50  -> q > 50*1000 / per1k
    const threshold = MIN_ORDER_PRICE_THB - FIXED_FEE_THB; // 50
    if (per1k <= 0) return Infinity;
    return Math.floor((threshold * 1000) / per1k) + 1;
  }

  /** จำนวนแนะนำ = (จำนวนที่ทำให้ราคา > 59) - 1 แล้ว clamp ตาม min/max */
  function initialQtyForService(s: Service) {
    const min = parseInt(s.min || "1", 10) || 1;
    const max = parseInt(s.max || "999999", 10) || 999999;
    const bq = breakQtyStrictGtMin(s);
    let start = isFinite(bq) ? bq - 1 : min;
    if (isNaN(start) || start <= 0) start = min;
    if (start < min) start = min;
    if (start > max) start = max;
    return String(start);
  }

  // กรอง + เรียง
  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    let list = services.filter((s) => {
      const passQ = !q || s.name.toLowerCase().includes(ql) || s.type.toLowerCase().includes(ql);
      const passC = cat === "All" || s.category === cat;
      const passP = pf === "all" || detectPlatform(s) === pf;
      return passQ && passC && passP;
    });
    if (sort === "cost_asc") list = list.sort((a, b) => apiCostPer1kTHB(a) - apiCostPer1kTHB(b));
    if (sort === "cost_desc") list = list.sort((a, b) => apiCostPer1kTHB(b) - apiCostPer1kTHB(a));
    if (sort === "name_asc") list = list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [services, q, cat, sort, pf]);

  // สำหรับเครื่องคิดราคา
  const selectedService = services.find((s) => String(s.service) === String(calcSid));
  const calcPrice = selectedService ? saleForQtyTHB_apiPlus9(selectedService, calcQty) : 0;
  const breakQty = selectedService ? breakQtyStrictGtMin(selectedService) : null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navbar */}
<nav className="sticky top-0 z-30 border-b border-black/10 bg-blue-600/95 text-white supports-[backdrop-filter]:bg-blue-600/80 backdrop-blur">
  <div className="mx-auto max-w-6xl px-3 md:px-6 h-11 md:h-12 flex items-center justify-between">
    {/* ซ้าย: โลโก้ + ชื่อร้าน */}
    <div className="flex items-center gap-2 md:gap-3 min-w-0">
      <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-black grid place-items-center text-sm md:text-base font-bold">
        {BRAND[0]}
      </div>
      <div className="leading-tight truncate">
        <div className="font-heading text-base md:text-lg tracking-tight">{BRAND}</div>
        {/* ซ่อนข้อความรองบนจอเล็ก */}
        <div className="hidden sm:block text-[11px] md:text-xs opacity-80 truncate">
          ดูบริการและราคา (เริ่มต้น {MIN_ORDER_PRICE_THB} บาท)
        </div>
      </div>
    </div>

    {/* ขวา: ข้อความสั้น (ซ่อนบนจอเล็ก) */}
    <div className="hidden sm:block text-[11px] md:text-xs opacity-80 truncate max-w-[50%] text-right">
      แคปหน้าจอแล้วทักอินบ็อกซ์เพื่อสั่งซื้อ
    </div>
  </div>
</nav>


      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <Section title="วิธีสั่งซื้อ">
          <ol className="list-decimal pl-5 text-sm opacity-90 space-y-1">
            <li>เลือกแพลตฟอร์มจากแถบไอคอน หรือค้นหาบริการ</li>
            <li>ดูข้อมูลบริการและ “จำนวนที่รับ”</li>
            <li>ใช้เครื่องคิดราคาทางขวาเพื่อดูราคารวม (ขั้นต่ำ {MIN_ORDER_PRICE_THB} บาท)</li>
            <li>แคปหน้าจอส่งชื่อบริการ + จำนวน + ราคา ไปยังอินบ็อกซ์</li>
          </ol>
        </Section>

        {/* แถบแพลตฟอร์ม */}
        <Section title="แพลตฟอร์ม">
          <div className="flex flex-wrap gap-2">
            {PLATFORM_ORDER.map((k) => (
              <button
                key={k}
                className={`btn ${pf === k ? "btn-primary" : "btn-ghost"} flex items-center gap-2`}
                onClick={() => setPf(k)}
                title={k === "all" ? "ทั้งหมด" : k}
              >
                <Icon kind={k} />
                <span className="capitalize">{k === "all" ? "ทั้งหมด" : k}</span>
              </button>
            ))}
          </div>
        </Section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ซ้าย: ฟิลเตอร์ + ตาราง */}
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="ค้นหา & ฟิลเตอร์"
              right={
                <button
                  className="pill"
                  onClick={() => {
                    setQ("");
                    setCat("All");
                    setSort("name_asc");
                    setPf("all");
                  }}
                >
                  ล้างทั้งหมด
                </button>
              }
            >
              <div className="grid gap-3 md:grid-cols-3">
                <input className="input" placeholder="ค้นหาบริการ / type" value={q} onChange={(e) => setQ(e.target.value)} />
                <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
                  {["All", ...Array.from(new Set(services.map((s) => s.category)))].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select className="input" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                  <option value="name_asc">ชื่อ A→Z</option>
                  <option value="cost_asc">ต้นทุน/1k จาก API: น้อย→มาก</option>
                  <option value="cost_desc">ต้นทุน/1k จาก API: มาก→น้อย</option>
                </select>
              </div>
            </Section>

            {/* ตารางบริการ (ไม่โชว์ราคาขาย) + “จำนวนที่รับ (min–max + แนะนำ)” */}
            <Section title="รายการบริการ" right={<span className="pill">ทั้งหมด {filtered.length} รายการ</span>}>
              <div className="max-h-[65vh] overflow-auto rounded-xl border border-black/10">
                {loading ? (
                  <div className="p-6 text-sm opacity-70 flex items-center gap-2"><Spinner /> กำลังโหลดบริการ…</div>
                ) : filtered.length === 0 ? (
                  <div className="p-6 text-sm opacity-70">ไม่พบบริการตามเงื่อนไขที่เลือก</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="table-th py-2 w-[52px]"></th>
                        <th className="table-th py-2 w-[90px]">ID</th>
                        <th className="table-th py-2">บริการ</th>
                        <th className="table-th py-2 w-[180px]">จำนวนที่รับ</th>
                        <th className="table-th py-2 w-[90px]">Refill</th>
                        <th className="table-th py-2 w-[110px]">เลือก</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => {
                        const plat = detectPlatform(s);
                        const recommended = initialQtyForService(s);
                        return (
                          <tr key={s.service} className="border-b last:border-0 hover:bg-blue-50/60">
                            <td className="py-2 px-3"><div className="grid place-items-center"><Icon kind={plat} className="w-5 h-5" /></div></td>
                            <td className="py-2 px-3 font-mono text-xs">{s.service}</td>
                            <td className="px-3">
                              <div className="flex items-center gap-2">
                                <span>{s.name}</span>
                                <span className="badge">เริ่มต้น {MIN_ORDER_PRICE_THB}.–</span>
                              </div>
                            </td>
                            <td className="px-3">
                              <div className="leading-tight">
                                <div>{s.min}–{s.max}</div>
                                <div className="text-[12px] opacity-70">แนะนำเริ่มที่ <b>{recommended}</b>+</div>
                              </div>
                            </td>
                            <td className="px-3">{s.refill ? "✅" : "—"}</td>
                            <td className="px-3">
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setCalcSid(String(s.service));
                                  setCalcQty(recommended);
                                  document.getElementById("price-calc")?.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                เลือก
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

            </Section>
          </div>

          {/* ขวา: เครื่องคิดราคา (สูตร API + 9, ขั้นต่ำ 59) */}
          <div id="price-calc" className="space-y-6">
            <Section title="เครื่องคิดราคา">
              <div className="space-y-3">
                <select
                  className="input"
                  value={calcSid}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setCalcSid(sid);
                    const svc = services.find((x) => String(x.service) === String(sid));
                    if (svc) setCalcQty(initialQtyForService(svc));
                  }}
                >
                  <option value="">— เลือกบริการ —</option>
                  {services.map((s) => (
                    <option key={s.service} value={s.service}>
                      {s.service} • {s.name}
                    </option>
                  ))}
                </select>

                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={calcQty}
                  onChange={(e) => setCalcQty(e.target.value)}
                />

                {selectedService && (
                  <div className="text-xs opacity-70 space-y-1">
                    <div>จำนวนที่รับ: {selectedService.min} – {selectedService.max}</div>
                    <div>{`จำนวนที่ทำให้ราคามากกว่า ${MIN_ORDER_PRICE_THB} บาท:`} <b>{breakQty ?? "-"}</b> หน่วย</div>
                  </div>
                )}

                <div className="rounded-xl border border-black/10 bg-blue-50/60 px-3 py-2 space-y-1.5">
                  {selectedService ? (
                    <>
                      <div className="text-sm">
                        ราคาขายโดยรวม: <b>{saleForQtyTHB_apiPlus9(selectedService, calcQty).toFixed(2)} บาท</b>
                      </div>

                    </>
                  ) : (
                    <div className="text-sm opacity-70">เลือกบริการก่อนเพื่อคำนวนราคา</div>
                  )}
                </div>

                <div className="text-xs opacity-70">
                  * แคปหน้าจอนี้แล้วส่งชื่อบริการ + จำนวน + ราคา ไปยังอินบ็อกซ์
                </div>
              </div>
            </Section>

            <Section title="หมายเหตุ">
              <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>ราคาเป็น “โดยประมาณ” ตามราคา API ปัจจุบัน บวกค่าธรรมเนียม {FIXED_FEE_THB} บาท</li>
                <li>ขั้นต่ำต่อออเดอร์ <b>{MIN_ORDER_PRICE_THB} บาท</b></li>
              </ul>
            </Section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
