# 🎯 Plan de Développement - WikiBible
**Date**: 3 janvier 2026
**Stack**: Next.js 16.1.1, React 19.2, Supabase SSR, Tailwind v4

---

## 📋 Analyse des Demandes Client

### 🔐 Demande 1 : "Modifier la clepsydre à la connexion"

**État actuel** :
- Fichier `app/auth/login/page.tsx:1` : Page de connexion basique avec `useActionState`
- Fichier `components/ConfirmationModal.tsx:6` : Modal de confirmation Catholic avec countdown de 5 secondes
- La "clepsydre" fait référence au système de countdown lors de la connexion

**Réponse client** :
> "Clepsydre : quand on se connecte y'a un ultimatum de 15 secondes"

**Action requise - MODIFLE CLÈS EN MAIN** :

1. **Changer le countdown de 5 → 15 secondes**
   - Modifier `components/ConfirmationModal.tsx:9` : `useState(15)` au lieu de `useState(5)`
   - Modifier `components/ConfirmationModal.tsx:34` : `setTimeout(15000)` au lieu de `5000`
   - Modifier `components/ConfirmationModal.tsx:96` : `style={{ width: `${(countdown / 15) * 100}%` }}` au lieu de `/ 5`

2. **Améliorer le UX "Ultimatum"** :
   - Ajouter un message plus impactant type "⏳ Vous avez 15 secondes pour confirmer"
   - Rendre le countdown plus visible (couleur qui change, animation plus prononcée)
   - Ajouter un bouton "Confirmer maintenant" pour ne pas attendre

**Fichiers à modifier** :
- `components/ConfirmationModal.tsx` - Countdown 15s + UX améliorée

---

## 📖 Demande 2 : Refonte complète du système de liens bibliques

### 2.1 Problème identifié

**État actuel** (`components/AddLinkModal.tsx:1`) :
```typescript
// Actuellement : 7 types de liens dans un seul select
<option value="citation">📖 Citation biblique</option>
<option value="concordance">🔄 Autre version biblique</option>
<option value="parallel">🔗 Référence théologique (auteur, document)</option>
<option value="prophecy">✨ Prophétie accomplie</option>
<option value="typology">🎭 Typologie (préfiguration)</option>
<option value="commentary">💭 Commentaire</option>
<option value="wiki">📚 Article Wiki</option>
```

**Problème** :
- Tous les types sont mélangés
- Pas de distinction claire entre "catégories principales" et "précisions"
- L'UX est confuse pour l'utilisateur

---

### 2.2 Solution proposée : Workflow en 2 étapes

#### ÉTAPE 1 : Choisir la CATÉGORIE principale

Le client demande un workflow en 2 étapes :

**Étape 1** : Sélectionner la catégorie principale
```
┌─────────────────────────────────────┐
│  Que souhaitez-vous ajouter ?        │
├─────────────────────────────────────┤
│  ○ Renvoi biblique                   │
│  ○ Commentaire/Méditation           │
│  ○ Référence externe                │
└─────────────────────────────────────┘
```

**Étape 2** : En fonction de la catégorie, formulaire différent

---

#### 📌 CATÉGORIE 1 : Renvoi Biblique

Si utilisateur sélectionne **"Renvoi biblique"** → Formulaire :

```typescript
// Champs demandés :
- Livre (select autocomplete/dropdown) ← Liste déroulante
- Chapitre (select automatique selon le livre)
- Verset (select automatique selon le chapitre)

// Puis : PRÉCISION sur le type de renvoi
┌─────────────────────────────────────┐
│  Type de renvoi :                    │
│  ○ Figure  [🎭]                     │
│  ○ Type     [⚏]                     │
│  ○ Prophétie [☀️]                    │
└─────────────────────────────────────┘
```

**⭐ PRÉCISION CLIENT - Occurrence cible** :

**Réponse client** :
> "Pour l'occurrence cible, c'est pas celle du départ, c'est celle où on arrive mais on peut pas l'écrire dans un champ il faut la sélectionner dans une liste déroulante ; livre chapitre verset et ça place un lien directement"

**Implémentation** :

1. **3 selects en cascade** (cascading dropdowns) :
   ```typescript
   // Étape 1 : Sélectionner le livre
   <select name="book_id" required>
     <option value="">Choisir un livre...</option>
     {books.map(book => (
       <option key={book.id} value={book.id}>
         {book.name} ({book.chapters} chapitres)
       </option>
     ))}
   </select>

   // Étape 2 : Sélectionner le chapitre (chargé dynamiquement)
   <select name="chapter" disabled={!selectedBook} required>
     <option value="">Choisir un chapitre...</option>
     {Array.from({ length: selectedBook?.chapters || 0 }, (_, i) => (
       <option key={i + 1} value={i + 1}>Chapitre {i + 1}</option>
     ))}
   </select>

   // Étape 3 : Sélectionner le verset (chargé dynamiquement)
   <select name="verse" disabled={!selectedChapter} required>
     <option value="">Choisir un verset...</option>
     {versets.map(v => (
       <option key={v.verse} value={v.verse}>Verset {v.verse}</option>
     ))}
   </select>
   ```

2. **Chargement des versets en temps réel** :
   - Utiliser React Server Actions pour charger les versets du chapitre sélectionné
   - Ne pas bloquer l'UI avec des requêtes inutiles

3. **Création automatique du lien** :
   - Une fois les 3 selects remplis → créer automatiquement le `target_verse_id`
   - Plus besoin de parser de texte manuellement

**Logos demandés** :
- **Figure** = `f` avec symbole 🎭
- **Type** = `t` avec symbole ⚏
- **Prophétie** = `p` avec symbole soleil ☀️

**Réponse client** :
> "Oui un symbole reconnaissable à côté de chaque occurrence"

**Implémentation** :
- Chaque renvoi affiché aura un badge avec :
  - Lettre (f, t, ou p) en **gras**
  - Icône correspondante (🎭, ⚏, ou ☀️)
  - Couleur distinctive par type
    - Figure = bleu 🔵
    - Type = vert 🟢
    - Prophétie = orange/jaune 🟡 (soleil)

⚠️ **Note importante du client** :
> "Ce sont des précisions sur les renvois et non des catégories différentes des renvois"

Donc dans la DB, ces 3 options doivent avoir le même `link_type` = `"renvoi"` ou `"parallel"`, mais avec un champ `sub_type` ou `precision` supplémentaire.

---

#### 💭 CATÉGORIE 2 : Commentaire / Méditation

Si utilisateur sélectionne **"Commentaire/Méditation"** → Formulaire :

```typescript
// Champs :
- Texte du commentaire (textarea)
- Type : ○ Commentaire  ○ Méditation
```

Dans la DB, cela crée une entrée dans `verse_annotations` ou un `verse_links` avec `link_type = "commentary"`

**⭐ NOUVEAU - Indicateur de confession** :

**Réponse client** :
> "Pour les commentaires une couleur pour savoir si c un protestant ou un catholique ou un orthodoxe qui l'a mis"

**Implémentation** :

Le champ `confession` existe déjà dans `verse_links` et `user_profiles`. Il faut l'afficher visuellement :

```typescript
// Dans VerseCard.tsx ou AnnotationCard.tsx
const confessionColors = {
  catholic: 'bg-yellow-100 text-yellow-800 border-yellow-300',    // 🟡 Catholique
  orthodox: 'bg-blue-100 text-blue-800 border-blue-300',          // 🔵 Orthodoxe
  protestant: 'bg-purple-100 text-purple-800 border-purple-300',  // 🟣 Protestant
  anglican: 'bg-green-100 text-green-800 border-green-300',       // 🟢 Anglican
  other: 'bg-gray-100 text-gray-800 border-gray-300',             // ⚫ Autre
};

// Affichage
<div className={`px-2 py-1 rounded text-xs font-medium border ${confessionColors[annotation.confession]}`}>
  {annotation.confession === 'catholic' && '🙏 Catholique'}
  {annotation.confession === 'orthodox' && '✝️ Orthodoxe'}
  {annotation.confession === 'protestant' && '📖 Protestante'}
  {annotation.confession === 'anglican' && '⛪ Anglicane'}
  {annotation.confession === 'other' && '❓ Autre'}
</div>
```

**Fichiers à modifier** :
- `components/AnnotationCard.tsx` - Afficher badge confession
- `components/VerseCard.tsx` - Afficher confession des annotations/liens
- `app/apocrypha/page.tsx` - Corriger import `createClient`

---

#### 📚 CATÉGORIE 3 : Référence Externe

Si utilisateur sélectionne **"Référence externe"** → Formulaire :

```typescript
// Champs :
- Auteur/Document (text input)
- Référence précise (text input)
- Source : [Saint | Père | Concile | Catéchisme | Autre]
```

---

### 2.3 Spécificité : Prophétie biblique avec checkbox

**Demande client** :
> "Prophétie biblique : cocher une case lorsque on indique un parallèle ce qui rajoute le petit soleil, et l'enlever de sa catégorie"

**Interprétation** :
- Quand on ajoute un renvoi qui est une prophétie
- Case à cocher : "☐ Est une prophétie accomplie"
- Si coché → afficher le soleil ☀️
- Et "l'enlever de sa catégorie" = ne PAS la classer comme "prophétie" dans les catégories principales, mais comme un renvoi avec le tag soleil

**Schéma DB proposé** :

```sql
-- Table verse_links
ALTER TABLE verse_links
ADD COLUMN is_prophecy BOOLEAN DEFAULT FALSE,
ADD COLUMN link_subtype VARCHAR; -- 'figure', 'type', 'prophecy'

-- Pour les renvois bibliques :
link_type = 'parallel' -- ou 'renvoi'
link_subtype = 'figure' | 'type' | 'prophecy'
is_prophecy = true -- si c'est une prophétie accomplie
```

---

### 2.4 Ce qui doit être SUPPRIMÉ

**Demande client** :
> "Enlever référence cible"

**Réponse client** :
> "Référence cible : sert à rien on en vient"

**À supprimer** :
- ❌ Le champ "Référence cible" dans `AddLinkModal.tsx:116-127`
- ❌ La colonne `target_reference` dans la DB (ou la garder pour compatibilité mais plus affichée)
- ❌ Toutes les références à ce champ dans le code

**Note** : La colonne `target_reference` existe encore dans `verse_links` pour stocker les références textuelles non bibliques (ex: "Saint Augustin", "Catéchisme 1234"), mais elle n'est plus visible dans le formulaire.

---

## 🗄️ Modifications Database (Supabase MCP)

### Migration à créer :

```sql
-- Ajouter sous-type de lien
ALTER TABLE verse_links
ADD COLUMN link_subtype VARCHAR CHECK (link_subtype IN ('figure', 'type', 'prophecy'));

-- Ajouter flag prophétie
ALTER TABLE verse_links
ADD COLUMN is_prophecy BOOLEAN DEFAULT FALSE;

-- Modifier les contraintes check
ALTER TABLE verse_links
DROP CONSTRAINT verse_links_link_type_check;

ALTER TABLE verse_links
ADD CONSTRAINT verse_links_link_type_check
CHECK (link_type::text = ANY (ARRAY['citation'::character varying, 'parallel'::character varying, 'prophecy'::character varying, 'typology'::character varying, 'commentary'::character varying, 'concordance'::character varying, 'wiki'::character varying, 'renvoi'::character varying]::text[]));
```

---

## 📝 Implémentation Technique

### Fichiers à modifier :

1. **`components/AddLinkModal.tsx`** :
   - ✅ Refactor complet en 2-step wizard
   - ✅ Étape 1 : Sélection catégorie (Renvoi | Commentaire | Référence)
   - ✅ Étape 2 : Formulaire dynamique selon catégorie
   - ✅ **NOUVEAU** : Pour renvois bibliques → 3 selects en cascade (livre → chapitre → verset)
   - ✅ Ajouter select subtype pour les renvois (figure/type/prophétie)
   - ❌ SUPPRIMER le champ "Référence cible" textuel

2. **`components/VerseSelector.tsx`** (NOUVEAU) :
   - ✅ Composant réutilisable pour les 3 selects en cascade
   - ✅ Chargement dynamique des chapitres/versets
   - ✅ Gestion des états disabled/required

3. **`app/actions.ts`** :
   - ✅ Modifier `CreateVerseLinkSchema` pour utiliser `book_id`, `chapter`, `verse` au lieu de `target_verse`
   - ✅ Ajouter `link_subtype` et `is_prophecy`
   - ✅ **NOUVEAU** : Server Action `getVersesAction` pour charger les versets d'un chapitre
   - ✅ **NOUVEAU** : Ajouter `updateVerseLinkAction` et `deleteVerseLinkAction`

4. **`components/VerseCard.tsx`** :
   - ✅ Afficher les logos f/t/p selon `link_subtype` avec icônes et couleurs
   - ✅ Afficher soleil ☀️ si `is_prophecy = true`
   - ✅ Afficher badge de confession (couleur selon catholic/orthodox/protestant)
   - ✅ Boutons modifier/supprimer sur les contributions (si auteur)

5. **`components/AnnotationCard.tsx`** (NOUVEAU) :
   - ✅ Afficher badge confession avec couleur
   - ✅ Boutons modifier/supprimer (si auteur)

6. **`components/ConfirmationModal.tsx`** :
   - ✅ Changer countdown 5s → 15s
   - ✅ Améliorer UX "ultimatum"

7. **Nouveaux Server Actions** :
   - ✅ `getVersesAction(book_id, chapter)` - Charger les versets d'un chapitre
   - ✅ `updateVerseLinkAction` - Modifier un lien existant
   - ✅ `deleteVerseLinkAction` - Supprimer un lien
   - ✅ `updateAnnotationAction` - Modifier une annotation
   - ✅ `deleteAnnotationAction` - Supprimer une annotation

---

## 🎨 UI/UX Proposée

### Design du wizard :

```
┌──────────────────────────────────────────────┐
│  Étape 1/2 : Type de contribution             │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 📖 Renvoi biblique                     │  │
│  │    Créer un lien vers un autre verset  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 💭 Commentaire / Méditation            │  │
│  │    Ajouter votre réflexion             │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 📚 Référence externe                   │  │
│  │    Saint, Père, Concile...             │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘

[Suivant →]
```

### Si "Renvoi biblique" sélectionné → Étape 2 :

```
┌──────────────────────────────────────────────┐
│  Étape 2/2 : Détails du renvoi biblique       │
│  [← Retour]                                   │
├──────────────────────────────────────────────┤
│                                              │
│  Livre : [Jean ▼]                            │
│  Chapitre : [3]     Verset : [16]            │
│                                              │
│  Type de renvoi :                            │
│  ┌────────────────────────────────────────┐  │
│  │ 🎭 Figure (préfiguration)              │  │
│  │ ⚏ Type (antitype)                     │  │
│  │ ☀️ Prophétie accomplie                │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ☐ Cocher si c'est une prophétie biblique   │
│     (ajoutera le soleil ☀️)                  │
│                                              │
│  Description (optionnel) :                   │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘

[Annuler] [Ajouter le renvoi]
```

---

## ⚠️ Questions pour le Client

### ✅ RÉPONSES OBTENUES :

1. ~~**Clepsydre** :~~ ✅ **RÉSOLU**
   - **Réponse** : "Quand on se connecte y'a un ultimatum de 15 secondes"
   - **Action** : Changer countdown 5s → 15s dans `ConfirmationModal.tsx`

2. ~~**Logos f/t/p** :~~ ✅ **RÉSOLU**
   - **Réponse** : "Oui un symbole reconnaissable à côté de chaque occurrence"
   - **Action** : Badge avec lettre + icône + couleur distinctive

3. ~~**Suppression "Référence cible"** :~~ ✅ **RÉSOLU**
   - **Réponse** : "Référence cible : sert à rien on en vient"
   - **Action** : Supprimer le champ du formulaire

4. ~~**Couleurs pour commentaires** :~~ ✅ **RÉSOLU**
   - **Réponse** : "Une couleur pour savoir si c'est un protestant ou un catholique ou un orthodoxe"
   - **Action** : Badge confession avec code couleur

### ❌ RESTE À CLARIFIER :

1. **Modification/Suppression des contributions** :
   - **Réponse client** : "Oui l'utilisateur peut modifier ou supprimer son occurrence"
   - **Implémentation** :
     - Ajouter boutons "Modifier" et "Supprimer" sur chaque contribution
     - Vérifier que l'utilisateur est bien l'auteur
     - Server Actions pour update/delete

2. **Workflow wizard** :
   - L'utilisateur peut-il revenir à l'étape 1 s'il s'est trompé de catégorie ? (OUI par défaut)
   - Confirmation avant ajout du renvoi ? (NON par défaut, ajout direct)

---

## 📚 Demande 4 : Page Apocryphes

### 4.1 État actuel

**Fichiers existants** :
- ✅ `app/apocrypha/page.tsx` - Page principale des apocryphes
- ✅ `app/apocrypha/[slug]/page.tsx` - Page d'un livre apocryphe
- ✅ `components/ApocryphaGrid.tsx` - Grille des livres
- ✅ `components/ApocryphaFilter.tsx` - Filtre par catégorie
- ✅ `components/ApocryphaContent.tsx` - Affichage du contenu

**Database (via Supabase MCP)** :
- ✅ Table `apocryphal_books` avec 6+ livres importés
- ✅ Table `apocryphal_verses` avec traductions (text_original + text_fr)
- ✅ Catégories : `apocrypha` (2 livres) et `deutero` (4 livres)

**Contenu importé** (6/14 livres) :
1. **1 Esdras** - 9 chapitres
2. **2 Esdras** - 16 chapitres
3. **Additions to Esther** - 16 chapitres
4. **Judith** - 16 chapitres
5. **Tobit** - 14 chapitres
6. *(En cours d'import : 8 autres livres)*

---

### 4.2 Architecture existante

**URL Routing** :
```
/apocrypha                    → Liste des livres par catégorie
/apocrypha/[slug]             → Page d'un livre (ex: /apocrypha/tobit)
```

**Structure des données** :

```sql
-- Livres apocryphes
apocryphal_books:
  - id: UUID
  - name: "1 Esdras"
  - name_fr: "1 Esdras"
  - slug: "1-esdras"
  - category: "apocrypha" | "deutero" | "second_temple" | "dss"
  - chapters: 9
  - description_fr: "Livre apocryphe: 1 Esdras"

-- Versets apocryphes
apocryphal_verses:
  - id: UUID
  - book_id: UUID (FK → apocryphal_books)
  - chapter: 1
  - verse: 1
  - text_original: "And Josias held..."
  - text_fr: "Et Josias célébra..."
  - translation_id: "gemini-3-flash"
```

---

### 4.3 Fonctionnalités implémentées

✅ **Page principale** (`/apocrypha`) :
- Header avec breadcrumb
- Liste des livres groupés par catégorie
- Filtre par catégorie
- Grille visuelle des livres

✅ **Page détail livre** (`/apocrypha/[slug]`) :
- Info livre (nom, description)
- Navigation par chapitres (sticky header)
- Affichage des versets avec traduction FR

✅ **Composants** :
- `ApocryphaGrid` - Cartes des livres
- `ApocryphaFilter` - Filtre catégories
- `ApocryphaContent` - Contenu des chapitres/versets

---

### 4.4 Améliorations à prévoir

⚠️ **Bug à corriger** :
```typescript
// app/apocrypha/page.tsx:9
const supabase = await createClient(); // ❌ Manque l'import
```
→ Corriger en : `import { createClient } from '@/utils/supabase/server';`

🔧 **Améliorations UX futures** (optionnelles) :
1. **Recherche dans les apocryphes** :
   - Barre de recherche texte
   - Recherche par référence (ex: "Tobie 3:5")

2. **Comparaison avec Bible canonique** :
   - Liens vers versets parallèles dans la Bible
   - "Voir aussi : Tobie 6:10 → Tobie 12:12 (Bible de Jérusalem)"

3. **Notes et commentaires** :
   - Système d'annotations sur les versets apocryphes
   - Commentaires théologiques

4. **Mode lecture** :
   - Mode sombre/lecture
   - Taille de police ajustable
   - Pagination par chapitre

---

### 4.5 Intégration avec le système de liens

🔗 **Futur lien avec le système de renvois bibliques** :

Les versets apocryphes pourront être :
- **Cités** depuis la Bible canonique
- **Reliés** aux renvois bibliques (ex: prophéties citées dans les apocryphes)
- **Annotés** avec le système de confession (catholic/orthodox/protestant)

**Note théologique** :
- Les apocryphes sont **reconnus par les catholiques et orthodoxes** comme deutérocanoniques
- Les protestants les considèrent comme **apocryphes** (non canoniques)
- → Important d'afficher la confession de celui qui ajoute des liens vers ces textes

---

### 4.6 Statistiques d'import

**État actuel** (6/14 livres) :
- ✅ **Apocryphes** (2 livres) : 1 Esdras, 2 Esdras
- ✅ **Deutérocanoniques** (4 livres) : Tobie, Judith, Additions d'Esther, *(+1 en cours)*
- ⏳ **Reste à importer** : 8 livres

**Volume de données** :
- ~1000+ versets déjà importés
- Traduction FR automatique (Gemini)
- Structure prête pour l'ajout de contributions

---

## 🏆 Demande 5 : Système de Récompense & Gamification

### 3.1 Spécifications fonctionnelles

**Demande client** :
> "Fait un système de récompense de contributeur, il gagne un cœur par contribution multiplié par les likes qu'il aura"
> "Ensuite il a son Dashboard dans son espace user et on voit aussi le classement"

**Calcul des points** :
```
❤️ Cœurs = (Nombre de contributions) × (Likes reçus)
```

**Types de contributions** :
- Lien biblique ajouté (`verse_links`)
- Annotation créée (`verse_annotations`)
- Source externe ajoutée (`verse_external_links`)
- Article wiki créé/révisé (`wiki_articles`, `wiki_revisions`)

**Ce qu'il faut développer** :

1. **Système de likes** sur les contributions
2. **Calcul automatique des cœurs**
3. **Dashboard utilisateur** avec ses stats
4. **Classement global** des meilleurs contributeurs
5. **Badges/Achievements** (optionnel mais recommandé)

---

### 3.2 Schéma Database proposé

#### Tables à créer :

```sql
-- Table pour les likes sur les contributions
CREATE TABLE contribution_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contribution_type VARCHAR NOT NULL CHECK (contribution_type IN ('link', 'annotation', 'external_source', 'wiki_article')),
    contribution_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, contribution_type, contribution_id)
);

-- Index pour les performances
CREATE INDEX idx_contribution_likes_type_id ON contribution_likes(contribution_type, contribution_id);

-- Table pour les scores utilisateur (mise à jour par trigger)
CREATE TABLE user_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    total_hearts INTEGER DEFAULT 0,
    total_contributions INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des badges/achievements
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR NOT NULL, -- 'first_contribution', 'hundred_hearts', 'top_contributor', etc.
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- Ajouter colonnes likes_count aux tables existantes
ALTER TABLE verse_links ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE verse_annotations ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE verse_external_links ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE wiki_articles ADD COLUMN likes_count INTEGER DEFAULT 0;
```

#### Trigger pour calcul automatique des cœurs :

```sql
-- Fonction pour mettre à jour le score utilisateur
CREATE OR REPLACE FUNCTION update_user_score()
RETURNS TRIGGER AS $$
DECLARE
    v_contributions INTEGER;
    v_likes INTEGER;
    v_hearts INTEGER;
BEGIN
    -- Compter les contributions de l'utilisateur
    SELECT COUNT(*)
    INTO v_contributions
    FROM (
        SELECT 1 FROM verse_links WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
        UNION ALL
        SELECT 1 FROM verse_annotations WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
        UNION ALL
        SELECT 1 FROM verse_external_links WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
        UNION ALL
        SELECT 1 FROM wiki_articles WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
    ) AS contrib;

    -- Compter les likes reçus
    SELECT COALESCE(SUM(likes_count), 0)
    INTO v_likes
    FROM (
        SELECT likes_count FROM verse_links WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
        UNION ALL
        SELECT likes_count FROM verse_annotations WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
        UNION ALL
        SELECT likes_count FROM verse_external_links WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
        UNION ALL
        SELECT likes_count FROM wiki_articles WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
    ) AS likes;

    -- Calculer les cœurs
    v_hearts := v_contributions * v_likes;

    -- Upsert le score
    INSERT INTO user_scores (user_id, total_hearts, total_contributions, total_likes_received)
    VALUES (COALESCE(NEW.author_id, OLD.author_id), v_hearts, v_contributions, v_likes)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_hearts = EXCLUDED.total_hearts,
        total_contributions = EXCLUDED.total_contributions,
        total_likes_received = EXCLUDED.total_likes_received,
        updated_at = NOW();

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers sur les tables de contributions
CREATE TRIGGER trigger_update_score_on_link
AFTER INSERT OR UPDATE ON verse_links
FOR EACH ROW
EXECUTE FUNCTION update_user_score();

CREATE TRIGGER trigger_update_score_on_annotation
AFTER INSERT OR UPDATE ON verse_annotations
FOR EACH ROW
EXECUTE FUNCTION update_user_score();

CREATE TRIGGER trigger_update_score_on_external_source
AFTER INSERT OR UPDATE ON verse_external_links
FOR EACH ROW
EXECUTE FUNCTION update_user_score();

CREATE TRIGGER trigger_update_score_on_wiki_article
AFTER INSERT OR UPDATE ON wiki_articles
FOR EACH ROW
EXECUTE FUNCTION update_user_score();

-- Fonction pour mettre à jour le classement
CREATE OR REPLACE FUNCTION update_rankings()
RETURNS VOID AS $$
BEGIN
    -- Mettre à jour le rang basé sur les cœurs
    WITH ranked_users AS (
        SELECT
            user_id,
            DENSE_RANK() OVER (ORDER BY total_hearts DESC) as new_rank
        FROM user_scores
    )
    UPDATE user_scores us
    SET rank = ru.new_rank
    FROM ranked_users ru
    WHERE us.user_id = ru.user_id;
END;
$$ LANGUAGE plpgsql;

-- Job planifié (à configurer dans pg_cron ou via Supabase)
-- Tous les jours à minuit : SELECT update_rankings();
```

---

### 3.3 Composants React à créer

#### 1. **Dashboard Utilisateur** (`app/profil/dashboard/page.tsx`)

```typescript
// Interface Dashboard
interface UserDashboard {
  user: {
    username: string;
    avatar?: string;
    confession: string;
  };
  stats: {
    totalHearts: number;      // ❤️ Cœurs totaux
    totalContributions: number; // 📝 Contributions
    totalLikes: number;        // 👍 Likes reçus
    rank: number;              // 🏆 Classement
  };
  recentContributions: Contribution[];
  badges: Badge[];
}
```

**Layout proposé** :

```
┌─────────────────────────────────────────────────────┐
│  📊 Mon Espace - Mon Dashboard                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  👤 Jean Dupont                               │ │
│  │  🏆 Rang #42 sur 1,234 contributeurs          │ │
│  │  🙏 Confession : Catholique                   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ ❤️ 1,234 │ 📝 56   │ 👍 789  │ 🏆 #42   │    │
│  │ Cœurs    │ Contrib. │ Likes   │ Classement│    │
│  └──────────┴──────────┴──────────┴──────────┘    │
│                                                     │
│  🏅 Badges                                          │
│  ┌─────┬─────┬─────┬─────┬─────┐                   │
│  │ 🥇  │ ✍️  │ 📖  │ 💎  │ ⭐  │                   │
│  │Prem.│100+ │Expert|Top 10|Star│                   │
│  └─────┴─────┴─────┴─────┴─────┘                   │
│                                                     │
│  📈 Évolution récente                               │
│  [Graphique des cœurs gagnés les 30 derniers jours] │
│                                                     │
│  📝 Mes 5 dernières contributions                   │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🔗 Renvoi : Jean 3:16 → Genèse 12:3           │ │
│  │    💭 12 likes • ❤️ 12 cœurs                  │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │ 💬 Annotation : Psaume 23                     │ │
│  │    👍 8 likes • ❤️ 8 cœurs                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 2. **Système de Likes** (`components/LikeButton.tsx`)

```typescript
'use client';

interface LikeButtonProps {
  contributionType: 'link' | 'annotation' | 'article';
  contributionId: string;
  initialLikes: number;
  isLiked: boolean;
  onToggleLike: () => void;
}

export function LikeButton({
  contributionType,
  contributionId,
  initialLikes,
  isLiked,
  onToggleLike
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);
  const [pending, setPending] = useState(false);

  const handleLike = async () => {
    setPending(true);
    await onToggleLike();
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    setPending(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={pending}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
        liked
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
      }`}
    >
      <svg
        className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
      <span className="font-medium">{likes}</span>
    </button>
  );
}
```

#### 3. **Classement Global** (`app/classement/page.tsx`)

```
┌─────────────────────────────────────────────────────┐
│  🏆 Classement des Contributeurs                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🥇 1.  Marie_Augustin       ❤️ 45,678 cœurs        │
│       📝 234 contributions  👍 195 likes moy.       │
│                                                     │
│  🥈 2.  Thomas_Aquin        ❤️ 38,912 cœurs        │
│       📝 189 contributions  👍 206 likes moy.       │
│                                                     │
│  🥉 3.  Therese_Avila       ❤️ 34,521 cœurs        │
│       📝 156 contributions  👍 221 likes moy.       │
│                                                     │
│  4.  Jean-Paul_II          ❤️ 29,843 cœurs        │
│  5.  Francois_Assisi       ❤️ 27,156 cœurs        │
│  6.  Benedict_XVI          ❤️ 24,789 cœurs        │
│  ...                                                 │
│                                                     │
│  [Filtres: Cette semaine | Ce mois | Toujours]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 4. **Badges/Achievements**

```typescript
// Badges proposés
const BADGES = {
  first_contribution: { icon: '🌱', name: 'Premier pas', description: 'Votre première contribution' },
  ten_contributions: { icon: '📝', name: 'Contributeur', description: '10 contributions' },
  hundred_contributions: { icon: '✍️', name: 'Expert', description: '100 contributions' },
  first_like: { icon: '❤️', name: 'Apprécié', description: 'Votre premier like' },
  hundred_likes: { icon: '💎', name: 'Populaire', description: '100 likes reçus' },
  top_10: { icon: '👑', name: 'Élite', description: 'Top 10 du classement' },
  top_contributor: { icon: '🏆', name: 'Légende', description: '1er du classement' },
  catholic: { icon: '🙏', name: 'Foi catholique', description: 'Confession catholique' },
  theologian: { icon: '📖', name: 'Théologien', description: '50 articles wiki' },
};
```

---

### 3.4 Server Actions à créer

**Dans `app/actions.ts`** :

```typescript
// === GAMIFICATION ACTIONS ===

const LikeContributionSchema = z.object({
  contribution_type: z.enum(['link', 'annotation', 'external_source', 'wiki_article']),
  contribution_id: z.string().uuid(),
});

/**
* Like/Unlike une contribution
*/
export async function toggleLikeAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = LikeContributionSchema.safeParse({
    contribution_type: formData.get('contribution_type'),
    contribution_id: formData.get('contribution_id'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { contribution_type, contribution_id } = validatedFields.data;

  // Vérifier si déjà liké
  const { data: existingLike } = await supabase
    .from('contribution_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('contribution_type', contribution_type)
    .eq('contribution_id', contribution_id)
    .single();

  if (existingLike) {
    // Unlike
    await supabase
      .from('contribution_likes')
      .delete()
      .eq('id', existingLike.id);

    // Décrémenter le compteur
    const tableMap = {
      link: 'verse_links',
      annotation: 'verse_annotations',
      external_source: 'verse_external_links',
      wiki_article: 'wiki_articles',
    };

    await supabase
      .from(tableMap[contribution_type])
      .update({ likes_count: supabase.rpc('decrement', { val: 1 }) })
      .eq('id', contribution_id);

    return { success: true, liked: false };
  } else {
    // Like
    await supabase
      .from('contribution_likes')
      .insert({
        user_id: user.id,
        contribution_type,
        contribution_id,
      });

    // Incrémenter le compteur
    const tableMap = {
      link: 'verse_links',
      annotation: 'verse_annotations',
      external_source: 'verse_external_links',
      wiki_article: 'wiki_articles',
    };

    await supabase
      .from(tableMap[contribution_type])
      .update({ likes_count: supabase.rpc('increment', { val: 1 }) })
      .eq('id', contribution_id);

    return { success: true, liked: true };
  }
}

/**
* Récupérer le dashboard utilisateur
*/
export async function getUserDashboardAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Récupérer le score
  const { data: score } = await supabase
    .from('user_scores')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Récupérer les badges
  const { data: badges } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', user.id);

  // Récupérer les contributions récentes
  // ... (jointures sur verse_links, verse_annotations, etc.)

  return {
    success: true,
    score,
    badges,
    // ...
  };
}

/**
* Récupérer le classement global
*/
export async function getLeaderboardAction(limit = 100) {
  const supabase = await createClient();

  const { data: leaderboard } = await supabase
    .from('user_scores')
    .select(`
      *,
      user:user_profiles(username, full_name)
    `)
    .order('total_hearts', { ascending: false })
    .limit(limit);

  return { success: true, leaderboard };
}
```

---

### 3.5 Fichiers à créer/modifier

**Nouveaux fichiers** :
- `app/profil/dashboard/page.tsx` - Dashboard utilisateur
- `app/classement/page.tsx` - Page de classement
- `components/LikeButton.tsx` - Bouton de like
- `components/UserStatsCard.tsx` - Carte de stats
- `components/LeaderboardTable.tsx` - Tableau du classement
- `components/BadgeDisplay.tsx` - Affichage des badges

**Fichiers à modifier** :
- `app/actions.ts` - Ajouter actions gamification
- `components/VerseCard.tsx` - Intégrer bouton like
- `components/AddLinkModal.tsx` - Afficher les likes reçus
- `app/profil/page.tsx` - Lien vers le dashboard
- `app/layout.tsx` - Ajouter lien "Classement" dans la nav

---

## 🚦 Ordre de priorité

### IMMÉDIAT (Script en cours)
- ⏳ **Laisser tourner l'import des apocryphes** (6/14 livres)
- ✅ Page Apocryphes déjà fonctionnelle

### URGENT (dès que import fini)
1. **URGENT** : Modifier countdown `ConfirmationModal.tsx` (5s → 15s)
2. **URGENT** : Corriger import `createClient` dans `app/apocrypha/page.tsx`

### HIGH PRIORITÉ
3. **HIGH** : Système de récompense (gamification) - **NOUVELLE DEMANDE PRIORITAIRE**
4. **HIGH** : Refonte `AddLinkModal` en 2-step wizard
5. **HIGH** : Migration DB pour `link_subtype`, `is_prophecy` ET gamification
6. **HIGH** : Créer `VerseSelector.tsx` (3 selects en cascade)

### MEDIUM PRIORITÉ
7. **MEDIUM** : Dashboard utilisateur
8. **MEDIUM** : Affichage des logos f/t/p dans `VerseCard`
9. **MEDIUM** : Classement global
10. **MEDIUM** : Système modification/suppression contributions

### LOW PRIORITÉ
11. **LOW** : Polish UX (animations, transitions)
12. **LOW** : Recherche dans les apocryphes
13. **LOW** : Mode lecture apocryphes

---

## 📦 Livrables

Une fois clarifié, livrer :

### Phase 1 - Système de liens (demandes originales)
- [ ] **URGENT** : Modifier countdown `ConfirmationModal.tsx` (5s → 15s)
- [ ] Migration Supabase pour `link_subtype` et `is_prophecy`
- [ ] Créer composant `VerseSelector.tsx` (3 selects en cascade)
- [ ] Refactor `AddLinkModal.tsx` en wizard 2-step
- [ ] Supprimer champ "Référence cible" textuel
- [ ] Server Action `getVersesAction` pour charger versets
- [ ] Server Actions update/delete pour contributions
- [ ] Créer `AnnotationCard.tsx` avec badge confession
- [ ] Display des logos f/t/p avec couleurs dans `VerseCard`
- [ ] Afficher badge confession (catholic/orthodox/protestant)
- [ ] Tests manuels du workflow complet de liens

### Phase 2 - Gamification (NOUVEAU)
- [ ] Migration Supabase complète (tables likes, scores, badges)
- [ ] Triggers PostgreSQL pour calcul automatique des cœurs
- [ ] Server Actions `toggleLikeAction`, `getUserDashboardAction`, `getLeaderboardAction`
- [ ] Composant `LikeButton.tsx` réutilisable
- [ ] Page Dashboard utilisateur avec stats et badges
- [ ] Page Classement global avec top 100
- [ ] Intégration des likes dans `VerseCard` et `AddLinkModal`
- [ ] Système de badges avec achievements
- [ ] Tests manuels du système de gamification
- [ ] Documentation technique (README gamification)

---

**Note technique** :
Tous les changements doivent respecter la stack Next.js 16.1 (App Router), React 19 (`useActionState`, Server Actions), et le pattern RLS Supabase. Le système de gamification utilise des triggers PostgreSQL pour la performance et évite les calculs coûteux côté client.
