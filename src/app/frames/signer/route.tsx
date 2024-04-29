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

export const POST = frames(async (ctx: any) => {
  if (!ctx.message.isValid) {
    throw new Error("Invalid Frame");
  }
  const { state, searchParams, message } = ctx;
  const { hash, fid, target } = state;
  const opt_in = Boolean(searchParams.opt_in);
  const translator_fid = message?.requesterFid as number;

  let signer_approval_url = null;
  let signer = await lookup_fid_signer_on_supabase(translator_fid);
  if (signer && signer.status !== "approved") {
    signer = await lookup_neynar_signer(signer.signer_uuid);
    if (signer.status === "approved") {
      await add_or_update_signer_on_supabase({
        ...signer,
        fid: translator_fid,
      });
    }
    signer_approval_url = signer.signer_approval_url;
  } else if (!signer) {
    signer = await generate_signer(translator_fid);
    signer_approval_url = signer?.signer_approval_url;
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
      hash && fid && target ? (
        <Button
          action="post"
          target={`/translate?hash=${hash}&fid=${fid}&target=${target}`}
        >
          ← Back to cast
        </Button>
      ) : null,
      signer && signer.status !== "approved" ? (
        <Button action="post" target={"/signer"}>
          Refresh
        </Button>
      ) : null,
    ],
  };
});
