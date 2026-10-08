#!/usr/bin/env bash
# Run the Chief of Staff agent locally against a local (or Vercel) copy of the site.
#
#   scripts/run-local.sh TEST 630XXXXXXX            # local site, texts that number
#   SITE_URL=https://<vercel-site> scripts/run-local.sh TEST 630XXXXXXX
#
# Needs: the `claude` CLI with Gmail, Calendar, RingCentral, Sales_Database and the
# COS database connected. Missing tools are reported by the agent, as designed.
set -euo pipefail
cd "$(dirname "$0")/.."

RUN="${1:-}"; PHONE="${2:-}"
[[ "$RUN" =~ ^(TEST|MORNING|MIDDAY|EVENING|REFRESH)$ ]] || { echo "Usage: $0 TEST|MORNING|MIDDAY|EVENING|REFRESH [phone]"; exit 2; }
if [[ "$RUN" == "TEST" && -z "$PHONE" ]]; then echo "TEST needs the phone number to text (10 digits)."; exit 2; fi
command -v claude >/dev/null || { echo "The 'claude' CLI is not installed."; exit 2; }

# Load the site's local env (INGEST_SECRET etc.); never printed.
[[ -f .env.local ]] && { set -a; source .env.local; set +a; }
export SITE_URL="${SITE_URL:-http://localhost:3000}"
[[ -n "${INGEST_SECRET:-}" ]] || { echo "INGEST_SECRET is not set (put it in .env.local)."; exit 2; }

# Start the local site if SITE_URL is local and not already answering.
STARTED=""
if [[ "$SITE_URL" == http://localhost:* ]]; then
  PORT="${SITE_URL##*:}"
  if ! curl -s -o /dev/null "$SITE_URL/login"; then
    echo "Starting local site on port $PORT ..."
    npx next dev -p "$PORT" > .local-site.log 2>&1 &
    STARTED=$!
    trap '[[ -n "$STARTED" ]] && kill "$STARTED" 2>/dev/null || true' EXIT
    for _ in $(seq 1 40); do curl -s -o /dev/null "$SITE_URL/login" && break; sleep 1; done
  fi
fi
echo "Site: $SITE_URL"

MSG="$RUN"
[[ -n "$PHONE" ]] && MSG="$RUN. Text only this number: $PHONE"
claude -p "$MSG" --system-prompt "$(cat agent/chief-of-staff.md)"

echo
echo "Open $SITE_URL (password from SITE_PASSWORD) to see the published brief."
