import { neynar_client } from "../neynar";

export const clean_translated_text_rows = async (unclean_rows: any) => {
  if (!unclean_rows) return;
  const author_fid = unclean_rows[0].author_fid;
  const src_language = unclean_rows[0].src_language;

  const cleaned_translated_fids: Map<string, number> = unclean_rows
    .map((row: any) => {
      return {
        fid: row.translator_fid,
        language: row.translated_language,
      };
    })
    .filter((translated_row: any) => translated_row.fid !== author_fid)
    .reduce((acc: Map<string, number>, row: any) => {
      acc.set(row.language, row.fid);
      return acc;
    }, new Map<string, number>());
  cleaned_translated_fids.set(src_language, author_fid);
  const unique_fids: number[] = Array.from(cleaned_translated_fids.values());
  const profiles = await neynar_client.fetchBulkUsers(unique_fids);
  const cleaned_rows = unclean_rows.map((row: any) => {
    const { translated_text, translator_fid, created_at } = row;
    const translator = profiles.users.find(
      (profile: any) => profile.fid === translator_fid
    );
    return {
      translated_text,
      translator,
      created_at,
    };
  });
  const author = profiles.users.find(
    (profile: any) => profile.fid === author_fid
  );
  return { author, src_language, translations: cleaned_rows };
};
