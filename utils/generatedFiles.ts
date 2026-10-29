/**
 * files whose hunks carry nothing a reviewer weighs — lockfiles, minified and
 * generated output, snapshots, images and fonts, built trees, migration
 * metadata. the router's scorer reads a one-line stub in their place and its
 * heuristic skips their lines; a review's diff keeps them but leaves them off
 * its coverage checklist. `build/` and `vendor/` are deliberately not here: the
 * router eval set has source under both (`src/build/expo-brand.ts`, a vendored
 * crate patched in the PR), and hiding a patch is worse than reading a copy.
 */
export const GENERATED =
  /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|Cargo\.lock|go\.sum|poetry\.lock|Pipfile\.lock|Gemfile\.lock|composer\.lock|.*\.snap|.*\.min\.(js|css)|.*\.map|.*\.lock|.*\.(pb\.go|_pb2\.py|g\.dart)|.*\.(generated|gen)\.[^/]+|.*\.(svg|png|jpe?g|gif|ico|webp|woff2?|ttf|pdf))$|(^|\/)(dist|generated|__generated__|node_modules|\.yarn|__snapshots__|coverage|\.next|\.turbo|drizzle\/meta)\//i;
