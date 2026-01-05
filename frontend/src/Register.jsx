import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

const WAIVER_TEXT = `
REGISTRATION WAIVER AND RELEASE OF LIABILITY

By registering for an account with Seattle Leopards FC, you acknowledge and agree to the following:

1. You understand and accept the risks associated with participation in club activities, including injury, disability, or death.
2. You agree to comply with all club rules, policies, and codes of conduct.
3. You release and hold harmless Seattle Leopards FC, its officers, officials, agents, employees, and volunteers from any and all liability arising from your participation.
4. You agree that this waiver is intended to be as broad and inclusive as permitted by law.

Please read the full waiver before agreeing.
`;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: "", 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    phone: "", 
    agreeWaiver: false, 
    agreeTerms: false, 
    agreePrivacy: false, 
    waiverOpened: false, 
    waiverRead: false 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [waiverModal, setWaiverModal] = useState(false);

  // Real-time validation
  useEffect(() => {
    const validation = validate();
    setErrors(validation);
  }, [form]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = "Username is required";
    if (form.username && form.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (form.username && form.username.length > 30) newErrors.username = "Username must be less than 30 characters";
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email format is invalid";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) newErrors.phone = "Phone number must be 10 digits";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password && form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!form.agreeWaiver) newErrors.agreeWaiver = "You must read and agree to the waiver";
    if (!form.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
    if (!form.agreePrivacy) newErrors.agreePrivacy = "You must agree to the privacy policy";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    
    if (Object.keys(validation).length === 0) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: form.username,
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Store the token
        localStorage.setItem("token", data.token);
        
        toast.success("Registration successful! Welcome to Seattle Leopards FC!");
        
        // Redirect to registration payment page
        navigate("/registration-payment");
      } catch (error) {
        console.error("Registration error:", error);
        toast.error(error.message || "Registration failed. Please try again.");
        setErrors({ submit: error.message || "Registration failed" });
      } finally {
        setLoading(false);
      }
    }
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    const validation = validate();
    return Object.keys(validation).length === 0;
  };

  const openWaiver = () => {
    setWaiverModal(true);
    setForm((prev) => ({ ...prev, waiverOpened: true }));
  };

  const handleWaiverScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setForm((prev) => ({ ...prev, waiverRead: true }));
    }
  };

  const handleWaiverAgree = () => {
    setForm((prev) => ({ ...prev, waiverRead: true, agreeWaiver: true }));
    setWaiverModal(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-900">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-semibold">Username <span className="text-red-600">*</span></label>
          <input 
            type="text" 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            className={`border rounded px-3 py-2 w-full ${errors.username ? 'border-red-500' : 'border-green-300'}`}
            placeholder="Choose a unique username (3-30 characters)"
            required 
            minLength={3}
            maxLength={30}
          />
          <p className="text-xs text-gray-600 mt-1">
            You'll be able to log in using either your username or email address
          </p>
          {errors.username && <div className="text-xs text-red-600">{errors.username}</div>}
        </div>
        <div>
          <label className="font-semibold">Full Name <span className="text-red-600">*</span></label>
          <input 
            type="text" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            className={`border rounded px-3 py-2 w-full ${errors.name ? 'border-red-500' : 'border-green-300'}`}
            required 
          />
          {errors.name && <div className="text-xs text-red-600">{errors.name}</div>}
        </div>
        <div>
          <label className="font-semibold">Email <span className="text-red-600">*</span></label>
          <input 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            className={`border rounded px-3 py-2 w-full ${errors.email ? 'border-red-500' : 'border-green-300'}`}
            placeholder="your.email@example.com"
            required 
          />
          <p className="text-xs text-gray-600 mt-1">
            You can use your email address to log in instead of your username
          </p>
          {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
        </div>
        <div>
          <label className="font-semibold">Phone <span className="text-red-600">*</span></label>
          <input 
            type="tel" 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            className={`border rounded px-3 py-2 w-full ${errors.phone ? 'border-red-500' : 'border-green-300'}`}
            required 
          />
          {errors.phone && <div className="text-xs text-red-600">{errors.phone}</div>}
        </div>
        <div>
          <label className="font-semibold">Password <span className="text-red-600">*</span></label>
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            className={`border rounded px-3 py-2 w-full ${errors.password ? 'border-red-500' : 'border-green-300'}`}
            required 
          />
          {errors.password && <div className="text-xs text-red-600">{errors.password}</div>}
        </div>
        <div>
          <label className="font-semibold">Confirm Password <span className="text-red-600">*</span></label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={form.confirmPassword} 
            onChange={handleChange} 
            className={`border rounded px-3 py-2 w-full ${errors.confirmPassword ? 'border-red-500' : 'border-green-300'}`}
            required 
          />
          {errors.confirmPassword && <div className="text-xs text-red-600">{errors.confirmPassword}</div>}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm flex flex-col gap-2">
          <button
            type="button"
            className="underline text-yellow-700 text-left"
            onClick={openWaiver}
            disabled={waiverModal}
          >
            Read Waiver and Release of Liability <span className="text-red-600">*</span>
          </button>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeWaiver"
              checked={form.agreeWaiver}
              onChange={handleChange}
              required
              disabled={!form.waiverOpened}
            />
            <span>
              I have read and agree to the waiver and release of liability. <span className="text-red-600">*</span>
            </span>
          </label>
          {!form.waiverOpened && <span className="text-xs text-red-600">You must open and read the waiver before agreeing.</span>}
          {form.waiverOpened && !form.waiverRead && <span className="text-xs text-yellow-700">Scroll to the bottom of the waiver to enable agreement.</span>}
          {errors.agreeWaiver && <div className="text-xs text-red-600">{errors.agreeWaiver}</div>}
        </div>
        <div className="flex flex-col gap-2 bg-green-50 border border-green-200 rounded p-3 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={form.agreeTerms}
              onChange={handleChange}
              required
            />
            <span>
              I have read and agree to the <a href="/terms" className="underline text-green-700" target="_blank" rel="noopener noreferrer">Terms of Service</a>. <span className="text-red-600">*</span>
            </span>
          </label>
          {errors.agreeTerms && <div className="text-xs text-red-600">{errors.agreeTerms}</div>}
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreePrivacy"
              checked={form.agreePrivacy}
              onChange={handleChange}
              required
            />
            <span>
              I have read and agree to the <a href="/privacy" className="underline text-green-700" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. <span className="text-red-600">*</span>
            </span>
          </label>
          {errors.agreePrivacy && <div className="text-xs text-red-600">{errors.agreePrivacy}</div>}
        </div>
        <button 
          type="submit" 
          className="bg-green-900 text-white font-bold py-2 rounded hover:bg-green-700 transition disabled:opacity-50" 
          disabled={loading || !isFormValid()}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
        {errors.submit && <div className="text-red-600 font-semibold mt-2">{errors.submit}</div>}
      </form>
      {/* Waiver Modal */}
      {waiverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <h3 className="text-xl font-bold mb-2 text-green-900">Waiver and Release of Liability</h3>
            <div
              className="overflow-y-auto border border-green-200 rounded p-3 h-64 text-sm text-gray-700 mb-4"
              onScroll={handleWaiverScroll}
            >
              <pre className="whitespace-pre-wrap">{WAIVER_TEXT}</pre>
            </div>
            <div className="text-xs text-gray-500 mb-2">Scroll to the bottom to enable agreement.</div>
            <button
              className="bg-green-900 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition disabled:opacity-50"
              onClick={handleWaiverAgree}
              disabled={!form.waiverRead}
            >
              {form.waiverRead ? "I Agree" : "Scroll to Bottom First"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 