// app/layout.tsx
import './globals.css'; // your global styles
import Header from '@/components/Header';

export const metadata = {
  title: 'My Website',
  description: 'My cool Next.js app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex flex-1 bg-stone-100 overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
