'use server';

import { supabase } from '@/lib/supabase';
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

// === AUTH ACTIONS ===

export async function loginAction(state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password } = validatedFields.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function registerAction(state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const validatedFields = RegisterSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password, name } = validatedFields.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function logoutAction() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/');
  return { success: true };
}

// === WIKI ACTIONS ===

export async function createArticleAction(state: ActionResult<{slug: string}> | null, formData: FormData): Promise<ActionResult<{slug: string}>> {
  const validatedFields = CreateArticleSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    comment: formData.get('comment'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

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
  const { data, error } = await supabase
    .from('bible_books')
    .select('*')
    .order('position');

  if (error) {
    return { error: error.message };
  }

  return { success: true, books: data };
}

export async function getBookAction(bookId: string) {
  const { data, error } = await supabase
    .from('bible_books')
    .select('*')
    .eq('id', bookId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, book: data };
}

export async function getChapterAction(bookId: string, chapter: number) {
  const { data, error } = await supabase
    .from('bible_verses')
    .select('*')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse');

  if (error) {
    return { error: error.message };
  }

  return { success: true, verses: data };
}

export async function searchBibleAction(query: string) {
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

export async function getArticleAction(slug: string) {
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
