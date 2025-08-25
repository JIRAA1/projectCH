export type Ads4uResponse<T = any> = T & { error?: string };

async function postAds4u<T = any>(action: string, params: Record<string, any> = {}) {
  const url = process.env.ADS4U_API_URL!;
  const key = process.env.ADS4U_API_KEY!;

  if (!url || !key) {
    throw new Error(
      `Missing ENV: ${!url ? "ADS4U_API_URL " : ""}${!key ? "ADS4U_API_KEY" : ""}`.trim()
    );
  }

  // timeout กัน request ค้าง
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 15000); // 15s

  const body = new URLSearchParams({
    key,
    action,
    ...Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ),
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body,
      cache: "no-store",
      signal: ac.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ads4u HTTP ${res.status} ${res.statusText} :: ${text.substring(0, 300)}`);
    }

    const json = (await res.json()) as Ads4uResponse<T>;
    if ((json as any)?.error) throw new Error(`Ads4u error: ${(json as any).error}`);
    return json;
  } catch (err: any) {
    // log ฝั่ง server (ดูได้ใน Terminal)
    console.error("[Ads4u] POST failed:", { action, params, err: err?.message });
    throw err;
  } finally {
    clearTimeout(t);
  }
}

export const Ads4u = {
  services: () => postAds4u<any[]>("services"),
  addOrder: (payload: { service: string; link: string; quantity: string; runs?: string; interval?: string }) =>
    postAds4u<{ order: number }>("add", payload),
  status: (order: string) => postAds4u("status", { order }),
  statusMulti: (orders: string) => postAds4u("status", { orders }),
  refill: (order: string) => postAds4u<{ refill: string }>("refill", { order }),
  refillMulti: (orders: string) => postAds4u("refill", { orders }),
  cancel: (orders: string) => postAds4u("cancel", { orders }),
  balance: () => postAds4u<{ balance: string; currency: string }>("balance"),
};
