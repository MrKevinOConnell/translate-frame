import { Button } from "frames.js/next";
import { frames } from "../frames";
import { installUrl } from "../../utils";
import {
  add_or_update_signer_on_supabase,
  lookup_fid_signer_on_supabase,
  update_signer_tip,
} from "@/app/supabase";
import {
  generate_signer,
  lookup_neynar_signer,
  neynar_client,
} from "@/app/neynar";
import { APP_MNEMONIC } from "@/app/env";

export const POST = frames(async (ctx) => {
  const currentState = ctx.state;
  const hash = ctx.state.hash;
  const cast_fid = ctx.state.fid;
  const opt_in = Boolean(ctx.searchParams.opt_in) ?? false;
  const translator_fid = ctx.message?.requesterFid;
  const target = ctx.state.target;
  let signer_approval_url = null;

  //lookup signer
  let signer = await lookup_fid_signer_on_supabase(translator_fid);
  if (signer) {
    if (signer.status !== "approved") {
      //lookup
      let old_status = signer.status;
      signer = await lookup_neynar_signer(signer.signer_uuid);
      //check if signer status is different
      if (signer.status !== old_status) {
        await add_or_update_signer_on_supabase({
          ...signer,
          fid: translator_fid,
        });
      }
      signer_approval_url = signer.signer_approval_url;
    }
  } else {
    signer = await generate_signer(translator_fid);
    if (signer) {
      signer_approval_url = signer.signer_approval_url;
    }
  }

  return {
    image: (
      <div tw="flex flex-col text-[36px] space-y-4 justify-center items-center">
        <p>Approve a signer!</p>
        <p>
          This lets you respond to casts in other languages. Optionally you can
          tip 5% of your DEGEN allowance or 500 DEGEN every two weeks.
        </p>
      </div>
    ),
    buttons: [
      <Button action="post" target={`/`}>
        Install action
      </Button>,
      signer && signer.status !== "approved" ? (
        <Button action="link" target={signer_approval_url}>
          Approve signer
        </Button>
      ) : (
        <Button
          action="post"
          target={`/signer?opt_in=${opt_in ? "false" : "true"}`}
        >
          {opt_in
            ? "Optionally tip 5% of allowance or 500 DEGEN every two weeks."
            : "Opt out of tipping"}
        </Button>
      ),
      hash && cast_fid && target ? (
        <Button
          action="post"
          target={`/translate?hash=${hash}&fid=${cast_fid}&target=${target}`}
        >
          ← Back to cast
        </Button>
      ) : null,
    ],
  };
});
