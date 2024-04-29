import {
  add_translation_to_supabase,
  check_if_hash_translated_language_exists,
  lookup_fid_signer_on_supabase,
} from "@/app/supabase";
import { Button } from "frames.js/next";
import {
  APP_URL,
  DEEPL_API_KEY,
  HUB_API_URL,
  NEYNAR_API_KEY,
  NEYNAR_BOT_SIGNER,
} from "../../env";
import { frames } from "../frames";
import { translate_text } from "@/app/helpers/translation";
import { neynar_client } from "@/app/neynar";

const handler = frames(async (ctx) => {
  const translatorFid = ctx.message?.requesterFid;
  const hash = ctx.searchParams.hash;
  const fid = ctx.searchParams.fid;
  const target = ctx.searchParams.target ?? "EN";
  const currentState = ctx.state;
  const updatedState = {
    ...currentState,
    hash: hash,
    fid,
    target,
  };
  if (!hash) {
    return {
      image: <div tw="flex">No cast provided</div>,
    };
  }

  if (!fid || !target) {
    return {
      image: <div tw="flex">No cast author fid provided</div>,
      buttons: [
        <Button action="post" target={"/"}>
          Install action
        </Button>,
      ],
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
  let src_language = "";
  const [supabase_translated_text, signer] = await Promise.all([
    await check_if_hash_translated_language_exists(hash, target),
    await lookup_fid_signer_on_supabase(translatorFid),
  ]);

  if (supabase_translated_text) {
    translated_text = supabase_translated_text.translated_text;
    src_language = supabase_translated_text.src_language;
  } else {
    const { srcLanguage, translatedText } = await translate_text(text, target);
    translated_text = translatedText;
    src_language = srcLanguage;
    const profile = await neynar_client.fetchBulkUsers([translatorFid as any]);
    const translate_cast_send = `This cast in ${target} is the following: ${translatedText}. Requested by ${
      profile.users[0].username
    }:\n\n   ${APP_URL!}/frames/translate?hash=${hash}&fid=${fid}`;
    const { translatedText: castSendTranslation } = await translate_text(
      translate_cast_send,
      target
    );
    const cast = await neynar_client.publishCast(
      NEYNAR_BOT_SIGNER as any,
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
    };
    add_translation_to_supabase(row);
  }

  return {
    textInput: signer ? `Respond in ${src_language}!` : undefined,
    image: (
      <div tw="flex p-10 text-[42px]">
        <p>Here is your translation: {translated_text}</p>
      </div>
    ),
    buttons: [
      <Button action="post" target={`/`}>
        Install action
      </Button>,
      signer && signer.status === "approved" ? (
        <Button action="post" target={`/respond?hash=${hash}`}>
          Respond
        </Button>
      ) : (
        <Button action="post" target={"/signer"}>
          Make a signer!
        </Button>
      ),
      <Button
        action="link"
        target={`https://warpcast.com/~/compose?embeds[]=${`${APP_URL}/frames/translate?hash=${hash}&fid=${fid}&target=${target}`}`}
      >
        Share
      </Button>,
    ],
  };
});

export const GET = handler;
export const POST = handler;
