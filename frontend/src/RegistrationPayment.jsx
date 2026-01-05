import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

export default function RegistrationPayment() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('choice'); // choice, payment, success
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [sendingReceipt, setSendingReceipt] = useState(false);
  
  // Card Information
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cardType: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchUserData(token);
  }, [navigate]);

  const fetchUserData = async (token) => {
    try {
      // Fetch user data
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userResponse.ok) {
        navigate("/signin");
        return;
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Fetch payment status
      const statusResponse = await fetch(`${API_BASE_URL}/payments/user/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setPaymentStatus(statusData);
        
        // If already paid, redirect to account
        if (statusData.registrationPaymentStatus === 'paid') {
          toast.info('Registration payment already completed!');
          navigate('/account');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading payment information');
    } finally {
      setLoading(false);
    }
  };

  // Card helpers
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

  const validateCard = () => {
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
    return true;
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentMethod === 'card' && !validateCard()) {
      return;
    }

    setProcessingPayment(true);

    try {
      const token = localStorage.getItem('token');
      const cardLastFour = paymentMethod === 'card' 
        ? cardInfo.cardNumber.replace(/\s/g, '').slice(-4) 
        : '';

      const response = await fetch(`${API_BASE_URL}/payments/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod === 'card' ? 'credit_card' : 'paypal',
          cardType: cardInfo.cardType,
          cardLastFour,
          sendReceipt: true // Request receipt email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTransactionId(data.transactionId);
        setStep('success');
        toast.success('Payment successful!');
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred while processing your payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const sendReceiptEmail = async () => {
    setSendingReceipt(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/send-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transactionId })
      });

      if (response.ok) {
        toast.success(`Receipt sent to ${user.email}`);
      } else {
        toast.error('Failed to send receipt');
      }
    } catch (error) {
      toast.error('Error sending receipt');
    } finally {
      setSendingReceipt(false);
    }
  };

  const downloadReceipt = () => {
    // Generate a printable receipt
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - Seattle Leopards FC</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #166534; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #166534; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .receipt-details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .row:last-child { border-bottom: none; }
          .label { color: #666; }
          .value { font-weight: bold; }
          .total { font-size: 1.2em; background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .total .value { color: #166534; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em; }
          .success-badge { background: #dcfce7; color: #166534; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚽ Seattle Leopards FC</h1>
          <p>Payment Receipt</p>
          <span class="success-badge">✓ Payment Successful</span>
        </div>
        
        <div class="receipt-details">
          <div class="row">
            <span class="label">Transaction ID</span>
            <span class="value">${transactionId}</span>
          </div>
          <div class="row">
            <span class="label">Date</span>
            <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="row">
            <span class="label">Name</span>
            <span class="value">${user?.name || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Email</span>
            <span class="value">${user?.email || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Payment Type</span>
            <span class="value">Registration Fee</span>
          </div>
          <div class="row">
            <span class="label">Payment Method</span>
            <span class="value">${paymentMethod === 'card' ? `${cardInfo.cardType || 'Card'} ending in ${cardInfo.cardNumber.slice(-4)}` : 'PayPal'}</span>
          </div>
          <div class="row total">
            <span class="label">Amount Paid</span>
            <span class="value">$${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for registering with Seattle Leopards FC!</p>
          <p>Questions? Contact us at support@seattleleopardsfc.com</p>
          <p style="margin-top: 20px;">
            <button onclick="window.print()" style="background: #166534; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
          </p>
        </div>
      </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-3xl font-bold text-green-900">Seattle Leopards FC</h1>
          <p className="text-gray-600 mt-2">Complete Your Registration</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'choice' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step !== 'choice' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-green-600 text-white' : step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
              2
            </div>
            <div className={`w-16 h-1 ${step === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              ✓
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Step 1: Choice */}
          {step === 'choice' && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
                <p className="text-gray-600 mt-2">Your account has been created successfully.</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <span className="text-xl mr-3">💡</span>
                  <div>
                    <p className="font-medium text-yellow-800">Registration Fee Required</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      To be assigned to a team and participate in club activities, please complete the registration fee payment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registration Fee</span>
                  <span className="text-2xl font-bold text-green-700">${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('payment')}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>💳</span> Pay Now
                </button>
                <button
                  onClick={() => navigate('/account')}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Pay Later → Go to My Account
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                You can also pay later from your account settings.
              </p>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div className="p-8">
              <button
                onClick={() => {
                  setStep('choice');
                  setPaymentMethod('');
                }}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                ← Back
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Amount to Pay</span>
                  <span className="text-2xl font-bold text-green-700">${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              {!paymentMethod && (
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-10 h-10" />
                    <span className="font-medium text-lg">Pay with PayPal</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="font-medium text-lg">Pay with Card</span>
                  </button>
                </div>
              )}

              {/* PayPal Payment */}
              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <button onClick={() => setPaymentMethod('')} className="text-gray-500 hover:text-gray-700">←</button>
                    <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-8 h-8" />
                    <span className="font-medium">PayPal Checkout</span>
                  </div>
                  <p className="text-gray-600">
                    You will be redirected to PayPal to complete your secure payment.
                  </p>
                  <button
                    onClick={processPayment}
                    disabled={processingPayment}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Pay $${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'} with PayPal`
                    )}
                  </button>
                </div>
              )}

              {/* Card Payment */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <button onClick={() => setPaymentMethod('')} className="text-gray-500 hover:text-gray-700">←</button>
                    <span className="font-medium">Card Payment</span>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardInfo.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16"
                      maxLength={19}
                    />
                    {cardInfo.cardType && (
                      <span className="absolute right-4 top-9 text-sm font-semibold text-gray-500">
                        {cardInfo.cardType}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardInfo.cardName}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, cardName: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardInfo.expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <button
                    onClick={processPayment}
                    disabled={processingPayment}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Pay $${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'}`
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <span>🔒</span> Your payment is secure and encrypted
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Thank you, {user?.name}! Your registration is now complete.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-bold text-green-700">${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-sm">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>What's Next?</strong><br />
                  A club administrator will review your registration and assign you to a team based on your program. Check your account for updates!
                </p>
              </div>

              {/* Receipt Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={sendReceiptEmail}
                  disabled={sendingReceipt}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingReceipt ? (
                    'Sending...'
                  ) : (
                    <>📧 Email Receipt</>
                  )}
                </button>
                <button
                  onClick={downloadReceipt}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  📄 Download Receipt
                </button>
              </div>

              <button
                onClick={() => navigate('/account')}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                Go to My Account →
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact us at <a href="mailto:support@seattleleopardsfc.com" className="text-green-600 hover:underline">support@seattleleopardsfc.com</a>
        </p>
      </div>
    </div>
  );
}



