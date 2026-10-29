/**
 * emits a JSON array of { slug, agent, name } entries for one of two CI matrix
 * jobs. `agent` mirrors the harness the runtime would pick in production
 * (anthropic/* → claude, everything else → opencode).
 *
 * MODE=aliases (default) — every alias. consumed by `models-live`, which runs
 *   the cheap top-level CLI smoke per alias (`action/test/model-smoke.ts`) to
 *   validate resolution + auth.
 *
 * MODE=flagships — one standard-tier model per provider. consumed by
 *   `providers-live`, which runs the full harness smoke
 *   (`pnpm runtest smoke <agent>`) to validate provider-class tool-calling
 *   (e.g. Gemini schema sanitizer, OpenAI tool-call format). flagship slugs
 *   live in `providers.ts`.
 *
 * Every keyed alias on a direct route is smoked. A mirrored id can drift from
 * its upstream (testing the direct google entry says nothing about whether the
 * openrouter mirror has the same model id), but `test:catalog` checks each
 * mirrored id against the route's own published list with no LLM call, so a
 * `flagshipOnly` mirror (`openrouter/*`, `vercel/*`) is smoked through its
 * flagship alone. Also pruned: routing slugs (bedrock/byok) whose `resolve` is
 * a sentinel that picks the actual model id from a per-run env var, and
 * whatever `isExcluded` rejects — a provider CI holds no key for, or a metered
 * model on one we decline to pay for.
 *
 * usage:
 *   node action/test/list-aliases.ts
 *   MODE=flagships node action/test/list-aliases.ts
 *
 * NOTE: the CI matrix (with MATRIX_FILTER scoping) lives in `matrix.ts`,
 * which calls into this file. raw invocation here emits the full list.
 */
import { modelAliases } from "../models.ts";
import { providers } from "./providers.ts";

export type MatrixEntry = {
  slug: string;
  agent: string;
  name: string;
};

function toMatrixEntry(alias: (typeof modelAliases)[number]): MatrixEntry {
  return {
    slug: alias.slug,
    agent: alias.slug.startsWith("anthropic/") ? "claude" : "opencode",
    // readable display name (GHA renders slashes awkwardly in matrix job titles)
    name: alias.slug.replace("/", "-"),
  };
}

const aliasBySlug = new Map(modelAliases.map((a) => [a.slug, a]));

/** providers CI holds no credential for — see `ProviderEntry.noCiCredential`. */
const uncredentialedProviders = new Set(
  providers.filter((p) => p.noCiCredential).map((p) => p.name)
);

/** providers whose metered models CI declines to pay for — see `ciCostExcluded`. */
const costExcludedProviders = new Set(providers.filter((p) => p.ciCostExcluded).map((p) => p.name));

/** mirror routes smoked through their flagship alone — see `flagshipOnly`. */
const flagshipOnlyProviders = new Set(providers.filter((p) => p.flagshipOnly).map((p) => p.name));

/**
 * A cost exclusion spares the provider's free models: they bill nothing, they
 * keep working after the balance runs dry (all 4 free Zen aliases passed the
 * 2026-09-10 nightly while all 39 metered ones failed on `Insufficient
 * balance`), and they are the only live coverage of tiers no other provider
 * mirrors. A missing credential spares nothing, because nothing can run.
 */
function isExcluded(alias: (typeof modelAliases)[number]): boolean {
  if (uncredentialedProviders.has(alias.provider)) return true;
  return costExcludedProviders.has(alias.provider) && !alias.isFree;
}

export function buildAliasMatrix(): MatrixEntry[] {
  return modelAliases
    .filter((alias) => {
      // routing slugs (bedrock/byok) need a per-run env var to pick the actual
      // model — there's no generic smoke test.
      if (alias.routing) return false;
      // no key in CI, or a metered model on a provider we decline to pay for.
      if (isExcluded(alias)) return false;
      return !flagshipOnlyProviders.has(alias.provider) || alias.isFree;
    })
    .map(toMatrixEntry);
}

export function buildFlagshipMatrix(): MatrixEntry[] {
  return providers
    .filter((p) => !p.noCiCredential)
    .map((p) => {
      const alias = aliasBySlug.get(p.flagship);
      if (!alias) {
        throw new Error(
          `list-aliases: flagship "${p.flagship}" missing from modelAliases — update providers.ts`
        );
      }
      return alias;
    })
    .filter((alias) => !isExcluded(alias))
    .map(toMatrixEntry);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.env.MODE === "flagships" ? "flagships" : "aliases";
  const matrix = mode === "flagships" ? buildFlagshipMatrix() : buildAliasMatrix();
  process.stdout.write(JSON.stringify(matrix));
}
