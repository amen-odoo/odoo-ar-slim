import { Message } from "@mail/core/common/message";
import { AccountReportController } from "@account_reports/components/account_report/controller";

import { props, t } from "@odoo/owl";

export class AccountReportMessage extends Message {
    setup() {
        super.setup(...arguments);
        this.accountReportProps = props({
            reportController: t.instanceOf(AccountReportController).optional(),
        });
    }
}
