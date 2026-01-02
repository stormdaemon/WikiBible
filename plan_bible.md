# 📖 Plan d'Implémentation - Moteur de Liens Théologiques (CE PLAN DOIT ETRE ONE SHOT DES MAINTENANT, USAGE DE CONTEXT 7 MCP A CHAQUE MICRO ETAPE OBLIGATOIRE, UTIILISE TON OUTIL PLAN/TASK POUR IMPLEMENTER TOUT çA)

## 🎯 Vision du Projet
Transformer la Bible en un **réseau social d'annotations croisées** où chaque verset devient un point d'ancrage pour les contributions théologiques multi-auteurs.

---

## 🏗 Architecture de la Base de Données (VERIFIER LA STRUCTURE ACTUELLE VIA SUPABASE MCP POUR EVITER LES CONFLITS ET MODIFIER CE SCHEMA EN CONSEQUENCE)

### Tables Supabase à Créer

#### 1. `verse_links` (Liens inter-versets)
```sql
CREATE TABLE verse_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE,
  target_verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE,
  link_type VARCHAR(50) NOT NULL, -- 'citation', 'parallel', 'prophecy', 'typology', 'commentary'
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_source_verse (source_verse_id),
  INDEX idx_target_verse (target_verse_id)
);
```

#### 2. `verse_annotations` (Commentaires par verset)
```sql
CREATE TABLE verse_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES verse_annotations(id) ON DELETE CASCADE, -- Pour les réponses
  is_official BOOLEAN DEFAULT FALSE, -- Annotations des "experts" signalés
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. `external_sources` (Sources externes : Saints, Pères de l'Église)
```sql
CREATE TABLE external_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author_name VARCHAR(255), -- Ex: "Saint Augustin", "Saint Thomas d'Aquin"
  source_type VARCHAR(50) NOT NULL, -- 'saint', 'father', 'council', 'catechism'
  reference VARCHAR(255), -- Ex: "Confessions, Livre X"
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `verse_external_links` (Liens vers sources externes)
```sql
CREATE TABLE verse_external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id UUID REFERENCES bible_verses(id) ON DELETE CASCADE,
  external_source_id UUID REFERENCES external_sources(id) ON DELETE CASCADE,
  link_type VARCHAR(50), -- 'citation', 'commentary', 'reference'
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 Interface Utilisateur

### Page Lecteur Bible Amélioré

#### 1. Mode Lecture Standard
- Affichage du verset avec **mise en surbrillance** si des liens/annotations existent
- **Badge indicateur** : "🔗 3 liens | 💬 5 annotations"

#### 2. Panneau Latéral "Contributions" (Sidebar)
```tsx
// Ouverture au clic sur un verset
<div className="annotation-sidebar">
  <Tabs>
    <Tab label="Liens Bibliques" />
    <Tab label="Sources Externes" />
    <Tab label="Annotations" />
  </Tabs>

  {/* Contenu dynamique chargé depuis l'API */}
</div>
```

**Contenu de la sidebar :**
- **Onglet "Liens Bibliques"** : Liste des versets liés avec :
  - Référence du verset (ex: "Jean 3:16")
  - Type de lien (citation, parallèle, prophétie)
  - Auteur du lien
  - Bouton "Voir le verset"

- **Onglet "Sources Externes"** : Citations des Saints/Pères
  - Citation de Saint Augustin
  - Référence complète (œuvre, chapitre)
  - Bouton "Ajouter une source"

- **Onglet "Annotations"** : Commentaires threadés
  - Commentaire principal
  - Réponses indentées
  - Bouton "Répondre"

#### 3. Modal "Ajouter un Liens"
```tsx
<form action={createLinkAction}>
  <select name="link_type">
    <option value="citation">Citation directe</option>
    <option value="parallel">Parallèle thématique</option>
    <option value="prophecy">Prophétie accomplie</option>
    <option value="typology">Typologie</option>
  </select>

  <input
    type="text"
    name="target_verse"
    placeholder="Référence du verset (ex: Jean 3:16)"
  />

  <textarea
    name="description"
    placeholder="Expliquez ce lien..."
  />
</form>
```

---

## 🔄 Server Actions (Next.js 16)

### Fichier : `app/actions.ts`

```typescript
// === LIENS INTER-VERSETS ===

export async function createVerseLinkAction(state: ActionResult, formData: FormData) {
  const user = await getUser();

  const sourceVerseId = formData.get('source_verse_id');
  const targetVerseRef = formData.get('target_verse'); // Ex: "Jean 3:16"
  const linkType = formData.get('link_type');
  const description = formData.get('description');

  // Parser la référence du verset cible
  const targetVerse = await parseVerseReference(targetVerseRef);

  // Créer le lien
  const { error } = await supabase
    .from('verse_links')
    .insert({
      source_verse_id: sourceVerseId,
      target_verse_id: targetVerse.id,
      link_type: linkType,
      author_id: user.id,
      description
    });

  revalidatePath(`/bible/${bookSlug}/${chapter}`);
  return { success: true };
}

// === ANNOTATIONS ===

export async function createAnnotationAction(state: ActionResult, formData: FormData) {
  const user = await getUser();

  const { error } = await supabase
    .from('verse_annotations')
    .insert({
      verse_id: formData.get('verse_id'),
      author_id: user.id,
      content: formData.get('content'),
      parent_id: formData.get('parent_id') || null
    });

  revalidatePath(`/bible/${bookSlug}/${chapter}`);
  return { success: true };
}

// === RÉCUPÉRATION DES CONTRIBUTIONS ===

export async function getVerseContributionsAction(verseId: string) {
  const { data: links } = await supabase
    .from('verse_links')
    .select(`
      *,
      target_verse:bible_verses(*, bible_books(*)),
      author:auth.users(*)
    `)
    .eq('source_verse_id', verseId);

  const { data: annotations } = await supabase
    .from('verse_annotations')
    .select('*, author:auth.users(*)')
    .eq('verse_id', verseId)
    .is('parent_id', null);

  const { data: external } = await supabase
    .from('verse_external_links')
    .select('*, external_source:*')
    .eq('verse_id', verseId);

  return {
    links: links || [],
    annotations: annotations || [],
    external_sources: external || []
  };
}
```

---

## 🚀 Roadmap d'Implémentation (One shot)

### Phase 1 : Base de Données & Backend
- [ ] Créer les 4 tables Supabase
- [ ] Implémenter les RLS policies
- [ ] Créer les Server Actions de base (createLink, createAnnotation)

### Phase 2 : UI Lecteur Bible
- [ ] Page `/bible/[book]/[chapter]` avec badges sur les versets
- [ ] Sidebar rétractable avec 3 onglets
- [ ] Modal "Ajouter un lien"

### Phase 3 : Crowdsourcing
- [ ] Formulaire d'annotation avec réponses threadées
- [ ] Profil contributeur avec statistiques
- [ ] Système de "signalement" pour annotations officielles

### Phase 4 : Sources Externes
- [ ] Import de citations des Saints/Pères (CSV initial)
- [ ] Page gestion des sources externes
- [ ] Recherche full-text sur les citations

### Phase 5 : Visualisation Avancée
- [ ] Graph view des connexions (D3.js ou React Flow)
- [ ] Filtres par type de lien, par auteur
- [ ] Export des annotations en PDF

---

## 📊 Spécifications Techniques

### Types de Liens Disponibles
1. **Citation** : Un verset en cite explicitement un autre
2. **Parallèle** : Même thème ou idée
3. **Prophétie** : Accomplissement d'une prophétie
4. **Typologie** : Préfiguration de l'Ancien Testament vers le Nouveau
5. **Commentaire** : Explication théologique

### RLS Policies (Sécurité)
```sql
-- Seuls les utilisateurs connectés peuvent créer des liens
CREATE POLICY "Users can create links"
ON verse_links FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Tout le monde peut voir les liens
CREATE POLICY "Links are public"
ON verse_links FOR SELECT
USING (true);

-- Seuls les auteurs peuvent supprimer leurs liens
CREATE POLICY "Authors can delete own links"
ON verse_links FOR DELETE
USING (auth.uid() = author_id);
```

---

## 🎯 Priorités Fonctionnalités

### ⚡ High Priority
1. Système de liens inter-versets
2. Annotations de base
3. Sidebar avec les 3 onglets

4. Sources externes (Saints/Pères)
5. Réponses aux annotations
6. Profils contributeurs


7. Graph view des connexions
8. Export PDF
9. Mobile app responsive

---

## 📚 Ressources

### Données initiales à importer
- Citations des Pères de l'Église (accès public)
- Catéchisme de l'Église Catholique
- Écrits des Saints (domaine public)

### Technologies
- **Next.js 16** : App Router + Server Actions
- **Supabase SSR** : Base de données + Auth
- **Tailwind v4** : Styling
- **D3.js** : Graph visualisation (optionnel)

---

**Date de création** : 31 décembre 2025
**Statut** : Plan validé, prêt pour implémentation
