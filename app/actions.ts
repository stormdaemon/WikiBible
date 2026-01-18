'use server';

import { createClient } from '@/utils/supabase/server-action';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// === TYPES ===

interface ActionResult<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
  slug?: string;
}

// === SCHEMAS ===

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  confession: z.enum(['catholic', 'orthodox', 'protestant', 'anglican', 'other']),
});

const CreateArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  comment: z.string().optional(),
});

const UpdateArticleSchema = z.object({
  article_id: z.string().uuid(),
  content: z.string().min(1),
  comment: z.string().optional(),
  is_minor_edit: z.boolean().optional(),
});

const UpdateProfileSchema = z.object({
  user_id: z.string().uuid(),
  username: z.string().min(2).optional(),
  confession: z.enum(['catholic', 'orthodox', 'protestant', 'anglican', 'other']),
  bio: z.string().optional(),
});

// === AUTH ACTIONS ===

import { redirect } from 'next/navigation';

export async function loginAction(state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password } = validatedFields.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function registerAction(state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const validatedFields = RegisterSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
    confession: formData.get('confession'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password, name, confession } = validatedFields.data;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        confession,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wikibibledev.netlify.app'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function updateProfileAction(state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const validatedFields = UpdateProfileSchema.safeParse({
    user_id: formData.get('user_id'),
    username: formData.get('username'),
    confession: formData.get('confession'),
    bio: formData.get('bio'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { user_id, username, confession, bio } = validatedFields.data;

  // Vérifier que l'utilisateur modifie son propre profil
  if (user.id !== user_id) {
    return { error: 'Non autorisé' };
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id,
      username,
      confession,
      bio,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profil');
  return { success: true };
}



// === WIKI ACTIONS ===

export async function createArticleAction(state: ActionResult<{ slug: string }> | null, formData: FormData): Promise<ActionResult<{ slug: string }>> {
  const validatedFields = CreateArticleSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    comment: formData.get('comment'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { title, content, comment } = validatedFields.data;

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Create article
  const { data: article, error: articleError } = await supabase
    .from('wiki_articles')
    .insert({
      title,
      slug,
      author_id: user.id,
      is_published: true,
    })
    .select()
    .single();

  if (articleError) {
    return { error: articleError.message };
  }

  // Create initial revision
  const { error: revisionError } = await supabase
    .from('wiki_revisions')
    .insert({
      article_id: article.id,
      content,
      comment: comment || 'Initial version',
      author_id: user.id,
    });

  if (revisionError) {
    return { error: revisionError.message };
  }

  // Update article with current_revision_id
  const { error: updateError } = await supabase
    .from('wiki_articles')
    .update({ current_revision_id: article.id })
    .eq('id', article.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Mettre à jour le score de l'utilisateur
  await updateUserScore(user.id, 'wiki_article');

  revalidatePath(`/wiki/${slug}`);
  return { success: true, slug };
}

export async function updateArticleAction(state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const validatedFields = UpdateArticleSchema.safeParse({
    article_id: formData.get('article_id'),
    content: formData.get('content'),
    comment: formData.get('comment'),
    is_minor_edit: formData.get('is_minor_edit') === 'true',
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { article_id, content, comment, is_minor_edit } = validatedFields.data;

  // Create new revision
  const { data: revision, error: revisionError } = await supabase
    .from('wiki_revisions')
    .insert({
      article_id,
      content,
      comment: comment || 'Edit',
      author_id: user.id,
      is_minor_edit: is_minor_edit || false,
    })
    .select()
    .single();

  if (revisionError) {
    return { error: revisionError.message };
  }

  // Update article with new current_revision_id
  const { error: updateError } = await supabase
    .from('wiki_articles')
    .update({ current_revision_id: revision.id })
    .eq('id', article_id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/wiki/[slug]`);
  return { success: true };
}

// === BIBLE ACTIONS ===

export async function getBooksAction() {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('bible_books')
    .select('*')
    .order('position');

  if (error) {
    return { error: error.message };
  }

  return { success: true, books: data };
}

export async function getBookAction(bookSlug: string) {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('bible_books')
    .select('*')
    .eq('slug', bookSlug)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, book: data };
}

export async function getChapterAction(bookSlug: string, chapter: number, translationId: string = 'crampon') {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  // D'abord récupérer l'id du livre à partir du slug
  const { data: book, error: bookError } = await supabase
    .from('bible_books')
    .select('id')
    .eq('slug', bookSlug)
    .single();

  if (bookError || !book) {
    return { error: bookError?.message || 'Livre non trouvé' };
  }

  // Ensuite récupérer les versets avec la traduction
  const { data, error } = await supabase
    .from('bible_verses')
    .select('*')
    .eq('book_id', book.id)
    .eq('chapter', chapter)
    .eq('translation_id', translationId)
    .order('verse');

  if (error) {
    return { error: error.message };
  }

  return { success: true, verses: data };
}

export async function getVerseAction(bookSlug: string, chapter: number, verse: number, translationId: string = 'crampon') {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  // Récupérer l'id du livre
  const { data: book, error: bookError } = await supabase
    .from('bible_books')
    .select('id')
    .eq('slug', bookSlug)
    .single();

  if (bookError || !book) {
    return { error: bookError?.message || 'Livre non trouvé' };
  }

  // Récupérer le verset spécifique avec la traduction
  const { data, error } = await supabase
    .from('bible_verses')
    .select('*')
    .eq('book_id', book.id)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .eq('translation_id', translationId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, verse: data };
}

export async function searchBibleAction(query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bible_verses')
    .select(`
      *,
      bible_books (*)
    `)
    .textSearch('text', query);

  if (error) {
    return { error: error.message };
  }

  return { success: true, results: data };
}

/**
 * Récupère les versets d'un chapitre spécifique avec une traduction donnée
 */
export async function getVersesAction(bookId: string, chapter: number, translationId: string = 'crampon') {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bible_verses')
    .select('*')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .eq('translation_id', translationId)
    .order('verse', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { success: true, verses: data };
}

export async function getArticleAction(slug: string) {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('wiki_articles')
    .select(`
      *,
      wiki_revisions (*),
      bible_books (*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, article: data };
}

export async function getRecentArticlesAction(limit = 10) {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return { success: true, articles: data };
}

// === VERSE LINKS & ANNOTATIONS ACTIONS ===

const CreateVerseLinkSchema = z.object({
  source_verse_id: z.string().uuid(),
  target_verse: z.string().min(1),
  link_type: z.enum(['citation', 'parallel', 'prophecy', 'typology', 'commentary', 'concordance', 'wiki']),
  description: z.string().optional(),
  target_translation: z.enum(['crampon', 'jerusalem']).optional(),
});

const CreateAnnotationSchema = z.object({
  verse_id: z.string().uuid(),
  content: z.string().min(1),
  parent_id: z.string().uuid().nullish(), // Accepte null et undefined
});

const CreateExternalSourceSchema = z.object({
  title: z.string().min(1),
  author_name: z.string().optional(),
  source_type: z.enum(['saint', 'father', 'council', 'catechism']),
  reference: z.string().optional(),
  content: z.string().min(1),
});

const LinkExternalSourceSchema = z.object({
  verse_id: z.string().uuid(),
  external_source_id: z.string().uuid(),
  link_type: z.enum(['citation', 'commentary', 'reference']).optional(),
});

/**
 * Parse une référence de verset biblique (ex: "Jean 3:16", "Genèse 1:1")
 * et retourne le verse_id correspondant
 * @deprecated Utiliser parseVerseReferenceUniversal à la place pour le support multi-sources
 */
async function parseVerseReference(reference: string, translation: string = 'crampon') {
  // Utiliser createPublicClient comme parseTextReference
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  console.log('[parseVerseReference] INPUT:', reference, 'translation:', translation);

  // Parser la référence (format: "Livre Chapitre:Verset")
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/i);
  if (!match) {
    console.log('[parseVerseReference] NO MATCH');
    return null;
  }

  const [, bookName, chapter, verse] = match;
  console.log('[parseVerseReference] Parsed:', { bookName, chapter, verse });

  // Rechercher le livre par nom avec .or()
  const orQuery = `name.ilike.%${bookName}%,name_en.ilike.%${bookName}%`;
  console.log('[parseVerseReference] OR query:', orQuery);

  const { data: book, error: bookError } = await supabase
    .from('bible_books')
    .select('id')
    .or(orQuery)
    .limit(1)
    .maybeSingle();

  console.log('[parseVerseReference] Book result:', book);
  console.log('[parseVerseReference] Book error:', bookError);

  if (!book) {
    console.log('[parseVerseReference] BOOK NOT FOUND');
    return null;
  }

  // Rechercher le verset AVEC la traduction spécifiée
  const { data: verseList, error: verseError } = await supabase
    .from('bible_verses')
    .select('id')
    .eq('book_id', book.id)
    .eq('chapter', parseInt(chapter))
    .eq('verse', parseInt(verse))
    .eq('translation_id', translation)  // Filtrer par traduction !
    .limit(1);

  console.log('[parseVerseReference] Verse result:', verseList);
  console.log('[parseVerseReference] Verse error:', verseError);

  // Retourner le premier verset trouvé
  return verseList && verseList.length > 0 ? verseList[0] : null;
}

/**
 * Types pour les versets universels
 */
interface UniversalVerse {
  verse_id: string;
  verse_type: 'bible' | 'apocryphal' | 'contribution';
  book_id: string;
  chapter: number;
  verse: number;
  text: string;
  translation_id: string;
  translation_name?: string;
  book_name: string;
  book_slug: string;
}

/**
 * Parse une référence de verset biblique de manière universelle
 * Cherche dans: bible_verses (toutes traductions), apocryphal_verses, verse_contributions
 *
 * @param reference - Référence du verset (ex: "Jean 3:16", "1 Enoch 1:1")
 * @param translation - Traduction cible (crampon, jerusalem, ou slug de traduction communautaire)
 * @param verseType - Type de verset ('bible', 'apocryphal', 'any')
 * @returns Le verset trouvé ou null
 */
async function parseVerseReferenceUniversal(
  reference: string,
  translation: string = 'crampon',
  verseType: string = 'any'
): Promise<UniversalVerse | null> {
  const supabase = await createClient();

  console.log('[parseVerseReferenceUniversal] INPUT:', { reference, translation, verseType });

  // Parser la référence (format: "Livre Chapitre:Verset")
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/i);
  if (!match) {
    console.log('[parseVerseReferenceUniversal] NO MATCH');
    return null;
  }

  const [, bookName, chapterStr, verseStr] = match;
  const chapter = parseInt(chapterStr);
  const verse = parseInt(verseStr);
  console.log('[parseVerseReferenceUniversal] Parsed:', { bookName, chapter, verse });

  // Normaliser le slug du livre
  let bookSlug = bookName.toLowerCase().replace(/\s+/g, '-');

  // D'abord, essayer de trouver le livre par slug exact (pour les apocryphes et bible)
  const { data: bookBySlug } = await supabase
    .from('bible_books')
    .select('id, slug')
    .eq('slug', bookSlug)
    .maybeSingle();

  if (!bookBySlug) {
    // Essayer dans les apocryphal_books
    const { data: apocryphalBook } = await supabase
      .from('apocryphal_books')
      .select('id, slug')
      .eq('slug', bookSlug)
      .maybeSingle();

    if (!apocryphalBook) {
      // Essayer avec une recherche partielle
      const { data: bookByName } = await supabase
        .from('bible_books')
        .select('id, slug')
        .ilike('name', `%${bookName}%`)
        .maybeSingle();

      if (bookByName) {
        bookSlug = bookByName.slug;
      }
    }
  } else {
    bookSlug = bookBySlug.slug;
  }

  // Utiliser le RPC get_verse_universal
  const { data, error } = await supabase
    .rpc('get_verse_universal', {
      p_book_slug: bookSlug,
      p_chapter: chapter,
      p_verse: verse,
      p_translation_id: translation,
      p_verse_type: verseType,
    });

  if (error) {
    console.error('[parseVerseReferenceUniversal] RPC error:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log('[parseVerseReferenceUniversal] No verse found');
    return null;
  }

  const result = Array.isArray(data) ? data[0] : data;
  console.log('[parseVerseReferenceUniversal] FOUND:', result);
  return result as UniversalVerse;
}

/**
 * Recherche un article wiki par son titre
 */
async function findWikiArticle(title: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('wiki_articles')
    .select('id, slug')
    .ilike('title', `%${title}%`)
    .limit(1);

  // Return the first article or null
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Crée un lien depuis un verset (avec miroir automatique pour les liens bibliques)
 */
export async function createVerseLinkAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = CreateVerseLinkSchema.safeParse({
    source_verse_id: formData.get('source_verse_id'),
    target_verse: formData.get('target_verse'),
    link_type: formData.get('link_type'),
    description: formData.get('description'),
    target_translation: formData.get('target_translation'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { source_verse_id, target_verse, link_type, description, target_translation } = validatedFields.data;

  // Récupérer la confession de l'utilisateur depuis son profil
  // Utiliser 'catholic' par défaut si la requête échoue ou si le profil n'existe pas
  let userConfession = 'catholic';
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('confession')
      .eq('user_id', user.id)
      .single();

    if (!error && profile?.confession) {
      userConfession = profile.confession;
    }
  } catch {
    // Ignorer l'erreur et utiliser la valeur par défaut
  }

  let target_verse_id: string | null = null;

  // Si c'est un lien wiki, rechercher l'article
  if (link_type === 'wiki') {
    const article = await findWikiArticle(target_verse);
    if (!article) {
      return { error: 'Article wiki non trouvé. Vérifiez le titre exact.' };
    }
    // Pour les wiki, on stocke l'ID de l'article dans target_verse_id
    target_verse_id = article.id;
  } else {
    // Pour les versets bibliques, parser la référence avec la traduction spécifiée
    console.log('[createVerseLinkAction] Parsing target_verse:', target_verse, 'translation:', target_translation);
    const targetVerse = await parseVerseReference(target_verse, target_translation);
    console.log('[createVerseLinkAction] Parsed result:', targetVerse);
    if (targetVerse) {
      target_verse_id = targetVerse.id;
      console.log('[createVerseLinkAction] target_verse_id set to:', target_verse_id);
    } else {
      console.log('[createVerseLinkAction] FAILED to parse verse reference!');
    }
    // Sinon target_verse_id reste null (référence textuelle libre)
  }

  // Récupérer les données du verset source pour le miroir
  const { data: sourceVerseData } = await supabase
    .from('bible_verses')
    .select(`
      id,
      verse,
      chapter,
      bible_books!inner(
        name
      )
    `)
    .eq('id', source_verse_id)
    .single();

  // TypeScript infère mal le type, on cast correctement
  const sourceVerse = sourceVerseData as any;

  // Créer le lien original avec la référence textuelle et la confession automatique
  const { data: createdLink, error: insertError } = await supabase
    .from('verse_links')
    .insert({
      source_verse_id,
      target_verse_id, // peut être null pour les références non bibliques
      link_type,
      author_id: user.id,
      description,
      target_reference: target_verse, // stocker la référence textuelle
      confession: userConfession, // confession automatique depuis le profil
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Miroir automatique : créer le lien inverse pour tous les liens bibliques
  // y compris ceux créés avec une référence textuelle
  if (link_type !== 'wiki' && sourceVerse) {
    // Si target_verse_id est null mais on a une référence textuelle, essayer de la parser
    let mirrorTargetId = target_verse_id;
    if (!mirrorTargetId && target_verse) {
      const parsedVerse = await parseVerseReference(target_verse);
      if (parsedVerse) {
        mirrorTargetId = parsedVerse.id;
      }
    }

    // Créer le miroir seulement si on a un ID cible valide
    if (mirrorTargetId) {
      const sourceReference = `${sourceVerse.bible_books.name} ${sourceVerse.chapter}:${sourceVerse.verse}`;

      // Créer le lien inverse
      const { data: mirrorLink } = await supabase
        .from('verse_links')
        .insert({
          source_verse_id: mirrorTargetId, // Le verset cible devient la source
          target_verse_id: source_verse_id, // La source originale devient la cible
          link_type,
          author_id: user.id,
          description: `↩️ ${description || 'Renvoi réciproque'}`, // Ajouter une flèche pour indiquer le miroir
          target_reference: sourceReference, // La référence du verset source original
          confession: userConfession,
          mirror_link_id: createdLink.id, // Lien vers le lien original
        })
        .select('id')
        .single();

    // Mettre à jour le lien original avec l'ID du miroir
    if (mirrorLink?.id) {
      await supabase
        .from('verse_links')
        .update({ mirror_link_id: mirrorLink.id })
        .eq('id', createdLink.id);
    }
    }
  }

  // Mettre à jour le score de l'utilisateur
  await updateUserScore(user.id, 'verse_link');

  // Revalider les pages des chapitres concernés pour afficher les nouveaux liens
  // On utilise revalidatePath avec le chemin du verset source pour rafraîchir le cache
  revalidatePath('/bible/[bookId]/[chapter]');
  return { success: true };
}

/**
 * Crée une annotation sur un verset
 */
export async function createAnnotationAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  console.log('[createAnnotationAction] === START ===');
  console.log('[createAnnotationAction] formData entries:', Array.from(formData.entries()));

  const validatedFields = CreateAnnotationSchema.safeParse({
    verse_id: formData.get('verse_id'),
    content: formData.get('content'),
    parent_id: formData.get('parent_id'),
  });

  console.log('[createAnnotationAction] validatedFields.success:', validatedFields.success);
  if (!validatedFields.success) {
    console.error('[createAnnotationAction] Validation errors:', validatedFields.error.issues);
    return { error: `Champs invalides: ${JSON.stringify(validatedFields.error.issues)}` };
  }
  console.log('[createAnnotationAction] Validated data:', validatedFields.data);

  const supabase = await createClient();
  console.log('[createAnnotationAction] Supabase client created');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('[createAnnotationAction] getUser error:', userError);
  console.log('[createAnnotationAction] user:', user ? { id: user.id, email: user.email } : null);

  if (!user) {
    console.error('[createAnnotationAction] User not authenticated!');
    return { error: 'Non authentifié' };
  }

  const { verse_id, content, parent_id } = validatedFields.data;
  console.log('[createAnnotationAction] About to insert:', { verse_id, content: content?.substring(0, 50), parent_id, author_id: user.id });

  // Utiliser la fonction SECURITY DEFINER pour contourner RLS
  // La fonction insert_annotation() s'exécute avec les droits du propriétaire (postgres)
  // et valide les paramètres avant insertion
  console.log('[createAnnotationAction] Using insert_annotation() RPC function...');
  const { data: annotationId, error } = await supabase
    .rpc('insert_annotation', {
      p_verse_id: verse_id,
      p_author_id: user.id,
      p_content: content,
      p_parent_id: parent_id || null,
    });

  console.log('[createAnnotationAction] RPC result - annotationId:', annotationId);
  console.log('[createAnnotationAction] RPC error:', error);
  console.log('[createAnnotationAction] Insert result:', error ? 'FAILED' : 'SUCCESS');

  if (error) {
    console.error('[createAnnotationAction] Insert error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return { error: error.message };
  }

  // Mettre à jour le score de l'utilisateur (ne pas bloquer si échoue)
  console.log('[createAnnotationAction] Updating user score...');
  try {
    await updateUserScore(user.id, 'annotation');
    console.log('[createAnnotationAction] Score updated successfully');
  } catch (scoreError) {
    console.error('[createAnnotationAction] Score update failed:', scoreError);
    // Continuer malgré l'erreur de score
  }

  console.log('[createAnnotationAction] Revalidating path...');
  revalidatePath('/bible/[book]/[chapter]', 'page');

  console.log('[createAnnotationAction] === END SUCCESS ===');
  return { success: true };
}

/**
 * Crée une source externe (Saint, Père de l'Église, etc.)
 */
export async function createExternalSourceAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = CreateExternalSourceSchema.safeParse({
    title: formData.get('title'),
    author_name: formData.get('author_name'),
    source_type: formData.get('source_type'),
    reference: formData.get('reference'),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { error } = await supabase
    .from('external_sources')
    .insert(validatedFields.data);

  if (error) {
    return { error: error.message };
  }

  // Mettre à jour le score de l'utilisateur
  await updateUserScore(user.id, 'external_source');

  return { success: true };
}

/**
 * Lie une source externe à un verset
 */
export async function linkExternalSourceAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = LinkExternalSourceSchema.safeParse({
    verse_id: formData.get('verse_id'),
    external_source_id: formData.get('external_source_id'),
    link_type: formData.get('link_type'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { error } = await supabase
    .from('verse_external_links')
    .insert({
      ...validatedFields.data,
      author_id: user.id,
    });

  if (error) {
    return { error: error.message };
  }

  // Mettre à jour le score de l'utilisateur
  await updateUserScore(user.id, 'external_source');

  revalidatePath('/bible/[book]/[chapter]');
  return { success: true };
}

/**
 * Récupère toutes les contributions pour un verset (liens, annotations, sources externes)
 */
export async function getVerseContributionsAction(verseId: string) {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  // Récupérer tous les liens (sans jointure pour commencer)
  const { data: links, error: linksError } = await supabase
    .from('verse_links')
    .select('*')
    .eq('source_verse_id', verseId);

  console.log('[getVerseContributionsAction] raw links:', JSON.stringify(links, null, 2));
  console.log('[getVerseContributionsAction] linksError:', linksError);

  // Récupérer les profils des auteurs de manière groupée
  const authorIds = [...new Set(links?.map(l => l.author_id).filter(Boolean) || [])];
  const { data: authorProfiles } = authorIds.length > 0
    ? await supabase
      .from('user_profiles')
      .select('user_id, username, confession')
      .in('user_id', authorIds as string[])
    : { data: [] };

  // Créer un Map pour accéder rapidement aux profils
  const authorMap = new Map(
    authorProfiles?.map(p => [p.user_id, p]) || []
  );

  // Fonction pour parser une référence textuelle (ex: "Genèse 3:16", "Jean 3:16")
  async function parseTextReference(reference: string) {
    try {
      // Pattern pour matcher "Livre chapitre:verset" ou "Livre chapitre:verset-verseet"
      const match = reference.match(/^(.+?)\s+(\d+):(\d+)(?:-\d+)?$/i);
      if (!match) return null;

      const [, bookName, chapterStr, verseStr] = match;
      const chapter = parseInt(chapterStr);
      const verse = parseInt(verseStr);

      // Chercher le livre par nom (insensible à la casse et aux accents)
      const { data: book } = await supabase
        .from('bible_books')
        .select('id, name, slug')
        .or(`name.ilike.%${bookName}%,name_en.ilike.%${bookName}%`)
        .limit(1)
        .maybeSingle();

      if (!book) return null;

      // Récupérer le verset avec le texte
      const { data: verseData } = await supabase
        .from('bible_verses')
        .select(`
          id,
          verse,
          chapter,
          text,
          bible_books(
            id,
            name,
            slug
          )
        `)
        .eq('book_id', book.id)
        .eq('chapter', chapter)
        .eq('verse', verse)
        .limit(1)
        .maybeSingle();

      return verseData;
    } catch {
      return null;
    }
  }

  // Pour chaque lien, récupérer les détails du verset cible
  const linksWithDetails = await Promise.all(
    (links || []).map(async (link) => {
      let bibleVerses = null;

      // Si c'est un lien biblique avec target_verse_id, récupérer les détails du verset
      if (link.target_verse_id && link.link_type !== 'wiki') {
        // Vérifier le type de verset cible pour savoir dans quelle table chercher
        if (link.target_verse_type === 'apocryphal') {
          // Chercher dans apocryphal_verses
          const { data: apocryphalVerse } = await supabase
            .from('apocryphal_verses')
            .select(`
              id,
              verse,
              chapter,
              text_fr,
              translation_id,
              apocryphal_books(
                id,
                name_fr,
                slug
              )
            `)
            .eq('id', link.target_verse_id)
            .single();

          // Transformer le format pour qu'il soit compatible avec bible_verses
          if (apocryphalVerse) {
            bibleVerses = {
              id: apocryphalVerse.id,
              verse: apocryphalVerse.verse,
              chapter: apocryphalVerse.chapter,
              text: apocryphalVerse.text_fr,
              translation_id: apocryphalVerse.translation_id,
              bible_books: {
                id: apocryphalVerse.apocryphal_books.id,
                name: apocryphalVerse.apocryphal_books.name_fr,
                slug: apocryphalVerse.apocryphal_books.slug,
              },
            };
          }
        } else {
          // Chercher dans bible_verses (par défaut)
          const { data: targetVerse } = await supabase
            .from('bible_verses')
            .select(`
              id,
              verse,
              chapter,
              text,
              translation_id,
              bible_books(
                id,
                name,
                slug
              )
            `)
            .eq('id', link.target_verse_id)
            .single();

          bibleVerses = targetVerse;
        }
      }
      // Si pas de target_verse_id mais une référence textuelle, essayer de la parser
      else if (link.target_reference && link.link_type !== 'wiki') {
        bibleVerses = await parseTextReference(link.target_reference);
        console.log('[getVerseContributionsAction] parsed reference:', link.target_reference, '→', bibleVerses);
      }

      return {
        ...link,
        author: link.author_id ? authorMap.get(link.author_id) : null,
        bible_verses: bibleVerses,
      };
    })
  );

  // Séparer les liens wiki et les liens bibliques
  const wikiLinks = linksWithDetails.filter(link => link.link_type === 'wiki');
  const bibleLinks = linksWithDetails.filter(link => link.link_type !== 'wiki');

  // Pour les liens wiki, récupérer les détails des articles
  const wikiLinksWithArticles = await Promise.all(
    wikiLinks.map(async (link) => {
      // target_verse_id contient l'ID de l'article wiki pour les liens wiki
      const { data: article } = await supabase
        .from('wiki_articles')
        .select('id, title, slug')
        .eq('id', link.target_verse_id)
        .single();

      return {
        ...link,
        wiki_article: article,
      };
    })
  );

  // Récupérer les annotations principales (pas les réponses) - sans jointure à cause du RLS
  const { data: annotations } = await supabase
    .from('verse_annotations')
    .select('*')
    .eq('verse_id', verseId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  // Récupérer tous les author_ids uniques pour les annotations et leurs réponses
  const annotationAuthorIds = new Set<string>();
  (annotations || []).forEach(a => annotationAuthorIds.add(a.author_id));

  // Récupérer les profils des auteurs d'annotations de manière groupée
  const { data: annotationAuthorProfiles } = annotationAuthorIds.size > 0
    ? await supabase
      .from('user_profiles')
      .select('user_id, username, full_name')
      .in('user_id', Array.from(annotationAuthorIds))
    : { data: [] };

  // Créer un Map pour accéder rapidement aux profils d'annotations
  const annotationAuthorMap = new Map(
    annotationAuthorProfiles?.map(p => [p.user_id, p]) || []
  );

  // Pour chaque annotation, récupérer ses réponses et leurs auteurs
  const annotationsWithReplies = await Promise.all(
    (annotations || []).map(async (annotation) => {
      // Récupérer les réponses
      const { data: replies } = await supabase
        .from('verse_annotations')
        .select('*')
        .eq('parent_id', annotation.id)
        .order('created_at', { ascending: true });

      // Récupérer les profils des réponses
      const replyAuthorIds = (replies || []).map(r => r.author_id);
      const { data: replyProfiles } = replyAuthorIds.length > 0
        ? await supabase
          .from('user_profiles')
          .select('user_id, username, full_name')
          .in('user_id', replyAuthorIds)
        : { data: [] };

      const replyAuthorMap = new Map(
        replyProfiles?.map(p => [p.user_id, p]) || []
      );

      // Enrichir les réponses avec les profils
      const enrichedReplies = (replies || []).map(reply => ({
        ...reply,
        user_profile: replyAuthorMap.get(reply.author_id),
      }));

      return {
        ...annotation,
        user_profile: annotationAuthorMap.get(annotation.author_id),
        replies: enrichedReplies,
      };
    })
  );

  // Récupérer les sources externes liées
  const { data: external_sources } = await supabase
    .from('verse_external_links')
    .select(`
      *,
      external_source:external_sources(*)
    `)
    .eq('verse_id', verseId);

  return {
    links: bibleLinks,
    wiki_links: wikiLinksWithArticles,
    annotations: annotationsWithReplies,
    external_sources: external_sources || [],
  };
}

/**
 * Ajoute les liens miroirs manquants pour les liens bibliques existants
 * À utiliser une fois pour migrer les anciens liens
 */
export async function fixMissingMirrorsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Récupérer tous les liens bibliques qui n'ont pas de miroir (sauf wiki)
  const { data: linksWithoutMirror } = await supabase
    .from('verse_links')
    .select('*')
    .is('mirror_link_id', null)
    .neq('link_type', 'wiki'); // On ne traite PAS les wiki ici

  if (!linksWithoutMirror || linksWithoutMirror.length === 0) {
    return { success: true, message: 'Tous les liens ont déjà des miroirs' };
  }

  let created = 0;
  let errors = 0;

  // Pour chaque lien sans miroir, créer le lien inverse
  for (const link of linksWithoutMirror) {
    try {
      // Récupérer les données du verset source
      const { data: sourceVerse } = await supabase
        .from('bible_verses')
        .select('id, verse, chapter, bible_books!inner(name)')
        .eq('id', link.source_verse_id)
        .single();

      if (!sourceVerse) continue;

      // Déterminer l'ID cible (soit target_verse_id, soit parser target_reference)
      let targetId = link.target_verse_id;
      if (!targetId && link.target_reference) {
        const parsed = await parseVerseReference(link.target_reference);
        if (parsed) targetId = parsed.id;
      }

      if (!targetId) continue;

      // Créer le lien miroir
      const { data: mirrorLink } = await supabase
        .from('verse_links')
        .insert({
          source_verse_id: targetId,
          target_verse_id: link.source_verse_id,
          link_type: link.link_type,
          author_id: link.author_id,
          description: `↩️ ${link.description || 'Renvoi réciproque'}`,
          target_reference: `${sourceVerse.bible_books.name} ${sourceVerse.chapter}:${sourceVerse.verse}`,
          confession: link.confession,
          mirror_link_id: link.id,
        })
        .select('id')
        .single();

      // Mettre à jour le lien original
      if (mirrorLink?.id) {
        await supabase
          .from('verse_links')
          .update({ mirror_link_id: mirrorLink.id })
          .eq('id', link.id);
        created++;
      }
    } catch {
      errors++;
    }
  }

  revalidatePath('/bible/[bookId]/[chapter]');
  return {
    success: true,
    message: `${created} miroirs créés, ${errors} erreurs`,
  };
}

/**
 * Modifie une annotation (avec historique des modifications)
 */
export async function updateAnnotationAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = CreateAnnotationSchema.safeParse({
    verse_id: formData.get('annotation_id'),
    content: formData.get('content'),
    parent_id: null,
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { verse_id, content } = validatedFields.data;
  const annotation_id = formData.get('annotation_id') as string;

  // Vérifier que l'utilisateur est bien l'auteur
  const { data: existingAnnotation } = await supabase
    .from('verse_annotations')
    .select('author_id, content')
    .eq('id', annotation_id)
    .single();

  if (!existingAnnotation || existingAnnotation.author_id !== user.id) {
    return { error: 'Non autorisé' };
  }

  // Sauvegarder l'ancien contenu avant la modification
  const oldContent = existingAnnotation.content;

  // Enregistrer l'historique de la modification
  const { error: historyError } = await supabase
    .from('annotation_edits')
    .insert({
      annotation_id,
      old_content: oldContent,
      new_content: content,
      edited_by: user.id,
    });

  if (historyError) {
    console.error("Erreur lors de l'enregistrement de l'historique:", historyError);
    // On ne bloque pas la modification si l'historique échoue
  }

  // Mettre à jour l'annotation
  const { error } = await supabase
    .from('verse_annotations')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', annotation_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bible/[book]/[chapter]');
  return { success: true };
}

/**
 * Supprime une annotation
 */
export async function deleteAnnotationAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const annotation_id = formData.get('annotation_id') as string;

  // Utiliser la fonction RPC SECURITY DEFINER pour contourner RLS
  const { data, error } = await supabase
    .rpc('delete_annotation', {
      p_annotation_id: annotation_id,
      p_user_id: user.id,
    });

  if (error) {
    console.error('[deleteAnnotationAction] Error:', error);
    return { error: error.message || 'Non autorisé' };
  }

  revalidatePath('/bible/[book]/[chapter]');
  return { success: true };
}

/**
 * Modifie un lien de verset
 */
export async function updateVerseLinkAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const link_id = formData.get('link_id') as string;
  const description = formData.get('description') as string;
  const link_subtype = formData.get('link_subtype') as string | null;
  const is_prophecy = formData.get('is_prophecy') === 'true';

  // Vérifier que l'utilisateur est bien l'auteur
  const { data: existingLink } = await supabase
    .from('verse_links')
    .select('author_id')
    .eq('id', link_id)
    .single();

  if (!existingLink || existingLink.author_id !== user.id) {
    return { error: 'Non autorisé' };
  }

  // Mettre à jour le lien
  const updateData: any = {};
  if (description !== undefined) updateData.description = description;
  if (link_subtype !== undefined) updateData.link_subtype = link_subtype;
  if (is_prophecy !== undefined) updateData.is_prophecy = is_prophecy;
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('verse_links')
    .update(updateData)
    .eq('id', link_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bible/[book]/[chapter]');
  return { success: true };
}

/**
 * Supprime un lien de verset
 */
export async function deleteVerseLinkAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const link_id = formData.get('link_id') as string;

  // Vérifier que l'utilisateur est bien l'auteur
  const { data: existingLink } = await supabase
    .from('verse_links')
    .select('author_id, mirror_link_id')
    .eq('id', link_id)
    .single();

  if (!existingLink || existingLink.author_id !== user.id) {
    return { error: 'Non autorisé' };
  }

  // Supprimer le lien miroir s'il existe
  if (existingLink.mirror_link_id) {
    await supabase
      .from('verse_links')
      .delete()
      .eq('id', existingLink.mirror_link_id);
  }

  // Supprimer aussi les liens qui miroient ce lien
  await supabase
    .from('verse_links')
    .delete()
    .eq('mirror_link_id', link_id);

  // Supprimer le lien principal
  const { error } = await supabase
    .from('verse_links')
    .delete()
    .eq('id', link_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bible/[book]/[chapter]');
  return { success: true };
}

// ============================================================================
// GAMIFICATION ACTIONS
// ============================================================================

/**
 * Points attribués pour chaque type de contribution
 */
const CONTRIBUTION_POINTS = {
  verse_link: 10,
  annotation: 15,
  external_source: 20,
  wiki_article: 50,
  verse_translation: 25,
  translation_approved: 50,
} as const;

type ContributionType = keyof typeof CONTRIBUTION_POINTS;

/**
 * Met à jour le score d'un utilisateur en utilisant la fonction RPC
 * @param userId - ID de l'utilisateur
 * @param contributionType - Type de contribution
 */
async function updateUserScore(userId: string, contributionType: ContributionType) {
  const points = CONTRIBUTION_POINTS[contributionType];
  const supabase = await createClient();

  // Utiliser la fonction RPC pour ajouter les points de manière sécurisée
  const { data, error } = await supabase
    .rpc('add_contribution_points', {
      p_user_id: userId,
      p_contribution_type: contributionType,
      p_points: points,
    });

  if (error) {
    console.error('[updateUserScore] RPC error:', error);
    throw error;
  }

  console.log('[updateUserScore] Points ajoutés:', data);
}

const LikeContributionSchema = z.object({
  contribution_type: z.enum(['link', 'annotation', 'external_source', 'wiki_article']),
  contribution_id: z.string().uuid(),
});

export async function toggleLikeAction(
  state: ActionResult & { liked?: boolean; new_count?: number } | null,
  formData: FormData
): Promise<ActionResult & { liked?: boolean; new_count?: number }> {
  const supabase = await createClient();

  // Vérifier l'authentification
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Non authentifié' };
  }

  // Valider les données
  const validatedFields = LikeContributionSchema.safeParse({
    contribution_type: formData.get('contribution_type'),
    contribution_id: formData.get('contribution_id'),
  });

  if (!validatedFields.success) {
    return { error: 'Données invalides' };
  }

  const { contribution_type, contribution_id } = validatedFields.data;

  // Déterminer la table cible et la colonne author_id
  const targetTable = contribution_type === 'link' ? 'verse_links' :
                      contribution_type === 'annotation' ? 'verse_annotations' :
                      contribution_type === 'external_source' ? 'verse_external_links' :
                      'wiki_articles';

  const authorColumn = contribution_type === 'wiki_article' ? 'author_id' :
                       contribution_type === 'external_source' ? 'author_id' :
                       'author_id';

  // Récupérer l'auteur de la contribution pour mettre à jour ses stats
  const { data: contribution } = await supabase
    .from(targetTable)
    .select(authorColumn)
    .eq('id', contribution_id)
    .single();

  const contributionAuthorId = contribution?.[authorColumn];

  // Vérifier si l'utilisateur a déjà liké
  const { data: existingLike } = await supabase
    .from('contribution_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('contribution_type', contribution_type)
    .eq('contribution_id', contribution_id)
    .single();

  if (existingLike) {
    // Unlike : supprimer le like et décrémenter le compteur
    const { error: deleteError } = await supabase
      .from('contribution_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('contribution_type', contribution_type)
      .eq('contribution_id', contribution_id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    let newCount: number;

    // Utiliser la RPC pour les annotations, sinon méthode classique
    if (contribution_type === 'annotation') {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('update_annotation_likes', {
          p_annotation_id: contribution_id,
          p_increment: -1,
        });

      if (rpcError) {
        return { error: rpcError.message };
      }
      newCount = rpcData as number;
    } else {
      // Décrémenter le compteur de likes (méthode classique pour les autres types)
      const { data: currentContrib } = await supabase
        .from(targetTable)
        .select('likes_count')
        .eq('id', contribution_id)
        .single();

      newCount = Math.max(0, (currentContrib?.likes_count || 0) - 1);

      const { error: updateError } = await supabase
        .from(targetTable)
        .update({ likes_count: newCount })
        .eq('id', contribution_id);

      if (updateError) {
        return { error: updateError.message };
      }
    }

    // Mettre à jour total_likes_received pour l'auteur de la contribution
    if (contributionAuthorId) {
      await supabase.rpc('decrement_user_likes', {
        target_user_id: contributionAuthorId
      });
    }

    // Revalidation pour mettre à jour l'UI
    if (contribution_type === 'link' || contribution_type === 'annotation') {
      revalidatePath('/bible/[book]/[chapter]');
    }
    revalidatePath('/classement-contributeurs');

    return { success: true, liked: false, new_count: newCount };
  } else {
    // Like : insérer le like et incrémenter le compteur
    const { error: insertError } = await supabase
      .from('contribution_likes')
      .insert({
        user_id: user.id,
        contribution_type: contribution_type,
        contribution_id: contribution_id,
      });

    if (insertError) {
      return { error: insertError.message };
    }

    let newCount: number;

    // Utiliser la RPC pour les annotations, sinon méthode classique
    if (contribution_type === 'annotation') {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('update_annotation_likes', {
          p_annotation_id: contribution_id,
          p_increment: 1,
        });

      if (rpcError) {
        return { error: rpcError.message };
      }
      newCount = rpcData as number;
    } else {
      // Incrémenter le compteur de likes (méthode classique pour les autres types)
      const { data: currentContrib } = await supabase
        .from(targetTable)
        .select('likes_count')
        .eq('id', contribution_id)
        .single();

      newCount = (currentContrib?.likes_count || 0) + 1;

      const { error: updateError } = await supabase
        .from(targetTable)
        .update({ likes_count: newCount })
        .eq('id', contribution_id);

      if (updateError) {
        return { error: updateError.message };
      }
    }

    // Mettre à jour total_likes_received pour l'auteur de la contribution
    if (contributionAuthorId) {
      await supabase.rpc('increment_user_likes', {
        target_user_id: contributionAuthorId
      });
    }

    // Revalidation pour mettre à jour l'UI
    if (contribution_type === 'link' || contribution_type === 'annotation') {
      revalidatePath('/bible/[book]/[chapter]');
    }
    revalidatePath('/classement-contributeurs');

    return { success: true, liked: true, new_count: newCount };
  }
}

export async function getUserDashboardAction(userId: string) {
  const supabase = await createClient();

  // Récupérer le score de l'utilisateur
  const { data: score, error: scoreError } = await supabase
    .from('user_scores')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (scoreError && scoreError.code !== 'PGRST116') {
    return { error: scoreError.message };
  }

  // Récupérer les badges de l'utilisateur
  const { data: badges, error: badgesError } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (badgesError) {
    return { error: badgesError.message };
  }

  // Compter les contributions par type
  const { data: links } = await supabase
    .from('verse_links')
    .select('id')
    .eq('author_id', userId);

  const { data: annotations } = await supabase
    .from('verse_annotations')
    .select('id')
    .eq('author_id', userId);

  const { data: externalSources } = await supabase
    .from('verse_external_links')
    .select('id')
    .eq('author_id', userId);

  const { data: wikiArticles } = await supabase
    .from('wiki_articles')
    .select('id')
    .eq('author_id', userId);

  return {
    success: true,
    score: score || {
      total_hearts: 0,
      total_contributions: 0,
      total_likes_received: 0,
      rank: null,
    },
    badges: badges || [],
    breakdown: {
      links: links?.length || 0,
      annotations: annotations?.length || 0,
      external_sources: externalSources?.length || 0,
      wiki_articles: wikiArticles?.length || 0,
    },
  };
}

export async function getLeaderboardAction(limit: number = 100) {
  const supabase = await createClient();

  const { data: leaderboard, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('total_hearts', { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  // Transformer les données pour avoir le format attendu
  const transformedLeaderboard = leaderboard?.map(entry => ({
    ...entry,
    user_profiles: {
      username: entry.username,
      full_name: entry.full_name,
      confession: entry.confession,
    }
  })) || [];

  return {
    success: true,
    leaderboard: transformedLeaderboard,
  };
}

// ============================================================================
// VERSE CONTRIBUTION ACTIONS
// ============================================================================

export async function submitVerseTranslationAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vous devez être connecté pour contribuer.' };
  }

  const verse_id = formData.get('verse_id') as string;
  const translation_id = formData.get('translation_id') as string;
  const text = formData.get('text') as string;

  if (!verse_id || !translation_id || !text) {
    return { error: 'Tous les champs sont requis.' };
  }

  const { error } = await supabase
    .from('verse_contributions')
    .insert({
      verse_id,
      translation_id,
      text,
      contributor_id: user.id,
      status: 'pending',
    });

  if (error) {
    return { error: error.message };
  }

  // Award points for submitting a translation
  await updateUserScore(user.id, 'verse_translation');

  revalidatePath('/bible-contributive');
  revalidatePath('/classement-contributeurs');

  return { success: true };
}

// ============================================================================
// BIBLE ENTITIES ACTIONS
// ============================================================================

export interface BibleEntity {
  id: string;
  name: string;
  slug: string;
  entity_type: 'person' | 'place' | 'concept' | 'event';
  summary: string | null;
  wiki_article_id: string | null;
  aliases: string[] | null;
  metadata: Record<string, any> | null;
}

export async function getBibleEntitiesAction(): Promise<{ success: boolean; entities?: BibleEntity[]; error?: string }> {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('bible_entities')
    .select('*')
    .order('name');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, entities: data || [] };
}

export async function getBibleEntityBySlugAction(slug: string): Promise<{ success: boolean; entity?: BibleEntity; error?: string }> {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('bible_entities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, entity: data };
}

const CreateEntitySchema = z.object({
  name: z.string().min(1),
  entity_type: z.enum(['person', 'place', 'concept', 'event']),
  summary: z.string().min(1),
  aliases: z.string().optional(),
});

export async function createEntityAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult & { entity?: BibleEntity }> {
  const validatedFields = CreateEntitySchema.safeParse({
    name: formData.get('name'),
    entity_type: formData.get('entity_type'),
    summary: formData.get('summary'),
    aliases: formData.get('aliases'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { name, entity_type, summary, aliases } = validatedFields.data;

  // Générer le slug
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Préparer les aliases
  const aliasesArray = aliases
    ? aliases.split(',').map(a => a.trim()).filter(a => a.length > 0)
    : [];

  // Créer l'entité
  const { data, error } = await supabase
    .from('bible_entities')
    .insert({
      name,
      slug,
      entity_type,
      summary,
      aliases: aliasesArray,
      metadata: {},
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, entity: data };
}

// ============================================================================
// VERSE MANAGEMENT ACTIONS (Add Missing / Update Existing)
// ============================================================================

const AddVerseSchema = z.object({
  book_id: z.string().uuid(),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  text: z.string().min(1),
  translation_id: z.string().min(1),
});

const UpdateVerseSchema = z.object({
  verse_id: z.string().uuid(),
  text: z.string().min(1),
});

/**
 * Action pour ajouter un verset manquant à une traduction
 * Utilise la fonction RPC add_verse_translation qui attribue automatiquement
 * 25 points au contributeur via add_contribution_points
 */
export async function addVerseAction(
  state: ActionResult<{ id: string; text: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string; text: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vous devez être connecté pour ajouter un verset.' };
  }

  // Valider les champs
  const validatedFields = AddVerseSchema.safeParse({
    book_id: formData.get('book_id'),
    chapter: parseInt(formData.get('chapter') as string),
    verse: parseInt(formData.get('verse') as string),
    text: formData.get('text'),
    translation_id: formData.get('translation_id') || 'jerusalem',
  });

  if (!validatedFields.success) {
    console.error('[addVerseAction] Validation error:', validatedFields.error.issues);
    return { error: 'Champs invalides' };
  }

  const { book_id, chapter, verse, text, translation_id } = validatedFields.data;

  // Appeler la fonction RPC pour ajouter le verset avec points automatiques
  const { data, error } = await supabase
    .rpc('add_verse_translation', {
      p_book_id: book_id,
      p_chapter: chapter,
      p_verse: verse,
      p_text: text,
      p_contributor_id: user.id,
      p_translation_id: translation_id,
    });

  if (error) {
    console.error('[addVerseAction] RPC error:', error);
    return { error: error.message || 'Erreur lors de l\'ajout du verset' };
  }

  // Revalider les chemins pour mettre à jour l'UI
  revalidatePath('/bible/[bookId]/[chapter]');
  revalidatePath('/bible-contributive');
  revalidatePath('/classement-contributeurs');

  return { success: true, data: data as { id: string; text: string } };
}

/**
 * Action pour mettre à jour un verset existant
 * Utilise la fonction RPC update_verse_translation qui:
 * - Enregistre l'historique dans verse_contributions
 * - Attribue automatiquement 25 points au contributeur
 */
export async function updateVerseAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vous devez être connecté pour modifier un verset.' };
  }

  // Valider les champs
  const validatedFields = UpdateVerseSchema.safeParse({
    verse_id: formData.get('verse_id'),
    text: formData.get('text'),
  });

  if (!validatedFields.success) {
    console.error('[updateVerseAction] Validation error:', validatedFields.error.issues);
    return { error: 'Champs invalides' };
  }

  const { verse_id, text } = validatedFields.data;

  // Appeler la fonction RPC pour mettre à jour le verset avec historique et points
  const { data, error } = await supabase
    .rpc('update_verse_translation', {
      p_verse_id: verse_id,
      p_new_text: text,
      p_contributor_id: user.id,
    });

  if (error) {
    console.error('[updateVerseAction] RPC error:', error);
    return { error: error.message || 'Erreur lors de la mise à jour du verset' };
  }

  // Revalider les chemins pour mettre à jour l'UI
  revalidatePath('/bible/[bookId]/[chapter]');
  revalidatePath('/bible-contributive');
  revalidatePath('/classement-contributeurs');

  return { success: true };
}

// ============================================================================
// COMMUNITY TRANSLATION ACTIONS (Contributive Bible)
// ============================================================================

const SubmitCommunityTranslationSchema = z.object({
  book_id: z.string().uuid(),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  text: z.string().min(1),
  translation_id: z.string().min(1),
});

/**
 * Action pour soumettre une traduction communautaire
 * Utilise la fonction RPC submit_community_translation qui:
 * - Enregistre dans verse_contributions avec statut 'pending'
 * - Attribue automatiquement 25 points au contributeur
 */
export async function submitCommunityTranslationAction(
  state: ActionResult<{ id: string; text: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string; text: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vous devez être connecté pour contribuer une traduction.' };
  }

  // Valider les champs
  const validatedFields = SubmitCommunityTranslationSchema.safeParse({
    book_id: formData.get('book_id'),
    chapter: parseInt(formData.get('chapter') as string),
    verse: parseInt(formData.get('verse') as string),
    text: formData.get('text'),
    translation_id: formData.get('translation_id'),
  });

  if (!validatedFields.success) {
    console.error('[submitCommunityTranslationAction] Validation error:', validatedFields.error.issues);
    return { error: 'Champs invalides' };
  }

  const { book_id, chapter, verse, text, translation_id } = validatedFields.data;

  // Appeler la fonction RPC pour soumettre la traduction avec points automatiques
  const { data, error } = await supabase
    .rpc('submit_community_translation', {
      p_book_id: book_id,
      p_chapter: chapter,
      p_verse: verse,
      p_text: text,
      p_translation_id: translation_id,
      p_contributor_id: user.id,
    });

  if (error) {
    console.error('[submitCommunityTranslationAction] RPC error:', error);
    return { error: error.message || 'Erreur lors de la soumission de la traduction' };
  }

  // Revalider les chemins pour mettre à jour l'UI
  revalidatePath('/bible-contributive/[bookId]/[chapter]');
  revalidatePath('/bible-contributive');
  revalidatePath('/classement-contributeurs');

  return { success: true, data: data as { id: string; text: string } };
}

/**
 * Récupère les versets manquants pour une traduction en comparant avec Crampon
 * Retourne la liste des versets qui n'existent pas dans la traduction cible
 */
export async function getMissingVersesAction(bookSlug: string, chapter: number, translationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_missing_verses', {
      p_book_slug: bookSlug,
      p_chapter: chapter,
      p_translation_id: translationId,
    });

  if (error) {
    console.error('[getMissingVersesAction] RPC error:', error);
    return { error: error.message };
  }

  return { success: true, missingVerses: data || [] };
}

// ============================================================================
// MODERATION ACTIONS (Validating Community Translations)
// ============================================================================

const ValidateContributionSchema = z.object({
  contribution_id: z.string().uuid(),
});

const RejectContributionSchema = z.object({
  contribution_id: z.string().uuid(),
  review_notes: z.string().optional(),
});

/**
 * Récupère les contributions en attente de modération
 * Réservé aux modérateurs
 */
export async function getPendingContributionsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Vérifier si l'utilisateur est modérateur
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_moderator')
    .eq('user_id', user.id)
    .single();

  if (!profile || !profile.is_moderator) {
    return { error: 'Accès réservé aux modérateurs' };
  }

  // Récupérer les contributions en attente
  const { data, error } = await supabase
    .rpc('get_pending_contributions');

  if (error) {
    console.error('[getPendingContributionsAction] RPC error:', error);
    return { error: error.message };
  }

  return { success: true, contributions: data || [] };
}

/**
 * Valide une traduction communautaire et la publie
 * Réservé aux modérateurs
 */
export async function validateContributionAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = ValidateContributionSchema.safeParse({
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

  // Vérifier si l'utilisateur est modérateur
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_moderator')
    .eq('user_id', user.id)
    .single();

  if (!profile || !profile.is_moderator) {
    return { error: 'Accès réservé aux modérateurs' };
  }

  const { contribution_id } = validatedFields.data;

  // Valider la contribution
  const { data, error } = await supabase
    .rpc('validate_community_translation', {
      p_contribution_id: contribution_id,
      p_moderator_id: user.id,
    });

  if (error) {
    console.error('[validateContributionAction] RPC error:', error);
    return { error: error.message || 'Erreur lors de la validation' };
  }

  revalidatePath('/bible-contributive/[bookId]/[chapter]');
  revalidatePath('/moderation');
  return { success: true, data };
}

/**
 * Rejette une traduction communautaire
 * Réservé aux modérateurs
 */
export async function rejectContributionAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = RejectContributionSchema.safeParse({
    contribution_id: formData.get('contribution_id'),
    review_notes: formData.get('review_notes'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Vérifier si l'utilisateur est modérateur
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_moderator')
    .eq('user_id', user.id)
    .single();

  if (!profile || !profile.is_moderator) {
    return { error: 'Accès réservé aux modérateurs' };
  }

  const { contribution_id, review_notes } = validatedFields.data;

  // Rejeter la contribution
  const { error } = await supabase
    .rpc('reject_community_translation', {
      p_contribution_id: contribution_id,
      p_moderator_id: user.id,
      p_review_notes: review_notes || null,
    });

  if (error) {
    console.error('[rejectContributionAction] RPC error:', error);
    return { error: error.message || 'Erreur lors du rejet' };
  }

  revalidatePath('/moderation');
  return { success: true };
}

/**
 * Vérifie si l'utilisateur actuel est modérateur
 */
export async function isModeratorAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: true, isModerator: false };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_moderator')
    .eq('user_id', user.id)
    .single();

  return { success: true, isModerator: profile?.is_moderator || false };
}

// ============================================================================
// UNIVERSAL VERSE LINKS (Multi-source, multi-translation)
// ============================================================================

const CreateUniversalLinkSchema = z.object({
  source_verse_id: z.string().uuid(),
  source_verse_type: z.enum(['bible', 'apocryphal', 'contribution']),
  target_verse: z.string().min(1),
  target_translation: z.string().min(1),
  target_verse_type: z.enum(['bible', 'apocryphal', 'any']).default('any'),
  link_type: z.enum(['citation', 'parallel', 'prophecy', 'typology', 'commentary', 'concordance']),
  description: z.string().optional(),
});

/**
 * Crée un lien universel entre deux versets
 * Supporte: bible_verses (toutes traductions), apocryphal_verses, verse_contributions
 * Le miroir est créé automatiquement
 */
export async function createVerseLinkUniversalAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = CreateUniversalLinkSchema.safeParse({
    source_verse_id: formData.get('source_verse_id'),
    source_verse_type: formData.get('source_verse_type'),
    target_verse: formData.get('target_verse'),
    target_translation: formData.get('target_translation'),
    target_verse_type: formData.get('target_verse_type'),
    link_type: formData.get('link_type'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    console.error('[createVerseLinkUniversalAction] Validation error:', validatedFields.error.issues);
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Récupérer la confession de l'utilisateur
  let userConfession = 'catholic';
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('confession')
      .eq('user_id', user.id)
      .single();

    if (profile?.confession) {
      userConfession = profile.confession;
    }
  } catch {
    // Ignorer l'erreur et utiliser la valeur par défaut
  }

  const {
    source_verse_id,
    source_verse_type,
    target_verse,
    target_translation,
    target_verse_type,
    link_type,
    description,
  } = validatedFields.data;

  // Parser la référence du verset cible
  const targetVerse = await parseVerseReferenceUniversal(
    target_verse,
    target_translation,
    target_verse_type
  );

  if (!targetVerse) {
    console.warn('[createVerseLinkUniversalAction] Target verse not found, creating link with reference only');
  }

  // Créer le lien avec le RPC create_universal_link
  const { data: linkResult, error: linkError } = await supabase
    .rpc('create_universal_link', {
      p_source_verse_id: source_verse_id,
      p_source_verse_type: source_verse_type,
      p_target_book_slug: targetVerse?.book_slug || target_verse,
      p_target_chapter: targetVerse?.chapter || 1,
      p_target_verse: targetVerse?.verse || 1,
      p_target_translation_id: target_translation,
      p_target_verse_type: target_verse_type,
      p_link_type: link_type,
      p_author_id: user.id,
      p_description: description,
      p_confession: userConfession,
    });

  if (linkError) {
    console.error('[createVerseLinkUniversalAction] RPC error:', linkError);
    return { error: linkError.message };
  }

  // Mettre à jour le score de l'utilisateur
  await updateUserScore(user.id, 'verse_link');

  revalidatePath('/bible/[bookId]/[chapter]');
  revalidatePath('/bible-contributive/[bookId]/[chapter]');
  revalidatePath('/apocrypha');

  return { success: true, data: linkResult };
}

/**
 * Récupère tous les liens pour un verset donné (universel)
 * Inclut les liens vers bible_verses, apocryphal_verses, et verse_contributions
 */
export async function getVerseLinksUniversalAction(
  verseId: string,
  verseType: string = 'bible'
): Promise<ActionResult & { links?: any[] }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_verse_links_universal', {
      p_verse_id: verseId,
      p_verse_type: verseType,
    });

  if (error) {
    console.error('[getVerseLinksUniversalAction] RPC error:', error);
    return { error: error.message, links: [] };
  }

  return { success: true, links: data || [] };
}

/**
 * Schema pour les liens avec sélection de traduction étendue
 */
const CreateVerseLinkExtendedSchema = z.object({
  source_verse_id: z.string().uuid(),
  target_verse: z.string().min(1),
  link_type: z.enum(['citation', 'parallel', 'prophecy', 'typology', 'commentary', 'concordance', 'wiki']),
  description: z.string().optional(),
  // Traductions supportées : officielles + communautaires
  target_translation: z.enum(['crampon', 'jerusalem', 'auto']).optional(),
  target_verse_type: z.enum(['bible', 'apocryphal', 'any']).optional(),
});

/**
 * Action améliorée pour créer un lien de verset
 * Supporte toutes les traductions et les apocryphes
 * Remplace l'ancienne createVerseLinkAction
 */
export async function createVerseLinkExtendedAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = CreateVerseLinkExtendedSchema.safeParse({
    source_verse_id: formData.get('source_verse_id'),
    target_verse: formData.get('target_verse'),
    link_type: formData.get('link_type'),
    description: formData.get('description'),
    target_translation: formData.get('target_translation'),
    target_verse_type: formData.get('target_verse_type'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const {
    source_verse_id,
    target_verse,
    link_type,
    description,
    target_translation = 'crampon',
    target_verse_type = 'any',
  } = validatedFields.data;

  // Récupérer la confession de l'utilisateur
  let userConfession = 'catholic';
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('confession')
      .eq('user_id', user.id)
      .single();

    if (profile?.confession) {
      userConfession = profile.confession;
    }
  } catch {
    // Utiliser la valeur par défaut
  }

  // Pour les liens wiki, utiliser l'ancien système
  if (link_type === 'wiki') {
    const article = await findWikiArticle(target_verse);
    if (!article) {
      return { error: 'Article wiki non trouvé' };
    }

    const { error: insertError } = await supabase
      .from('verse_links')
      .insert({
        source_verse_id,
        target_verse_id: article.id,
        link_type: 'wiki',
        author_id: user.id,
        description,
        target_reference: target_verse,
        confession: userConfession,
      });

    if (insertError) {
      return { error: insertError.message };
    }

    await updateUserScore(user.id, 'verse_link');
    revalidatePath('/bible/[bookId]/[chapter]');
    return { success: true };
  }

  // Pour les liens bibliques, utiliser parseVerseReferenceUniversal
  const targetVerse = await parseVerseReferenceUniversal(
    target_verse,
    target_translation,
    target_verse_type
  );

  let target_verse_id: string | null = targetVerse?.verse_id || null;
  const target_reference = targetVerse
    ? `${targetVerse.book_name} ${targetVerse.chapter}:${targetVerse.verse}`
    : target_verse;

  // Récupérer les données du verset source pour le miroir
  const { data: sourceVerseData } = await supabase
    .from('bible_verses')
    .select(`
      id,
      verse,
      chapter,
      bible_books!inner(
        name
      )
    `)
    .eq('id', source_verse_id)
    .maybeSingle();

  // Créer le lien original
  const { data: createdLink, error: insertError } = await supabase
    .from('verse_links')
    .insert({
      source_verse_id,
      target_verse_id,
      link_type,
      author_id: user.id,
      description,
      target_reference,
      confession: userConfession,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Miroir automatique si on a les deux versets
  if (target_verse_id && sourceVerseData) {
    const sourceReference = `${sourceVerseData.bible_books.name} ${sourceVerseData.chapter}:${sourceVerseData.verse}`;

    const { data: mirrorLink } = await supabase
      .from('verse_links')
      .insert({
        source_verse_id: target_verse_id,
        target_verse_id: source_verse_id,
        link_type,
        author_id: user.id,
        description: `↩️ ${description || 'Renvoi réciproque'}`,
        target_reference: sourceReference,
        confession: userConfession,
        mirror_link_id: createdLink.id,
      })
      .select('id')
      .single();

    // Mettre à jour le lien original avec l'ID du miroir
    if (mirrorLink?.id) {
      await supabase
        .from('verse_links')
        .update({ mirror_link_id: mirrorLink.id })
        .eq('id', createdLink.id);
    }
  }

  await updateUserScore(user.id, 'verse_link');
  revalidatePath('/bible/[bookId]/[chapter]');
  revalidatePath('/bible-contributive/[bookId]/[chapter]');

  return { success: true };
}

/**
 * Action pour obtenir toutes les traductions disponibles
 * Inclut les traductions officielles et communautaires actives
 */
export async function getAvailableTranslationsAction() {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  // Traductions officielles (hardcodées pour bible_verses)
  const officialTranslations = [
    { id: 'crampon', name: 'Bible Crampon (1904)', type: 'official' },
    { id: 'jerusalem', name: 'Bible de Jérusalem (1998)', type: 'official' },
  ];

  // Traductions communautaires (hardcodées car le RPC ne retourne pas les données correctement)
  const communityTranslations = [
    { id: 'osty', name: 'Bible Osty', type: 'community' },
    { id: 'tob', name: 'Bible Tob', type: 'community' },
    { id: 'septante', name: 'Septante', type: 'community' },
    { id: 'liturgique', name: 'Traduction Liturgique', type: 'community' },
    { id: 'vulgate', name: 'Vulgate', type: 'community' },
    { id: 'grec', name: 'Texte Grec', type: 'community' },
    { id: 'hebreu', name: 'Texte Hébreu', type: 'community' },
    { id: 'latin', name: 'Texte Latin', type: 'community' },
  ];

  const allTranslations = [
    ...officialTranslations,
    ...communityTranslations,
  ];

  return { success: true, translations: allTranslations };
}

// ============================================================================
// APOCRYPHAL VERSES ACTIONS
// ============================================================================

/**
 * Récupère tous les livres apocryphes
 */
export async function getApocryphalBooksAction() {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from('apocryphal_books')
    .select('*')
    .order('name_fr');

  if (error) {
    return { error: error.message };
  }

  return { success: true, books: data || [] };
}

/**
 * Récupère les versets d'un livre apocryphe
 */
export async function getApocryphalChapterAction(bookSlug: string, chapter: number) {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  // Récupérer l'ID du livre apocryphe
  const { data: book, error: bookError } = await supabase
    .from('apocryphal_books')
    .select('id')
    .eq('slug', bookSlug)
    .single();

  if (bookError || !book) {
    return { error: bookError?.message || 'Livre apocryphe non trouvé' };
  }

  // Récupérer les versets
  const { data, error } = await supabase
    .from('apocryphal_verses')
    .select('*')
    .eq('book_id', book.id)
    .eq('chapter', chapter)
    .order('verse');

  if (error) {
    return { error: error.message };
  }

  return { success: true, verses: data || [] };
}

/**
 * Récupère un verset apocryphe spécifique
 */
export async function getApocryphalVerseAction(bookSlug: string, chapter: number, verse: number) {
  const { createPublicClient } = await import('@/utils/supabase/server');
  const supabase = createPublicClient();

  // Récupérer l'ID du livre apocryphe
  const { data: book, error: bookError } = await supabase
    .from('apocryphal_books')
    .select('id')
    .eq('slug', bookSlug)
    .single();

  if (bookError || !book) {
    return { error: bookError?.message || 'Livre apocryphe non trouvé' };
  }

  // Récupérer le verset
  const { data, error } = await supabase
    .from('apocryphal_verses')
    .select('*')
    .eq('book_id', book.id)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, verse: data };
}

/**
 * Schema pour les liens universels avec source type
 */
const CreateUniversalLinkWithSourceSchema = z.object({
  source_verse_id: z.string().uuid(),
  source_type: z.enum(['bible', 'contributive', 'apocryphal']),
  target_verse: z.string().min(1),
  target_source_type: z.enum(['bible', 'contributive', 'apocryphal', 'any']),
  target_translation: z.string().min(1),
  link_type: z.enum(['citation', 'parallel', 'prophecy', 'typology', 'commentary', 'concordance']),
  link_subtype: z.enum(['parallel', 'figure', 'type', 'prophecy']).optional(),
  is_prophecy: z.boolean().optional(),
  description: z.string().optional(),
});

/**
 * Crée un lien universel entre deux versets
 * Supporte: bible_verses, apocryphal_verses, verse_contributions
 * Avec sélection explicite du type de source
 */
export async function createUniversalLinkWithSourceAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = CreateUniversalLinkWithSourceSchema.safeParse({
    source_verse_id: formData.get('source_verse_id'),
    source_type: formData.get('source_type'),
    target_verse: formData.get('target_verse'),
    target_source_type: formData.get('target_source_type'),
    target_translation: formData.get('target_translation'),
    link_type: formData.get('link_type'),
    link_subtype: formData.get('link_subtype'),
    is_prophecy: formData.get('is_prophecy') === 'true',
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    console.error('[createUniversalLinkWithSourceAction] Validation error:', validatedFields.error.issues);
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Récupérer la confession de l'utilisateur
  let userConfession = 'catholic';
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('confession')
      .eq('user_id', user.id)
      .single();

    if (profile?.confession) {
      userConfession = profile.confession;
    }
  } catch {
    // Utiliser la valeur par défaut
  }

  const {
    source_verse_id,
    source_type,
    target_verse,
    target_source_type,
    target_translation,
    link_type,
    link_subtype,
    is_prophecy,
    description,
  } = validatedFields.data;

  // Parser la référence du verset cible avec le bon type
  const targetVerse = await parseVerseReferenceUniversal(
    target_verse,
    target_translation,
    target_source_type
  );

  let target_verse_id: string | null = targetVerse?.verse_id || null;
  const target_reference = targetVerse
    ? `${targetVerse.book_name} ${targetVerse.chapter}:${targetVerse.verse}`
    : target_verse;

  // Récupérer les données du verset source pour le miroir
  let sourceReference = '';
  if (source_type === 'bible') {
    const { data: sourceVerseData } = await supabase
      .from('bible_verses')
      .select(`
        id,
        verse,
        chapter,
        bible_books!inner(name)
      `)
      .eq('id', source_verse_id)
      .maybeSingle();

    if (sourceVerseData) {
      sourceReference = `${sourceVerseData.bible_books.name} ${sourceVerseData.chapter}:${sourceVerseData.verse}`;
    }
  } else if (source_type === 'apocryphal') {
    const { data: sourceVerseData } = await supabase
      .from('apocryphal_verses')
      .select(`
        id,
        verse,
        chapter,
        apocryphal_books!inner(name_fr)
      `)
      .eq('id', source_verse_id)
      .maybeSingle();

    if (sourceVerseData) {
      sourceReference = `${sourceVerseData.apocryphal_books.name_fr} ${sourceVerseData.chapter}:${sourceVerseData.verse}`;
    }
  }

  // Créer le lien original avec les nouveaux champs source_verse_type et target_verse_type
  const { data: createdLink, error: insertError } = await supabase
    .from('verse_links')
    .insert({
      source_verse_id,
      source_verse_type: source_type,
      target_verse_id,
      target_verse_type: targetVerse?.verse_type || null,
      link_type,
      link_subtype,
      is_prophecy,
      author_id: user.id,
      description,
      target_reference,
      confession: userConfession,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[createUniversalLinkWithSourceAction] Insert error:', insertError);
    return { error: insertError.message };
  }

  // Miroir automatique si on a les deux versets
  if (target_verse_id && sourceReference) {
    const { data: mirrorLink } = await supabase
      .from('verse_links')
      .insert({
        source_verse_id: target_verse_id,
        source_verse_type: targetVerse?.verse_type || source_type,
        target_verse_id: source_verse_id,
        target_verse_type: source_type,
        link_type,
        link_subtype,
        is_prophecy,
        author_id: user.id,
        description: `↩️ ${description || 'Renvoi réciproque'}`,
        target_reference: sourceReference,
        confession: userConfession,
        mirror_link_id: createdLink.id,
      })
      .select('id')
      .single();

    // Mettre à jour le lien original avec l'ID du miroir
    if (mirrorLink?.id) {
      await supabase
        .from('verse_links')
        .update({ mirror_link_id: mirrorLink.id })
        .eq('id', createdLink.id);
    }
  }

  await updateUserScore(user.id, 'verse_link');
  revalidatePath('/bible/[bookId]/[chapter]');
  revalidatePath('/bible-contributive/[bookId]/[chapter]');
  revalidatePath('/apocrypha/[slug]');

  return { success: true };
}
