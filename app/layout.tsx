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

import Header from '@/components/Header';
import { createClient } from '@/utils/supabase/server';

// ... (rest of imports)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // Gestion robuste : getUser peut retourner null ou undefined
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    // En cas d'erreur, on considère l'utilisateur comme non connecté
    console.error('Error getting user:', error);
    user = null;
  }

  return (
    <html lang="fr" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header user={user} />
        {children}
      </body>
    </html>
  );
}
