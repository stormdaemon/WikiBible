import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * WikiLinkExtension - Extension TipTap pour les liens wiki
 *
 * Syntaxe: [[Article Title]]
 *
 * Affiche un lien stylé vers un article wiki
 */
export const WikiLinkExtension = Mark.create({
  name: 'wikiLink',

  inclusive: false,

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            'data-title': attributes.title,
          };
        },
      },
      slug: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-slug'),
        renderHTML: (attributes) => {
          if (!attributes.slug) {
            return {};
          }
          return {
            'data-slug': attributes.slug,
          };
        },
      },
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-href'),
        renderHTML: (attributes) => {
          if (!attributes.href) {
            return {};
          }
          return {
            'data-href': attributes.href,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="wiki-link"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(
        {
          'data-type': 'wiki-link',
          class: 'text-accent hover:text-accent/80 underline underline-offset-2 decoration-accent/30 hover:decoration-accent/60 font-medium transition-all',
        },
        HTMLAttributes
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setWikiLink:
        (title: string) =>
        ({ commands }) => {
          // Convertir le titre en slug
          const slug = titleToSlug(title);
          const href = `/wiki/${slug}`;

          return commands.setMark(this.name, {
            title,
            slug,
            href,
          });
        },
    };
  },
});

/**
 * Convertit un titre d'article en slug
 */
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
