const OPENAI_KEY_STORAGE = "expense-tracker-openai-key";

export function getOpenAIKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(OPENAI_KEY_STORAGE) ?? "";
}

export function setOpenAIKey(key: string) {
  if (key.trim()) {
    localStorage.setItem(OPENAI_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(OPENAI_KEY_STORAGE);
  }
}
