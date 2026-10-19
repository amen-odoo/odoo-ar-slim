import { Component, proxy } from "@odoo/owl";
import { formatDate, formatDateTime } from "@web/core/l10n/dates";
import { useDateTimePicker } from "@web/core/datetime/datetime_picker_hook";

const { DateTime } = luxon;

export class AccountReportLineCellEditableDateTime extends Component {
    static template = "account_reports.AccountReportLineCellEditableDateTime";
    static props = {
        onChange: Function,
        cell: Object,
        audit: Function,
    };

    setup() {
        this.controller = proxy(this.env.controller);

        this.datetime = proxy({
            value: this.props.cell?.no_format ? DateTime.fromISO(this.props.cell.no_format) : "",
        });

        const pickerProps = {
            value: this.datetime.value || null,
            type: this.figureType,
        };

        this.datetimePicker = useDateTimePicker({
            target: "inputDate",
            showSeconds: false,
            tz: this.tz,
            get pickerProps() {
                return pickerProps;
            },
            onApply: (newDate) => {
                this.datetime.value = newDate;
                this.props.onChange(newDate);
            },
        });
    }

    onClickEdit() {
        this.datetimePicker.open();
    }

    onBlur() {
        this.datetimePicker.close();
    }

    onMouseDown(ev) {
        /**
         * This function has for purpose to prevent the input focus via the click without
         * blocking the click when the element is focus.
         */
        if (!this.datetimePicker.isOpen()) {
            ev.preventDefault();
        }
    }

    audit() {
        if (this.datetimePicker.isOpen()) {
            return;
        }
        this.props.audit();
    }

    get tz() {
        return this.controller.context?.tz || "UTC";
    }

    get inputValue() {
        const value = this.datetime.value;
        if (value) {
            if (this.figureType === "datetime") {
                return formatDateTime(value, { tz: this.tz });
            } else if (this.figureType === "date") {
                return formatDate(value, { tz: this.tz });
            } else {
                throw new Error(
                    `Bad figure type to format. Expected: date, datetime. Got: ${this.figureType}`
                );
            }
        }
        return "";
    }

    get figureType() {
        return this.props.cell?.figure_type;
    }
}
