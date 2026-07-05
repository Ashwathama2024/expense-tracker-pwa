import { CATEGORIES, type Category } from "./categories";
import { getOpenAIKey } from "./settings";
import { fileToImageDataUrl } from "./pdf";

// SECURITY TRADEOFF: this is a client-side-only PWA with no backend, so the
// OpenAI API key has to live in the browser to make this call — either typed
// into Settings (stored in localStorage) or baked in at build time via
// NEXT_PUBLIC_OPENAI_API_KEY. Either way it's visible in devtools/network
// requests to anyone with access to this device. Acceptable for a personal,
// single-user tool — do not reuse this pattern for anything multi-user.
const MODEL = "gpt-5-nano";

export interface ParsedTransaction {
  amount: number | null;
  category: Category | null;
  date: string | null;
  note: string | null;
}

export async function parseReceiptTransactions(
  file: File
): Promise<ParsedTransaction[]> {
  const apiKey = getOpenAIKey() || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No OpenAI API key set. Tap the key icon at the top of the app to add one."
    );
  }

  const dataUrl = await fileToImageDataUrl(file);
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
            "You extract structured expense data from a photo of a receipt, an invoice, or a payment " +
            "app screenshot (e.g. Google Pay / UPI). The image may show a SINGLE purchase or a LIST of " +
            "several separate transactions (e.g. a payment history/statement screen) — find every " +
            "distinct transaction visible and return one entry per transaction, oldest or top-of-screen " +
            "first. " +
            `Respond with strict JSON only: {"transactions": [{"amount": number|null, "category": one of [${CATEGORIES.join(
              ", "
            )}]|null, "date": "YYYY-MM-DD"|null, "note": string|null}, ...]}. ` +
            `"note" should be a short merchant or payee name (a few words). ` +
            `If a date isn't visible for an entry, use null rather than guessing. Today's date is ${today}. ` +
            `If you can't find any transaction, return {"transactions": []}.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract every expense transaction from this image.",
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
  const rows: unknown[] = Array.isArray(parsed.transactions) ? parsed.transactions : [];

  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    const category: Category | null = CATEGORIES.includes(r.category as Category)
      ? (r.category as Category)
      : null;
    return {
      amount: typeof r.amount === "number" ? r.amount : null,
      category,
      date: typeof r.date === "string" ? r.date : null,
      note: typeof r.note === "string" ? r.note : null,
    };
  });
}
