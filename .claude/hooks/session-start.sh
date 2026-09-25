#!/usr/bin/env bash
# SessionStart hook for Claude Code on the web.
#
# Remote sessions run in a fresh container each time, so anything documented as
# a "once per clone" step has to be redone here or it silently does not happen.
set -euo pipefail

# Local clones already have their own git identity and installed deps — only the
# throwaway web containers need this.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

# Git identity: deliberately left alone. Vercel resolves a commit author's
# email to a GitHub account and then requires that account to have access to
# the Vercel project; an author it cannot resolve is not checked at all. In the
# parent repo, setting user.email to the owner's Gmail address blocked every
# deployment until the GitHub account was linked on Vercel's side. Leave the
# container default in place unless that link is known to exist.

# Dependencies, so `pnpm lint`, `pnpm typecheck` and `pnpm build` work without a
# manual install. Plain `install` rather than `--frozen-lockfile` so the
# resolved store is reused when the container image is cached.
pnpm install
