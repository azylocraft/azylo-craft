/**
 * Turns plain text pasted into the admin (e.g. copied from a web page or document) into the
 * Markdown the storefront renders. Heuristics, line by line:
 *  - "Title Case Line" on its own              → ## heading
 *  - "Sentence case label" directly over text   → bold label with the text below it
 *  - "Label: value"                             → **Label:** value (kept as tight lines)
 *  - two or more short lines in a row           → bullet list
 * Text that already contains Markdown (#, -, *, >, 1.) is left as it is.
 */

const SHORT = 60;
const MINOR = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "vs", "with", "your", "is", "it"]);

const isMarkdown = (l: string) => /^(#{1,6}\s|[-*+]\s|>\s?|\d+\.\s|\*\*)/.test(l);
const endsSentence = (l: string) => /[.!?:;,]$/.test(l);
const isLabel = (l: string) => /^[^:.]{2,40}:\s+\S/.test(l) && !/^https?:/i.test(l);
const isShort = (l: string) => l.length <= SHORT && !endsSentence(l) && !isLabel(l);

function isTitleCase(l: string) {
  const words = l.replace(/[—–&/-]/g, " ").split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  const caps = words.filter((w, i) => /^[A-Z0-9]/.test(w) || (i > 0 && MINOR.has(w.toLowerCase())));
  return caps.length === words.length;
}

export function plainToMarkdown(input: string, opts: { dropTitle?: string } = {}): string {
  const lines = input.replace(/\r\n?/g, "\n").split("\n").map((l) => l.trim());
  if (opts.dropTitle && lines[0]?.toLowerCase() === opts.dropTitle.toLowerCase()) lines.shift();

  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) {
      if (out.length && out[out.length - 1] !== "") out.push("");
      continue;
    }
    if (isMarkdown(l)) {
      out.push(l);
      continue;
    }
    // "One Sofa. More Ways to Use Your Space." — a short title-case line above a paragraph is a heading.
    if (endsSentence(l) && !isLabel(l) && l.length <= SHORT && isTitleCase(l) && !lines[i - 1] && lines[i + 1] && !isShort(lines[i + 1])) {
      out.push(`## ${l}`, "");
      continue;
    }
    if (isLabel(l)) {
      const [label, ...rest] = l.split(":");
      const value = rest.join(":").trim();
      const line = `**${label.trim()}:** ${value}`;
      // A lone long "Label: sentence" becomes a highlighted callout.
      const alone = !isLabel(lines[i - 1] ?? "") && !isLabel(lines[i + 1] ?? "");
      if (alone && value.length > 70) {
        if (out.length && out[out.length - 1] !== "") out.push("");
        out.push(`> ${line}`, "");
      }
      else out.push(isLabel(lines[i + 1] ?? "") ? `${line}  ` : line);
      continue;
    }
    if (isShort(l)) {
      // Run of short lines → bullets (unless it is a heading followed by a paragraph).
      let j = i;
      while (j < lines.length && lines[j] && isShort(lines[j])) j++;
      // If text follows the run directly, its last line is a heading/label for that text, not a bullet.
      if (lines[j] && j - i >= 2 && (isTitleCase(lines[j - 1]) || j - i === 2)) j--;
      if (j - i >= 2) {
        if (out.length && out[out.length - 1] !== "") out.push("");
        for (let k = i; k < j; k++) out.push(`- ${lines[k]}`);
        out.push("");
        i = j - 1;
        continue;
      }
      if (out.length && out[out.length - 1] !== "") out.push("");
      if (isTitleCase(l) || !lines[i + 1]) out.push(`## ${l}`, "");
      else out.push(`**${l}**  `);
      continue;
    }
    out.push(l);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
