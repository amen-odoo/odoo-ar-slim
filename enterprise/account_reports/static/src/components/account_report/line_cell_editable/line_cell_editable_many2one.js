import { Component } from "@odoo/owl";
import { Many2OneField } from "@web/views/fields/many2one/many2one_field";
import { Record } from "@web/model/record";

export class AccountReportLineCellEditableMany2One extends Component {
    static template = "account_reports.AccountReportLineCellEditableMany2One";
    static components = { Many2OneField, Record };
    static props = {
        onChange: Function,
        cell: Object,
        audit: Function,
    };

    async update(value) {
        const resModel = this.value.split(':')[0];
        const resId = value.data.id.id || 0;
        await this.props.onChange(`${resModel}:${resId}`);
    }

    get value() {
        const cellEditData = JSON.parse(this.props.cell.edit_popup_data);
        return this.props.cell.no_format || `${cellEditData.target_model}:0`;
    }

    get recordProps() {
        let [resModel, resId] = this.value.split(':');
        const fields = {
            id: {
                type: "many2one",
                relation: resModel,
            },
        };

        return {
            hooks: { onRecordChanged: (r, _) => this.update(r) },
            values: { id: parseInt(resId) || false },
            resModel: resModel,
            fields: fields,
            activeFields: fields,
        };
    }
}
