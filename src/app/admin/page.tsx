"use client";
import { useEffect, useMemo, useState } from "react";
import Section from "@/components/Section";
import Spinner from "@/components/Spinner";

type Service = { service:number; name:string; type:string; category:string; rate:string; min:string; max:string; refill:boolean; cancel:boolean; };
type Balance = { balance:string; currency:string };

export default function Admin() {
  const [services,setServices] = useState<Service[]>([]);
  const [balance,setBalance] = useState<Balance|null>(null);
  const [loading,setLoading] = useState(true);

  const [markup,setMarkup] = useState(1.8);

  useEffect(()=>{
    setLoading(true);
    Promise.all([
      fetch("/api/services").then(r=>r.json()),
      fetch("/api/balance").then(r=>r.json()),
      fetch("/api/public-config").then(r=>r.json()),
    ]).then(([sv,bal,conf])=>{
      if (!sv.error) setServices(sv);
      if (!bal.error) setBalance(bal);
      if (conf?.default_markup) setMarkup(conf.default_markup);
    }).finally(()=>setLoading(false));
  },[]);

  // พรีวิว 10 รายการ: ต้นทุน/1k (THB) และราคาขาย/1k (THB)
  const preview = useMemo(()=>{
    if (!services.length) return [];
    return services.slice(0,10).map(s=>{
      const costTHB = parseFloat(s.rate||"0"); // rate จาก API = THB/1k
      const sellTHB = (costTHB || 0) * (markup || 1);
      return { id:s.service, name:s.name, costTHB, sellTHB };
    });
  },[services,markup]);

  async function logout(){
    await fetch("/api/logout",{method:"POST"});
    window.location.href="/";
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <div className="flex items-center gap-3">
          {balance?.balance ? (
            <span className="badge">Balance {parseFloat(balance.balance).toFixed(2)} {balance.currency}</span>
          ) : <span className="text-sm opacity-70 inline-flex items-center gap-2"><Spinner/> กำลังโหลดเครดิต…</span>}
          <button className="btn btn-ghost" onClick={logout}>ออกจากระบบ</button>
        </div>
      </div>

      <Section title="ตั้งค่าการคำนวณราคา (THB)">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm opacity-70">Markup (ตัวคูณ เช่น 1.8 = บวก 80%)</label>
            <input className="input mt-1" type="number" step="0.01" value={markup} onChange={e=>setMarkup(parseFloat(e.target.value||"0"))}/>
          </div>
          <div className="self-end text-sm opacity-70">
            * ใช้คูณกับต้นทุน (บาท/1k) เพื่อได้ “ราคาขาย (บาท/1k)”
          </div>
        </div>
      </Section>

      <Section title="พรีวิวราคาขาย (ตัวอย่าง 10 รายการ)">
        <div className="overflow-auto rounded-xl border border-black/10">
          {loading ? (
            <div className="p-6 text-sm opacity-70 flex items-center gap-2"><Spinner/> กำลังโหลด…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th py-2">Service</th>
                  <th className="table-th py-2">Name</th>
                  <th className="table-th py-2">ต้นทุน/1k (THB)</th>
                  <th className="table-th py-2">ราคาขาย/1k (THB)</th>
                </tr>
              </thead>
              <tbody>
                {preview.map(p=>(
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 px-3 font-mono text-xs">{p.id}</td>
                    <td className="px-3">{p.name}</td>
                    <td className="px-3">{p.costTHB.toFixed(2)}</td>
                    <td className="px-3">{p.sellTHB.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Section>
    </main>
  );
}
