import { createFrames } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";
import { HUB_API_URL, NEYNAR_API_KEY } from "../env";

export type State = {
  hash: string;
  fid: number;
  target: string;
};

export const frames = createFrames({
  basePath: "/frames",
  initialState: {
    hash: "",
    fid: 0,
    target: "",
  },
  middleware: [
    farcasterHubContext({
      hubHttpUrl: HUB_API_URL,
      hubRequestOptions: {
        headers: {
          api_key: NEYNAR_API_KEY ?? "",
        },
      },
    }),
  ],
});
