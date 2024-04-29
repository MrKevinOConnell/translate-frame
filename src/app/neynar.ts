import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NEYNAR_API_KEY } from "./env";

export const neynar_client = new NeynarAPIClient(NEYNAR_API_KEY as string);
