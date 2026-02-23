import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: 'VizPilot - AI Data Intelligence Platform',
  description: 'Intelligent data analysis and visualization for business insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AuthProvider>
          {children}
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
