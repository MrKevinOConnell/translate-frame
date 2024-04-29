import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { APP_MNEMONIC, NEYNAR_API_KEY } from "./env";
import { add_or_update_signer_on_supabase } from "./supabase";

export const neynar_client = new NeynarAPIClient(NEYNAR_API_KEY as string);

export const generate_signer = async (fid: any) => {
  //make a deadline a year from now in a number timestamp
  const deadlineDate = new Date();
  deadlineDate.setFullYear(deadlineDate.getFullYear() + 1);
  //make deadline a number
  const deadline = deadlineDate.getTime();
  const signer = await neynar_client.createSignerAndRegisterSignedKey(
    APP_MNEMONIC as string,
    {
      deadline,
    }
  );
  if (signer) {
    await add_or_update_signer_on_supabase({ ...signer, fid });
  }
  return signer;
};

export const lookup_neynar_signer = async (signer_uuid: string) => {
  const signer = await neynar_client.lookupSigner(signer_uuid);
  return signer;
};
