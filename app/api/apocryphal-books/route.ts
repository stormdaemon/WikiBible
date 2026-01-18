import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createPublicClient } = await import('@/utils/supabase/server');
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from('apocryphal_books')
      .select('*')
      .order('name_fr');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, books: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
