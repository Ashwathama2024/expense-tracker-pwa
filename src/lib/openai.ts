import { CATEGORIES, type Category } from "./categories";
import { getOpenAIKey } from "./settings";

// SECURITY TRADEOFF: this is a client-side-only PWA with no backend, so the
// OpenAI API key has to live in the browser to make this call — either typed
// into Settings (stored in localStorage) or baked in at build time via
// NEXT_PUBLIC_OPENAI_API_KEY. Either way it's visible in devtools/network
// requests to anyone with access to this device. Acceptable for a personal,
// single-user tool — do not reuse this pattern for anything multi-user.
const MODEL = "gpt-5-nano";

export interface ParsedReceipt {
  amount: number | null;
  category: Category | null;
  date: string | null;
  note: string | null;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function parseReceiptImage(file: File): Promise<ParsedReceipt> {
  const apiKey = getOpenAIKey() || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No OpenAI API key set. Tap the key icon at the top of the app to add one."
    );
  }

  const dataUrl = await fileToDataUrl(file);
  const today = new Date().toISOString().slice(0, 10);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You extract structured expense data from a photo of a receipt or a payment app screenshot. " +
            `Respond with strict JSON only: {"amount": number|null, "category": one of [${CATEGORIES.join(
              ", "
            )}]|null, "date": "YYYY-MM-DD"|null, "note": string|null}. ` +
            `"note" should be a short merchant or item description (a few words). ` +
            `If a date isn't visible, use null rather than guessing. Today's date is ${today}.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the expense details from this image.",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response had no content.");

  const parsed = JSON.parse(content);
  const category: Category | null = CATEGORIES.includes(parsed.category)
    ? parsed.category
    : null;

  return {
    amount: typeof parsed.amount === "number" ? parsed.amount : null,
    category,
    date: typeof parsed.date === "string" ? parsed.date : null,
    note: typeof parsed.note === "string" ? parsed.note : null,
  };
}
