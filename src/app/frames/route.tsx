import { Button } from "frames.js/next";
import { frames } from "./frames";
import { installUrl } from "../utils";

const handler = frames(async (ctx) => {
  const installEnglish = installUrl("EN");
  const installChinese = installUrl("ZH");
  const installKorean = installUrl("KO");

  return {
    image: (
      <div tw="flex flex-col">
        <div tw="text-[52px] mb-4">Farcaster Translator!</div>
        <div tw="text-[36px]">
          Install language or search for language code e.g. 'en' for English
        </div>
      </div>
    ),
    textInput: "Search a language code e.g. 'EN'",
    buttons: [
      <Button action="post" target={"/search"}>
        🔎 Search
      </Button>,
      <Button action="link" target={installEnglish}>
        🇬🇧EN
      </Button>,
      <Button action="link" target={installChinese}>
        🇨🇳CN
      </Button>,
      <Button action="link" target={installKorean}>
        🇰🇷KO
      </Button>,
    ],
  };
});

export const POST = handler;
export const GET = handler;
