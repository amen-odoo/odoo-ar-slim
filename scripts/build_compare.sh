#!/usr/bin/env bash
# Build the side-by-side "compare" branch from two slim snapshots made by build_slim.sh.
# Only the localization modules and the Argentina docs page, so both versions fit in one Gemini import.
#
# Usage: build_compare.sh <out_dir> <snapshot_20> <snapshot_19.4>
set -euo pipefail
OUT=$1; S20=$2; S194=$3
rm -rf "$OUT"; mkdir -p "$OUT"

for pair in "20.0:$S20" "19.4:$S194"; do
  label=${pair%%:*}; src=${pair#*:}
  mkdir -p "$OUT/$label/odoo/addons" "$OUT/$label/enterprise"
  cp -r "$src"/odoo/addons/l10n_* "$OUT/$label/odoo/addons/"
  cp -r "$src"/enterprise/l10n_* "$OUT/$label/enterprise/"
  (cd "$src" && find documentation -path '*fiscal_localizations*' -type f | tar -T - -cf -) | tar -xf - -C "$OUT/$label"
  cp "$src/README.md" "$OUT/$label/SOURCES.md"
done

cat > "$OUT/README.md" <<EOF
# Odoo Argentina localization — 19.4 vs 20.0 side by side

Snapshot date: $(date -u +%Y-%m-%d). Use this branch to compare versions in a single Gemini chat.

- \`20.0/\` and \`19.4/\` hold the same set: every \`l10n_*\` module from Community (\`odoo/addons/\`) and Enterprise (\`enterprise/\`), plus the Argentina page of the official docs.
- Each folder's \`SOURCES.md\` lists the exact commits.
- Core modules (\`account\`, \`stock\`, \`point_of_sale\`, \`base\`, \`account_reports\`) are only in the single-version branches \`20.0\` and \`saas-19.4\`.

Always name the folder (19.4 or 20.0) a claim comes from. Known differences: \`l10n_latam_base\` and \`l10n_ar_stock_batch\` exist only in 19.4; \`l10n_ar_withholding\` is rebuilt on \`l10n_account_withholding_tax\` in 20.0.

$(find "$OUT" -type f | wc -l) files, $(du -sh "$OUT" | cut -f1). Enterprise code is proprietary (OEEL): keep this repository private.
EOF
echo "== compare done: $(find "$OUT" -type f | wc -l) files, $(du -sh "$OUT" | cut -f1)"
