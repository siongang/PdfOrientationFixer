// app/layout.tsx
import { Suspense } from "react";
import "./globals.css"; // your global styles
import Header from "@/components/Header";


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
      
      <body className="flex flex-col max-h-screen">
        <Header />
        <main className="flex flex-1 bg-stone-100 overflow-hidden">
          {" "}
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
