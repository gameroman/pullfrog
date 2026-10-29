import arg from "arg";
import { z } from "zod";
import { configurationApi, resolveTarget } from "./_configuration.ts";

export async function runCli(input: { args: string[]; prog: string; showHelp?: boolean }) {
  const args = arg(
    { "--repo": String, "-R": "--repo", "--help": Boolean, "-h": "--help" },
    { argv: input.args }
  );
  if (input.showHelp || args["--help"] || !args._.length) {
    console.log(`usage: ${input.prog} run PROMPT

start a Pullfrog run, like the console's prompt box, and print its URL.
name the issue or pull request in the prompt:

  ${input.prog} run "enrich issue #42"
  gh issue list --json number --jq '.[].number' | xargs -I{} ${input.prog} run "enrich issue #{}"

  --repo, -R OWNER/REPO   select a repository (default: GitHub origin)`);
    return;
  }
  if (args._.length > 1) throw new Error("quote the prompt as one argument");
  const target = resolveTarget({ org: undefined, repo: args["--repo"] });
  const data = await configurationApi({
    target,
    path: "run",
    method: "POST",
    body: { prompt: args._[0] },
  });
  console.log(z.object({ url: z.string() }).parse(data).url);
}
