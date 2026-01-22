'use client';

import { updateArticleAction } from '@/app/actions';
import { useActionState, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Tables } from '@/lib/database.types';
import WikiEditor from '@/components/wiki-editor/WikiEditor';

interface WikiRevision {
  id: string;
  article_id: string;
  content: string;
  comment: string | null;
  author_id: string;
  is_minor_edit: boolean;
  created_at: string;
}

interface ArticleWithRevisions extends Tables<'wiki_articles'> {
  wiki_revisions: WikiRevision[];
}

interface EditArticleFormProps {
  article: ArticleWithRevisions;
}

/**
 * Convertit un contenu markdown basique en HTML pour l'éditeur TipTap
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p></p>';

  // Si le contenu commence déjà par une balise HTML, on le retourne tel quel
  if (markdown.trim().startsWith('<')) {
    return markdown;
  }

  // Traiter ligne par ligne pour mieux gérer les blocs
  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Headers
    if (line.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3>${line.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2>${line.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h1>${line.slice(2)}</h1>`);
      continue;
    }

    // Liste à puces
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      const content = processInlineMarkdown(line.slice(2));
      htmlParts.push(`<li><p>${content}</p></li>`);
      continue;
    }

    // Fermer la liste si on n'est plus dans une liste
    if (inList && !line.startsWith('- ') && !line.startsWith('* ')) {
      htmlParts.push('</ul>');
      inList = false;
    }

    // Ligne vide = nouveau paragraphe
    if (line.trim() === '') {
      continue;
    }

    // Paragraphe normal
    const content = processInlineMarkdown(line);
    htmlParts.push(`<p>${content}</p>`);
  }

  // Fermer la liste si encore ouverte
  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('') || '<p></p>';
}

/**
 * Traite le markdown inline (gras, italique, liens)
 */
function processInlineMarkdown(text: string): string {
  let result = text;

  // Bold + Italic (***text***)
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold (**text**)
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic (*text*)
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Liens wiki [[texte]]
  result = result.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
    const slug = linkText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<a href="/wiki/${slug}" class="text-blue-600 hover:text-blue-800 underline">${linkText}</a>`;
  });

  // Liens markdown [texte](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline">$1</a>');

  return result;
}

export default function EditArticleForm({ article }: EditArticleFormProps) {
  const [state, formAction, isPending] = useActionState(updateArticleAction, null as Awaited<ReturnType<typeof updateArticleAction>> | null);

  // Récupérer le contenu de la révision la plus récente et le convertir si nécessaire
  const rawContent = article.wiki_revisions?.[0]?.content || '';
  const initialContent = useMemo(() => markdownToHtml(rawContent), [rawContent]);
  const [content, setContent] = useState(initialContent);

  // Gérer la redirection en cas de succès
  useEffect(() => {
    if (state?.success) {
      window.location.href = `/wiki/${article.slug}`;
    }
  }, [state, article.slug]);

  return (
    <div className="space-y-6">
      {/* Header avec info article */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">{article.title}</h2>
            <p className="text-sm text-slate-600">
              Dernière modification: {new Date(article.updated_at || article.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="article_id" value={article.id} />

        {/* Éditeur WYSIWYG */}
        <div className="form__group">
          <label className="form__label flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Contenu de l'article
          </label>

          <WikiEditor
            content={content}
            onChange={(html, _text) => setContent(html)}
            placeholder="Rédigez votre article ici..."
            minHeight="350px"
          />

          {/* Champ caché pour le formulaire */}
          <input type="hidden" name="content" value={content} />

          <p className="text-xs text-secondary mt-2 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Utilisez les boutons de la barre d'outils pour insérer des références bibliques et des liens wiki.
          </p>
        </div>

        {/* Commentaire de révision */}
        <div className="form__group">
          <label htmlFor="comment" className="form__label flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Commentaire de révision
          </label>
          <input
            id="comment"
            name="comment"
            type="text"
            className="form__input"
            placeholder="Ex: Correction de la formulation, ajout de sources..."
          />
          <p className="text-xs text-slate-500 mt-1">
            Décrivez brièvement vos modifications pour l'historique.
          </p>
        </div>

        {/* Modification mineure */}
        <div className="form__group">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              name="is_minor_edit"
              value="true"
              className="w-5 h-5 text-accent border-slate-300 rounded focus:ring-accent focus:ring-offset-0"
            />
            <div>
              <span className="text-sm font-medium text-primary">Modification mineure</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Correction de typos, formatage, mise en page (pas de changement de contenu)
              </p>
            </div>
          </label>
        </div>

        {/* Erreur */}
        {state?.error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800" role="alert">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="font-medium">{state.error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="btn btn--primary flex-1 flex items-center justify-center gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Publier la modification
              </>
            )}
          </button>
          <Link
            href={`/wiki/${article.slug}`}
            className="btn btn--secondary flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Annuler
          </Link>
        </div>
      </form>

      {/* Rappel des bonnes pratiques */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Avant de publier</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Vérifiez l'exactitude des informations</li>
              <li>• Assurez-vous que les références bibliques sont correctes</li>
              <li>• Relisez pour corriger les erreurs de frappe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
