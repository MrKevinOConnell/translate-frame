import {
  add_translation_to_supabase,
  check_if_hash_translated_language_exists,
} from "@/app/supabase";
import {
  DEEPL_API_KEY,
  HUB_API_URL,
  NEYNAR_API_KEY,
  NEYNAR_SIGNER,
} from "../../env";
import { frames } from "../frames";
import { translate_text } from "@/app/helpers/translation";
import { neynar_client } from "@/app/neynar";

const handler = frames(async (ctx) => {
  const translatorFid = ctx.message?.requesterFid;
  const hash = ctx.searchParams.hash;
  const fid = ctx.searchParams.fid;
  const target = ctx.searchParams.target || "EN";

  if (!hash) {
    return {
      image: <div tw="flex">No cast provided</div>,
    };
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("api_key", NEYNAR_API_KEY || "");

  const castReq = await fetch(
    `${HUB_API_URL}/v1/castById?hash=${hash}&fid=${fid}`,
    {
      headers: headers,
    }
  );

  if (!castReq.ok) {
    const text = await castReq.text();
    return {
      image: <div tw="flex">Error fetching cast: {castReq.status}</div>,
    };
  }

  const {
    data: {
      castAddBody: { text },
    },
  } = await castReq.json();
  let translated_text = "";
  const supabase_translated_text =
    await check_if_hash_translated_language_exists(hash, target);

  if (supabase_translated_text) {
    translated_text = supabase_translated_text.translated_text;
  } else {
    const { srcLanguage, translatedText } = await translate_text(text, target);
    translated_text = translatedText;
    const profile = await neynar_client.fetchBulkUsers([translatorFid as any]);
    const translate_cast_send = `This cast in ${target} is the following: ${translatedText}. Thank you ${profile.users[0].username} for requesting to translate this cast!`;
    const { translatedText: castSendTranslation } = await translate_text(
      translate_cast_send,
      target
    );
    const cast = await neynar_client.publishCast(
      NEYNAR_SIGNER as any,
      castSendTranslation,
      {
        replyTo: hash,
      }
    );
    const row = {
      translated_text: translatedText,
      translated_language: target,
      hash,
      author_fid: fid,
      translator_fid: translatorFid,
      src_text: text,
      src_language: srcLanguage,
      translation_hash: cast.hash,
    };
    add_translation_to_supabase(row);
  }

  return {
    image: <div tw="flex p-10 text-[42px]">{translated_text}</div>,
  };
});

export const GET = handler;
export const POST = handler;
