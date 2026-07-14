# NileCart Email Notification Service — User & Developer Reference

---

# Part A — User Perspective

*For customers, sellers, operations teams, product managers, and anyone who does not need code-level detail.*

---

## A.1 What Is the Email Notification Service?

NileCart sends **transactional emails** when something important happens in the marketplace — for example, a login code, a seller application update, an order confirmation, a payment receipt, or a cancellation notice.

These are **not marketing newsletters**. They are system messages tied to real account, order, payment, and store events so every party stays informed.

Emails are sent from dedicated NileCart addresses such as:

| Address | Typical use |
|---------|-------------|
| `accounts@…` | Login and verification codes |
| `seller@…` | Seller onboarding and account status |
| `orders@…` | Order placed and status updates |
| `payments@…` | Payment receipts, failures, retries |
| `returns@…` | Customer cancellations |
| `inventory@…` | Low stock / out of stock alerts |
| `support@…` | Guidance when paid cancel needs human help |
| `shipping@…` | Shipment and delivery-related notices |
| `admin@…` / `security@…` | Internal ops and mismatch alerts |

Until custom domain mailboxes are fully verified with the email provider (Resend), some messages may show a shared fallback “From” address while content and purpose stay the same.

---

## A.2 Why Email Notifications Matter

### For customers

| Benefit | What it means for you |
|---------|------------------------|
| **Proof of purchase** | Order and payment emails confirm what you bought and paid |
| **Delivery updates** | Know when an order is packed, shipped, out for delivery, or delivered |
| **Security** | OTP codes and cancel guidance help keep your account and money safe |
| **Clarity on problems** | Failed payments and cancellations explain what happened next |

### For sellers

| Benefit | What it means for you |
|---------|------------------------|
| **New order alerts** | Act quickly when a customer places an order |
| **Paid vs unpaid** | Know when it is safe to ship (especially for online payments) |
| **Stock warnings** | Low / out-of-stock emails reduce lost sales |
| **Application status** | Approval, rejection, or deactivation is confirmed by email |

### For business & operations

| Benefit | What it means for the business |
|---------|--------------------------------|
| **Trust & conversion** | Shoppers expect confirmation emails in ecommerce |
| **Fewer support tickets** | Status and payment emails answer common “where is my order?” questions |
| **Seller SLA** | Sellers get notified to fulfill or stop shipping on cancel |
| **Ops visibility** | Admin alerts (e.g. new seller applications, payment mismatches) surface risk early |

---

## A.3 Who Receives Which Kinds of Email?

| Audience | Examples of emails they receive |
|----------|----------------------------------|
| **Customer** | Login OTP, order placed, payment receipt / failure, status updates, cancellations, paid-cancel guidance |
| **Seller** | Verification OTP, application received / approved / rejected, new order, paid order ready to ship, stock alerts, cancel stop-ship |
| **Admin / Support ops** | New seller application queue, payment verification mismatch alerts |
| **Delivery / future roles** | COD delivery failure (planned), assignment emails (future) |

Guests who never create an account may still receive order-related emails if they complete checkout with a verified email on the order.

---

## A.4 Overall Email Flow (Plain Language)

```text
Something important happens in NileCart
        │  (example: you place an order, pay, or a seller is approved)
        ▼
The server decides which email(s) to send
        │  (who should receive it, what template, which From address)
        ▼
The message is built (HTML + plain text)
        ▼
It is sent through Resend (email delivery provider)
        ▼
It arrives in the recipient’s inbox
```

**Important:** Most emails are sent **immediately** when the action succeeds (during the same request). One exception is the **“complete your payment” reminder**, which is sent later by a small scheduled job if payment is still pending.

If email delivery fails, NileCart usually **still completes the business action** (order placed, seller approved, etc.) and logs the email error so shopping is not blocked by mailbox problems.

---

## A.5 When Do Users Get Emails? (By Journey)

### Account & security

| When this happens | Who gets email | What the email is for |
|-------------------|----------------|------------------------|
| You request a storefront login code | Customer | One-time sign-in code |
| Seller / admin requests dashboard OTP | Seller or Admin | One-time dashboard login code |
| Seller verifies email during signup | Seller | Account verification code |

### Seller onboarding & store lifecycle

| When this happens | Who gets email | What the email is for |
|-------------------|----------------|------------------------|
| Seller submits store application | Seller + Admin | “We received your application” + ops queue alert |
| Admin approves seller | Seller | You’re approved — start selling |
| Admin rejects seller | Seller | Reason and how to fix / resubmit |
| Admin deactivates / reactivates seller | Seller | Account paused or restored |
| KYC incomplete / profile incomplete / policy update | Seller | Helpers ready; used when ops/cron enables them |

### Shopping & orders

| When this happens | Who gets email | What the email is for |
|-------------------|----------------|------------------------|
| COD order placed | Customer + Seller(s) | Order confirmation / new order to fulfill |
| Card checkout started | Customer + Seller(s) | Complete payment / pending order notice |
| Payment succeeds | Customer + Seller(s) | Receipt + “paid — ready to ship” (+ order confirmed) |
| Payment fails or is cancelled at gateway | Customer + Seller(s) | Failure + retry guidance / stop fulfillment |
| Pending payment left unpaid | Customer | Reminder after ~30 minutes (configurable) |
| Customer retries payment | Customer | New checkout link |
| Seller/admin marks packed / shipped / out for delivery / delivered | Customer (and sellers on deliver) | Status progress |
| Customer cancels early | Customer + Seller(s) | Cancel confirm + stop shipping |
| Customer tries to cancel a **paid card** order in-app | Customer | Contact support guidance (cancel not allowed online) |
| Admin cancels an order | Customer + Seller(s) | Reason + stock restored notice |

### Inventory

| When this happens | Who gets email | What the email is for |
|-------------------|----------------|------------------------|
| Stock drops to / below low-stock threshold (but not zero) | Seller | Restock soon |
| Stock reaches zero | Seller | Out of stock — listing unavailable for that SKU |

Inventory emails only fire when stock **crosses** a threshold (not on every small drop while already low).

---

## A.6 What Shoppers and Sellers Should Expect

### Timing

- Most messages arrive within seconds of the event.
- Payment reminders arrive after a waiting period (default **30 minutes**) if the online payment is still pending.
- Delivery depends on inbox providers (Gmail, Outlook, etc.) and spam filters.

### Soft failures

If the email provider is misconfigured or temporarily down:

- You may not receive an email **even though** the action succeeded (e.g. order is still placed).
- Check **Orders** / **Seller dashboard** in the app as the source of truth.
- Ops can fix provider settings (`RESEND_API_KEY`, verified From addresses).

### Spam & branding

Ask recipients to whitelist NileCart domains. Prefer verifying domain mailboxes (`orders@`, `payments@`, …) in Resend for best deliverability.

---

## A.7 Operations / Stakeholder Cheatsheet

| Business goal | Emails that support it |
|---------------|------------------------|
| Reduce “did my order go through?” tickets | E1 order placed, F1 payment received |
| Help sellers fulfill faster | E2 new order, F2 paid ready to ship |
| Recover abandoned checkouts | F5 pending payment reminder, F6 retry link |
| Stop wasted shipping on cancels | G2 / G5 / F4 stop-fulfillment emails |
| Catch payment fraud / bad gateway data | F7 mismatch alert to admin |
| Keep catalog sellable | C4 / C5 stock alerts |

---

# Part B — Technical Reference

*For backend engineers and integrators.*

---

## B.1 Architecture Overview

```text
HTTP / webhook / cron event
        │
        ▼
Domain service (order, payment, seller, product, auth)
        │
        ▼
Notify helper (*Email.service.js)
  • resolve recipients (customer / seller / admin)
  • build template data (order number, amounts, links)
  • soft-fail wrap (never block core transaction)
        │
        ▼
email.service.js
  • render*Email(eventKey, data)  → subject + HTML + text
  • buildFromHeader(senderKey)    → NileCart <mailbox@domain>
  • sendEmail()                   → Resend API
        │
        ▼
src/emails/
  design/         tokens, escape helpers
  components/     Layout, Button, Card, OrderItemsTable, …
  templates/      seller | inventory | order | payment | cancellation
  senders.js      EMAIL_SENDERS + *_EVENT_META (id, From, subject)
```

**Provider:** [Resend](https://resend.com) via `src/vendor/resend.vendor.js`.  
**Preview CLI:** `npm run preview:emails:seller` → `tmp/email-previews/`.

---

## B.2 Folder Map

| Path | Responsibility |
|------|----------------|
| `src/emails/design/` | Brand tokens, HTML escape, date formatting |
| `src/emails/components/` | Shared email UI (header, footer, buttons, tables) |
| `src/emails/templates/seller/` | Seller lifecycle B1–B9 |
| `src/emails/templates/inventory/` | Stock C4–C5 |
| `src/emails/templates/order/` | Order placement & status E* |
| `src/emails/templates/payment/` | Payments F1–F11 |
| `src/emails/templates/cancellation/` | Cancellations G1–G6 |
| `src/emails/senders.js` | From-address catalog + per-event subject/priority |
| `src/emails/index.js` | `renderSellerEmail`, `renderOrderEmail`, … |
| `src/services/email.service.js` | OTP + `sendEmail` + typed senders |
| `src/services/sellerEmail.service.js` | Seller notify helpers |
| `src/services/inventoryEmail.service.js` | Stock threshold notify |
| `src/services/orderEmail.service.js` | Order placed / status |
| `src/services/paymentEmail.service.js` | Payment success/fail/retry/reminder |
| `src/services/cancellationEmail.service.js` | Cancel flows G1–G6 |
| `src/cron/index.js` | Pending payment reminder scanner (F5) |

---

## B.3 Delivery Process

1. **Trigger** fires in a domain service after DB commit (or after a validation gate for G3).
2. **Notify helper** loads recipient emails (User populate / Seller.user / `EMAIL_ADMIN_NOTIFY`).
3. **`send*Email(eventKey, { to, data })`** looks up meta in `*_EVENT_META`.
4. **Template builder** returns `{ html, text }`; subject comes from meta.
5. **From header** resolved as:
   - `EMAIL_FROM_<MAILBOX>` if set, else
   - constructed `Display <local@EMAIL_DOMAIN>`, with
   - fallback swap to `RESEND_FROM_EMAIL` when the specific mailbox override is unset (sandbox-friendly).
6. **Resend** `emails.send`; errors bubble to `safeSend` and are logged.
7. Business response returns success regardless of soft email failure (except OTP flows, which may hard-fail if email is required and misconfigured in production).

### Soft-fail pattern

```js
const safeSend = async (label, fn) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[moduleEmail] ${label} failed:`, error.message || error);
    return { sent: false, error };
  }
};
```

OTP emails (`sendCustomerLoginOtp`, etc.) intentionally **fail the request** in production when Resend is not configured, because the user cannot proceed without the code.

---

## B.4 Configuration

| Env variable | Purpose |
|--------------|---------|
| `RESEND_API_KEY` | Resend API key (required to actually send) |
| `RESEND_FROM_EMAIL` | Fallback / verified From |
| `EMAIL_DOMAIN` | Default domain for constructed mailboxes (`nilescart.com`) |
| `EMAIL_FROM_ACCOUNTS` / `_SELLER` / `_ORDERS` / `_PAYMENTS` / `_RETURNS` / `_INVENTORY` / `_SHIPPING` / `_SUPPORT` / `_SECURITY` / `_LEGAL` / `_FINANCE` / `_ADMIN` / `_NOREPLY` | Optional per-mailbox From |
| `EMAIL_ADMIN_NOTIFY` | Comma-separated ops inboxes (B2 seller applications, F7 mismatches) |
| `DASHBOARD_URL` | CTA base for seller/admin links |
| `STOREFRONT_URL` | CTA base for customer order/pay links |
| `LOW_STOCK_THRESHOLD` | Inventory low-stock crossover (default `5`) |
| `PAYMENT_PENDING_REMINDER_MINUTES` | Delay before F5 (default `30`) |
| `PAYMENT_REMINDER_CHECK_MINUTES` | Cron scan interval (default `5`) |

See `.env.example` for copy-paste defaults.

---

## B.5 Event Catalog

IDs match product notification planning (B / C / E / F / G). Prefer the dedicated cancellation module (G1–G6) over legacy `ORDER_CANCELLED_*` templates for new cancel traffic.

### Auth OTP (inline templates in `email.service.js`)

| Trigger | Recipient | From key |
|---------|-----------|----------|
| Customer login OTP | Customer | `accounts` |
| Seller signup OTP | Seller | `accounts` |
| Dashboard seller/admin OTP | Seller / Admin | `accounts` |

### Seller lifecycle (`sellerEmail.service.js`)

| ID | Event key | Trigger (code) |
|----|-----------|----------------|
| B1 | `APPLICATION_SUBMITTED_SELLER` | `applyForSeller` / resubmit after reject |
| B2 | `APPLICATION_SUBMITTED_ADMIN` | Same → `EMAIL_ADMIN_NOTIFY` / `ADMIN_EMAIL` |
| B3 | `SELLER_APPROVED` | `approveSeller` |
| B4 | `SELLER_REJECTED` | `rejectSeller` |
| B5 | `SELLER_DEACTIVATED` | `deactivateSeller` |
| B6 | `SELLER_REACTIVATED` | `reactivateSeller` |
| B7–B9 | KYC / profile / policy | Exported helpers (cron/admin-ready) |

### Inventory (`inventoryEmail.service.js`)

| ID | Event key | Trigger |
|----|-----------|---------|
| C4 | `LOW_STOCK` | Order stock decrement or product variant update crosses ≤ threshold, still > 0 |
| C5 | `OUT_OF_STOCK` | Stock crosses to 0 |

Threshold logic: `classifyStockAlert(previous, current, threshold)` — only **boundary crosses**, not continuous low stock.

### Orders (`orderEmail.service.js`)

| ID | Event key | Trigger |
|----|-----------|---------|
| E1 | `ORDER_PLACED_CUSTOMER` | COD `placeOrder` / card `initializeCheckout` |
| E2 | `ORDER_PLACED_SELLER` | Same (per seller item group) |
| E5 | `ORDER_CONFIRMED_CUSTOMER` | Payment success → status confirmed; or seller/admin set `confirmed` |
| E6 / E8 / E9 / E10 | packed / shipped / OFD / delivered | Seller or admin status update |
| E11 | `ORDER_DELIVERED_SELLER` | Status → `delivered` |

### Payments (`paymentEmail.service.js`)

| ID | Event key | Trigger |
|----|-----------|---------|
| F1 / F2 | success customer / seller | `applyPaymentVerification` success |
| F3 / F4 | failed customer / seller | `failPaymentAndCancelOrder` (replaces G1/G2 for payment cancels) |
| F5 | pending reminder | Cron `processPendingPaymentReminders` |
| F6 | retry | `retryCheckout` |
| F7 | mismatch admin | tx_ref or amount mismatch in verification |
| F8–F11 | adjustment / payout / payout failed / commission | Helpers only (future finance) |

### Cancellations (`cancellationEmail.service.js`)

| ID | Event key | Trigger |
|----|-----------|---------|
| G1 / G2 | customer cancel confirm / seller stop | `cancelOrder` (customer) |
| G3 | paid cancel blocked | Customer attempts cancel on paid card → email then `400` |
| G4 / G5 | ops cancel customer / seller stock restore | Admin sets `orderStatus: cancelled` (stock restored) |
| G6 | COD refusal | `notifyCodRefusal` (future delivery flow) |

---

## B.6 End-to-End Examples

### Card checkout & pay

```text
POST /api/payments/checkout
  → buildOrderFromCart (stock −)
  → OrderEmail.notifyOrderPlaced (E1/E2)
  → Flutterwave hosted URL returned

Gateway success (redirect or webhook)
  → applyPaymentVerification
  → PaymentEmail.notifyPaymentSuccessful (F1/F2)
  → OrderEmail.notifyOrderStatusChanged confirmed (E5)

Gateway fail / cancel
  → failPaymentAndCancelOrder (stock +)
  → PaymentEmail.notifyPaymentFailed (F3/F4)
```

### Customer cancel

```text
PATCH /api/orders/:id/cancel

IF paid card:
  → CancellationEmail.notifyPaidCancelBlocked (G3)
  → throw 400

ELSE early stage:
  → restore stock/coupon
  → CancellationEmail.notifyCustomerCancellation (G1/G2)
```

### Payment reminder (scheduled)

```text
server start → startCronJobs()
every PAYMENT_REMINDER_CHECK_MINUTES:
  find card + pending + placed + createdAt ≤ now − N minutes
  + missing flutterwave.paymentReminderSentAt
  → notifyPaymentPendingReminder (F5)
  → set paymentReminderSentAt
```

---

## B.7 Multi-Vendor Recipient Splitting

Orders may contain products from multiple sellers. Helpers call `groupOrderItemsBySeller(order)`:

1. Collect product IDs from line items  
2. Load products → `seller`  
3. Group line items by seller  
4. Email each seller **only their items**

Customers always receive the full order view in customer-facing templates.

---

## B.8 Template Development

1. Add / edit builder under `src/emails/templates/<domain>/`.
2. Register in that domain’s `index.js` template map.
3. Add `*_EVENT_META` entry in `senders.js` (id, sender, subject, priority).
4. Expose notify helper in the matching `*Email.service.js`.
5. Call notify from domain service **after** successful persistence.
6. Preview: `npm run preview:emails:seller`.

Always `escapeHtml` user-provided strings in templates. Prefer shared components over one-off HTML.

---

## B.9 Testing Checklist

- [ ] OTP arrives with Resend configured; fails clearly if not configured in production
- [ ] Seller apply → B1 to seller, B2 to `EMAIL_ADMIN_NOTIFY`
- [ ] Approve / reject / deactivate / reactivate send B3–B6
- [ ] COD place → E1 + E2
- [ ] Card checkout → E1/E2 with payment-pending messaging
- [ ] Pay success → F1/F2 + E5
- [ ] Pay fail → F3/F4 (order cancelled, stock restored)
- [ ] Retry checkout → F6 with new link
- [ ] Leave payment pending past threshold → F5 once
- [ ] Amount / tx_ref mismatch → F7 to ops
- [ ] Customer cancel → G1/G2
- [ ] Paid cancel attempt → G3 + API 400
- [ ] Admin cancel → G4/G5 and stock restored
- [ ] Stock crossover → C4 or C5 only on threshold cross
- [ ] Soft-fail: break Resend key → business APIs still succeed (except OTP)

---

## B.10 Known Gaps & Future Scope

### Current limitations

| Gap | Impact |
|-----|--------|
| Most sends are **inline** in the HTTP request | Adds latency; spikes with multi-seller fan-out |
| Soft-fail can hide undelivered mail | Users may not know email failed |
| No bounce / complaint webhook handling | Deliverability ops is manual |
| No user email preference center | Cannot opt out of non-critical nudges (B8, F5) |
| F8–F11 / B7–B9 / G6 not productized | Templates exist; domain workflows incomplete |
| Legacy `ORDER_CANCELLED_*` templates remain | Prefer cancellation module for cancel traffic |
| In-process cron only | Not suitable for multi-instance horizontal scale without leader election / distributed lock |

### When background workers become required

Move email off the request path when any of the following is true:

1. **Volume** — high order rate makes Resend round-trips dominate p95 API latency  
2. **Fan-out** — multi-vendor carts + admin CC lists cause many sends per event  
3. **Retries** — need exponential backoff, dead-letter queues, and idempotent “exactly once” delivery keys  
4. **Multi-instance** — more than one API process must not double-fire F5 cron without a lock  
5. **Heavy templates** — PDF invoices / large attachments  
6. **Compliance** — audit log of every send attempt independent of app logs  

### Recommended future architecture

```text
Domain event → Outbox table / stream
                    ↓
            Worker(s) (BullMQ / SQS / Cloud Tasks)
                    ↓
         email.service send + idempotency key
         (orderId + eventKey + recipient)
                    ↓
         Resend + delivery webhooks (delivered / bounced)
```

Suggested worker-backed jobs first:

| Job | Reason |
|-----|--------|
| Order placed / paid fan-out | Highest volume + multi-seller |
| Payment pending reminders | Already scheduled; needs distributed lock |
| Inventory digest (daily) | Replace per-SKU spam with digests |
| Seller payout / commission packs (F9–F11) | Batch finance |
| Marketing / announcements | Must be queued + unsubscribed |

### Incremental migration path

1. Keep current notify helpers as the **public API**.  
2. Swap internals from direct Resend → `enqueueEmail(eventKey, payload)`.  
3. Run workers that call the same `send*Email` renderers (templates stay unchanged).  
4. Add send-attempt collection: `{ eventKey, to, status, providerId, attempts }`.  
5. Add Resend webhooks for bounce → mark user undeliverable.

---

## B.11 Related Documentation

- Seller onboarding (triggers B1–B6): `documentation/seller-onboarding.documentation.md`
- Catalog / stock: `documentation/catalog.documentation.md`
- Coupons (restore on cancel interacts with cancel emails): `documentation/coupon.documentation.md`
- Env samples: `.env.example`
- HTML preview: `npm run preview:emails:seller` → `tmp/email-previews/`

---

## B.12 Quick Reference — Notify Entry Points

| Helper module | Main exports |
|---------------|--------------|
| `sellerEmail.service.js` | `notifySellerApplicationSubmitted`, `notifySellerApproved`, `notifySellerRejected`, `notifySellerDeactivated`, `notifySellerReactivated`, … |
| `inventoryEmail.service.js` | `notifyStockChange`, `notifyProductVariantStockChanges` |
| `orderEmail.service.js` | `notifyOrderPlaced`, `notifyOrderStatusChanged`, `notifyOrderCancelled` (delegates cancel) |
| `paymentEmail.service.js` | `notifyPaymentSuccessful`, `notifyPaymentFailed`, `notifyPaymentRetry`, `notifyPaymentMismatch`, `processPendingPaymentReminders`, … |
| `cancellationEmail.service.js` | `notifyCustomerCancellation`, `notifyPaidCancelBlocked`, `notifyOpsCancellation`, `notifyCodRefusal` |
| `email.service.js` | `sendEmail`, OTP senders, `sendSellerLifecycleEmail`, `sendInventoryEmail`, `sendOrderEmail`, `sendPaymentEmail`, `sendCancellationEmail` |

---

*Last updated to reflect the NileCart email notification implementation: modular templates, Resend delivery, seller / inventory / order / payment / cancellation domains, and the pending-payment reminder cron.*
