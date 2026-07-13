/**
 * Dev helper — renders seller + inventory emails to HTML files.
 * Usage: node scripts/previewSellerEmails.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  renderSellerEmail,
  renderInventoryEmail,
  renderOrderEmail,
  renderPaymentEmail,
  renderCancellationEmail,
  SELLER_EVENT_META,
  INVENTORY_EVENT_META,
  ORDER_EVENT_META,
  PAYMENT_EVENT_META,
  CANCELLATION_EVENT_META,
} from "../src/emails/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../tmp/email-previews");

const sample = {
  sellerName: "Amina Okello",
  storeName: "Nile Threads",
  applicationId: "665f1a2b3c4d5e6f7a8b9c0d",
  sellerEmail: "amina@example.com",
  sellerMobile: "+256700000000",
  nationalId: "CM1234567890",
  tinNumber: "TIN-998877",
  city: "Kampala",
  country: "Uganda",
  submittedAt: new Date(),
  approvedAt: new Date(),
  rejectedAt: new Date(),
  deactivatedAt: new Date(),
  reactivatedAt: new Date(),
  commissionRate: 12,
  rejectionReason:
    "Business registration document was unclear. Please upload a higher-resolution copy.",
  reason: "Repeated late shipment SLA breaches",
  missingDocuments: ["Business registration", "Address proof"],
  expiredDocuments: ["National ID"],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  incompleteFields: ["Store logo", "Store banner", "Store description"],
  completionPercent: 55,
  updateTitle: "Updated seller commission & performance policy",
  summary:
    "We are refining marketplace commission rates and clarifying fulfillment SLAs.",
  changes: [
    "Standard commission moves to 12% for apparel categories",
    "Orders must be packed within 48 hours of confirmation",
    "Updated prohibited items list for beauty and accessories",
  ],
  effectiveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  previousCommission: 10,
  newCommission: 12,
  dashboardUrl: "http://localhost:5173/seller",
  addProductUrl: "http://localhost:5173/seller/products/new",
  profileUrl: "http://localhost:5173/seller/profile",
  ordersUrl: "http://localhost:5173/seller/orders",
  reapplyUrl: "http://localhost:5173/seller/onboarding",
  verificationUrl: "http://localhost:5173/seller/profile",
  adminReviewUrl: "http://localhost:5173/admin/sellers/665f1a2b3c4d5e6f7a8b9c0d",
  storefrontUrl: "http://localhost:3000/store/nile-threads",
  appealUrl: "http://localhost:3000/help/seller-appeal",
  supportUrl: "http://localhost:3000/help",
  policyUrl: "http://localhost:3000/legal/seller-terms",
  acknowledgeUrl: "http://localhost:5173/seller/policy-ack",
  documentStatus: {
    idProof: true,
    businessProof: false,
    addressProof: true,
  },
  productTitle: "Linen Midi Dress",
  variantSku: "LMD-M-SAGE",
  size: "M",
  color: "Sage",
  currentStock: 3,
  previousStock: 8,
  threshold: 5,
  detectedAt: new Date(),
  inventoryUrl: "http://localhost:5173/seller/products",
  productEditUrl:
    "http://localhost:5173/seller/products/665f1a2b3c4d5e6f7a8b9c0d/edit",
  customerName: "Sam Okello",
  orderNumber: "NILECART-1001",
  paymentMethod: "cod",
  paymentStatus: "pending",
  items: [
    {
      title: "Linen Midi Dress",
      quantity: 1,
      price: 12000,
      size: "M",
      color: "Sage",
      variantSku: "LMD-M-SAGE",
    },
  ],
  subtotal: 12000,
  discount: 0,
  shippingFee: 79,
  total: 12079,
  currency: "NGN",
  shippingAddress: {
    fullName: "Sam Okello",
    addressLine: "12 Kampala Road",
    city: "Kampala",
    state: "Central",
    pincode: "10001",
    country: "Uganda",
    mobileNumber: "+256700000000",
  },
  placedAt: new Date(),
  updatedAt: new Date(),
  cancelledAt: new Date(),
  deliveredAt: new Date(),
  orderUrl: "http://localhost:3000/orders/665f1a2b3c4d5e6f7a8b9c0d",
  payUrl: "http://localhost:3000/checkout/payment",
  sellerOrderUrl: "http://localhost:5173/seller/orders/665f1a2b3c4d5e6f7a8b9c0d",
  cancelReason: "Changed my mind",
  cancelledBy: "customer",
  note: "Handed to courier",
  status: "shipped",
  amount: 12079,
  channel: "card",
  txRef: "ORD-abc123",
  transactionId: "999888777",
  paidAt: new Date(),
  failedAt: new Date(),
  orderCancelled: true,
  retryUrl: "http://localhost:3000/checkout/payment/retry?orderId=665f1a2b3c4d5e6f7a8b9c0d",
  checkoutUrl: "https://checkout.flutterwave.com/v3/hosted/pay/test",
  reminderMinutes: 30,
  expectedAmount: 12079,
  receivedAmount: 10000,
  mismatchType: "amount",
  source: "webhook",
  details: "Expected 12079 NGN but gateway reported 10000.",
  previousAmount: 12079,
  newAmount: 11000,
  period: "1–15 Jul 2026",
  payoutAmount: 85000,
  payoutDate: new Date(),
  bankLast4: "4242",
  statementUrl: "http://localhost:5173/seller/finance/statements/july",
  failureReason: "Invalid account number",
  bankUrl: "http://localhost:5173/seller/profile",
  grossSales: 100000,
  commissionAmount: 12000,
  netPayout: 88000,
  refundEligible: false,
  stockRestored: true,
  audience: "customer",
  recipientName: "Sam Okello",
  attemptNumber: 1,
  failureReason: "Customer refused delivery / not available",
  attemptedAt: new Date(),
  rescheduleUrl: "http://localhost:3000/orders/665f1a2b3c4d5e6f7a8b9c0d/reschedule",
};

const writeGroup = async (dirName, meta, renderFn) => {
  const dir = path.join(outDir, dirName);
  await mkdir(dir, { recursive: true });
  const indexRows = [];

  for (const eventKey of Object.keys(meta)) {
    const rendered = renderFn(eventKey, sample);
    const fileName = `${rendered.id}-${eventKey.toLowerCase()}.html`;
    await writeFile(path.join(dir, fileName), rendered.html, "utf8");
    indexRows.push(
      `<li><a href="./${fileName}"><strong>${rendered.id}</strong> — ${rendered.subject}</a> <em>(${rendered.priority} · ${rendered.senderKey}@)</em></li>`
    );
    console.log(`Wrote ${dirName}/${fileName}`);
  }

  await writeFile(
    path.join(dir, "index.html"),
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${dirName} email previews</title>
    <style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;line-height:1.5}li{margin:10px 0}</style>
    </head><body><h1>NileCart ${dirName} emails</h1><ul>${indexRows.join("")}</ul></body></html>`,
    "utf8"
  );
};

await writeGroup("seller", SELLER_EVENT_META, renderSellerEmail);
await writeGroup("inventory", INVENTORY_EVENT_META, renderInventoryEmail);
await writeGroup("order", ORDER_EVENT_META, renderOrderEmail);
await writeGroup("payment", PAYMENT_EVENT_META, renderPaymentEmail);
await writeGroup("cancellation", CANCELLATION_EVENT_META, renderCancellationEmail);

console.log(`\nPreviews under: ${outDir}`);
