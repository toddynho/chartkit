#!/usr/bin/env bash
# Configure npm trusted publishing for every public package.
# Run this locally, logged in as the npm owner, after the one-time bootstrap publish.
# It calls `npm trust`, which updates the registry. Pass --dry-run to print the commands only.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
dry=0
if [[ "${1:-}" == "--dry-run" ]]; then
  dry=1
elif [[ -n "${1:-}" ]]; then
  echo "usage: scripts/npm-trust.sh [--dry-run]" >&2
  exit 2
fi

count=0
while read -r name _dir _profile; do
  if [[ -z "${name}" || "${name}" == \#* ]]; then
    continue
  fi
  cmd=(npm trust github "${name}" --file publish.yml --repo toddynho/chartkit --env npm --allow-stage-publish --yes)
  if [[ "${dry}" -eq 1 ]]; then
    printf 'would run:'
    printf ' %q' "${cmd[@]}"
    printf '\n'
  else
    "${cmd[@]}"
    sleep 2
  fi
  count=$((count + 1))
done < "${root}/scripts/public-packages.txt"

echo
echo "Trusted publisher planned for ${count} packages: workflow publish.yml, repo toddynho/chartkit, environment npm, stage only."
echo "Each new trusted publisher must complete a first OIDC publish within 2 days (Publish workflow, bootstrap false, mode stage)."
echo "Then, on npmjs.com for each package, set Publishing access to 'Require two-factor authentication and disallow tokens'."
echo "Revoke the bootstrap granular token and delete the NPM_TOKEN secret on the GitHub environment npm."
