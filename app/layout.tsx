import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Masala Festival Portal — Portal de Postulaciones',
  description: 'Postula tu film al Masala Festival. Portal oficial de Masala Group S.A.S.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
