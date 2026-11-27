export interface InlineToken {
  code: boolean;
  text: string;
}

export function splitInlineCode(value: string | null | undefined): InlineToken[] {
  const raw = String(value ?? '');
  if (!raw) return [];
  const parts = raw.split(/(`[^`]+`)/g);
  const tokens: InlineToken[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
      tokens.push({ code: true, text: part.slice(1, -1) });
    } else {
      tokens.push({ code: false, text: part });
    }
  }
  return tokens;
}
