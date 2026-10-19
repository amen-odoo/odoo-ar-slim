# odoo-ar-slim

Slim snapshots of the Odoo code and docs relevant to the Argentina localization, sized to import into Gemini (limit: 100 MB and 5,000 files per import). **Private: contains Enterprise code (OEEL).**

## Branches

| Branch | Contents | Approx. size |
|---|---|---|
| `20.0` | Community `l10n_ar*`, `l10n_latam*`, `l10n_account_withholding_tax`, `account`, `stock`, `point_of_sale`, `base` · Enterprise `l10n_ar*`, `account_reports` · Docs: Finance (Argentina only among localizations), POS, Inventory, eCommerce | ~21 MB, ~2,000 files |
| `saas-19.4` | Same set for 19.4 (adds `l10n_latam_base`, `l10n_ar_stock_batch`) | ~21 MB, ~2,000 files |
| `compare` | `19.4/` and `20.0/` side by side: localization modules + Argentina docs page only | ~5 MB, ~560 files |

Only source text is kept: translations (`i18n/`), tests, vendored libraries and images are stripped. Each branch's `README.md` lists the exact source commits.

## Sources

- Community: [odoo/odoo](https://github.com/odoo/odoo), branches `20.0` and `saas-19.4`.
- Enterprise: [amen-odoo/enterprise](https://github.com/amen-odoo/enterprise) (private fork), branches `20.0` and `saas-19.4`.
- Docs 20.0: [amen-odoo/documentation](https://github.com/amen-odoo/documentation), branch `20.0`.
- Docs 19.4: [odoo/documentation](https://github.com/odoo/documentation), branch `saas-19.4` (the fork has no `saas-19.4` branch).

## Using it in Gemini

In a chat on gemini.google.com: **+ > Import code**, then paste a branch URL:

- `https://github.com/amen-odoo/odoo-ar-slim/tree/20.0`
- `https://github.com/amen-odoo/odoo-ar-slim/tree/saas-19.4`
- `https://github.com/amen-odoo/odoo-ar-slim/tree/compare`

One import per chat. Imports are static snapshots: after each monthly refresh, import again in a new chat. Private repos need your GitHub account linked to your Google account.

## Monthly refresh

`.github/workflows/refresh.yml` runs on the 1st of each month (and on demand from **Actions > Refresh slim snapshots > Run workflow**). It:

1. Syncs the forks with upstream (same as "Sync fork"): `enterprise` 20.0 and saas-19.4, `documentation` 20.0.
2. Rebuilds the three branches with `scripts/build_slim.sh` and `scripts/build_compare.sh`.
3. Fails if a branch goes over Gemini's limits, then force-pushes the branches (each is a single commit, no history).

### Setup (once)

The workflow needs a token that can read the private Enterprise fork and sync both forks:

1. GitHub > Settings > Developer settings > **Fine-grained tokens** > Generate new token.
2. Resource owner: `amen-odoo`. Repository access: **Only select repositories** > `enterprise`, `documentation`.
3. Permissions > Repository > **Contents: Read and write** (write is only for "Sync fork").
4. In this repo: Settings > Secrets and variables > Actions > **New repository secret** named `ODOO_FORKS_TOKEN`, value = the token.

Fine-grained tokens expire; renew the secret when GitHub warns you.

## Building locally

```bash
scripts/build_slim.sh out/20.0 "Odoo 20.0" 20.0 20.0 https://github.com/amen-odoo/documentation 20.0
scripts/build_slim.sh out/saas-19.4 "Odoo 19.4" saas-19.4 saas-19.4 https://github.com/odoo/documentation saas-19.4
scripts/build_compare.sh out/compare out/20.0 out/saas-19.4
```

To change what goes in, edit the `*_PATTERNS` arrays at the top of `scripts/build_slim.sh`.
