#!/usr/bin/env bash
set -euo pipefail

# ----------------- CONFIG -----------------
BASE_BRANCH="${BASE_BRANCH:-main}"
HEAD_BRANCH="${HEAD_BRANCH:-beta}"
REMOTE="${REMOTE:-origin}"

REVIEWER="${REVIEWER:-brettflorio}"
UPDATE_IF_EXISTS="${UPDATE_IF_EXISTS:-true}"
# ------------------------------------------

usage() {
  cat <<EOF
Usage: $(basename "$0") [--dry-run|-n]

Creates or updates a PR from HEAD -> BASE, with body built from conventional commits in BASE..HEAD.
- Conventional commits only
- Merge commits omitted
- Grouped by type (Features, Bug Fixes, etc.)
- PR title derived from latest beta tag on HEAD: vX.Y.Z-beta.N -> "chore: release X.Y.Z"

Flags:
  -n, --dry-run   Print what would be created/updated, but do not call GitHub.
EOF
}

DRY_RUN="false"
if [[ "${1:-}" == "--dry-run" || "${1:-}" == "-n" ]]; then
  DRY_RUN="true"
elif [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
elif [[ -n "${1:-}" ]]; then
  echo "Unknown argument: $1" >&2
  usage
  exit 2
fi

require() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1" >&2; exit 1; }; }
require git
require gh
require python3
require grep
require sed
require sort
require tail
require tr

git rev-parse --is-inside-work-tree >/dev/null

# In dry-run we still need to know repo, refs, tags; we can do without auth, but it’s fine to keep.
gh auth status >/dev/null 2>&1 || {
  if [[ "$DRY_RUN" == "false" ]]; then
    echo "GitHub CLI not authenticated. Run: gh auth login" >&2
    exit 1
  fi
}

git fetch "$REMOTE" "$BASE_BRANCH" "$HEAD_BRANCH" --tags --prune >/dev/null

OWNER_REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
if [[ -z "$OWNER_REPO" ]]; then
  # Fallback if gh repo view fails in dry-run environments
  OWNER_REPO="$(git config --get remote.${REMOTE}.url | sed -E 's#(git@|https://)github.com[:/](.+)\.git#\2#')"
fi
OWNER="${OWNER_REPO%/*}"
REPO="${OWNER_REPO#*/}"

RANGE="$REMOTE/$BASE_BRANCH..$REMOTE/$HEAD_BRANCH"

# Conventional commit subject pattern (type, optional scope, optional !, colon-space, message)
CONVENTIONAL_RE='^(feat|fix|perf|refactor|revert|docs|style|test|build|ci|chore)(\([^)]+\))?(!)?: .+'

RAW_SUBJECTS="$(git log --no-merges --pretty=format:'%s' "$RANGE" || true)"
FILTERED="$(echo "$RAW_SUBJECTS" | grep -E "$CONVENTIONAL_RE" || true)"

if [[ -z "${FILTERED//[$'\n'' ''\t']/}" ]]; then
  echo "No conventional commits found in $RANGE (after excluding merges)." >&2
  exit 1
fi

section_title() {
  case "$1" in
    feat) echo "Features" ;;
    fix) echo "Bug Fixes" ;;
    perf) echo "Performance" ;;
    refactor) echo "Refactoring" ;;
    docs) echo "Documentation" ;;
    style) echo "Styles" ;;
    test) echo "Tests" ;;
    build) echo "Build" ;;
    ci) echo "CI" ;;
    chore) echo "Chores" ;;
    revert) echo "Reverts" ;;
    *) echo "" ;;
  esac
}

# Render bullets:
# - scoped:   **scope**: message
# - unscoped: message
format_lines_for_type() {
  local type="$1"
  local lines
  lines="$(echo "$FILTERED" | grep -E "^${type}(\([^)]+\))?(!)?: " || true)"
  [[ -z "${lines//[$'\n'' ''\t']/}" ]] && return 0

  # 1) type(scope)!: msg -> - **scope**: msg
  # 2) type(scope): msg  -> - **scope**: msg
  # 3) type!: msg        -> - msg
  # 4) type: msg         -> - msg
  echo "$lines" | sed -E \
    -e "s/^${type}\(([^)]+)\)(!)?: (.+)$/- **\1**: \3/" \
    -e "s/^${type}(!)?: (.+)$/- \2/"
}

make_section() {
  local type="$1"
  local title; title="$(section_title "$type")"
  [[ -z "$title" ]] && return 0

  local bullets
  bullets="$(format_lines_for_type "$type" || true)"
  [[ -z "${bullets//[$'\n'' ''\t']/}" ]] && return 0

  echo "### $title"
  echo "$bullets"
  echo
}

BODY="$(
  make_section feat
  make_section fix
  make_section perf
  make_section refactor
  make_section docs
  make_section style
  make_section test
  make_section build
  make_section ci
  make_section chore
  make_section revert
)"

# Derive release version from latest beta tag on HEAD:
# v1.2.3-beta.4 -> 1.2.3
derive_release_version() {
  # Prefer tags that are reachable from HEAD_BRANCH (beta)
  local latest_beta_tag
  latest_beta_tag="$(
    git tag --list 'v*-beta.*' --merged "$REMOTE/$HEAD_BRANCH" \
      | sort -V \
      | tail -n 1 \
      || true
  )"

  if [[ -n "$latest_beta_tag" ]]; then
    echo "$latest_beta_tag" \
      | sed -E 's/^v//' \
      | sed -E 's/-beta\.[0-9]+$//'
    return 0
  fi

  # Fallback: try package.json version
  if [[ -f package.json ]]; then
    local v
    v="$(node -p "require('./package.json').version" 2>/dev/null || true)"
    if [[ -n "$v" ]]; then
      echo "$v"
      return 0
    fi
  fi

  # Last resort: empty
  echo ""
}

RELEASE_VERSION="$(derive_release_version)"
if [[ -z "$RELEASE_VERSION" ]]; then
  echo "Could not derive release version (no beta tags like vX.Y.Z-beta.N found on $REMOTE/$HEAD_BRANCH, and no package.json version)." >&2
  exit 1
fi

TITLE="chore: release ${RELEASE_VERSION}"

# --------- Find existing open PR (HEAD -> BASE) via GitHub API ----------
find_existing_pr() {
  gh api "repos/${OWNER}/${REPO}/pulls?state=open&base=${BASE_BRANCH}&head=${OWNER}:${HEAD_BRANCH}" 2>/dev/null \
    | python3 - <<'PY'
import sys, json
try:
    prs = json.load(sys.stdin)
except Exception:
    prs = []
if prs:
    print(prs[0].get("number",""))
    print(prs[0].get("html_url",""))
PY
}

if [[ "$DRY_RUN" == "true" ]]; then
  echo "DRY RUN"
  echo "Base:     $BASE_BRANCH"
  echo "Head:     $HEAD_BRANCH"
  echo "Reviewer: $REVIEWER"
  echo "Title:    $TITLE"
  echo "Body:"
  echo "----------------------------------------"
  echo "$BODY"
  echo "----------------------------------------"
  exit 0
fi

if [[ "$UPDATE_IF_EXISTS" == "true" ]]; then
  existing="$(find_existing_pr || true)"
  existing_number="$(echo "$existing" | sed -n '1p')"
  existing_url="$(echo "$existing" | sed -n '2p')"

  if [[ -n "${existing_number}" ]]; then
    echo "Found existing PR: ${existing_url:-#${existing_number}}"
    gh pr edit "$existing_number" --title "$TITLE" --body "$BODY" >/dev/null
    gh pr edit "$existing_number" --add-reviewer "$REVIEWER" >/dev/null || true
    echo "✅ Updated PR and requested reviewer: $REVIEWER"
    echo "${existing_url:-https://github.com/${OWNER_REPO}/pull/${existing_number}}"
    exit 0
  fi
fi

# --------- Create PR ----------
PR_URL="$(
  gh pr create \
    --base "$BASE_BRANCH" \
    --head "$HEAD_BRANCH" \
    --title "$TITLE" \
    --body "$BODY" \
    --reviewer "$REVIEWER" \
  | tail -n 1
)"

echo "✅ Created PR and requested reviewer: $REVIEWER"
echo "$PR_URL"