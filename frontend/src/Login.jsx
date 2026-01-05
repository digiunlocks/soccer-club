import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotUsernameEmail, setForgotUsernameEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Handle non-JSON response (likely HTML error page)
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error. Please try again later.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store the token
      localStorage.setItem("token", data.token);
      
      toast.success("Login successful!");
      
      // Redirect based on user type
      if (data.user.isSuperAdmin) {
        navigate("/admin");
      } else {
        navigate("/account");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecoveryMessage("Password reset instructions have been sent to your email.");
        toast.success("Password reset email sent!");
        setForgotPasswordEmail("");
        setTimeout(() => setShowForgotPassword(false), 3000);
      } else {
        setRecoveryMessage(data.message || "Failed to send password reset email.");
        toast.error(data.message || "Failed to send password reset email.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setRecoveryMessage("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleForgotUsername = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotUsernameEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecoveryMessage("Your username has been sent to your email.");
        toast.success("Username sent to your email!");
        setForgotUsernameEmail("");
        setTimeout(() => setShowForgotUsername(false), 3000);
      } else {
        setRecoveryMessage(data.message || "Failed to send username.");
        toast.error(data.message || "Failed to send username.");
      }
    } catch (error) {
      console.error("Forgot username error:", error);
      setRecoveryMessage("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-900">Sign In</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-semibold">Username or Email <span className="text-red-600">*</span></label>
          <input
            type="text"
            name="usernameOrEmail"
            value={form.usernameOrEmail}
            onChange={handleChange}
            className="border border-green-300 rounded px-3 py-2 w-full"
            placeholder="Enter your username or email address"
            required
          />
          <p className="text-xs text-gray-600 mt-1">
            You can log in using either your username or email address
          </p>
        </div>
        <div>
          <label className="font-semibold">Password <span className="text-red-600">*</span></label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="border border-green-300 rounded px-3 py-2 w-full"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => setShowForgotUsername(true)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Forgot Username?
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-900 text-white font-bold py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-900">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setRecoveryMessage("");
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              {recoveryMessage && (
                <div className={`text-sm p-3 rounded ${
                  recoveryMessage.includes("sent") || recoveryMessage.includes("sent") 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {recoveryMessage}
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setRecoveryMessage("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {recoveryLoading ? "Sending..." : "Send Reset Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Username Modal */}
      {showForgotUsername && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-900">Recover Username</h3>
              <button
                onClick={() => {
                  setShowForgotUsername(false);
                  setForgotUsernameEmail("");
                  setRecoveryMessage("");
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleForgotUsername} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotUsernameEmail}
                  onChange={(e) => setForgotUsernameEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              {recoveryMessage && (
                <div className={`text-sm p-3 rounded ${
                  recoveryMessage.includes("sent") || recoveryMessage.includes("sent") 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {recoveryMessage}
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotUsername(false);
                    setForgotUsernameEmail("");
                    setRecoveryMessage("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {recoveryLoading ? "Sending..." : "Send Username"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 