#!/usr/bin/env bash
# Runs SQL against the linked project via the Management API.
# Usage: bash scripts/sql.sh "select 1"   or   bash scripts/sql.sh -f file.sql
# The request body goes through a UTF-8 temp file (command-line args on Windows are not UTF-8 safe).
set -euo pipefail
cd "$(dirname "$0")/.."
T="$(grep -m1 -oE 'sbp_[A-Za-z0-9]+' .secret)"
R="$(grep -E '^SUPABASE_PROJECT_REF=' .env.local | cut -d= -f2- | tr -d '"\r')"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
if [ "$1" = "-f" ]; then
  node -e 'const fs=require("fs");fs.writeFileSync(process.argv[2],JSON.stringify({query:fs.readFileSync(process.argv[1],"utf8")}))' "$2" "$TMP"
else
  Q="$1" node -e 'require("fs").writeFileSync(process.argv[1],JSON.stringify({query:process.env.Q}))' "$TMP"
fi
curl -s "https://api.supabase.com/v1/projects/$R/database/query" \
  -H "Authorization: Bearer $T" -H "Content-Type: application/json; charset=utf-8" --data-binary "@$TMP"
echo
