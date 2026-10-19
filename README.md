# Odoo Argentina localization — 19.4 vs 20.0 side by side

Snapshot date: 2026-10-19. Use this branch to compare versions in a single Gemini chat.

- `20.0/` and `19.4/` hold the same set: every `l10n_*` module from Community (`odoo/addons/`) and Enterprise (`enterprise/`), plus the Argentina page of the official docs.
- Each folder's `SOURCES.md` lists the exact commits.
- Core modules (`account`, `stock`, `point_of_sale`, `base`, `account_reports`) are only in the single-version branches `20.0` and `saas-19.4`.

Always name the folder (19.4 or 20.0) a claim comes from. Known differences: `l10n_latam_base` and `l10n_ar_stock_batch` exist only in 19.4; `l10n_ar_withholding` is rebuilt on `l10n_account_withholding_tax` in 20.0.

562 files, 4.5M. Enterprise code is proprietary (OEEL): keep this repository private.
