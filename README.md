# 🇻🇦 Wiki Catholic - La Bible Catholique (73 Livres)

Encyclopédie biblique catholique complète avec le canon de 73 livres, propulsée par Next.js 16.1, React 19.2, Tailwind v4 et Supabase.

## 🎯 Vision

- **Canon Catholique Complet**: 73 livres (46 Ancien Testament, 27 Nouveau Testament)
- **Livres Deutérocanoniques**: Tobie, Judith, Sagesse, Siracide, Baruch, 1-2 Maccabées
- **Wiki Collaboratif**: Articles avec historique des révisions
- **Navigation Intelligente**: Liens automatiques vers les versets bibliques

## 🛠 Stack Technique

- **Framework**: Next.js 16.1 (App Router)
- **UI**: React 19.2
- **Styling**: Tailwind CSS v4 (@theme based)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Langage**: TypeScript 5
- **Package Manager**: Bun

## 📦 Installation

```bash
# Installer les dépendances
bun install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditez .env.local avec vos credentials Supabase

# Importer les 73 livres de la Bible
bun run scripts/import-bible-books.ts

# Lancer le serveur de développement
bun run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Structure du Projet

```
wikibible/
├── app/                    # App Router Next.js
│   ├── layout.tsx         # Layout principal avec fonts
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Tailwind v4 @theme
├── lib/                    # Utilitaires
│   ├── supabase.ts        # Client Supabase
│   └── database.types.ts  # Types générés depuis Supabase
├── scripts/                # Scripts d'import
│   └── import-bible-books.ts  # Import des 73 livres
└── design_system.html      # Système de design de référence
```

## 🗄️ Base de Données

### Tables Principales

- `bible_books` - Les 73 livres du canon catholique
- `bible_verses` - Tous les versets avec traductions
- `wiki_articles` - Articles du wiki
- `wiki_revisions` - Historique des révisions
- `wiki_categories` - Catégories d'articles

### Migrations

Les migrations sont gérées via Supabase MCP:

```typescript
// Voir les tables existantes
mcp__supabase__list_tables()

// Appliquer une migration
mcp__supabase__apply_migration(name, query)

// Générer les types
mcp__supabase__generate_typescript_types()
```

## 🎨 Design System

Le design system est défini dans `design_system.html` et utilise:

- **Couleurs**: Slate (gris), Amber (or sacré), Red (liturgique)
- **Typographie**: Inter (UI), Libre Baskerville (titres & citations)
- **Composants**: Cards, Buttons, Inputs selon les specs

## 🔧 Workflow "Vibe Coding"

Pour chaque tâche, suivez le **7-Step Micro-Context Loop**:

1. **MCP Schema Sync**: Vérifier le schéma DB avec Supabase MCP
2. **File Context**: Lister les fichiers du dossier cible
3. **Requirement Validation**: Confirmer l'alignement avec le canon de 73 livres
4. **Drafting Intent**: Décrire la logique en 2 phrases
5. **Type Generation**: Assurer que les interfaces TS correspondent au schéma
6. **Execution**: Écrire le code (React 19 Server Actions, Tailwind v4)
7. **Post-Check**: Vérifier avec MCP que la logique est synchronisée

## 📚 Canon Catholique

### Ancien Testament (46 livres)

**Pentateuque** (5)
- Genèse, Exode, Lévitique, Nombres, Deutéronome

**Livres Historiques** (16)
- Josué, Juges, Ruth, 1-2 Samuel, 1-2 Rois, 1-2 Chroniques, Esdras, Néhémie
- Tobie†, Judith†, Esther, 1 Maccabées†, 2 Maccabées†

**Livres Poétiques** (7)
- Job, Psaumes, Proverbes, Ecclésiaste, Cantique des Cantiques
- Sagesse†, Siracide†

**Prophètes** (18)
- Isaïe, Jérémie, Lamentations, Baruch†, Ézéchiel, Daniel
- Osée, Joël, Amos, Abdias, Jonas, Michée, Nahum, Habacuc, Sophonie, Aggée, Zacharie, Malachie

† = Livres deutérocanoniques

### Nouveau Testament (27 livres)

**Évangiles** (4)
- Matthieu, Marc, Luc, Jean

**Histoire** (1)
- Actes des Apôtres

**Épîtres de Paul** (13)
- Romains, 1-2 Corinthiens, Galates, Éphésiens, Philippiens, Colossiens
- 1-2 Thessaloniciens, 1-2 Timothée, Tite, Philémon, Hébreux

**Épîtres Catholiques** (7)
- Jacques, 1-2 Pierre, 1-2-3 Jean, Jude

**Apocalypse** (1)
- Apocalypse

## 🚀 Scripts Disponibles

```bash
bun run dev       # Serveur de développement
bun run build     # Build de production
bun run start     # Serveur de production
bun run lint      # ESLint
```

## 📝 Notes

- Le projet utilise **React 19.2** avec les dernières fonctionnalités (use(), useActionState)
- **Tailwind v4** utilise `@theme` au lieu de tailwind.config.js
- Toutes les opérations DB passent par **Supabase MCP**
- Les types TypeScript sont générés automatiquement depuis la DB

## 🙏 Acknowledgments

- Bible Crampon 1923 pour la traduction française
- Design system inspiré des meilleures pratiques UI/UX
- Supabase pour l'infrastructure backend

---

**Wiki Catholic** - La Parole de Dieu accessible à tous. 🇻🇦
