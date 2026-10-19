import { registry } from "@web/core/registry";
import { fuzzyLookup } from "@web/core/utils/search";

const commandProviderRegistry = registry.category("command_provider");

commandProviderRegistry.add("account_report_variants", {
    namespace: "/",
    async provide(env, options) {
        if (!options.searchValue || options.searchValue.length < 2) {
            return [];
        }

        const menuService = env.services.menu;
        const apps = menuService.getApps();

        const accountingApp = apps.find((app) =>
            ["accountant.menu_accounting", "account.menu_finance"].includes(app.xmlid)
        );

        if (!accountingApp) {
            return [];
        }

        const variants = await env.services.orm.cache({
            type: "disk",
            update: "once",
        }).call("account.report", "get_available_variants", []);

        const matched = fuzzyLookup(options.searchValue, variants, (v) => v.display_name);
        if (!matched.length) return [];

        return matched.slice(0, 5).map((variant) => ({
            name: `${variant.root_report_path_name} / ${variant.display_name}`,
            category: "menu_items",
            action() {
                menuService.setCurrentMenu(accountingApp);

                const reportMenu = menuService.getAll().find((m) => m.actionID && m.actionID == variant.root_action_id);

                env.services.action.doAction({
                    type: "ir.actions.client",
                    tag: "account_report",
                    name: variant.display_name,
                    context: { report_id: variant.root_report_id },
                    params: {
                        options: { selected_variant_id: variant.id },
                        ignore_session: true,
                    },
                    path: reportMenu?.actionPath,
                }, { clearBreadcrumbs: true });
            },
        }));
    },
});
