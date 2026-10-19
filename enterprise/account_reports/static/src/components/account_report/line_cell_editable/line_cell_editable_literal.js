import { Component, proxy } from "@odoo/owl";
import { useRef } from "@web/owl2/utils";
import { useHotkey } from "@web/core/hotkeys/hotkey_hook";
import { localization } from "@web/core/l10n/localization";
import { formatFloat } from "@web/core/utils/numbers";
import { parseFloat } from "@web/views/fields/parsers";

export class AccountReportLineCellEditableLiteral extends Component {
    static template = "account_reports.AccountReportLineCellEditableLiteral";
    static props = {
        onChange: Function,
        cell: Object,
        audit: Function,
    };

    setup() {
        this.input = useRef("input");
        this.editPopupData = this.parseEditPopupData();

        useHotkey(
            "Enter",
            (ev) => {
                ev.target.blur();
            },
            { bypassEditableProtection: true }
        );

        this.focused = proxy({ value: false });
    }

    parseEditPopupData() {
        try {
            return JSON.parse(this.props.cell.edit_popup_data || "{}");
        } catch {
            return {};
        }
    }

    get isLocaleFormatType() {
        return ["float", "integer", "monetary", "percentage"].includes(
            this.props.cell?.figure_type
        );
    }

    get editableNumericValue() {
        const { no_format } = this.props.cell;
        if (no_format == null || no_format === "") {
            return no_format;
        }

        const numericValue = Number(no_format);
        if (Number.isNaN(numericValue)) {
            return no_format;
        }

        return formatFloat(numericValue, {
            digits: [0, this.editPopupData.rounding || 2],
            thousandsSep: "",
            grouping: [],
            trailingZeros: false,
        });
    }

    get editableValue() {
        const value = this.isLocaleFormatType
            ? this.editableNumericValue
            : this.props.cell.no_format;

        return value == null ? "" : String(value);
    }

    onClickEdit() {
        this.input.el.focus();
    }

    async onChange() {
        let editValue = this.input.el.value;

        if (this.isLocaleFormatType) {
            const otherDecimalSeparator = localization.decimalPoint === "." ? "," : ".";
            const localeThousandsSeparator = localization.thousandsSep || "";

            if (
                this.input.el.value.split(localization.decimalPoint || ".").length >= 3
                || (this.input.el.value.includes(otherDecimalSeparator) && otherDecimalSeparator !== localeThousandsSeparator)
            ) {
                editValue = this.input.el.value;
            } else {
                try {
                    editValue = parseFloat(this.input.el.value).toString();
                } catch {
                    editValue = this.input.el.value;
                }
            }
        }

        await this.props.onChange(editValue);
        this.focused.value = false;
    }

    onFocus() {
        this.focused.value = true;
        this.input.el.value = this.editableValue;
        this.input.el.select();
    }

    onBlur() {
        if (this.editableValue === this.input.el.value) {
            this.focused.value = false;
        }
    }

    onMouseDown(ev) {
        /**
         * This function has for purpose to prevent the input focus via the click without
         * blocking the click when the element is focus.
         */
        if (!this.isFocused) {
            ev.preventDefault();
        }
    }

    audit() {
        if (this.isFocused) {
            return;
        }
        this.props.audit();
    }

    get isFocused() {
        return this.focused.value;
    }

    get inputValue() {
        return this.isFocused ? this.editableValue : this.props.cell.name;
    }
}
