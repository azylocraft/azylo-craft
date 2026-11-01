#!/usr/bin/env bash
# Runs the Supabase CLI with credentials loaded from .secret / .env.local
# (never echoed). Usage: bash scripts/sb.sh <supabase args…>
set -euo pipefail
cd "$(dirname "$0")/.."
SUPABASE_ACCESS_TOKEN="$(grep -m1 -oE 'sbp_[A-Za-z0-9]+' .secret)"
export SUPABASE_ACCESS_TOKEN
SUPABASE_DB_PASSWORD="$(grep -E '^SUPABASE_DB_PASSWORD=' .env.local | cut -d= -f2- | tr -d '"\r')"
export SUPABASE_DB_PASSWORD
export SUPABASE_PROJECT_REF="$(grep -E '^SUPABASE_PROJECT_REF=' .env.local | cut -d= -f2- | tr -d '"\r')"
exec npx --yes supabase@latest "$@"
