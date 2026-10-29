import { type } from "arktype";
import { primaryRepoState } from "../toolState.ts";
import { apiFetch } from "../utils/apiFetch.ts";
import type { ToolContext } from "./server.ts";
import { execute, tool } from "./shared.ts";

export const SimilarIssues = type({
  issue_number: type.number.describe("The issue number to find older duplicate candidates for"),
});

export function SimilarIssuesTool(ctx: ToolContext) {
  return tool({
    name: "find_similar_issues",
    description:
      "Find high-recall older duplicate candidates for an issue. Similarity is only retrieval: inspect promising candidates with get_issue before deciding whether they are duplicates.",
    mutates: true,
    parameters: SimilarIssues,
    execute: execute(async (input) => {
      // a run with no target adopts the first issue it asks about, keeping on-demand index writes to one
      const repoState = primaryRepoState(ctx.toolState);
      repoState.issueNumber ??= input.issue_number;
      const subject = ctx.payload.event.issue_number ?? repoState.issueNumber;
      if (ctx.payload.event.is_pr || subject !== input.issue_number) {
        throw new Error(`find_similar_issues is limited to this run's issue, #${subject}`);
      }
      const response = await apiFetch({
        path: `/api/repo/${ctx.repo.owner}/${ctx.repo.name}/issues/${input.issue_number}/similar`,
        headers: {
          authorization: `Bearer ${ctx.apiToken}`,
        },
        signal: AbortSignal.timeout(13 * 60_000),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(`similar issue lookup returned ${response.status}: ${message}`);
      }
      return { result: await response.json() };
    }),
  });
}
