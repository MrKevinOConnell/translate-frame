import { NextRequest } from "next/server";
import { frames } from "../../frames";
import { APP_URL } from "../../../env";

type ActionMetadata = {
  /** The action name. Must be less than 30 characters. */
  name: string;
  /** An [Octicons](https://primer.style/foundations/icons) icon name. */
  icon: string;
  /** A short description up to 80 characters. */
  description: string;
  /** External link to an "about" page for extended description. */
  aboutUrl: string;
  /** The action type. (Same type options as frame buttons). Only post is accepted in V1. */
  action: {
    type: "post";
  };
};

export const GET = (req: NextRequest) => {
  const target = req.nextUrl.searchParams.get("target") || "EN";

  const languageNames = new Intl.DisplayNames(["EN"], {
    type: "language",
  });

  const languageName = languageNames.of(target);

  const actionMetadata: ActionMetadata = {
    name: `Translate to ${languageName}`,
    icon: "globe",
    description: `Translate cast text to ${languageNames.of(target)}`,
    aboutUrl: APP_URL!,
    action: {
      type: "post",
    },
  };

  return Response.json(actionMetadata);
};

export const POST = frames(async (ctx) => {
  return Response.json({
    type: "frame",
    frameUrl: `${APP_URL}/frames/translate?hash=${
      ctx.message?.castId?.hash
    }&fid=${ctx.message?.castId?.fid}&target=${
      ctx.searchParams.target || "EN"
    }`,
  });
});
