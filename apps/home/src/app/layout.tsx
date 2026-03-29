import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tamuu - Platform Undangan Digital & Vendor Pernikahan Premium",
  description: "Temukan vendor pernikahan terbaik dan buat undangan digital eksklusif hanya di Tamuu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-white min-h-screen selection:bg-amber-100">
        {children}
      </body>
    </html>
  );
}
