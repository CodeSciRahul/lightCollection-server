import "dotenv/config";

const trim = (value) => value?.trim() || undefined;

export const appConfig = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  /** Next.js storefront origin — used for Flutterwave redirect URLs */
  storefrontUrl:
    trim(process.env.STOREFRONT_URL) ||
    trim(process.env.NEXT_PUBLIC_STOREFRONT_URL) ||
    "http://localhost:3000",

  payment: {
    currency: trim(process.env.PAYMENT_CURRENCY) || "UGX",
    currencySymbol: trim(process.env.PAYMENT_CURRENCY_SYMBOL) || "UGX",
    options:
      trim(process.env.FLUTTERWAVE_PAYMENT_OPTIONS) ||
      "card,mobilemoneyuganda,banktransfer",
    logoUrl: trim(process.env.PAYMENT_LOGO_URL),
    /** Minutes after checkout before sending F5 pending reminder */
    pendingReminderMinutes:
      Number(process.env.PAYMENT_PENDING_REMINDER_MINUTES) || 30,
    /** How often the reminder cron scans (minutes) */
    reminderCheckMinutes:
      Number(process.env.PAYMENT_REMINDER_CHECK_MINUTES) || 5,
  },

  mongodb: {
    uri: trim(process.env.MONGODB_URI),
  },

  jwt: {
    secret: trim(process.env.JWT_SECRET),
  },

  resend: {
    apiKey: trim(process.env.RESEND_API_KEY),
    fromEmail: trim(process.env.RESEND_FROM_EMAIL),
  },

  /** Seller dashboard origin (Vite/React admin+seller app) */
  dashboardUrl:
    trim(process.env.DASHBOARD_URL) ||
    trim(process.env.CLIENT_URL) ||
    "http://localhost:5173",

  /**
   * Domain-based transactional From addresses.
   * Only explicit EMAIL_FROM_* values override the constructed mailbox.
   */
  email: {
    domain: trim(process.env.EMAIL_DOMAIN) || "nilescart.com",
    from: {
      accounts: trim(process.env.EMAIL_FROM_ACCOUNTS),
      seller: trim(process.env.EMAIL_FROM_SELLER),
      admin: trim(process.env.EMAIL_FROM_ADMIN),
      support: trim(process.env.EMAIL_FROM_SUPPORT),
      security: trim(process.env.EMAIL_FROM_SECURITY),
      legal: trim(process.env.EMAIL_FROM_LEGAL),
      noreply: trim(process.env.EMAIL_FROM_NOREPLY),
      inventory: trim(process.env.EMAIL_FROM_INVENTORY),
      orders: trim(process.env.EMAIL_FROM_ORDERS),
      shipping: trim(process.env.EMAIL_FROM_SHIPPING),
      payments: trim(process.env.EMAIL_FROM_PAYMENTS),
      finance: trim(process.env.EMAIL_FROM_FINANCE),
      returns: trim(process.env.EMAIL_FROM_RETURNS),
    },
    /** Ops inbox(es) for B2 + F7 alerts (comma-separated) */
    adminNotifyEmails: (process.env.EMAIL_ADMIN_NOTIFY || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
    defaultFrom: trim(process.env.RESEND_FROM_EMAIL),
  },

  inventory: {
    /** Notify seller when stock drops to this level or below (still > 0) */
    lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD) || 5,
  },

  admin: {
    email: trim(process.env.ADMIN_EMAIL),
    password: trim(process.env.ADMIN_PASSWORD),
    name: trim(process.env.ADMIN_NAME) || "Platform Admin",
  },
  aws: {
    accessKeyId: trim(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: trim(process.env.AWS_SECRET_ACCESS_KEY),
    region: trim(process.env.AWS_REGION),
    bucketName: trim(process.env.AWS_BUCKET_NAME),
    /** Optional CloudFront or custom CDN origin, e.g. https://cdn.example.com */
    publicUrlBase: trim(process.env.AWS_S3_PUBLIC_URL),
  },
  orderNumberPrefix: trim(process.env.ORDER_NUMBER_PREFIX),
  flutterwave: {
    publicKey: trim(process.env.FLUTTERWAVE_PUBLIC_KEY),
    secretKey: trim(process.env.FLUTTERWAVE_SECRET_KEY),
    encryptionKey: trim(process.env.FLUTTERWAVE_ENCRYPTION_KEY),
    /** v4 OAuth — required for customers, payment methods, and charges */
    clientId: trim(process.env.FLUTTERWAVE_CLIENT_ID),
    clientSecret: trim(process.env.FLUTTERWAVE_CLIENT_SECRET),
    webhookSecret: trim(process.env.FLUTTERWAVE_WEBHOOK_SECRET),
    useSandbox:
      process.env.FLUTTERWAVE_USE_SANDBOX !== undefined
        ? process.env.FLUTTERWAVE_USE_SANDBOX === "true"
        : (process.env.NODE_ENV || "development") !== "production",
  },
};
