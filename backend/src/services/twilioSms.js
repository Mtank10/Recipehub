import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const twilio = new Twilio(accountSid, authToken);

// Use in-memory store (replace with Redis in production)
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const  sendOTP = async (phone)=> {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(phone, { otp, expiresAt });

  await twilio.messages.create({
    body: `Your OTP code is: ${otp}`,
    from: fromPhone,
    to: phone,
  });

  console.log(`Sent OTP ${otp} to ${phone}`);
  return true;
}

export const verifyOTP=(phone, otp)=> {
  const record = otpStore.get(phone);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  const isValid = record.otp === otp;
  if (isValid) otpStore.delete(phone);

  return isValid;
}

