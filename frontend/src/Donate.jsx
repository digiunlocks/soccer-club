import { useState, useEffect } from "react";
import { API_BASE_URL } from './config/api';

export default function Donate() {
  const [amount, setAmount] = useState("");
  const [feeSettings, setFeeSettings] = useState(null);
  const [feeLoading, setFeeLoading] = useState(true);

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
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-900">Support Seattle Leopards FC</h2>
      <p className="mb-6 text-gray-700">Your donation helps us provide opportunities, equipment, and programs for youth and adult soccer in our community. Thank you for your support!</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded p-4">
          <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-12 h-12 mb-2" />
          <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition mb-1 w-full text-center">Donate with PayPal</a>
          <span className="text-xs text-gray-600">(You will be redirected to PayPal)</span>
        </div>
        <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded p-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Zelle_logo.svg" alt="Zelle" className="w-16 h-8 mb-2" />
          <span className="font-bold text-green-900">Zelle</span>
          <span className="text-xs text-gray-600">Send to: <span className="font-mono">donate@seattleleopardsfc.com</span></span>
        </div>
        <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded p-4">
          <img src="https://cdn.worldvectorlogo.com/logos/venmo-1.svg" alt="Venmo" className="w-16 h-8 mb-2" />
          <span className="font-bold text-green-900">Venmo</span>
          <span className="text-xs text-gray-600">@SeattleLeopardsFC</span>
        </div>
        <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded p-4">
          <img src="https://cdn.worldvectorlogo.com/logos/cash-app.svg" alt="Cash App" className="w-12 h-12 mb-2" />
          <span className="font-bold text-green-900">Cash App</span>
          <span className="text-xs text-gray-600">$SeattleLeopardsFC</span>
        </div>
        <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded p-4 col-span-1 sm:col-span-2">
          <span className="font-bold text-green-900 mb-2">Credit/Debit Card</span>
          <button className="bg-yellow-400 text-green-900 px-4 py-2 rounded font-bold hover:bg-yellow-500 transition w-full max-w-xs">Donate with Card</button>
          <span className="text-xs text-gray-600 mt-1">(Card processing coming soon)</span>
        </div>
      </div>
    </div>
  );
} 