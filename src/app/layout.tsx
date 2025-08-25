import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ads4u Panel",
  description: "บริการของเรา (Ads4u)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
