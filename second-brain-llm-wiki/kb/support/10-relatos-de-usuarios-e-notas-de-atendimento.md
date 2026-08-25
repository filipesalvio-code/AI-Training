# User Reports and Support Notes

Compiled observations received during training and support calls. The text below preserves the informal way of the reports and may contain user hypotheses, not technical conclusions.

## Report 1842 — payment disappeared from the dashboard

> I paid the rent yesterday and today it disappeared from the accounts payable card. I looked in accounts payable and found it marked as paid. I thought the system had deleted it.

Support note: the dashboard was filtered to **Open**. When switched to **All situations**, the entry appeared. We explained that marking it as paid removes the item from pending but does not erase the history.

## Report 1870 — cash total different from the bank

> Nexo shows R$ 800 more than the bank app. I did the reconciliation and it didn't solve the issue.

Support note: there was a check recorded as received but not yet cleared. The payment had been made directly in the checking account. The client decided to reverse it and record the receipt first in the `Checks to be cleared` account.

## Report 1901 — duplicate charge

> I clicked to issue the boleto, it took a while, so I clicked again. Now the client received two links.

Support note: one charge was recorded and the other was rejected by the bank. We confirmed the identifier of the valid charge and canceled the excess attempt. Guidance: wait while it is **Processing**.

## Report 1944 — future installments did not change

> I changed the category of the June installment, but July and August remained in the old category.

Support note: the user edited only one installment. We repeated the change by selecting **Apply to future installments as well**. Already paid installments were not modified.

## Report 2013 — DRE does not match cash flow

> My DRE shows profit for the month, but the cash flow decreased. Which report is wrong?

Support note: none were necessarily wrong. The DRE was on an accrual basis and there were payments for purchases made in previous months, as well as loan installments. We showed the difference between economic results and financial movements.

## Report 2057 — transfer became revenue

> I sent money from the bank account to the digital account and classified the entry as revenue. Now it looks like we sold more.

Support note: we canceled the revenue and expense created manually and recorded a transfer between own accounts. After that, the account balances remained correct and the false revenue was removed from the DRE.

## Report 2088 — deactivated user still appeared

> I removed the person from the company, but their name still appears in the payment history.

Support note: expected behavior. Access was blocked, and the history retains the original author for auditing. The user could no longer log in.

## Report 2140 — canceled invoice, open boleto

> I canceled the invoice at the city hall and thought the boleto would be canceled as well.

Support note: NFS-e, boleto, and financial entry have independent cycles. The boleto needed to be canceled in the Collections area, and the revenue was canceled separately.

## Report 2196 — export not received

> I requested a spreadsheet for two years and it didn't arrive in my email.

Support note: the export had 32,000 lines and was processed in the background. The file was available in the Notifications bell. The client expected to receive it by email because older versions of the process worked that way.

## Report 2241 — recurrence ended but accounts remain

> I canceled the rent recurrence, but two future accounts still appear.

Support note: ending the recurrence prevents new generations but does not remove already created entries. The two accounts were reviewed and canceled individually.

## Patterns Observed by the Team

- users confuse filtering with deletion;
- cash and accrual need to be explained with examples;
- bank integrations are not always instantaneous;
- actions on boleto, invoice, and entry do not propagate automatically;
- recurrence and installment seem the same to new users;
- it is better to ask for identifiers and times than long descriptions without context.
