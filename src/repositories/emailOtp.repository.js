import EmailOtp from "../models/EmailOtp.js";

export { EmailOtp };

export const findOne = (filter) => EmailOtp.findOne(filter);
export const findOneAndUpdate = (filter, update, options) =>
  EmailOtp.findOneAndUpdate(filter, update, options);
export const deleteMany = (filter) => EmailOtp.deleteMany(filter);
export const deleteOne = (filter) => EmailOtp.deleteOne(filter);
export const create = (data) => EmailOtp.create(data);

export const findByEmail = (email) => EmailOtp.findOne({ email });

export const upsertByEmail = (email, update) =>
  EmailOtp.findOneAndUpdate({ email }, update, { upsert: true, new: true });
