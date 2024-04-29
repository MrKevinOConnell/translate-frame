import { Button } from "frames.js/next";
import { frames } from "../frames";
import { installUrl } from "../../utils";

export const POST = frames(async (ctx) => {
  const language = ctx.message?.inputText;

  if (!language) {
    return {
      textInput: "Search a language code e.g. 'EN'",
      image: <div tw="flex">No language provided</div>,
      buttons: [
        <Button action="post" target={"/search"}>
          🔎 Search
        </Button>,
        <Button action="post" target={"/"}>
          ← Back
        </Button>,
      ],
    };
  }

  let languageCode = language.slice(0, 2);
  const languageNames = new Intl.DisplayNames(["EN"], {
    type: "language",
  });
  const languageName = languageNames.of(languageCode);

  if (!languageName) {
    return {
      textInput: "Search a language code e.g. 'EN'",
      image: <div tw="flex">Language '{languageCode}' not found</div>,
      buttons: [
        <Button action="post" target={"/search"}>
          🔎 Search
        </Button>,
        <Button action="post" target={"/"}>
          ← Back
        </Button>,
      ],
    };
  }

  return {
    image: (
      <div tw="flex text-[36px]">
        Install action for {languageNames.of(languageCode)}
      </div>
    ),
    textInput: "Search a language code e.g. 'EN'",
    buttons: [
      <Button action="post" target={"/search"}>
        🔎 Search
      </Button>,
      <Button action="link" target={installUrl(languageCode)}>
        {`Install ${languageName}`}
      </Button>,
      <Button action="post" target={"/"}>
        ← Back
      </Button>,
    ],
  };
});
