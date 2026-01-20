'use client';

import { Editor } from '@tiptap/react';
import { Icons } from './icons';

interface EditorToolbarProps {
  editor: Editor | null;
  onInsertVerse: () => void;
  onInsertWikiLink: () => void;
}

/**
 * EditorToolbar - Barre d'outils de l'éditeur Wiki
 *
 * Boutons de formatage de base + insertion versets et liens wiki
 * SVG de style catholique médiéval
 */
export default function EditorToolbar({ editor, onInsertVerse, onInsertWikiLink }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const toolbarGroups = [
    // Titres
    {
      buttons: [
        {
          icon: <Icons.H1 />,
          label: 'Titre 1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => editor.isActive('heading', { level: 1 }),
        },
        {
          icon: <Icons.H2 />,
          label: 'Titre 2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => editor.isActive('heading', { level: 2 }),
        },
        {
          icon: <Icons.H3 />,
          label: 'Titre 3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: () => editor.isActive('heading', { level: 3 }),
        },
      ],
    },
    // Formatage texte
    {
      buttons: [
        {
          icon: <Icons.Bold />,
          label: 'Gras',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: () => editor.isActive('bold'),
        },
        {
          icon: <Icons.Italic />,
          label: 'Italique',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: () => editor.isActive('italic'),
        },
      ],
    },
    // Listes
    {
      buttons: [
        {
          icon: <Icons.BulletList />,
          label: 'Liste à puces',
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: () => editor.isActive('bulletList'),
        },
        {
          icon: <Icons.OrderedList />,
          label: 'Liste numérotée',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: () => editor.isActive('orderedList'),
        },
      ],
    },
    // Insertion spéciale
    {
      buttons: [
        {
          icon: <Icons.Verse />,
          label: 'Insérer un verset',
          action: onInsertVerse,
          isActive: () => false,
          special: true,
        },
        {
          icon: <Icons.WikiLink />,
          label: 'Lien wiki',
          action: onInsertWikiLink,
          isActive: () => false,
          special: true,
        },
      ],
    },
  ];

  return (
    <div className="editor-toolbar flex items-center gap-1 p-2 bg-white border-b border-slate-200 rounded-t-lg overflow-x-auto">
      {toolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-1">
          {group.buttons.map((button, buttonIndex) => (
            <button
              key={buttonIndex}
              type="button"
              onClick={button.action}
              title={button.label}
              className={`p-2 rounded transition-colors ${
                button.isActive()
                  ? 'bg-accent text-white'
                  : button.special
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="w-5 h-5">
                {button.icon}
              </div>
            </button>
          ))}
          {groupIndex < toolbarGroups.length - 1 && (
            <div className="w-px h-6 bg-slate-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}
