import { clean_translated_text_rows } from "@/app/helpers/api_filtration";
import { get_all_translations_for_hash } from "@/app/supabase";
import { NextRequest, NextResponse } from "next/server";
export const revalidate = 60 * 30;
export const maxDuration = 60;

export async function GET(_: NextRequest, {}) {
  const url = new URL(_.nextUrl);
  const { searchParams } = url;
  const hash = searchParams.get("hash");
  if (!hash) {
    return NextResponse.json({ result: [] }, { status: 400 });
  }
  try {
    const result = await get_all_translations_for_hash(hash);
    const translations = await clean_translated_text_rows(result);
    return NextResponse.json({ translations });
  } catch (error) {
    return NextResponse.json({ translations: [] }, { status: 500 });
  }
}
