# Contributing to Pullfrog

Thanks for your interest in contributing!

This repo (`pullfrog/pullfrog`) is the open-source GitHub Action that powers Pullfrog. It is a read-only mirror of the action's directory in Pullfrog's private monorepo, and every sync overwrites it, so it does not accept pull requests.

## Reporting a bug or requesting a feature

[Open an issue](https://github.com/pullfrog/pullfrog/issues/new/choose). For a bug, link the failing workflow run if you can. If you've written a fix, describe it in the issue or link the branch on your fork: a maintainer can port it into the monorepo, and it reaches this repo with the next sync.

## Running the action locally

You need Node.js (see `.node-version` for the exact version). The canonical toolchain is [`nub`](https://nubjs.com) (`nub install`, `nub run <script>`); [`pnpm`](https://pnpm.io/) also works against the same `pnpm-lock.yaml`.

```bash
git clone https://github.com/pullfrog/pullfrog.git
cd pullfrog
nub install         # or: pnpm install
nub run typecheck   # or: pnpm typecheck
nub run test        # or: pnpm test
```

The full test suite needs credentials (GitHub App secrets) and some tests are LLM-driven, so a green local run isn't guaranteed without them.

## Questions?

Open an issue or reach out at [team@pullfrog.com](mailto:team@pullfrog.com).
