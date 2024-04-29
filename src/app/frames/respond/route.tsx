import { Button } from "frames.js/next";
import { frames } from "../frames";
import {
  add_translation_to_supabase,
  get_src_language_for_hash,
  lookup_fid_signer_on_supabase,
} from "@/app/supabase";
import { neynar_client } from "@/app/neynar";
import { APP_URL } from "@/app/env";
import { translate_text } from "@/app/helpers/translation";

export const POST = frames(async (ctx: any) => {
  if (!ctx.message.isValid) {
    throw new Error("Invalid Frame");
  }
  const hash = ctx.state.hash;
  const cast_fid = ctx.state.fid;
  const author_fid = ctx.message?.requesterFid;
  const target = ctx.state.target;
  const profile_info = await neynar_client.fetchBulkUsers([author_fid]);
  let src_language = null;
  const response = ctx.message?.inputText;
  let translatedText = null;
  let cast_info = null;

  if (!response) {
    return {
      image: (
        <div tw="flex">No response provided, please go back and enter one.</div>
      ),
      buttons: [
        <Button
          action="post"
          target={`/translate?hash=${hash}&fid=${cast_fid}&target=${target}`}
        >
          ← Back to cast
        </Button>,
      ],
    };
  }

  //lookup signer
  let signer = await lookup_fid_signer_on_supabase(author_fid as any);
  if (signer) {
    if (signer.status === "approved") {
      const hash_rows = await get_src_language_for_hash(hash);
      if (hash_rows && hash_rows.length > 0) {
        src_language = hash_rows[0].src_language;
      }
      //if src_language, translate
      if (src_language) {
        const translated_text = await translate_text(response, src_language);
        translatedText = translated_text.translatedText;
        const cast = await neynar_client.publishCast(
          signer.signer_uuid,
          `${translated_text.translatedText}`,
          {
            replyTo: hash,
          }
        );
        cast_info = cast;
        //add to supabase
        const row = {
          translated_text: translated_text.translatedText,
          translated_language: target,
          hash: cast.hash,
          author_fid: cast.author.fid,
          translator_fid: cast.author.fid,
          src_text: response,
          src_language: translated_text.srcLanguage,
        };
        add_translation_to_supabase(row);
      }
    }
  }

  return {
    image: (
      <div tw="flex flex-col text-[36px] space-y-4 justify-center items-center">
        <p>{`You responded with ${translatedText}`}</p>
        <p>{`What you inputted: ${response}`}</p>
      </div>
    ),
    buttons: [
      hash && cast_fid && target ? (
        <Button
          action="post"
          target={`/translate?hash=${hash}&fid=${cast_fid}&target=${target}`}
        >
          ← Back to original cast
        </Button>
      ) : null,
      <Button
        action="link"
        target={`https://warpcast.com/~/compose?embeds[]=${`${APP_URL}/frames`}`}
      >
        Share
      </Button>,
      <Button
        action="link"
        target={`https://warpcast.com/${profile_info.users[0].username}/${cast_info?.hash}`}
      >
        View cast
      </Button>,
    ],
  };
});
