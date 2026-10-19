#!/usr/bin/env bash
# Build one slim snapshot of the Odoo code and docs relevant to the Argentina localization,
# small enough to import into Gemini (limit: 100 MB and 5,000 files per repo/branch).
#
# Usage: build_slim.sh <out_dir> <label> <odoo_branch> <enterprise_branch> <docs_repo_url> <docs_branch>
#
# Env:
#   ENTERPRISE_URL  clone URL of the Enterprise fork (default https://github.com/amen-odoo/enterprise).
#                   In GitHub Actions it carries a token: https://x-access-token:<token>@github.com/amen-odoo/enterprise
set -euo pipefail

OUT=$1; LABEL=$2; ODOO_BR=$3; ENT_BR=$4; DOCS_URL=$5; DOCS_BR=$6
ENT_URL=${ENTERPRISE_URL:-https://github.com/amen-odoo/enterprise}
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# What goes in. Paths are repo-relative sparse-checkout patterns.
COMMUNITY_PATTERNS=(
  '/addons/l10n_ar*/' '/addons/l10n_latam*/' '/addons/l10n_account_withholding_tax/'
  '/addons/account/' '/addons/stock/' '/addons/point_of_sale/' '/odoo/addons/base/'
)
ENTERPRISE_PATTERNS=( '/l10n_ar*/' '/l10n_latam*/' '/account_reports/' )
DOCS_PATTERNS=(
  '/content/applications/finance/' '/content/applications/sales/point_of_sale/'
  '/content/applications/inventory_and_mrp/inventory/' '/content/applications/websites/ecommerce/'
)

sparse_clone() { # url branch dir patterns...
  local url=$1 br=$2 dir=$3; shift 3
  GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 --filter=blob:none --sparse --branch "$br" "$url" "$dir"
  git -C "$dir" sparse-checkout set --no-cone "$@"
}

# Copy only source and docs text; drop translations, tests, vendored libs and binaries.
copy_lean() { # src dest
  local src=$1 dest=$2
  mkdir -p "$dest"
  (cd "$src" && find . -type f \
      \( -name '*.py' -o -name '*.xml' -o -name '*.csv' -o -name '*.js' -o -name '*.scss' -o -name '*.rst' \) \
      -not -path './.git/*' -not -path '*/i18n/*' -not -path '*/tests/*' \
      -not -path '*/static/lib/*' -not -path '*/static/tests/*' -print0 \
    | tar --null -T - -cf -) | tar -xf - -C "$dest"
}

echo "== $LABEL: odoo/odoo $ODOO_BR"
sparse_clone https://github.com/odoo/odoo "$ODOO_BR" "$WORK/odoo" "${COMMUNITY_PATTERNS[@]}"
echo "== $LABEL: enterprise $ENT_BR"
sparse_clone "$ENT_URL" "$ENT_BR" "$WORK/enterprise" "${ENTERPRISE_PATTERNS[@]}"
echo "== $LABEL: documentation $DOCS_BR ($DOCS_URL)"
sparse_clone "$DOCS_URL" "$DOCS_BR" "$WORK/documentation" "${DOCS_PATTERNS[@]}"

# Keep only the Argentina page among the fiscal localizations (other countries add noise).
FL="$WORK/documentation/content/applications/finance/fiscal_localizations"
if [ -d "$FL" ]; then
  find "$FL" -mindepth 1 -maxdepth 1 ! -name 'argentina*' -exec rm -rf {} +
fi

rm -rf "$OUT"; mkdir -p "$OUT"
copy_lean "$WORK/odoo" "$OUT/odoo"
copy_lean "$WORK/enterprise" "$OUT/enterprise"
copy_lean "$WORK/documentation" "$OUT/documentation"

sha() { git -C "$1" rev-parse HEAD; }
FILES=$(find "$OUT" -type f | wc -l)
SIZE=$(du -sh "$OUT" | cut -f1)
cat > "$OUT/README.md" <<EOF
# Odoo Argentina localization — slim snapshot ($LABEL)

Snapshot date: $(date -u +%Y-%m-%d). Source text only: translations (i18n), tests, vendored libraries and images are removed.

| Folder | Source | Branch | Commit |
|---|---|---|---|
| \`odoo/\` | odoo/odoo (Community) | $ODOO_BR | \`$(sha "$WORK/odoo")\` |
| \`enterprise/\` | amen-odoo/enterprise (Enterprise fork) | $ENT_BR | \`$(sha "$WORK/enterprise")\` |
| \`documentation/\` | ${DOCS_URL#https://github.com/} | $DOCS_BR | \`$(sha "$WORK/documentation")\` |

Paths mirror the original repositories, e.g. \`odoo/addons/l10n_ar/models/account_move.py\` or \`enterprise/l10n_ar_edi/models/account_move.py\`. Odoo's \`base\` module is at \`odoo/odoo/addons/base\`.

Contents:
- Community: every \`l10n_ar*\` and \`l10n_latam*\` module, \`l10n_account_withholding_tax\` (when it exists on this branch), \`account\`, \`stock\`, \`point_of_sale\`, \`base\`.
- Enterprise: every \`l10n_ar*\` and \`l10n_latam*\` module, plus \`account_reports\`.
- Docs: Finance (only Argentina among fiscal localizations), Point of Sale, Inventory, eCommerce.

$FILES files, $SIZE. Enterprise code is proprietary (OEEL): keep this repository private.
EOF
echo "== $LABEL done: $(find "$OUT" -type f | wc -l) files, $(du -sh "$OUT" | cut -f1)"
