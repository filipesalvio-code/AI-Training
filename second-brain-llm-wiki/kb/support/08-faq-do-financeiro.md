# Finance FAQ

## I created an account, but it doesn’t appear in the cash flow. Why?

Check the period, company, and status. In the financial account filter, entries without a planned account do not appear. In Realized mode, accounts that have not yet been settled also do not appear.

## Can I create an account payable without a supplier?

No. Accounts payable require a supplier. For small recurring expenses, create a generic supplier such as `Miscellaneous expenses`, as long as this aligns with the company’s financial policy.

## A settlement was recorded on the wrong date. Do I need to delete the account?

No. Open the entry, reverse the incorrect settlement, and record a new settlement on the correct date. If the period is closed, request reopening from the administrator or make an adjustment guided by accounting.

## What is the difference between deleting and canceling?

Deleting removes the entry and only works when there are no linked records. Canceling preserves the history and removes the amount from operational reports. For issued documents, you may need to cancel the document separately with the bank or city hall.

## Is a partial payment considered overdue?

Yes, if there is a remaining balance and the due date has passed. The displayed status may be **Partially overdue**.

## How do I edit multiple accounts at once?

Select up to 200 records in the list and use **Actions > Bulk edit**. Category, cost center, due date, and planned account can be changed in bulk. Amount, supplier, and document must be edited individually.

## Is the bank balance updated in real time?

Not always. The NexoERP balance is updated immediately by recorded settlements. The balance pulled from the bank follows the integration frequency and may be delayed. Check the time of the last synchronization next to the account name.

## The payment slip was paid, but the receivable is still open.

Check whether the charge is marked as paid and whether there is a financial account linked to the wallet. On non-business days, the bank return file may arrive later. If the payment slip has been paid for more than two business days, open a support ticket with the charge identifier, without sending bank access data.

## How can I find who changed an entry?

Open the entry and select **History**. For broader research, use **Reports > Change audit**. The history shows user, date, changed field, and previous and new values.

## Can I delete a category?

Categories that have already been used cannot be deleted. They can be deactivated. Old entries remain linked to the inactive category.

## Why doesn’t the dashboard total match my spreadsheet?

Usually, there is a difference in filters or accounting basis. Confirm whether the spreadsheet uses due date, accrual, or settlement date, and whether it includes canceled, partial, and overdue titles. The dashboard may take up to five minutes to update.

## How do I record a transfer between two company accounts?

Use **Finance > Transfers > New transfer**. Do not create a separate expense and income entry. The transfer creates two linked movements and does not affect the P&L (DRE).

## Is it possible to undo a reconciliation?

Yes. In the Reconciled tab, open the transaction and click **Undo reconciliation**. Decide whether to keep or reverse the associated settlement.

## Can support recover a deleted entry?

In general, not through the interface. Immediately provide the code, time, and responsible user. The team reviews technical logs, but recovery is not guaranteed. Therefore, prefer canceling when preserving history is important.
