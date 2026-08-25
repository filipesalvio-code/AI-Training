# Accounts payable manual

## Add an expense

Go to **Financial > Accounts payable** and click **New expense**.

Main fields:

- supplier;
- description;
- amount;
- accrual date;
- due date;
- category;
- cost center;
- planned financial account;
- payment method;
- document number;
- attachment.

Supplier, description, amount, due date, and category are required. The financial account can be left blank while the payment is still unplanned.

The **Document number** field is used to identify duplicates. When the same supplier, number, and amount already exist, the system shows an alert. The alert does not block saving because there may be legitimate documents with the same data.

## Installments

To split a purchase, check **Installment plan** and enter the quantity, first due date, and interval. The system suggests monthly installments and appends `/01`, `/02`, and so on to the document number.

Any rounding difference is applied to the last installment. A purchase of R$ 100 split into three parts generates R$ 33.33, R$ 33.33, and R$ 33.34.

Changing only one installment does not modify the others. To change the series, select **Also apply to future installments**.

## Recurrence

Use recurrence for repeated expenses without a defined quantity, such as rent and subscriptions. Options are weekly, monthly, every two months, quarterly, semiannual, and annual.

NexoERP creates recurring entries 45 days before each due date. Ending recurrence does not delete entries that have already been generated.

Installments represent a single obligation split into parts. Recurrence represents independent obligations. This difference affects reports and cancellations.

## Attachments

PDF, PNG, JPG, XML, and text files are accepted, up to 10 MB per file. The limit is five attachments per entry. Executable files and compressed folders are not accepted.

## Settle an account

Open the entry and click **Record payment**. Enter:

1. payment date;
2. amount paid;
3. financial account;
4. interest, penalty, or discount, if any;
5. optional note.

If the entered amount is lower, the entry is marked **Partial** and keeps the remaining balance open. If it is higher, the system requires the difference to be classified as interest or an additional charge.

Interest and penalty use the expense category by default, but can be routed to specific categories in financial settings.

## Reverse a payment

Open the paid account, go to **Payment history**, and select **Reverse**. Reversal returns the entry to its previous status and corrects the financial account balance.

It is not possible to reverse a payment included in a closed accounting period. An administrator must reopen the period or record an adjusting entry in the current period.

## Batch payment

In the account list, select the items and choose **Actions > Batch payment**. All items must use the same financial account and the same payment date. Expenses in different currencies cannot be in the same batch.

The batch supports up to 200 entries. If any item requires approval, the entire batch remains pending approval.
