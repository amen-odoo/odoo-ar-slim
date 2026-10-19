# Odoo Argentina localization — slim snapshot (Odoo 20.0)

Snapshot date: 2026-10-19. Source text only: translations (i18n), tests, vendored libraries and images are removed.

| Folder | Source | Branch | Commit |
|---|---|---|---|
| `odoo/` | odoo/odoo (Community) | 20.0 | `8802ace3d4cf8c00c92005ef901d8dc3b0215a89` |
| `enterprise/` | amen-odoo/enterprise (Enterprise fork) | 20.0 | `a2a871edef4dd2557bad02fe66f3422c5c781ccb` |
| `documentation/` | amen-odoo/documentation | 20.0 | `bc4e8008aa8bbf229ecb91ecfd09f4454a14cd6f` |

Paths mirror the original repositories, e.g. `odoo/addons/l10n_ar/models/account_move.py` or `enterprise/l10n_ar_edi/models/account_move.py`. Odoo's `base` module is at `odoo/odoo/addons/base`.

Contents:
- Community: every `l10n_ar*` and `l10n_latam*` module, `l10n_account_withholding_tax` (when it exists on this branch), `account`, `stock`, `point_of_sale`, `base`.
- Enterprise: every `l10n_ar*` and `l10n_latam*` module, plus `account_reports`.
- Docs: Finance (only Argentina among fiscal localizations), Point of Sale, Inventory, eCommerce.

2027 files, 21M. Enterprise code is proprietary (OEEL): keep this repository private.
