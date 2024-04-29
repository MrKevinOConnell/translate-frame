// Import the required functions from the supabase-js library
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string);

// Function to check if any row exists based on a flexible filter
export async function check_if_hash_translated_language_exists(
  hash: string,
  translated_language: string
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("translated_language, translated_text")
      .eq("hash", hash)
      .eq("translated_language", translated_language);

    console.log("Matching row(s) found:", data);
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    // Check the result and print appropriate message
    if (data.length === 0) {
      console.log("No matching row exists.");
      return null;
    } else {
      console.log("Matching row(s) found:", data);
      const row = data[0];
      return row;
    }
  } catch (err) {
    return null;
    console.error("Unexpected error:", err);
  }
}

export async function get_all_translations_for_hash(hash: string) {
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .eq("hash", hash);

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    return data;
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

export async function add_translation_to_supabase(row: any) {
  try {
    const { data, error } = await supabase.from("translations").insert([row]);
    if (error) {
      console.error("Error inserting data:", error);
      return;
    }
    return data;
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

export async function lookup_fid_signer_on_supabase(
  fid: number | undefined
): Promise<any> {
  if (!fid) return null;
  const { data, error } = await supabase
    .from("*")
    .select("signer")
    .eq("fid", fid);

  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }
  if (data.length === 0) {
    console.log("No matching row exists.");
    return null;
  }
  const row = data[0];
  return row;
}

export async function add_or_update_signer_on_supabase(signer: any) {
  try {
    const { data, error } = await supabase.from("signers").upsert([signer]);
    if (error) {
      console.error("Error inserting data:", error);
      return;
    }
    return data;
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

export async function update_signer_tip(
  signer_uuid: string,
  tip_opt_in: boolean
) {
  try {
    const { data, error } = await supabase
      .from("signers")
      .update({ tip_opt_in })
      .eq("signer_uuid", signer_uuid);
    return data;
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}