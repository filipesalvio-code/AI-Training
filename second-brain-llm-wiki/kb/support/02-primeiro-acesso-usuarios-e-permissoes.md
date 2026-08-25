# First access, users, and permissions

## Initial access

The default address is `https://app.nexoerp.exemplo`. Each person must use their own user account. Shared login harms auditing and is not recommended.

On first access:

1. enter the email used in the invitation;
2. create a password with at least 10 characters;
3. accept the terms of use;
4. confirm the code sent by email;
5. choose the company you want to access.

The confirmation code expires in 15 minutes. If it expires, click **Resend code**. Delivery may take up to two minutes.

## Two-factor authentication

Two-factor authentication, called 2FA, can be enabled in **My profile > Security**. The system supports an authenticator app. SMS is not available.

Administrators can make 2FA mandatory for the entire company in **Settings > Security**. After enforcement is enabled, users without 2FA will have to set it up on their next access.

Keep recovery codes outside your computer. Each code works only once.

## Default profiles

**Administrator**: configures the company, creates users, changes permissions, and accesses all data.

**Finance**: creates and edits entries, settles transactions, reconciles statements, and issues reports. Does not manage users by default.

**Approver**: views payments awaiting approval and can approve or reject them according to the defined limit.

**Read-only**: only views authorized screens and reports. Does not create, edit, or settle entries.

**Accountant**: reviews accounting reports, documents, and exports. Access to banking data can be disabled.

## Create a user

Go to **Settings > Users > Invite user**. Enter name, email, profile, and allowed companies. The invitation is valid for 72 hours.

If the invitation expires, open the user record and select **Resend invitation**. There is no need to delete and register the user again.

## Payment approval

The company can require approval for expenses above a certain amount. The rule is in **Settings > Finance > Approvals**.

Example: payments up to R$ 1,000 do not require approval; from R$ 1,000.01 to R$ 10,000 require one approver; above R$ 10,000 require two approvers.

The person who created the entry can be prevented from approving it. This separation is configurable. A rejected payment returns to **Open** status with the reason for rejection.

## Lockout and password recovery

After five incorrect attempts, login is locked for 20 minutes. The **I forgot my password** option sends a link valid for 30 minutes.

Administrators cannot view another user’s password. They can only block access, end active sessions, or trigger a reset.

## Employee offboarding

Do not delete the user. Use **Block access** to preserve audit history. Also end active sessions and transfer pending approval tasks to another approver.
