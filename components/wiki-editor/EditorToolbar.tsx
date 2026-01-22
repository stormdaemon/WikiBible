'use client';

import { Editor } from '@tiptap/react';
import { Icons } from './icons';
import { useState } from 'react';

interface EditorToolbarProps {
  editor: Editor | null;
  onInsertVerse: () => void;
  onInsertWikiLink: () => void;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  action: () => void;
  isActive: () => boolean;
  disabled?: () => boolean;
  variant?: 'default' | 'special' | 'accent';
}

/**
 * EditorToolbar - Barre d'outils moderne de l'éditeur Wiki
 */
export default function EditorToolbar({ editor, onInsertVerse, onInsertWikiLink }: EditorToolbarProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!editor) {
    return null;
  }

  const toolbarGroups: { buttons: ToolbarButton[] }[] = [
    // Undo/Redo
    {
      buttons: [
        {
          icon: <Icons.Undo />,
          label: 'Annuler',
          shortcut: 'Ctrl+Z',
          action: () => editor.chain().focus().undo().run(),
          isActive: () => false,
          disabled: () => !editor.can().undo(),
        },
        {
          icon: <Icons.Redo />,
          label: 'Rétablir',
          shortcut: 'Ctrl+Y',
          action: () => editor.chain().focus().redo().run(),
          isActive: () => false,
          disabled: () => !editor.can().redo(),
        },
      ],
    },
    // Titres
    {
      buttons: [
        {
          icon: <Icons.H1 />,
          label: 'Titre 1',
          shortcut: 'Ctrl+Alt+1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => editor.isActive('heading', { level: 1 }),
        },
        {
          icon: <Icons.H2 />,
          label: 'Titre 2',
          shortcut: 'Ctrl+Alt+2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => editor.isActive('heading', { level: 2 }),
        },
        {
          icon: <Icons.H3 />,
          label: 'Titre 3',
          shortcut: 'Ctrl+Alt+3',
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
          shortcut: 'Ctrl+B',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: () => editor.isActive('bold'),
        },
        {
          icon: <Icons.Italic />,
          label: 'Italique',
          shortcut: 'Ctrl+I',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: () => editor.isActive('italic'),
        },
        {
          icon: <Icons.Code />,
          label: 'Code',
          shortcut: 'Ctrl+E',
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: () => editor.isActive('code'),
        },
      ],
    },
    // Listes et blocs
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
        {
          icon: <Icons.Quote />,
          label: 'Citation',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: () => editor.isActive('blockquote'),
        },
      ],
    },
    // Insertion
    {
      buttons: [
        {
          icon: <Icons.HorizontalRule />,
          label: 'Ligne horizontale',
          action: () => editor.chain().focus().setHorizontalRule().run(),
          isActive: () => false,
        },
      ],
    },
    // Insertion spéciale Wiki
    {
      buttons: [
        {
          icon: <Icons.Verse />,
          label: 'Insérer un verset biblique',
          action: onInsertVerse,
          isActive: () => false,
          variant: 'accent',
        },
        {
          icon: <Icons.WikiLink />,
          label: 'Lien vers un article wiki',
          action: onInsertWikiLink,
          isActive: () => false,
          variant: 'special',
        },
      ],
    },
  ];

  const getButtonClasses = (button: ToolbarButton) => {
    const isActive = button.isActive();
    const isDisabled = button.disabled?.() || false;
    const variant = button.variant || 'default';

    const baseClasses = 'relative p-2 rounded-lg transition-all duration-150 flex items-center justify-center';

    if (isDisabled) {
      return `${baseClasses} opacity-40 cursor-not-allowed bg-transparent text-slate-400`;
    }

    if (isActive) {
      return `${baseClasses} bg-primary text-white shadow-sm`;
    }

    switch (variant) {
      case 'accent':
        return `${baseClasses} bg-amber-100 text-amber-700 hover:bg-amber-200 hover:shadow-sm border border-amber-200`;
      case 'special':
        return `${baseClasses} bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm border border-blue-200`;
      default:
        return `${baseClasses} bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-sm`;
    }
  };

  return (
    <div className="editor-toolbar sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-white border border-slate-200 rounded-t-xl shadow-sm">
      {toolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5">
          {group.buttons.map((button, buttonIndex) => {
            const tooltipId = `${groupIndex}-${buttonIndex}`;
            const isDisabled = button.disabled?.() || false;

            return (
              <div key={buttonIndex} className="relative">
                <button
                  type="button"
                  onClick={button.action}
                  disabled={isDisabled}
                  onMouseEnter={() => setActiveTooltip(tooltipId)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className={getButtonClasses(button)}
                  aria-label={button.label}
                >
                  <div className="w-5 h-5">
                    {button.icon}
                  </div>
                </button>

                {/* Tooltip */}
                {activeTooltip === tooltipId && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap z-50 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                    <span>{button.label}</span>
                    {button.shortcut && (
                      <span className="ml-1.5 px-1 py-0.5 bg-slate-700 rounded text-[10px] font-mono">
                        {button.shortcut}
                      </span>
                    )}
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
            );
          })}
          {groupIndex < toolbarGroups.length - 1 && (
            <div className="w-px h-6 bg-slate-200 mx-1.5" />
          )}
        </div>
      ))}
    </div>
  );
}
