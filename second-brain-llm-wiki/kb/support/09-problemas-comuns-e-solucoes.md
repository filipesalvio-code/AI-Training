# Common problems and quick solutions

Internal support team document. Review: May.

## Blank screen after login

1. Refresh the page with `Ctrl+Shift+R` or `Cmd+Shift+R`.
2. Test in an incognito/private window.
3. Disable blocking extensions only for the NexoERP address.
4. Confirm the computer’s date and time are set automatically.
5. If it persists, collect browser info, timestamp, and a screenshot.

Supported browsers: current versions of Chrome, Edge, Firefox, and Safari. Internet Explorer is not supported.

## Access code did not arrive

Confirm the email address and spam folder. Wait two minutes before resending. Too many resends invalidate previous codes: only the most recent code works.

## Register Payment button disabled

Possible causes:

- user does not have settlement permission;
- accounting period is closed;
- entry was canceled;
- payment is pending approval;
- someone else is editing the record at that moment.

Hover over the button to see the reason shown on screen.

## Error "competency date earlier than allowed period"

The date is within a closed period. Do not recommend changing the date just to bypass the block. Finance should consult the accountant and request reopening or guidance for an adjustment entry.

## OFX statement does not import

Check whether the file is actually OFX and belongs to the selected account. Some banks provide HTML with an `.ofx` extension; open it in a text editor and confirm the content starts with an OFX header.

Files over 5 MB or covering more than 90 days must be split. If there is an incompatible account message, check bank, branch, and account number in the record.

## Statement imported in duplicate

First verify whether the transactions are truly duplicated or whether the bank provided different identifiers. Do not bulk-delete settlements before this check.

To remove an import that has not yet been reconciled, go to **Import history > Undo import**. If reconciliation has already happened, remove the links first.

## Boleto stuck in Processing

Wait up to 15 minutes. Then refresh the billing status. Do not issue another boleto for the same receivable while the first is still processing.

If it exceeds 30 minutes, open a ticket with billing ID, bank, wallet, and time. Do not attach certificate, password, or token.

## Boleto rejected due to address

Check ZIP code with eight digits, city, state, street, and customer number. Some banks do not accept number `0` or `S/N`; in that case, follow the specific guidance of the banking agreement.

## Duplicate balance after transfer

Usually, the transfer was recorded and a receivable and payable were also created manually. Locate all three records by amount and date. Keep the transfer and cancel the duplicate entries, after user confirmation.

## Exported report did not arrive

Large exports are not sent by email. They appear in the **Notifications** bell. Processing may take a few minutes, and the file is available for seven days.

## Message "record changed by another user"

NexoERP prevented an older edit from overwriting newer data. Refresh the screen, review the changes made by the other person, and repeat only the necessary adjustment.

## Minimum data to escalate to technical support

- company and CNPJ;
- affected user;
- URL or screen name;
- entry, billing, or import identifier;
- date and time with timezone;
- steps performed;
- expected result and observed result;
- screenshot without sensitive data.

Never ask for password, 2FA code, API token, PIX key, or remote access to the bank.
