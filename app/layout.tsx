import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700", "400"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "WikiBible - La Bible Catholique (73 Livres)",
  description: "Encyclopédie biblique catholique complète avec le canon de 73 livres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
