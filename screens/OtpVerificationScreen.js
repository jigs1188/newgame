import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Initialize reCAPTCHA (call this before sending OTP)
export const initRecaptcha = (authInstance, containerId = 'recaptcha-container') => {
  window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
    size: 'invisible',
    callback: (response) => {
      console.log("reCAPTCHA solved");
    },
  }, authInstance);
};

// Send OTP
export const sendOtp = (authInstance, phoneNumber) => {
  return signInWithPhoneNumber(authInstance, phoneNumber, window.recaptchaVerifier);
};
