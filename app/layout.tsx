import type { Metadata } from 'next';
import './globals.css';
import { SafetyStoreProvider } from '@/lib/store/safety-store';
import { Header } from '@/components/common/header';
import { NetworkStatusBanner } from '@/components/common/network-status-banner';

export const metadata: Metadata = {
  title: 'MEHFUS | Municipal Citizen & Authority Safety Infrastructure',
  description: 'Production-ready proactive safety platform for child recovery, women safety, responder dispatch, and predictive municipal risk intelligence.',
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
            <NetworkStatusBanner />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SafetyStoreProvider>
      </body>
    </html>
  );
}
