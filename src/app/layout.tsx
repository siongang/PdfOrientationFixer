// app/layout.tsx
import { Suspense } from "react";
import "./globals.css"; // your global styles
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "PDF Orientation",
  description: "My cool Next.js app",
  icons: {
    icon: "/website_icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex flex-1 bg-stone-100 overflow-hidden">
          {" "}
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
