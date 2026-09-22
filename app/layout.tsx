import type { Metadata } from 'next';
import './globals.css';
import { SafetyStoreProvider } from '@/lib/store/safety-store';
import { Header } from '@/components/common/header';

export const metadata: Metadata = {
  title: 'MEHFUS | Deeksha Bhoomi Safety Network',
  description: 'Integrated Citizen-Authority Safety Network for Emergency Child Response, Volunteer Mesh, and Crowd Management at Deeksha Bhoomi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070B14] text-slate-100 antialiased selection:bg-safety-orange selection:text-white">
        <SafetyStoreProvider>
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SafetyStoreProvider>
      </body>
    </html>
  );
}
