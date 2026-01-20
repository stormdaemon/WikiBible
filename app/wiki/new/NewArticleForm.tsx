'use client';

import { createArticleAction } from '@/app/actions';
import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { parseWikiLinks } from '@/lib/wiki-parser';
import WikiEditor from '@/components/wiki-editor/WikiEditor';

// Composant d'aide pour la syntaxe Markdown
function MarkdownHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-accent hover:text-accent/80 flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        {isOpen ? 'Masquer' : 'Afficher'} l'aide Markdown
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-sm">
          <h4 className="font-semibold text-primary">Syntaxe Markdown</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-slate-700 mb-1">Titres</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">## Titre 2</code>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-1">Gras / Italique</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">**gras** *italique*</code>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-1">Listes</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">- Item</code>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-1">Liens</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">[texte](url)</code>
            </div>

            <div className="md:col-span-2">
              <p className="font-medium text-slate-700 mb-1">🔗 Références Wiki</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded block">[[Jean 3:16]] - Référence biblique</code>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-1 inline-block">[[Saint Pierre]] - Article Wiki</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant d'aperçu Markdown
function MarkdownPreview({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="p-4 bg-white rounded-lg min-h-[200px] border border-slate-200 flex items-center justify-center">
        <p className="text-slate-400 italic">Aperçu du contenu...</p>
      </div>
    );
  }

  // Convertir d'abord les liens wiki en HTML
  const contentWithLinks = parseWikiLinks(content);

  // Puis appliquer le parsing markdown basique
  let html = contentWithLinks
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-primary">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-primary">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-4 text-primary">$1</h1>')
    // Bold et Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Liens [texte](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener">$1</a>')
    // Listes
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul class="my-2 space-y-1">$1</ul>')
    // Paragraphes
    .replace(/\n\n/g, '</p><p class="my-3">')
    // Line breaks
    .replace(/\n/g, '<br />');

  return (
    <div
      className="prose prose-sm max-w-none p-4 bg-white rounded-lg min-h-[200px] border border-slate-200"
      dangerouslySetInnerHTML={{ __html: `<p class="my-3">${html}</p>` }}
    />
  );
}

export default function NewArticleForm() {
  const [state, formAction, isPending] = useActionState(createArticleAction, null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Gérer la redirection en cas de succès
  useEffect(() => {
    if (state?.success && state?.slug) {
      window.location.href = `/wiki/${state.slug}`;
    }
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <form action={formAction} className="space-y-6">
        {/* Titre */}
        <div className="form__group">
          <label htmlFor="title" className="form__label flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Titre de l'article <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="form__input"
            placeholder="Ex: Saint Pierre, Concile de Trente, Transsubstantiation..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {title && (
            <p className="text-xs text-slate-500 mt-1">
              Slug: <code className="bg-slate-100 px-2 py-0.5 rounded">
              {title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || 'auto-généré'}
              </code>
            </p>
          )}
        </div>

        {/* Toggle Aperçu */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span className="text-sm font-medium text-slate-700">Aperçu en temps réel</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${showPreview ? 'bg-accent' : 'bg-slate-300'}`}
          >
            <span
              className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300"
              style={{ transform: showPreview ? 'translateX(0.25rem)' : 'translateX(-1.25rem)' }}
            />
          </button>
        </div>

        {/* Contenu + Aperçu côte à côte */}
        <div className={`grid ${showPreview ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
          {/* Éditeur WYSIWYG */}
          <div className="form__group relative">
            <label htmlFor="content" className="form__label flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Contenu <span className="text-red-500">*</span>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Nouvel éditeur WYSIWYG 🎨
              </span>
            </label>

            <WikiEditor
              content={content}
              onChange={(html, text) => setContent(html)}
              placeholder="# Introduction&#10;&#10;Rédigez votre article ici...&#10;&#10;## Section 1&#10;&#10;Vous pouvez utiliser des liens wiki comme [[Jean 3:16]]"
            />

            {/* Champ caché pour le formulaire */}
            <input type="hidden" name="content" value={content} />

            <p className="text-xs text-secondary mt-2 flex items-center gap-1">
              💡 L'éditeur WYSIWYG est maintenant actif ! Utilisez <code className="bg-slate-100 px-1 rounded">[[Livre Chapitre:Verset]]</code> pour les références bibliques.
            </p>
          </div>

          {/* Aperçu */}
          {showPreview && (
            <div className="form__group">
              <label className="form__label flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Aperçu
              </label>
              <MarkdownPreview content={content} />
            </div>
          )}
        </div>

        {/* Aide Markdown */}
        <MarkdownHelp />

        {/* Commentaire */}
        <div className="form__group">
          <label htmlFor="comment" className="form__label flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Commentaire de révision
          </label>
          <input
            id="comment"
            name="comment"
            type="text"
            className="form__input"
            placeholder="Ex: Création initiale de l'article"
          />
          <p className="text-xs text-slate-500 mt-1">
            Ce commentaire sera visible dans l'historique des révisions.
          </p>
        </div>

        {/* Erreur */}
        {state?.error && (
          <div className="alert alert--error" role="alert">
            <svg className="alert__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{state.error}</span>
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
                Publication en cours...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Publier l'article
              </>
            )}
          </button>
          <Link
            href="/wiki"
            className="btn btn--secondary flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Annuler
          </Link>
        </div>
      </form>

      {/* Conseils de création */}
      <div className="bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-xl p-6">
        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Conseils pour un bon article
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Titre clair :</strong> Utilisez des noms propres et des termes précis (ex: "Saint Augustin d'Hippone" plutôt que "Augustin")</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Sources :</strong> Citez vos sources avec les références externes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Liens Wiki :</strong> Créez des liens vers d'autres articles avec [[Nom de l'article]]</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span><strong>Références bibliques :</strong> Utilisez [[Livre Chapitre:Verset]] pour les versets (ex: [[Jean 3:16]])</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
