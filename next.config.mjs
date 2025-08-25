/** @type {import('next').NextConfig} */
const nextConfig = {
  // ปิดคำเตือน Cross origin ใน dev บนเครือข่ายภายใน
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://10.111.12.5:3000", // IP ที่ dev server บอกไว้
  ],
};

export default nextConfig;
