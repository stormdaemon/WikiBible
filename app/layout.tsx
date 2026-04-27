import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { DEFAULT_OG_IMAGE, JsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WikiBible - La Bible Catholique (73 Livres)",
    template: "%s | WikiBible",
  },
  description: "Encyclopédie biblique catholique complète avec le canon de 73 livres. Explorez les Écritures, contribuez et partagez la foi.",
  keywords: ["Bible", "Catholique", "73 livres", "Ancien Testament", "Nouveau Testament", "Deutérocanoniques", "Wiki", "Encyclopédie biblique"],
  authors: [{ name: "Parole et Partage" }],
  creator: "Parole et Partage",
  publisher: "WikiBible",

  icons: {
    icon: [
      { url: DEFAULT_OG_IMAGE, type: "image/jpeg" },
    ],
    apple: [
      { url: DEFAULT_OG_IMAGE },
    ],
  },

  // Open Graph - Facebook, Messenger, WhatsApp, LinkedIn, etc.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "WikiBible - La Bible Catholique (73 Livres)",
    description: "Encyclopédie biblique catholique complète avec le canon de 73 livres. Explorez les Écritures, contribuez et partagez la foi.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        secureUrl: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "WikiBible - Encyclopédie biblique catholique",
        type: "image/jpeg",
      },
    ],
  },

  // Twitter Cards - Twitter/X
  twitter: {
    card: "summary_large_image",
    site: "@WikiBible",
    creator: "@WikiBible",
    title: "WikiBible - La Bible Catholique (73 Livres)",
    description: "Encyclopédie biblique catholique complète avec le canon de 73 livres.",
    images: [DEFAULT_OG_IMAGE],
  },

  // Apple/iMessage
  appleWebApp: {
    capable: true,
    title: "WikiBible",
    statusBarStyle: "black-translucent",
  },

  // Autres métadonnées pour compatibilité maximale
  other: {
    "msapplication-TileImage": DEFAULT_OG_IMAGE,
    "og:image:url": DEFAULT_OG_IMAGE,
    "og:image:secure_url": DEFAULT_OG_IMAGE,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },
};

import Header from '@/components/Header';
import { RadioPlayer } from '@/components/RadioPlayer';
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
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: DEFAULT_OG_IMAGE,
              sameAs: [
                'https://wikibible.fr',
              ],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/wiki?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
          ]}
        />
        <RadioPlayer />
        <Header user={user} />
        {children}
      </body>
    </html>
  );
}
