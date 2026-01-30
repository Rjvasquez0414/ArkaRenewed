import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Arka Iglesia | Acercándote a Cristo",
    template: "%s | Arka Iglesia",
  },
  description:
    "Plataforma de Arka Iglesia para cursos bíblicos, prédicas, devocionales y más. Acércate a Cristo a través de nuestro contenido.",
  keywords: ["iglesia", "cristiano", "cursos bíblicos", "prédicas", "devocionales", "Arka"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
