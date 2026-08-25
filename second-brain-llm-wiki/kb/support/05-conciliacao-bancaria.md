# Bank Reconciliation Guide

Reconciliation is the comparison between the bank statement and the entries in NexoERP. The goal is to confirm that each bank inflow or outflow has a correct matching entry in the system.

## Before you start

Check that the financial account has the correct bank, branch, account number, and opening balance. The opening balance must represent the bank’s balance on the day before the first day tracked in NexoERP.

Do not change the opening balance to fix current differences. Use reconciliation to find the source of the discrepancy.

## Import a statement

Go to **Financial > Bank reconciliation**, choose the account, and click **Import statement**.

Accepted formats:

- OFX;
- CSV in the NexoERP template;
- automatic bank integration.

The maximum period per OFX file is 90 days. Files with transactions from more than one account must be split before import.

The system detects duplicates by transaction ID, date, amount, and account. Reimporting the same file usually does not duplicate transactions.

## Automatic suggestions

NexoERP looks for entries with the same amount and date up to three days before or after the bank transaction. Description, CPF/CNPJ, and document number increase the suggestion confidence.

A suggestion is not a settlement. The user must review and confirm it.

## Reconcile with an existing entry

Select the statement transaction, check the suggestion, and click **Reconcile**. If there is no suggestion, use **Find entry** and search by amount, period, or person.

One transaction can be linked to multiple entries. This is useful for deposits that group different sales. Likewise, multiple transactions can be linked to one entry, such as a split payment.

The sum of the items must match the statement amount. Fee differences must be recorded as a new entry.

## Create an entry from the statement

When there is no record in the system, select **Create and reconcile**. Choose income, expense, or transfer, and enter the category.

Avoid classifying transfers between your own accounts as income or expense. Choose **Transfer** and indicate the destination or source account. This prevents inflating results.

## Ignore a transaction

The **Ignore** option is for informational lines with no financial impact, such as end-of-day balance lines included in some files. Do not use Ignore for fees, interest, or real payments.

## Undo reconciliation

Open the **Reconciled** tab, find the transaction, and click **Undo reconciliation**. The transaction becomes pending again.

If the settlement was created during reconciliation, the system asks whether it should also be reversed. Read the confirmation carefully: keeping the settlement may be correct when only the statement link was wrong.

## Difference between system balance and bank balance

Check, in this order:

1. filter date;
2. opening balance;
3. transactions pending reconciliation;
4. settled entries in the wrong account;
5. duplicates;
6. transfers recorded as income or expense;
7. unrecorded bank fees.

Future transactions do not explain differences in the current balance, but they appear in the cash flow projection.
