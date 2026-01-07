# 🙏 Import Bible de Jérusalem - Guide Complet

## 📊 Problème actuel

La Bible de Jérusalem n'a que **23 208 versets** au lieu de **39 737** comme Crampon.
**Manque: 16 529 versets (41.6%)**

## 🔧 Solution

J'ai créé 2 scripts pour régler ça :

### 1️⃣ **`diagnose-jerusalem.py`** - Script de diagnostic

À lancer **EN PREMIER** pour comprendre le format du PDF :

```bash
cd scripts
python diagnose-jerusalem.py
```

**Ce que ça fait :**
- Analyse les 20 premières pages du PDF
- Montre le format exact des lignes
- Détecte automatiquement les patterns de versets
- Affiche des échantillons pour chaque type de pattern

**Sortie attendue :**
```
PAGE 5
   1: GENÈSE
     ⚠️  POSSIBLE NOM DE LIVRE
   2: Chapitre 1
     ⚠️  CHAPITRE
   3: 1, 1 Au commencement, Dieu créa le ciel et la terre.
     ⚠️  POSSIBLE VERSET
```

### 2️⃣ **`import-jerusalem-v2.py`** - Script d'import ROBUSTE

Une fois le diagnostic fait, lancer l'import :

```bash
python import-jerusalem-v2.py
```

**Améliorations vs l'ancien script :**

✅ **`layout=True`** - Préserve la mise en page du PDF
✅ **4 patterns de détection** au lieu de 1 :
   - Pattern A: "Genèse 1, 1 Au commencement..." (avec livre)
   - Pattern B: "1, 2 Au commencement..." (sans livre)
   - Pattern C: "1. Au commencement..." (avec point)
   - Pattern D: "1 Au commencement..." (numéro seul)

✅ **Suppression automatique** des anciens versets Jérusalem
✅ **Insertion par lots de 100** pour la performance
✅ **Statistiques détaillées** (pages, versets, erreurs)

## 🚀 Étapes complètes

### Étape 1: Installer les dépendances

```bash
pip install pdfplumber python-dotenv requests
```

### Étape 2: Vérifier les variables d'environnement

Créer `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

### Étape 3: Lancer le diagnostic

```bash
cd scripts
python diagnose-jerusalem.py
```

→ **Analysez la sortie** pour voir comment le PDF est formaté

### Étape 4: Importer les versets

```bash
python import-jerusalem-v2.py
```

→ **Attendez que tous les versets soient insérés**

### Étape 5: Vérifier dans Supabase

```sql
SELECT translation_id, COUNT(*)
FROM bible_verses
GROUP BY translation_id;
```

**Attendu :**
- Crampon: ~39 737 versets
- Jérusalem: ~39 737 versets (pareil !)

## 📈 Résultats attendus

| Traduction | Avant | Après |
|------------|-------|-------|
| Crampon | 39 737 ✅ | 39 737 ✅ |
| Jérusalem | 23 208 ❌ | **~39 737** ✅ |

## ⚠️ Si ça ne marche pas

### Problème: Toujours des versets manquants

**Solution:** Le PDF a un format différent, lancez le diagnostic et envoyez-moi les output !

### Problème: Erreur d'insertion

**Solution:** Vérifiez les permissions Supabase (RLS policies)

### Problème: Doublons

**Solution:** Le script supprime automatiquement les anciens versets Jérusalem

## 🎯 Prochaine étape

Une fois Jérusalem complète, **changer la traduction par défaut** dans la page de lecture des versets !

---

**Créé avec Claude Code** 🤖
