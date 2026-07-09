import { appConfig } from '../config/index.js';
import { getResendClient } from "../vendor/resend.vendor.js";

const SELLER_OTP_SUBJECT = "Your NilesCart seller verification code";
const CUSTOMER_OTP_SUBJECT = "Your NilesCart login code";

const buildSellerOtpHtml = (otp) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    <h2>Verify your email</h2>
    <p>Use this code to complete your seller account registration:</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${otp}</p>
    <p style="color: #666;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
  </div>
`;

const buildCustomerOtpHtml = (otp) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    <h2>Sign in to NilesCart</h2>
    <p>Use this verification code to continue:</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${otp}</p>
    <p style="color: #666;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
  </div>
`;

const sendViaResend = async (email, subject, html) => {
  const resend = getResendClient();
  const from = appConfig.resend.fromEmail;

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject,
    html,
  });

  if (error) {
    const err = new Error(error.message || "Failed to send verification email.");
    err.statusCode = 502;
    throw err;
  }
};

const sendOtpEmail = async (email, otp, { subject, buildHtml, devLabel }) => {
  const resend = getResendClient();
  const from = appConfig.resend.fromEmail;

  if (resend && from) {
    await sendViaResend(email, subject, buildHtml(otp));
    return;
  }

  if (appConfig.isDevelopment) {
    console.log(`[dev] ${devLabel} OTP for ${email}: ${otp}`);
    return;
  }

  const err = new Error(
    "Email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL."
  );
  err.statusCode = 503;
  throw err;
};

export const sendSellerVerificationOtp = async (email, otp) =>
  sendOtpEmail(email, otp, {
    subject: SELLER_OTP_SUBJECT,
    buildHtml: buildSellerOtpHtml,
    devLabel: "Seller",
  });

export const sendCustomerLoginOtp = async (email, otp) =>
  sendOtpEmail(email, otp, {
    subject: CUSTOMER_OTP_SUBJECT,
    buildHtml: buildCustomerOtpHtml,
    devLabel: "Customer login",
  });
