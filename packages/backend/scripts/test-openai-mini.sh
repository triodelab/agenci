#!/usr/bin/env bash
# Lokal test av OpenAI API + modellen gpt-4o-mini (samme som i Convex-koden).
# Krever: curl, jq. Leser OPENAI_API_KEY fra packages/backend/.env.local
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
ENV_FILE="${ROOT}/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Mangler ${ENV_FILE}. Kopier fra .env.example og legg inn nøkler."
  exit 1
fi
# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY er ikke satt i .env.local."
  echo "Legg til en linje: OPENAI_API_KEY=sk-..."
  echo "Synk til Convex med: npx convex env set OPENAI_API_KEY 'sk-...'"
  exit 1
fi
RESP="$(curl -sS https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Reply with exactly one word: pong"}],"max_tokens":24}')"
ERR="$(echo "$RESP" | jq -r '.error.message // empty')"
if [[ -n "$ERR" ]]; then
  echo "OpenAI-feil: $ERR"
  exit 1
fi
TEXT="$(echo "$RESP" | jq -r '.choices[0].message.content // empty')"
echo "gpt-4o-mini svar: ${TEXT}"
echo "OK — nøkkel og mini-modell fungerer mot API-et."
echo "Husk: sett samme nøkkel på deployment: npx convex env set OPENAI_API_KEY '...'"
