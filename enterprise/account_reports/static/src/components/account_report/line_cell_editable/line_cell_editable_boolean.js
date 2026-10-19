import { useRef } from "@web/owl2/utils";
import { Component } from "@odoo/owl";

export class AccountReportLineCellEditableBoolean extends Component {
    static template = "account_reports.AccountReportLineCellEditableBoolean";
    static props = {
        onChange: Function,
        cell: Object,
        audit: Function,
    };

    setup() {
        this.input = useRef("input");
    }

    toggleBooleanValue() {
        this.props.onChange(this.input.el.dataset.noFormat === "0" ? 1 : 0);
    }

    get inputNoFormatValue() {
        return this.props.cell?.no_format;
    }

    get inputValue() {
        return this.props.cell?.name;
    }
}
