import { useRef } from "@web/owl2/utils";
import { registry } from "@web/core/registry";
import { Component, onMounted } from "@odoo/owl";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

export class AccountReturnEditable extends Component {
    static template = "account_reports.AccountReturnEditableBadgeField";
    static props = {
        ...standardFieldProps,
        type: String,
        placeholder: { type: String, optional: true },
        widget_class: { type: String, optional: true },
    };

    setup() {
        super.setup();
        this.textareaRef = useRef("textarea");
        onMounted(() => {
            if (this.textareaRef.el) {
                this.resize();
            }
        });
    }

    updateField(event) {
        const value = event.target.value;
        this.props.record.update({ [this.props.name]: value });
        this.props.record.save();
    }

    resize() {
        // This can be replaced in the future by `field-sizing: content;` on the textarea
        // but it's not yet supported in all browsers (firefox and safari).
        this.textareaRef.el.style.height = "0"; // To force recalculation of scrollHeight
        this.textareaRef.el.style.height = this.textareaRef.el.scrollHeight + "px";
    }
}

export const accountReturnEditableBadge = {
    supportedTypes: ["char", "text"],
    component: AccountReturnEditable,
    extractProps: ({ placeholder, type, attrs }) => ({ placeholder, type, widget_class: attrs.widget_class }),
};

registry.category("fields").add("account_return_editable_badge", accountReturnEditableBadge);
