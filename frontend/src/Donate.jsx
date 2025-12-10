import { useState, useEffect } from "react";
import { API_BASE_URL } from './config/api';
import { toast } from 'react-toastify';

export default function Donate() {
  const [amount, setAmount] = useState("");
  const [feeSettings, setFeeSettings] = useState(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  
  // Donor Information
  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });
  
  // Card Information (for card payments)
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    cardType: ""
  });

  // Fetch fee settings on component mount
  useEffect(() => {
    const fetchFeeSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/fees`);
        if (response.ok) {
          const data = await response.json();
          setFeeSettings(data);
        }
      } catch (error) {
        console.error('Error fetching fee settings:', error);
      } finally {
        setFeeLoading(false);
      }
    };

    fetchFeeSettings();
  }, []);

  // Detect card type from card number
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return '';
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    // Format with spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (value.length <= 19) {
      setCardInfo(prev => ({
        ...prev,
        cardNumber: value,
        cardType: detectCardType(value)
      }));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setCardInfo(prev => ({ ...prev, expiryDate: value }));
    }
  };

  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setShowPaymentForm(true);
  };

  const handleDonorChange = (e) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const parsedAmount = parseFloat(amount);
    
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid donation amount');
      return false;
    }
    
    if (feeSettings?.donationMin && parsedAmount < feeSettings.donationMin) {
      toast.error(`Minimum donation is $${feeSettings.donationMin}`);
      return false;
    }
    
    if (!donorInfo.firstName || !donorInfo.lastName) {
      toast.error('Please enter your full name');
      return false;
    }
    
    if (!donorInfo.email || !/\S+@\S+\.\S+/.test(donorInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (paymentMethod === 'card') {
      const cardNum = cardInfo.cardNumber.replace(/\s/g, '');
      if (cardNum.length < 15) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!cardInfo.cardName) {
        toast.error('Please enter the name on your card');
        return false;
      }
      if (cardInfo.expiryDate.length < 5) {
        toast.error('Please enter a valid expiry date');
        return false;
      }
      if (cardInfo.cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
    }
    
    return true;
  };

  const processDonation = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      const cardLastFour = paymentMethod === 'card' 
        ? cardInfo.cardNumber.replace(/\s/g, '').slice(-4) 
        : '';

      const response = await fetch(`${API_BASE_URL}/payments/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod: paymentMethod === 'card' ? 'credit_card' : 'paypal',
          payerName: `${donorInfo.firstName} ${donorInfo.lastName}`,
          payerEmail: donorInfo.email,
          payerPhone: donorInfo.phone,
          cardType: cardInfo.cardType,
          cardLastFour,
          message: donorInfo.message
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTransactionId(data.transactionId);
        setDonationComplete(true);
        toast.success('Thank you for your donation!');
      } else {
        toast.error(data.error || 'Failed to process donation');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('An error occurred while processing your donation');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPaymentMethod("");
    setShowPaymentForm(false);
    setDonationComplete(false);
    setTransactionId("");
    setDonorInfo({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    setCardInfo({ cardNumber: "", cardName: "", expiryDate: "", cvv: "", cardType: "" });
  };

  // Success Screen
  if (donationComplete) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-green-900">Thank You!</h2>
        <p className="text-gray-700 mb-4">Your donation of <span className="font-bold">${parseFloat(amount).toFixed(2)}</span> has been received.</p>
        <p className="text-sm text-gray-600 mb-4">Transaction ID: <span className="font-mono">{transactionId}</span></p>
        <p className="text-gray-600 mb-6">A confirmation email has been sent to <span className="font-semibold">{donorInfo.email}</span></p>
        <button
          onClick={resetForm}
          className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-900">Support Seattle Leopards FC</h2>
      <p className="mb-6 text-gray-700">Your donation helps us provide opportunities, equipment, and programs for youth and adult soccer in our community. Thank you for your support!</p>
      
      {/* Amount Selection */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Donation Amount (USD)</label>
        <input
          type="number"
          min={feeSettings?.donationMin || 0}
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border border-green-300 rounded px-3 py-2 w-full mb-2"
          placeholder={`Minimum: $${(feeSettings?.donationMin || 0).toFixed(2)}`}
        />
        
        {/* Quick Amount Buttons */}
        {!feeLoading && feeSettings && feeSettings.donationOptions && feeSettings.donationOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {feeSettings.donationOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAmount(option.toString())}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  amount === option.toString()
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                ${option}
              </button>
            ))}
          </div>
        )}
        
        {feeSettings?.donationMin > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            Minimum donation amount: ${feeSettings.donationMin.toFixed(2)}
          </p>
        )}
      </div>

      {/* Payment Method Selection */}
      {!showPaymentForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => selectPaymentMethod('paypal')}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex flex-col items-center bg-green-50 border border-green-200 rounded p-4 hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-12 h-12 mb-2" />
            <span className="font-bold text-green-900">PayPal</span>
            <span className="text-xs text-gray-600">Secure PayPal checkout</span>
          </button>
          <button
            onClick={() => selectPaymentMethod('card')}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex flex-col items-center bg-green-50 border border-green-200 rounded p-4 hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-12 h-12 mb-2 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-bold text-green-900">Credit/Debit Card</span>
            <span className="text-xs text-gray-600">All major cards accepted</span>
          </button>
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <form onSubmit={processDonation} className="space-y-4">
          <div className="bg-green-50 rounded p-3 mb-4 flex justify-between items-center">
            <span className="font-semibold text-green-900">
              {paymentMethod === 'paypal' ? '💳 PayPal Checkout' : '💳 Card Payment'}
            </span>
            <span className="font-bold text-lg">${parseFloat(amount || 0).toFixed(2)}</span>
          </div>

          {/* Donor Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3 text-green-900">Your Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="firstName"
                value={donorInfo.firstName}
                onChange={handleDonorChange}
                placeholder="First Name *"
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="text"
                name="lastName"
                value={donorInfo.lastName}
                onChange={handleDonorChange}
                placeholder="Last Name *"
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              value={donorInfo.email}
              onChange={handleDonorChange}
              placeholder="Email Address *"
              className="border border-gray-300 rounded px-3 py-2 w-full mt-3"
              required
            />
            <input
              type="tel"
              name="phone"
              value={donorInfo.phone}
              onChange={handleDonorChange}
              placeholder="Phone (optional)"
              className="border border-gray-300 rounded px-3 py-2 w-full mt-3"
            />
          </div>

          {/* Card Information (only for card payment) */}
          {paymentMethod === 'card' && (
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-green-900">Card Details</h3>
              <div className="relative">
                <input
                  type="text"
                  value={cardInfo.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="Card Number"
                  className="border border-gray-300 rounded px-3 py-2 w-full pr-16"
                  maxLength={19}
                  required
                />
                {cardInfo.cardType && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
                    {cardInfo.cardType}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={cardInfo.cardName}
                onChange={(e) => setCardInfo(prev => ({ ...prev, cardName: e.target.value }))}
                placeholder="Name on Card"
                className="border border-gray-300 rounded px-3 py-2 w-full mt-3"
                required
              />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input
                  type="text"
                  value={cardInfo.expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="border border-gray-300 rounded px-3 py-2"
                  maxLength={5}
                  required
                />
                <input
                  type="text"
                  value={cardInfo.cvv}
                  onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="CVV"
                  className="border border-gray-300 rounded px-3 py-2"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          )}

          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              name="message"
              value={donorInfo.message}
              onChange={handleDonorChange}
              placeholder="Leave a message with your donation..."
              className="border border-gray-300 rounded px-3 py-2 w-full"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={processing}
              className={`flex-1 px-4 py-3 rounded font-bold transition flex items-center justify-center ${
                paymentMethod === 'paypal'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-yellow-400 text-green-900 hover:bg-yellow-500'
              } disabled:opacity-50`}
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Donate $${parseFloat(amount || 0).toFixed(2)}`
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            🔒 Your payment information is secure and encrypted
          </p>
        </form>
      )}
    </div>
  );
}
