export type FailureLink = { label: string; url: string };

/**
 * The one shape every failure comment takes: a bold, sentence-case headline that
 * names the cause, then at most a short paragraph or a list of two or more, then
 * the error or the tool's own output, then at most two links. Built here rather
 * than per message so those rules hold for every message at once.
 *
 * `error` is shown open, for when the error IS the explanation (an unrecognized
 * failure). `details` is collapsed, for output that backs up a headline we
 * already wrote. Free of imports: `billingErrors.ts` reaches client bundles
 * through `action/internal`.
 */
export function renderFailure(params: {
  headline: string;
  detail?: string | undefined;
  list?: [string, string, ...string[]] | undefined;
  error?: string | undefined;
  details?: { summary: string; text: string } | undefined;
  links?: [] | [FailureLink] | [FailureLink, FailureLink] | undefined;
}): string {
  const blocks = [
    params.detail ? `**${params.headline}** ${params.detail}` : `**${params.headline}**`,
  ];
  if (params.list) blocks.push(params.list.map((item) => `- ${item}`).join("\n"));
  if (params.error) blocks.push(fenced(params.error));
  if (params.details) {
    blocks.push(
      `<details><summary>${params.details.summary}</summary>\n\n${fenced(params.details.text)}\n\n</details>`
    );
  }
  if (params.links?.length) {
    blocks.push(params.links.map((link) => `[${link.label} →](${link.url})`).join(" · "));
  }
  return blocks.join("\n\n");
}

/** a fence longer than any backtick run inside, so quoted output cannot close it early. */
function fenced(text: string): string {
  let longest = 0;
  for (const match of text.matchAll(/`+/g)) longest = Math.max(longest, match[0].length);
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}\n${text}\n${fence}`;
}

export const DISCORD_LINK: FailureLink = {
  label: "Ask in Discord",
  url: "https://discord.gg/8y96raFg8e",
};
