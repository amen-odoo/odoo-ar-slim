import { useRef } from "@web/owl2/utils";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { useService } from "@web/core/utils/hooks";
import { Component, computed, proxy, untrack } from "@odoo/owl";

import { parseLineId } from "@account_reports/js/util";

import { RelationalModel } from "@web/model/relational_model/relational_model";

import { AccountReviewStateSelectionBadge } from "@account/components/account_review_state_selection/account_review_state_selection_badge";

export class AccountReportLineName extends Component {
    static template = "account_reports.AccountReportLineName";
    static props = {
        lineIndex: Number,
        line: Object,
    };
    static components = {
        Dropdown,
        DropdownItem,
        AccountReviewStateSelectionBadge,
    };

    setup() {
        this.action = useService("action");
        this.orm = useService("orm");
        this.ui = useService("ui");
        this.offline = useService("offline");
        this.controller = proxy(this.env.controller);

        this.lineNameCell = useRef("lineNameCell");

        this.accountStatus = computed(() => {
            if (!this.props.line.account_status) {
                return null;
            }

            const fields = {
                status: {
                    selection: [
                        ["todo", "To Review"],
                        ["reviewed", "Reviewed"],
                        ["supervised", "Supervised"],
                        ["anomaly", "Anomaly"],
                    ],
                    required: false,
                },
            };

            const model = new RelationalModel(
                this.env,
                {
                    config: {
                        resModel: "account.audit.account.status",
                        fields: fields,
                        activeFields: fields,
                        openGroupsByDefault: true,
                        isMonoRecord: true,
                    },
                    groupsLimit: Number.MAX_SAFE_INTEGER,
                    limit: 1,
                    countLimit: 1,
                },
                { orm: this.orm, offline: this.offline }
            );

            return untrack(
                () =>
                    new model.constructor.Record(
                        model,
                        {
                            context: this.env.controller.context,
                            activeFields: fields,
                            fields: fields,
                            resModel: "account.audit.account.status",
                            resId: this.props.line.account_status.id,
                            resIds: [this.props.line.account_status.id],
                            isMonoRecord: true,
                            mode: "readonly",
                        },
                        this.props.line.account_status,
                        { manuallyAdded: !this.props.line.account_status.id }
                    )
            );
        });
    }

    get accountStatusBadgeOptions() {
        return {
            todo: { decoration: "info" },
            reviewed: { decoration: "success" },
            supervised: { decoration: "success" },
            anomaly: { decoration: "danger" },
        };
    }

    get modelName() {
        return parseLineId(this.props.line.id).at(-1)[1];
    }

    //------------------------------------------------------------------------------------------------------------------
    // Caret options
    //------------------------------------------------------------------------------------------------------------------
    get caretOptions() {
        return this.controller.caretOptions[this.props.line.caret_options];
    }

    get hasCaretOptions() {
        return this.caretOptions?.length > 0;
    }

    async caretAction(caretOption) {
        const res = await this.orm.call(
            "account.report",
            "dispatch_report_action",
            [
                this.controller.options.report_id,
                this.controller.options,
                caretOption.action,
                {
                    line_id: this.props.line.id,
                    action_param: caretOption.action_param,
                },
            ],
            {
                context: this.controller.context,
            }
        );

        return this.action.doAction(res);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Classes
    // -----------------------------------------------------------------------------------------------------------------
    get lineNameClasses() {
        let classes = "text";

        if (this.props.line.unfoldable)
            classes += " unfoldable";

        if (this.props.line.is_draft)
            classes += " draft";

        if (this.props.line.css_class)
            classes += ` ${ this.props.line.css_class }`;

        return classes;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Action
    // -----------------------------------------------------------------------------------------------------------------
    async triggerAction() {
        const res = await this.orm.call(
            "account.report",
            "execute_action",
            [
                this.controller.options.report_id,
                this.controller.options,
                {
                    id: this.props.line.id,
                    actionId: this.props.line.action_id,
                },
            ],
            {
                context: this.controller.context,
            }
        );

        return this.action.doAction(res);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Load more
    // -----------------------------------------------------------------------------------------------------------------
    async loadMore() {
        const linesByParent = {}
        for (const line of this.controller.lines) {
            if (!line['parent_id'])
                continue;
            else if (line['parent_id'] in linesByParent)
                linesByParent[line['parent_id']].push(line);
            else
                linesByParent[line['parent_id']] = [line];
        }

        const lineToExpandId = this.props.line.parent_id;
        const alreadyLoadedChildLineIds = this.retrieveAllLoadedChildLines(linesByParent, lineToExpandId).map((x) => x['id']);

        const newLines = await this.orm.call(
            "account.report",
            this.controller.options.readonly_query ? "get_expanded_lines_readonly" : "get_expanded_lines",
            [
                this.controller.options.report_id,
                this.controller.options,
                lineToExpandId,
                this.props.line.groupby,
                this.props.line.expand_function,
                this.props.line.horizontal_split_side,
                this.controller._retrieve_line_comparison_base_value(),
                true,
                alreadyLoadedChildLineIds, // So that we avoid recomputing uselessly groupby of already unfolded and loaded lines
            ],
        );

        this.controller.setLineVisibility(newLines)

        // Insert the new lines at the right positions, keeping the result of previously unfolded lines
        const linesToInsert = [];
        for (const newLine of newLines) {
            linesToInsert.push(newLine);
            linesToInsert.push(...this.retrieveAllLoadedChildLines(linesByParent, newLine['id']));
        }

        const parentIndex = this.controller.lines.findIndex((x) => x.id === lineToExpandId);
        const nberLinesToRemove = this.props.lineIndex - parentIndex;

        // Sorting is done before inserting the lines, so that linesOrder is properly set on the controller before triggering a UI refresh.
        if (this.controller.areLinesOrdered()) {
            const newLinesOrder = await this.controller.loadLinesOrder(linesToInsert);

            // Modify the indices of the sublines so that they come all just after their parent's
            for (let i = 0 ; i < newLinesOrder.length ; i++) {
                newLinesOrder[i] += parentIndex + 1;
            }

            // Modify all indices stored in linesOrder for lines which will come after parent once the lines have been inserted
            let parentLineOrderIndex;
            for (let i = 0 ; i < this.controller.linesOrder.length ; i++) {
                if (this.controller.linesOrder[i] === parentIndex) {
                    parentLineOrderIndex = i;
                }
                else if (this.controller.linesOrder[i] > parentIndex) {
                    this.controller.linesOrder[i] += newLinesOrder.length - nberLinesToRemove;
                }
            }

            // Remove elements that would already be present in linesOrder before injecting the order of unfolded lines
            const reloadedIndices = new Set(newLinesOrder);
            this.controller.linesOrder = this.controller.linesOrder.filter(x => !reloadedIndices.has(x));

            this.controller.linesOrder.splice(parentLineOrderIndex + 1, 0, ...newLinesOrder);
        }
        else {
            // Reset linesOrder to use the indices of the lines directly, making sure it stays consistent with the newly loaded lines
            this.controller.linesOrder = []
            for (let i = 0 ; i < this.controller.lines.length + linesToInsert.length - nberLinesToRemove ; i++) {
                this.controller.linesOrder.push(i);
            }
        }

        // Insert lines, refreshing the UI
        this.controller.insertLines(parentIndex + 1, nberLinesToRemove, linesToInsert);
    }

    retrieveAllLoadedChildLines(linesByParent, lineId) {
        const rslt = [];
        if (lineId in linesByParent) {
            for (const childLine of linesByParent[lineId]) {
                rslt.push(childLine);
                rslt.push(...this.retrieveAllLoadedChildLines(linesByParent, childLine['id']))
            }
        }
        return rslt;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Fold / Unfold
    // -----------------------------------------------------------------------------------------------------------------
    toggleFoldable() {
        if (this.props.line.unfoldable)
            if (this.props.line.unfolded)
                this.controller.foldLine(this.props.lineIndex);
            else
                this.controller.unfoldLine(this.props.lineIndex);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Chatter
    // -----------------------------------------------------------------------------------------------------------------
    get isChatterAnnotated() {
        return this.props.line.visible_annotations;
    }

    get isChatterSelected() {
        return this.controller.chatterState.lineId === this.props.line.id;
    }

    async openChatter(ev) {
        ev.stopPropagation();

        if (!this.props.line.chatter) {
            return;
        }

        this.controller.toggleLineChatter({
            resModel: this.props.line.chatter.model,
            resId: this.props.line.chatter.id,
            line_id: this.props.line.id,
        });
    }
}
