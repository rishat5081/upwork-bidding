import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Upwork Bidder \u2014 Dashboard',
  description: 'Manual-assist job analysis and proposal generation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
