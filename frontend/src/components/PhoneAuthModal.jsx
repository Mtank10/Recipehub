import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, gql } from '@apollo/client';
import { FaPhone, FaLock, FaTimes } from 'react-icons/fa';

const SEND_OTP = gql`
  mutation SendOTP($phone: String!) {
    sendOTP(phone: $phone)
  }
`;

const VERIFY_OTP = gql`
  mutation VerifyOTP($phone: String!, $otp: String!) {
    verifyOTP(phone: $phone, otp: $otp) {
      token
      user {
        id
        name
        phone
        isOnboardingComplete
      }
    }
  }
`;

const PhoneAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [sendOTP] = useMutation(SEND_OTP);
  const [verifyOTP] = useMutation(VERIFY_OTP);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendOTP({ variables: { phone } });
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await verifyOTP({ variables: { phone, otp } });
      
      if (data?.verifyOTP?.token) {
        localStorage.setItem('token', data.verifyOTP.token);
        onSuccess(data.verifyOTP.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError('');
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-green)' }}>
            {step === 'phone' ? 'Enter Phone Number' : 'Verify OTP'}
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl"
                  style={{ borderColor: 'var(--border-color)' }}
                  maxLength="10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send you a verification code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending OTP...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                Verification Code
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-center text-lg tracking-widest"
                  style={{ borderColor: 'var(--border-color)' }}
                  maxLength="6"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                OTP sent to +91 {phone}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 py-3 px-6 border-2 rounded-xl font-semibold transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--dark-text)' }}
              >
                Change Number
              </button>
              <button
                type="submit"
                disabled={loading || !otp}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify'
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-sm text-green-600 hover:underline"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneAuthModal;