const BUILT_IN = new Set(["pullfrog", "pullfrogdev"]);

let runBotLogin = "pullfrog";

/**
 * the App this run operates as, from run-context. set once in `main.ts` before
 * any actor check; a customer-registered App is otherwise invisible to the
 * gates below (auto-merge would not wait on its unresolved threads, and would
 * read its own changes-requested review as a human block).
 */
export function setBotLogin(login: string): void {
  runBotLogin = normalize(login);
}

/**
 * true when a GitHub login belongs to Pullfrog's production or development app,
 * or to the App this run operates as.
 */
export function isPullfrog(actor: string | null | undefined): boolean {
  if (!actor) return false;
  const login = normalize(actor);
  return login === runBotLogin || BUILT_IN.has(login);
}

/** whether `actor` is `botLogin`: GraphQL drops the `[bot]` suffix REST carries. */
export function isBotLogin(actor: string | null | undefined, botLogin: string): boolean {
  return !!actor && normalize(actor) === normalize(botLogin);
}

/** the handles a mention of this run's bot can use; a custom App may have been renamed. */
export function mentionHandles(): string[] {
  return [...new Set(["@pullfrog", `@${runBotLogin}`])];
}

function normalize(login: string): string {
  return login.toLowerCase().replace("[bot]", "");
}
