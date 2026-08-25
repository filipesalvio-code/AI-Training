# Accounts Receivable Manual

## Create revenue

Go to **Finance > Accounts Receivable > New Revenue**. Enter the customer, description, amount, accrual date, due date, and category.

The customer record must have a valid CPF or CNPJ to issue a boleto or invoice. Revenue entries without bank collection can be created for customers without a document.

## Receipt methods

The receipt method field accepts cash, PIX, transfer, boleto, card, check, and others. This choice is used for reports and may enable additional fields.

For card sales, record the gross sale amount and the fee separately. If the acquirer integration is active, NexoERP creates the fee and the expected receipt automatically.

## Record receipt

Open the revenue entry and click **Record Receipt**. Confirm the date, financial account, and amount received.

When the customer pays only part of the debt, enter the actual amount. The entry remains **Partial**. New settlements can be recorded until the balance reaches zero.

To grant a discount, fill in the **Discount** field during settlement. The discount reduces the customer’s balance but does not increase the bank balance.

Example: invoice of R$ 1,000, receipt of R$ 950, and discount of R$ 50. The customer has no pending balance, and the financial account receives R$ 950.

## Boleto

After saving the revenue entry, use **Actions > Issue Boleto**. You must have a collection wallet configured in **Settings > Bank Integrations**.

It may take a few seconds for the boleto to be registered. In the meantime, the collection status appears as **Processing**. Do not click issue repeatedly.

Canceling the entry does not automatically cancel a boleto that has already been registered. First cancel the collection in **Collections > Boletos**, then cancel the financial entry.

## Email collection

In **Actions > Send Collection**, choose the message template and recipients. The email includes the amount, due date, and payment link.

Automatic reminders can be sent 5 days before, on the due date, and 3 days after. The intervals are configured in **Settings > Collections > Reminders**.

Customers marked with **Do not send automatic collection** do not receive reminders, even when the schedule is active.

## Renegotiation

To renegotiate overdue entries, select entries from the same customer and click **Renegotiate**. Enter the down payment, number of installments, interest, and first due date.

The original entries move to **Renegotiated** and no longer appear as open debt. The operation creates new entries linked to the agreement. Canceling the agreement reopens the original entries, as long as no agreement installment has been received.

## Delinquency

The delinquency report is in **Reports > Finance > Overdue Entries**. It can be grouped by customer, salesperson, or delay range.

The report uses the due date, not the accrual date. Partially received amounts appear only for the remaining open balance.
