export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bible_books: {
        Row: {
          chapters: number
          created_at: string | null
          id: string
          is_deuterocanonical: boolean | null
          name: string
          name_en: string
          position: number
          testament: string
        }
        Insert: {
          chapters: number
          created_at?: string | null
          id?: string
          is_deuterocanonical?: boolean | null
          name: string
          name_en: string
          position: number
          testament: string
        }
        Update: {
          chapters?: number
          created_at?: string | null
          id?: string
          is_deuterocanonical?: boolean | null
          name?: string
          name_en?: string
          position?: number
          testament?: string
        }
        Relationships: []
      }
      bible_verses: {
        Row: {
          book_id: string
          chapter: number
          created_at: string | null
          id: string
          text: string
          translation_id: string
          verse: number
        }
        Insert: {
          book_id: string
          chapter: number
          created_at?: string | null
          id?: string
          text: string
          translation_id?: string
          verse: number
        }
        Update: {
          book_id?: string
          chapter?: number
          created_at?: string | null
          id?: string
          text?: string
          translation_id?: string
          verse?: number
        }
        Relationships: [
          {
            foreignKeyName: "bible_verses_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "bible_books"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_article_categories: {
        Row: {
          article_id: string
          category_id: string
        }
        Insert: {
          article_id: string
          category_id: string
        }
        Update: {
          article_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_article_categories_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_article_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "wiki_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_articles: {
        Row: {
          author_id: string | null
          created_at: string | null
          current_revision_id: string | null
          id: string
          is_published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          current_revision_id?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          current_revision_id?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wiki_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wiki_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_revisions: {
        Row: {
          article_id: string
          author_id: string | null
          comment: string | null
          content: string
          created_at: string | null
          id: string
          is_minor_edit: boolean | null
        }
        Insert: {
          article_id: string
          author_id?: string | null
          comment?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_minor_edit?: boolean | null
        }
        Update: {
          article_id?: string
          author_id?: string | null
          comment?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_minor_edit?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_revisions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "wiki_articles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
