# Odoo Argentina localization — slim snapshot (Odoo 19.4)

Snapshot date: 2026-10-19. Source text only: translations (i18n), tests, vendored libraries and images are removed.

| Folder | Source | Branch | Commit |
|---|---|---|---|
| `odoo/` | odoo/odoo (Community) | saas-19.4 | `f6f7b8b42d1b8fa47cb89ced5ccd6eb0a4bd85c7` |
| `enterprise/` | amen-odoo/enterprise (Enterprise fork) | saas-19.4 | `d4947b6f75fedd963c673950240a7a20dd18071c` |
| `documentation/` | odoo/documentation | saas-19.4 | `4039b156f00e5a4e72ab6576a1d5238625ed87a1` |

Paths mirror the original repositories, e.g. `odoo/addons/l10n_ar/models/account_move.py` or `enterprise/l10n_ar_edi/models/account_move.py`. Odoo's `base` module is at `odoo/odoo/addons/base`.

Contents:
- Community: every `l10n_ar*` and `l10n_latam*` module, `l10n_account_withholding_tax` (when it exists on this branch), `account`, `stock`, `point_of_sale`, `base`.
- Enterprise: every `l10n_ar*` and `l10n_latam*` module, plus `account_reports`.
- Docs: Finance (only Argentina among fiscal localizations), Point of Sale, Inventory, eCommerce.

1980 files, 21M. Enterprise code is proprietary (OEEL): keep this repository private.
