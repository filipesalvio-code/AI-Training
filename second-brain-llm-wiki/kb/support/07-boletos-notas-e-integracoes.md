# Boletos, invoices, and integrations

## Bank integration

There are two types of connection:

**Statement reading**: imports balances and transactions for reconciliation.

**Collections and payments**: registers boletos or sends payments to the bank, according to the contracted agreement.

The integration is configured in **Settings > Bank integrations** by an administrator. Availability depends on the bank and the NexoERP plan.

An account may show the status **Attention required** when bank authorization expires. In this case, click **Reconnect**. Reconnecting does not delete history.

## Boletos

Before the first issuance, register the collection wallet, beneficiary, interest, penalty, and instructions. Create a low-value charge to validate the configuration.

Possible charge statuses:

- processing;
- registered;
- paid;
- overdue;
- cancellation requested;
- canceled;
- rejected.

A rejected boleto should not be sent to the customer. Open the details to see the code returned by the bank. Common causes: invalid payer document, incomplete ZIP code, non-validated wallet, and incorrect agreement.

Bank settlement may take until the next business day to appear, depending on the bank. PIX associated with the boleto is usually confirmed within a few minutes, but it can also be delayed.

## Service invoice

NexoERP sends NFS-e to integrated municipalities. You must configure a digital certificate, municipal registration, tax regime, and service code.

Financial revenue can exist without an invoice. To issue one, open the revenue entry and select **Actions > Issue NFS-e**.

Invoice statuses:

- draft;
- in queue;
- sent;
- authorized;
- rejected;
- canceled.

A rejected invoice does not change accounts receivable. Correct the data and resend. Do not create a second revenue entry just to try issuing again.

NFS-e cancellation follows the city hall’s deadline and rules. Canceling the invoice does not automatically cancel the revenue entry, boleto, or receipt.

## XML import

Incoming invoice XML can create a supplier, expense, items, and taxes. Go to **Purchases > Import XML**.

Review category, cost center, due dates, and payment terms before confirming. The XML provides tax data, but it does not always include the financial classification used by the company.

The system warns you when the access key has already been imported. A supplementary invoice has its own key and is not considered a duplicate.

## Accounting integration

Accounting export uses the chart of accounts linked to financial categories. Categories without an accounting account appear in the pending items report.

Period closing blocks edits, deletion, settlement, and reversal before the closing date. Administrators can reopen the period, but the action is logged in the audit trail.

## API

Customers on the Integration plan can use the API to register people, entries, and check settlements. Tokens are created in **Settings > Integrations > API**.

The token is shown only once. If it is lost, revoke it and create another one. Never put the token in spreadsheets, support tickets, or code run in the browser.
