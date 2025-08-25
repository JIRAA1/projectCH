// src/lib/auth.ts - Edge-safe HMAC (SHA-256) using Web Crypto
const SECRET = process.env.APP_SECRET || "dev-secret";
const enc = new TextEncoder();

/** base64url helpers */
function b64urlEncode(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  let str = "";
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  const b64 = typeof btoa === "function" ? btoa(str) : Buffer.from(arr).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64urlDecode(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4 || 4)) % 4);
  const bin = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/** import HMAC key once per runtime */
let _keyPromise: Promise<CryptoKey> | null = null;
function getKey() {
  if (!_keyPromise) {
    _keyPromise = crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return _keyPromise;
}

async function hmacSignRaw(data: string): Promise<Uint8Array> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return new Uint8Array(sig);
}

export const Auth = {
  /** returns token: base64url(JSON) + "." + base64url(signature) */
  async sign(payload: object) {
    const json = JSON.stringify(payload);
    const sig = await hmacSignRaw(json);
    return `${b64urlEncode(enc.encode(json))}.${b64urlEncode(sig)}`;
  },

  /** verifies token and returns payload or null */
  async verify(token: string) {
    const [b64, sigB64] = token.split(".");
    if (!b64 || !sigB64) return null;
    try {
      const jsonBytes = b64urlDecode(b64);
      const json = new TextDecoder().decode(jsonBytes);
      const expected = await hmacSignRaw(json);
      const got = b64urlDecode(sigB64);
      // constant-time-ish compare
      if (expected.length !== got.length) return null;
      let diff = 0;
      for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ got[i];
      if (diff !== 0) return null;
      return JSON.parse(json);
    } catch {
      return null;
    }
  },
};
