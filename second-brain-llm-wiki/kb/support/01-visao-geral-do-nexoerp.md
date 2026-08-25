# NexoERP Financial — overview

NexoERP is a financial management system for small and medium-sized businesses. This material covers the **NexoERP Cloud** edition, accessed through a web browser.

The Financial module includes:

- accounts payable;
- accounts receivable;
- customer and supplier records;
- bank accounts and cash accounts;
- bank reconciliation;
- cash flow;
- boleto issuance;
- management reports;
- integration with invoices and accounting.

## Concepts used in the system

A **Transaction** is any planned or completed amount. An electricity bill due next month is a planned transaction. After payment and clearing, it becomes part of the completed amounts.

**Clearing** is the confirmation that an account was paid or received. Clearing changes the balance of the selected financial account.

**Accrual period** indicates when the revenue or expense was generated. **Due date** indicates when it should be paid or received. **Settlement** indicates when the money actually came in or went out.

A **Financial account** represents where the money is held: checking account, digital account, investment account, or physical cash.

A **Category** explains the nature of the transaction, such as Rent, Utilities, Service revenue, or Taxes.

A **Cost center** identifies the area, unit, or project responsible for the revenue or expense. The same transaction can be split across more than one cost center.

## Home screen

When entering the Financial module, the user sees the dashboard with current balance, overdue accounts, upcoming amounts due, amounts to receive, and cash projection. The cards follow the company, period, and financial account filters shown at the top of the screen.

The current balance considers only cleared transactions. The projection also includes planned transactions within the selected period.

The most-used shortcuts are:

1. **New payment**;
2. **New receipt**;
3. **Import statement**;
4. **Issue boleto**;
5. **View cash flow**.

## Transaction status

- **Open**: not yet settled and not overdue.
- **Overdue**: not settled and the due date has passed.
- **Paid** or **Received**: has confirmed clearing.
- **Partial**: only part of the amount has been cleared.
- **Scheduled**: the payment was sent to the bank, but there is no confirmation yet.
- **Canceled**: invalidated and does not affect balances or projections.

Delete and cancel are not the same thing. Deletion removes the record and is only allowed when no links/dependencies exist. Canceling preserves the history.

## Help and support

The **?** icon in the top-right corner opens the help center. Tickets are submitted in **Help > Contact support**. When opening a ticket, provide the company, the screen, the transaction code, and the approximate time of the error.

Never send passwords, bank tokens, or digital certificates in a ticket.
