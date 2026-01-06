'use server';

import { createClient } from '@/utils/supabase/server';
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

export async function getChapterAction(bookSlug: string, chapter: number) {
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

  // Ensuite récupérer les versets
  const { data, error } = await supabase
    .from('bible_verses')
    .select('*')
    .eq('book_id', book.id)
    .eq('chapter', chapter)
    .order('verse');

  if (error) {
    return { error: error.message };
  }

  return { success: true, verses: data };
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
 * Récupère les versets d'un chapitre spécifique
 */
export async function getVersesAction(bookId: string, chapter: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bible_verses')
    .select('*')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
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
});

const CreateAnnotationSchema = z.object({
  verse_id: z.string().uuid(),
  content: z.string().min(1),
  parent_id: z.string().uuid().optional(),
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
 */
async function parseVerseReference(reference: string) {
  const supabase = await createClient();

  // Parser la référence (format: "Livre Chapitre:Verset")
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/i);
  if (!match) {
    return null;
  }

  const [, bookName, chapter, verse] = match;

  // Rechercher le livre par nom (en français ou anglais)
  const { data: book } = await supabase
    .from('bible_books')
    .select('id')
    .or(`name.ilike.${bookName},name_en.ilike.${bookName}`)
    .single();

  if (!book) {
    return null;
  }

  // Rechercher le verset
  const { data: verseData } = await supabase
    .from('bible_verses')
    .select('id')
    .eq('book_id', book.id)
    .eq('chapter', parseInt(chapter))
    .eq('verse', parseInt(verse))
    .single();

  return verseData;
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
 * Crée un lien depuis un verset
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
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { source_verse_id, target_verse, link_type, description } = validatedFields.data;

  // Récupérer la confession de l'utilisateur depuis son profil
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('confession')
    .eq('user_id', user.id)
    .single();

  const userConfession = profile?.confession || 'catholic';

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
    // Pour les versets bibliques, parser la référence
    const targetVerse = await parseVerseReference(target_verse);
    if (targetVerse) {
      target_verse_id = targetVerse.id;
    }
    // Sinon target_verse_id reste null (référence textuelle libre)
  }

  // Créer le lien avec la référence textuelle et la confession automatique
  const { error } = await supabase
    .from('verse_links')
    .insert({
      source_verse_id,
      target_verse_id, // peut être null pour les références non bibliques
      link_type,
      author_id: user.id,
      description,
      target_reference: target_verse, // stocker la référence textuelle
      confession: userConfession, // confession automatique depuis le profil
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bible/[book]/[chapter]');
  return { success: true };
}

/**
 * Crée une annotation sur un verset
 */
export async function createAnnotationAction(
  state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = CreateAnnotationSchema.safeParse({
    verse_id: formData.get('verse_id'),
    content: formData.get('content'),
    parent_id: formData.get('parent_id'),
  });

  if (!validatedFields.success) {
    return { error: 'Champs invalides' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  const { verse_id, content, parent_id } = validatedFields.data;

  const { error } = await supabase
    .from('verse_annotations')
    .insert({
      verse_id,
      author_id: user.id,
      content,
      parent_id: parent_id || null,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bible/[book]/[chapter]');
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

  revalidatePath('/bible/[book]/[chapter]');
  return { success: true };
}

/**
 * Récupère toutes les contributions pour un verset (liens, annotations, sources externes)
 */
export async function getVerseContributionsAction(verseId: string) {
  const supabase = await createClient();

  // Récupérer tous les liens
  const { data: links } = await supabase
    .from('verse_links')
    .select(`
      *,
      bible_verses!verse_links_target_verse_id_fkey(*, bible_books(*))
    `)
    .eq('source_verse_id', verseId);

  // Séparer les liens wiki et les liens bibliques
  const wikiLinks = links?.filter(link => link.link_type === 'wiki') || [];
  const bibleLinks = links?.filter(link => link.link_type !== 'wiki') || [];

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

  // Récupérer les annotations principales (pas les réponses)
  const { data: annotations } = await supabase
    .from('verse_annotations')
    .select('*')
    .eq('verse_id', verseId)
    .is('parent_id', null);

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
    annotations: annotations || [],
    external_sources: external_sources || [],
  };
}

/**
 * Modifie une annotation
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
    .select('author_id')
    .eq('id', annotation_id)
    .single();

  if (!existingAnnotation || existingAnnotation.author_id !== user.id) {
    return { error: 'Non autorisé' };
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

  // Vérifier que l'utilisateur est bien l'auteur
  const { data: existingAnnotation } = await supabase
    .from('verse_annotations')
    .select('author_id')
    .eq('id', annotation_id)
    .single();

  if (!existingAnnotation || existingAnnotation.author_id !== user.id) {
    return { error: 'Non autorisé' };
  }

  // Supprimer l'annotation
  const { error } = await supabase
    .from('verse_annotations')
    .delete()
    .eq('id', annotation_id);

  if (error) {
    return { error: error.message };
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
    .select('author_id')
    .eq('id', link_id)
    .single();

  if (!existingLink || existingLink.author_id !== user.id) {
    return { error: 'Non autorisé' };
  }

  // Supprimer le lien
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

  // Déterminer la table cible
  const targetTable = contribution_type === 'link' ? 'verse_links' :
                      contribution_type === 'annotation' ? 'verse_annotations' :
                      contribution_type === 'external_source' ? 'verse_external_links' :
                      'wiki_articles';

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

    // Décrémenter le compteur de likes
    const { data: currentContrib } = await supabase
      .from(targetTable)
      .select('likes_count')
      .eq('id', contribution_id)
      .single();

    const newCount = Math.max(0, (currentContrib?.likes_count || 0) - 1);

    const { error: updateError } = await supabase
      .from(targetTable)
      .update({ likes_count: newCount })
      .eq('id', contribution_id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Revalidation pour mettre à jour l'UI
    if (contribution_type === 'link' || contribution_type === 'annotation') {
      revalidatePath('/bible/[book]/[chapter]');
    }

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

    // Incrémenter le compteur de likes
    const { data: currentContrib } = await supabase
      .from(targetTable)
      .select('likes_count')
      .eq('id', contribution_id)
      .single();

    const newCount = (currentContrib?.likes_count || 0) + 1;

    const { error: updateError } = await supabase
      .from(targetTable)
      .update({ likes_count: newCount })
      .eq('id', contribution_id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Revalidation pour mettre à jour l'UI
    if (contribution_type === 'link' || contribution_type === 'annotation') {
      revalidatePath('/bible/[book]/[chapter]');
    }

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
    .from('user_scores')
    .select(`
      *,
      user_profiles!inner(
        username
      )
    `)
    .order('total_hearts', { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  // Transformer les données pour avoir le format attendu
  const transformedLeaderboard = leaderboard?.map(entry => ({
    ...entry,
    user: {
      raw_user_meta_data: {
        username: (entry as any).user_profiles?.username || 'Anonyme'
      }
    }
  })) || [];

  return {
    success: true,
    leaderboard: transformedLeaderboard,
  };
}
