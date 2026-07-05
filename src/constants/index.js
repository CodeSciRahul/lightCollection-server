export {
  DEPARTMENT_VALUES,
  DEPARTMENT_LABELS,
  GENDER_BY_DEPARTMENT,
  DEPARTMENT_ORDER,
} from "./enums.js";

export const messages = {
  OTP_SENT: "An OTP has been sent to your email, please verify.",
  SERVER_RUNNING: "Server is running...",
  API_HEALTH: "NileCart API is running",
};

export const regex = {
  OTP_SIX_DIGIT: /^\d{6}$/,
};
