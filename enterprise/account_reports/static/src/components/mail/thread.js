import { Thread } from "@mail/core/common/thread";
import { AccountReportMessage } from "./message";
import { AccountReportController } from "@account_reports/components/account_report/controller";

import { props, t } from "@odoo/owl";

export class AccountReportThread extends Thread {
    static template = "account_reports.Thread";
    static components = { ...Thread.components, Message: AccountReportMessage };

    setup() {
        super.setup(...arguments);
        this.accountReportProps = props({
            reportController: t.instanceOf(AccountReportController).optional(),
        });
    }
}
