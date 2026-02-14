# WikiBible - Contexte Complet du Projet
*Document généré le 2026-01-16 par exploration méthodique de la codebase*

---

## Version Next.js Confirmée

**Next.js 16.1.0** (vérifié dans `package.json`)
- React 19.2.0
- TypeScript 5
- App Router uniquement (pas de Pages Router)

---

## Architecture Confirmée

### Structure du Projet

```
WikiBible/
├── app/                          # App Router Next.js 16.1
│   ├── layout.tsx                # Layout principal (Server Component)
│   ├── page.tsx                  # Page d'accueil (Server Component)
│   ├── globals.css               # Tailwind v4 avec @theme
│   ├── actions.ts                # Server Actions ('use server')
│   ├── bible/                    # Route Bible
│   │   ├── page.tsx              # Server Component avec export dynamic/revalidate
│   │   ├── BiblePageClient.tsx   # Client Component ('use client')
│   │   └── [bookId]/[chapter]/   # Routes dynamiques
│   ├── bible-contributive/       # Route Bible contributive
│   ├── wiki/                     # Routes Wiki
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── edit/
│   ├── auth/                     # Authentification
│   │   ├── login/
│   │   └── register/
│   ├── profil/                   # Profil utilisateur
│   ├── apocrypha/                # Apocryphes
│   ├── classement-contributeurs/ # Classement
│   ├── contact/                  # Formulaire contact
│   └── mentions-legales/         # Mentions légales
├── components/                   # Composants React
├── src/components/               # Composants additionnels
├── hooks/                        # Custom hooks React
├── utils/                        # Utilitaires
│   └── supabase/
│       ├── server.ts             # Client Supabase SSR
│       └── client.ts             # Client Supabase client
├── lib/                          # Bibliothèques
│   └── supabase.ts               # Ancien client (à vérifier)
└── scripts/                      # Scripts d'import
```

### Conventions Next.js 16.1 App Router

#### Fichiers Spéciaux Confirmés

| Fichier | Type | Usage Confirmé dans le Projet |
|---------|------|-------------------------------|
| `layout.tsx` | Server Component | `app/layout.tsx` - Layout racine avec fonts et Header |
| `page.tsx` | Server/Client | Utilisé pour toutes les routes |
| `actions.ts` | Server Actions | `app/actions.ts` avec `'use server'` |
| `globals.css` | Styles globaux | Tailwind v4 avec directive `@import "tailwindcss"` |

**PAS de** : `_app.tsx`, `_document.tsx` (conventions Pages Router non utilisées)

#### Dynamic Route Config Confirmée

Exemple réel dans `app/bible/page.tsx`:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 3600;
```

**Options disponibles en Next.js 16.1**:
- `export const dynamic = 'auto' | 'force-dynamic' | 'error' | 'force-static'`
- `export const dynamicParams = true | false`
- `export const revalidate = number | false`
- `export const fetchCache = 'auto' | 'force-cache' | 'only-no-store'`

#### Metadata API (Next.js 16.1)

**Syntaxe confirmée** dans `app/layout.tsx`:
```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WikiBible - La Bible Catholique (73 Livres)",
  description: "Encyclopédie biblique catholique complète avec le canon de 73 livres",
};
```

**Fonctions disponibles**:
- `export const metadata: Metadata` (objet statique)
- `export async function generateMetadata({ params }): Promise<Metadata>` (dynamique)

#### generateStaticParams (Next.js 16.1)

```typescript
// Pour routes dynamiques comme [slug]
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Combiné avec dynamicParams
export const dynamicParams = false; // 404 pour routes non générées
```

---

## Stack Technique Confirmée

### Dépendances Core (extrait de package.json)

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.45.4",
    "@tailwindcss/postcss": "^4.1.18",
    "next": "^16.1.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "resend": "^6.6.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "tailwindcss": "^4.1.18",
    "eslint": "^9",
    "eslint-config-next": "^16.1.0"
  }
}
```

### Breaking Changes Next.js 16.1

1. **React 19 requis** : Le projet utilise React 19.2.0
2. **Nouvelle syntaxe de fetching** : `fetch()` avec `next: { revalidate }`
3. **Server Actions** : Stable avec `'use server'`
4. **App Router par défaut** : Pas de Pages Router détecté

---

## Patterns Server vs Client Components

### Server Components (par défaut)

**Détection** : Absence de `'use client'`

**Exemples confirmés** :
- `app/layout.tsx` - Layout avec auth Supabase
- `app/page.tsx` - Page d'accueil statique
- `app/bible/page.tsx` - Fetch de données avec export dynamic

**Caractéristiques**:
- `async/await` autorisé directement dans le composant
- Accès aux ressources serveur (DB, fichiers)
- Pas de useState, useEffect, event handlers

### Client Components

**Détection** : Présence de `'use client'` en haut de fichier

**Exemples confirmés** :
- `components/Header.tsx` - Navigation avec useState
- `components/RadioPlayer.tsx` - Player audio
- `components/AnnotationModal.tsx` - Modal interactif
- `app/bible/BiblePageClient.tsx` - Logique interactive

**Caractéristiques**:
- Utilisation de hooks React (useState, useEffect, etc.)
- Gestionnaires d'événements (onClick, onSubmit, etc.)
- Nécessite props pour les données serveur

### Pattern Server + Client (Hybrid)

**Exemple réel** : `app/bible/page.tsx` + `BiblePageClient.tsx`

```typescript
// app/bible/page.tsx (Server Component)
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function BiblePage() {
  const result = await getBooksAction();
  return <BiblePageClient books={result.books} />;
}

// app/bible/BiblePageClient.tsx (Client Component)
'use client';

export function BiblePageClient({ books }) {
  // Logique interactive avec useState, etc.
}
```

---

## Server Actions (Next.js 16.1)

### Définition Confirmée

Fichier : `app/actions.ts`
```typescript
'use server';  // Directive obligatoire en haut du fichier

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function loginAction(state, formData: FormData) {
  // Logique serveur
  const supabase = await createClient();
  // ...
  revalidatePath('/', 'layout');
}
```

### Schémas de Validation

```typescript
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

### Utilisation dans les Forms

```typescript
// Dans un Client Component
import { loginAction } from '@/app/actions';

<form action={loginAction}>
  <input name="email" />
  <input name="password" />
  <button type="submit">Connexion</button>
</form>
```

---

## Tailwind CSS v4

### Configuration Confirmée

Fichier : `app/globals.css`
```css
@import "tailwindcss";

@theme {
  /* Variables CSS custom */
  --color-primary: #1e293b;
  --color-accent: #b45309;
  /* ... */
}
```

### Changements v4

1. **PAS de `tailwind.config.js`** : Utilisation de `@theme` dans CSS
2. **PostCSS natif** : `@tailwindcss/postcss`
3. **Variables CSS natives** : `--color-*` au lieu de config object

### Classes Custom Confirmées

- `.btn`, `.btn--primary`, `.btn--secondary`
- `.form__group`, `.form__input`, `.form__label`
- `.card`, `.card--clickable`
- `.alert`, `.alert--error`
- `.badge`, `.badge--accent`

---

## Supabase Integration

### Client SSR (Server Components)

Fichier : `utils/supabase/server.ts`
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(url, key, { cookies: { ... } });
};
```

### Client Public (Lecture seule)

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const createPublicClient = () => {
  return createSupabaseClient(url, key);
};
```

### Tables Confirmées (via actions.ts)

- `bible_books` - Livres bibliques
- `bible_verses` - Versets avec traductions
- `wiki_articles` - Articles wiki
- `wiki_revisions` - Révisions wiki
- `user_profiles` - Profils utilisateurs
- `verse_links` - Liens entre versets
- `verse_annotations` - Annotations
- `external_sources` - Sources externes
- `verse_external_links` - Liens sources externes
- `user_scores` - Scores gamification
- `contribution_likes` - Likes contributions
- `bible_entities` - Entités bibliques
- `verse_contributions` - Contributions versets

---

## TypeScript Configuration

### tsconfig.json Confirmé

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "react-jsx",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Imports Alias

```typescript
import { Header } from '@/components/Header';
import { createClient } from '@/utils/supabase/server';
import { loginAction } from '@/app/actions';
```

---

## next.config.ts Confirmé

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Workaround temporaire
  },
};

export default nextConfig;
```

---

## Routes et Features Confirmées

### Routes Principales

| Route | Description | Type |
|-------|-------------|------|
| `/` | Accueil | Server Component |
| `/bible` | Navigateur Bible | Server + Client |
| `/bible/[bookId]/[chapter]` | Chapitre Bible | Server + Client |
| `/bible-contributive` | Bible contributive | Server + Client |
| `/wiki` | Liste articles wiki | Server Component |
| `/wiki/[slug]` | Article wiki | Server + Client |
| `/wiki/new` | Créer article | Client Component |
| `/wiki/[slug]/edit` | Éditer article | Client Component |
| `/auth/login` | Connexion | Client Component |
| `/auth/register` | Inscription | Client Component |
| `/profil` | Profil utilisateur | Server + Client |
| `/classement-contributeurs` | Leaderboard | Server Component |
| `/apocrypha` | Apocryphes | Server + Client |
| `/contact` | Contact | Server Component |
| `/mentions-legales` | Mentions légales | Server Component |

---

## Composants Client Confirmés

Fichiers avec `'use client'` détectés (31 fichiers) :

### Navigation & UI
- `components/Header.tsx`
- `components/RadioPlayer.tsx`
- `components/ConfirmationModal.tsx`

### Bible
- `app/bible/BiblePageClient.tsx`
- `components/BiblePageClient.tsx`
- `components/ChapterContent.tsx`
- `components/ChapterContentWrapper.tsx`
- `components/ChapterContentContributiveWrapper.tsx`
- `components/ChapterNavigation.tsx`
- `components/VerseCard.tsx`
- `components/VerseSelector.tsx`

### Contribution
- `components/ContributionButton.tsx`
- `components/ContributeVerseModal.tsx`
- `components/AddLinkModal.tsx`
- `components/LikeButton.tsx`

### Annotations
- `components/AnnotationCard.tsx`
- `components/AnnotationModal.tsx`

### Apocrypha
- `components/ApocryphaContent.tsx`
- `components/ApocryphaFilter.tsx`
- `components/ApocryphaVerseCard.tsx`

### Wiki
- `app/wiki/new/NewArticleForm.tsx`
- `app/wiki/[slug]/edit/EditArticleForm.tsx`

### Auth
- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`

### Profile
- `app/profil/ProfileSettings.tsx`

### Utils
- `utils/supabase/client.ts`
- `hooks/useTranslationPreference.ts`

### Src Components
- `src/components/bible-tooltip.tsx`
- `src/components/entity-selector.tsx`
- `src/components/interactive-verse.tsx`
- `src/components/verse-with-entities.tsx`

---

## Gamification System Confirmé

### Types de Contributions et Points

```typescript
const CONTRIBUTION_POINTS = {
  verse_link: 1,         // Renvoi biblique
  annotation: 1,         // Commentaire
  external_source: 5,    // Référence externe
  wiki_article: 50,      // Article wiki
  verse_translation: 2,  // Traduction verset
  translation_approved: 50, // Traduction approuvée
  like_received: 1,      // Like reçu par l'auteur
} as const;
```

### Actions de Gamification

- `updateUserScore()` - Mise à jour score utilisateur
- `toggleLikeAction()` - Like/unlike contributions
- `getUserDashboardAction()` - Dashboard utilisateur
- `getLeaderboardAction()` - Classement global

---

## Bible Data Structure

### Canon Catholique (73 livres confirmés)

**Ancien Testament (46 livres)**
- Pentateuque (5): Genèse, Exode, Lévitique, Nombres, Deutéronome
- Livres Historiques (16): Josué, Juges, Ruth, 1-2 Samuel, 1-2 Rois, 1-2 Chroniques, Esdras, Néhémie, Tobie†, Judith†, Esther, 1 Maccabées†, 2 Maccabées†
- Livres Poétiques (7): Job, Psaumes, Proverbes, Ecclésiaste, Cantique des Cantiques, Sagesse†, Siracide†
- Prophètes (18): Isaïe, Jérémie, Lamentations, Baruch†, Ézéchiel, Daniel, Osée, Joël, Amos, Abdias, Jonas, Michée, Nahum, Habacuc, Sophonie, Aggée, Zacharie, Malachie

**Nouveau Testament (27 livres)**
- Évangiles (4): Matthieu, Marc, Luc, Jean
- Histoire (1): Actes des Apôtres
- Épîtres de Paul (13): Romains, 1-2 Corinthiens, Galates, Éphésiens, Philippiens, Colossiens, 1-2 Thessaloniciens, 1-2 Timothée, Tite, Philémon, Hébreux
- Épîtres Catholiques (7): Jacques, 1-2 Pierre, 1-2-3 Jean, Jude
- Apocalypse (1): Apocalypse

† = Livres deutérocanoniques

---

## Runtime : Bun (PAS npm/yarn)

**Bun est le SEUL runtime/package manager utilisé.** Ne jamais utiliser npm, yarn ou pnpm.

```bash
bun dev        # Lancer le serveur de développement
bun run build  # Build de production
bun start      # Démarrer en production
bun run lint   # Linter
bun install    # Installer les dépendances
```

---

## Design System Confirmé

### Couleurs (via @theme)

```css
--color-primary: #1e293b;       /* Slate 900 */
--color-secondary: #64748b;     /* Slate 500 */
--color-accent: #b45309;        /* Amber 700 */
--color-accent-soft: #fef3c7;   /* Amber 100 */
--color-danger: #991b1b;        /* Red 800 */
--color-surface: #ffffff;
--color-background: #f8fafc;    /* Slate 50 */
--color-border: #e2e8f0;        /* Slate 200 */
```

### Typographie

```css
--font-sans: "Inter", system-ui, sans-serif;
--font-serif: "Libre Baskerville", serif;
```

### Fonts Google

- `Inter` - UI et corps de texte
- `Libre Baskerville` - Titres et citations

---

## Partenaires Intégrés

1. **Heaven Radio** - https://heavenradio.fr/
2. **La Mission Catholique** - https://lamissioncatholique.fr/
3. **Ultreia Event** - https://ultreiaevent.com/
4. **SOS Chrétiens d'Orient** - https://soschretiensdorient.netlify.app/
5. **Institut Irénée** - https://irenee-institut.org/

---

## Association Gestionnaire

**Parole et Partage** - SIREN: 841890692
- PayPal: https://www.paypal.com/paypalme/revelationradio?country.x=FR&locale.x=fr_FR

---

## Bonnes Pratiques Observées

1. **Séparation Server/Client** : Pattern clair entre Server Components pour data fetching et Client Components pour interactivité
2. **Type Safety** : TypeScript strict + Zod pour validation Server Actions
3. **Revalidation** : Utilisation de `revalidatePath()` après mutations
4. **Error Handling** : Try-catch avec gestion gracieuse des erreurs
5. **SEO** : Metadata API pour tous les pages publiques
6. **Performance** : ISR avec `export const revalidate` sur routes data-heavy

---

## Outils MCP Disponibles

### Supabase MCP
- `mcp__supabase__list_tables` - Lister les tables
- `mcp__supabase__execute_sql` - Exécuter du SQL
- `mcp__supabase__apply_migration` - Appliquer une migration
- `mcp__supabase__generate_typescript_types` - Générer les types
- `mcp__supabase__get_advisors` - Conseils sécurité/performance

### Context7 MCP
- `mcp__context7__query-docs` - Documentation Next.js et autres librairies
- `mcp__context7__resolve-library-id` - Trouver l'ID d'une librairie

---

## Notes Importantes

1. **next.config.ts** contient un workaround temporaire (`ignoreBuildErrors: true`)
2. **Deux clients Supabase** : `utils/supabase/server.ts` et `lib/supabase.ts` (à consolider?)
3. **Toutes les opérations DB** doivent passer par Supabase MCP
4. **Breaking changes React 19** : Utilisation de `use()` pour data fetching en Client Components
5. **Tailwind v4** : Pas de tailwind.config.js, tout dans @theme

---

*Ce document est une photographie exacte de la codebase au 2026-01-16. Pour toute mise à jour, relancer l'exploration Context7.*
