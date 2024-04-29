import { Button } from "frames.js/next";
import { frames } from "../frames";
import { installUrl } from "../../utils";
import {
  add_or_update_signer_on_supabase,
  get_all_translations_for_hash,
  lookup_fid_signer_on_supabase,
  update_signer_tip,
} from "@/app/supabase";
import {
  generate_signer,
  lookup_neynar_signer,
  neynar_client,
} from "@/app/neynar";
import { APP_MNEMONIC, APP_URL } from "@/app/env";
import { translate_text } from "@/app/helpers/translation";

export const POST = frames(async (ctx) => {
  const hash = ctx.state.hash;
  const cast_fid = ctx.state.fid;
  const opt_in = Boolean(ctx.searchParams.opt_in) ?? false;
  const translator_fid = ctx.message?.requesterFid;
  const target = ctx.state.target;
  let signer_approval_url = null;
  let src_language = null;
  const response = ctx.message?.inputText;

  if (!response) {
    return {
      image: (
        <div tw="flex">No response provided, please go back and enter one.</div>
      ),
      buttons: [
        <Button action="post" target={`/`}>
          Install action
        </Button>,
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
  let signer = await lookup_fid_signer_on_supabase(translator_fid);
  if (signer) {
    if (signer.status === "approved") {
      //look up hash
      const hash_rows = await get_all_translations_for_hash(hash);
      if (hash_rows && hash_rows.length > 0) {
        src_language = hash_rows[0].src_language;
      }
      //if src_language, translate
      if (src_language) {
        const translated_text = await translate_text(response, src_language);
        const cast = await neynar_client.publishCast(
          signer.signer_uuid,
          translated_text.translatedText,
          {
            replyTo: hash,
          }
        );
      }
    }
  }

  return {
    image: (
      <div tw="flex flex-col text-[36px] space-y-4 justify-center items-center">
        <p>{`You responded with ${translate_text}`}</p>
        <p>{`What you inputted: ${response}`}</p>
      </div>
    ),
    buttons: [
      <Button action="post" target={`/`}>
        Install action
      </Button>,
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
        target={`https://warpcast.com/~/compose?embeds[]=${`${APP_URL}/frames/translate?hash=${hash}&fid=${cast_fid}&target=${target}`}`}
      >
        Share Translation
      </Button>,
    ],
  };
});
