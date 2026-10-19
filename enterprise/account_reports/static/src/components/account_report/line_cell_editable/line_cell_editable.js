import { AccountReportLineCell } from "@account_reports/components/account_report/line_cell/line_cell";
import { AccountReportLineCellEditableLiteral } from "./line_cell_editable_literal";
import { AccountReportLineCellEditableDateTime } from "./line_cell_editable_datetime";
import { AccountReportLineCellEditableBoolean } from "./line_cell_editable_boolean";
import { AccountReportLineCellEditableMany2One } from "./line_cell_editable_many2one";

export class AccountReportLineCellEditable extends AccountReportLineCell {
    static template = "account_reports.AccountReportLineCellEditable";
    static components = {
        AccountReportLineCellEditableDateTime,
        AccountReportLineCellEditableBoolean,
        AccountReportLineCellEditableLiteral,
        AccountReportLineCellEditableMany2One,
    };

    async onChange(editValue) {
        const cellEditData = this.hasEditPopupData
            ? JSON.parse(this.props.cell.edit_popup_data)
            : {};

        const res = await this.orm.call(
            "account.report",
            "action_modify_manual_value",
            [
                this.controller.options.report_id,
                this.props.line.id,
                this.controller.options,
                cellEditData.column_group_index,
                editValue,
                cellEditData.target_expression_id,
                cellEditData.rounding,
                this.controller.columnGroupsTotals,
            ],
            {
                context: this.controller.context,
            }
        );
        this.controller.lines = res.lines;
        this.controller.columnGroupsTotals = res.column_groups_totals;
    }

    get cellClasses() {
        let classes = super.cellClasses;
        if (this.hasEditPopupData) {
            classes += " editable-cell";
        }
        return classes;
    }

    get hasEditPopupData() {
        return Boolean(this.props.cell?.edit_popup_data);
    }

    get figureType() {
        return this.props.cell?.figure_type;
    }

    get isDateTime() {
        return ["date", "datetime"].includes(this.figureType);
    }

    get isBoolean() {
        return this.figureType === "boolean";
    }

    get isMany2One() {
        return this.figureType === "many2one";
    }

    get editableCellProps() {
        return {
            cell: this.props.cell,
            onChange: this.onChange.bind(this),
            audit: this.audit.bind(this),
        };
    }
}
