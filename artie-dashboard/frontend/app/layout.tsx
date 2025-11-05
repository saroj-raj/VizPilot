import './globals.css';
import { AuthProvider } from './contexts/AuthContext';

export const metadata = {
  title: 'Elas ERP - Enterprise Resource Planning',
  description: 'Modern ERP solution for your business',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
