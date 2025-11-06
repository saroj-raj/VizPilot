import './globals.css';

export const metadata = {
  title: 'Elas ERP - Enterprise Resource Planning',
  description: 'Modern ERP solution for your business',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
