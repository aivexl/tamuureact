import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { SmartDomainRedirect } from "@/components/layout/SmartDomainRedirect";

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
      <body className="bg-white min-h-screen selection:bg-amber-100 flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', (e) => {
                if (e.message && (e.message.includes('ChunkLoadError') || e.message.includes('Loading chunk'))) {
                  window.location.reload();
                }
              }, true);
            `,
          }}
        />
        <AuthProvider>
          <SmartDomainRedirect />
          <Suspense fallback={<div className="h-16 bg-white border-b border-slate-100" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
