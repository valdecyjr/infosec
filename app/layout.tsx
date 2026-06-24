import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecBot-X | InfoSec AI Assistant",
  description: "Especialista em Segurança da Informação powered by AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
