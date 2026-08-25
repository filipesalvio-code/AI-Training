# Cash flow and financial reports

## Cash flow

The report is located at **Financial > Cash Flow**. It shows opening balance, inflows, outflows, and closing balance by day, week, or month.

In **Actual** mode, only settled amounts are included. In **Forecast** mode, both open and settled entries are included. In **Forecast vs. actual** mode, both amounts are shown side by side.

The **Cash date** filter uses due date for open items and settlement date for settled items. The **Accrual period** filter uses the date when the revenue or expense was recognized.

Because of this, January rent paid in February appears in January in the accrual report and in February in the cash-based actual report.

## Projection

The projection starts from the current balance of the selected accounts and applies future inflows and outflows. Entries without a forecast financial account are included in the overall total, but not in the projection of a specific account.

Overdue items are considered on the first day of the projection. To simulate that an overdue invoice will be paid on another date, temporarily change the due date or use the simulation scenario.

## Scenarios

The **Simulate scenario** feature lets you change dates and amounts without editing the original entries. You can also add a hypothetical revenue or expense.

Scenarios are private by default. The author can share them with view-only or management users. A scenario does not generate real entries.

## Income statement

The managerial P&L (DRE) is located at **Reports > Financial > DRE**. It uses categories configured as revenue, cost, expense, tax, and financial result.

The DRE should be analyzed on an accrual basis. If a category is not linked to a DRE group, the amount appears under **Unclassified**.

Transfers between own accounts are not part of the DRE. Capital contributions and partner withdrawals appear only when their categories are configured for this.

## Available reports

- accounts payable by supplier;
- accounts receivable by customer;
- overdue invoices;
- payments by category;
- receipts by category;
- results by cost center;
- financial account statement;
- daily cash position;
- managerial DRE;
- change audit log.

## Export

Lists can be exported as XLSX or CSV. Formatted reports also offer PDF.

The export keeps the filters applied on the screen. Before exporting, check company, period, status, and selected accounts.

Files with more than 20,000 rows are processed in the background. The download link appears in **Notifications** and remains available for seven days.

## Different numbers in reports

Two reports may show different numbers without any error. Compare:

1. cash or accrual basis;
2. period;
3. selected companies;
4. entry status;
5. inclusion of canceled entries;
6. categories and cost centers;
7. panel refresh date.

The home dashboard uses up to a five-minute cache. Detailed reports query data at the moment they are opened. Use **Refresh dashboard** to force an earlier refresh.
