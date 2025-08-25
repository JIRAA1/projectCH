"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) window.location.href = "/admin";
    else setError((await res.json())?.error || "Login failed");
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card p-6 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
        <input className="input mb-3" type="password" placeholder="Admin password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <button className="btn btn-primary w-full" onClick={submit}>เข้าสู่ระบบ</button>
      </div>
    </main>
  );
}
