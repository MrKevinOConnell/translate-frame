import { DEEPL_API_KEY } from "../env";

interface TranslateTextResponse {
  translatedText: string;
  srcLanguage: string;
}

export async function translate_text(
  inputText: string,
  targetLanguage: string
): Promise<TranslateTextResponse> {
  const url = "https://api-free.deepl.com/v2/translate";
  const body = {
    text: inputText,
    target_lang: targetLanguage,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const { text, detected_source_language } = data.translations[0];

  return {
    translatedText: text,
    srcLanguage: detected_source_language,
  };
}
