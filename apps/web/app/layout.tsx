import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@repo/ui/header";
import Footer from "@repo/ui/footer";
import DemoBootstrap from "./components/DemoBootstrap";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Carnaval Tickets — Oruro",
  description: "Consigue tus entradas para el Carnaval de Oruro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <DemoBootstrap />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
