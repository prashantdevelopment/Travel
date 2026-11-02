#!/bin/bash
# Full regression, ONE part at a time, on test port 3100 (the user's dev server keeps 3000).
#   nohup bash tests/e2e/regress.sh > regress.log 2>&1 &   then: grep FINISHED regress.log
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export E2E_APP_PORT=3100
export ADMIN_TOKEN=

fails=0
# run <name> <command...>: prints the summary lines, counts a failure on a non-zero exit.
run() {
  local name=$1; shift
  echo; echo "== $name"
  out=$(cd "$ROOT" && "$@" 2>&1); code=$?
  echo "$out" | grep -E "^# (tests|pass|fail)|FAIL|rror" | head -10
  [ $code -eq 0 ] && echo "$name ok" || { echo "FAIL $name (exit $code)"; fails=$((fails+1)); }
}

run build npx next build
if ls "$ROOT"/tests/*.test.js >/dev/null 2>&1; then run unit-tests npm test; fi

echo; echo "== browser E2E"
for f in "$ROOT"/tests/e2e/e2e-*.mjs; do
  out=$(timeout 600 node "$f" 2>&1); code=$?
  [ $code -ne 0 ] && fails=$((fails+1))
  echo "$(basename "$f"): $(echo "$out" | grep -E '^FAIL|^Error' | head -5) $(echo "$out" | tail -1)"
done

echo; echo "FINISHED with $fails failing part(s)"
