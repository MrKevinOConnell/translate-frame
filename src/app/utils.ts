import { AMPLITUDE_API, APP_URL } from "./env";
import axios from "axios";

export function constructCastActionUrl(params: { url: string }): string {
  const baseUrl = "https://warpcast.com/~/add-cast-action";
  const urlParams = new URLSearchParams({
    url: params.url,
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

export function installUrl(languageCode: string): string {
  const actionUrl = `${APP_URL!}/frames/actions/translate?target=${languageCode}`;

  return constructCastActionUrl({ url: actionUrl });
}

export async function sendEventToAmplitude(
  user_id: string,
  event_type: string,
  event_properties?: any
) {
  const data = {
    api_key: AMPLITUDE_API,
    events: [
      {
        user_id: user_id,
        event_type,
        event_properties: event_properties ?? {},
      },
    ],
  };

  const addData = await axios.post(
    "https://api2.amplitude.com/2/httpapi",
    data,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }
  );
}
