import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "./config/api";

const WAIVER_TEXT = `
REFEREE WAIVER AND RELEASE OF LIABILITY

In consideration of being allowed to participate as a referee in Seattle Leopards FC programs, related events, and activities, the undersigned acknowledges, appreciates, and agrees to the following:

1. I understand and accept the risks of injury, disability, death, and property loss that may result from officiating or participating in club activities, whether arising from my own actions, the actions of others, or the condition of the facilities or equipment used.
2. I agree to comply with all club rules, policies, and codes of conduct, and to promote a safe, respectful, and fair environment for all players, coaches, officials, and spectators.
3. I certify that I am physically fit and capable of fulfilling my referee duties, and that I will immediately notify club officials of any condition that may affect my ability to officiate safely.
4. I agree to maintain all required certifications, background checks, and training as required by the club, league, or governing bodies.
5. I understand that as a referee, I am expected to act with impartiality, integrity, and in the best interest of the game and the club at all times.
6. I, for myself and on behalf of my heirs, assigns, personal representatives, and next of kin, hereby release, indemnify, and hold harmless Seattle Leopards FC, its officers, officials, agents, employees, other participants, sponsoring agencies, sponsors, advertisers, and, if applicable, owners and lessors of premises used to conduct the event, from any and all claims, demands, losses, or liability arising out of or related to any injury, disability, death, or loss or damage to person or property, whether arising from the negligence of the releases or otherwise, to the fullest extent permitted by law.
7. I understand that this waiver and release is intended to be as broad and inclusive as permitted by the laws of the State of Washington, and agree that if any portion is held invalid, the remainder will continue in full legal force and effect.

By agreeing below, I acknowledge that I have read, understood, and voluntarily accept the terms of this waiver and release of liability as a condition of my participation as a referee with Seattle Leopards FC.
`;

function calculateAge(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function RefereeApplication() {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    age: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    experience: "",
    certifications: "",
    emergencyName: "",
    emergencyPhone: "",
    agreeApplication: false,
    agreeWaiver: false,
    waiverOpened: false,
    waiverRead: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [waiverModal, setWaiverModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };
    if (name === "dob") {
      newForm.age = calculateAge(value);
    }
    setForm(newForm);
    
    // Clear the specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Required";
    if (!form.dob) newErrors.dob = "Required";
    if (form.age === "" || form.age < 18) newErrors.dob = "Must be at least 18 years old";
    if (!form.email) newErrors.email = "Required";
    if (!form.address) newErrors.address = "Required";
    if (!form.city) newErrors.city = "Required";
    if (!form.state) newErrors.state = "Required";
    if (!form.zip) newErrors.zip = "Required";
    if (!form.experience) newErrors.experience = "Required";
    if (!form.emergencyName) newErrors.emergencyName = "Required";
    if (!form.emergencyPhone) newErrors.emergencyPhone = "Required";
    if (!form.agreeApplication) newErrors.agreeApplication = "Required";
    if (!form.agreeWaiver || !form.waiverRead) newErrors.agreeWaiver = "You must read and agree to the waiver";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      try {
        const res = await api.post(API_ENDPOINTS.APPLICATIONS.BASE, { type: "referee", info: form });
        setSubmitted(true);
        setForm({
          name: "",
          dob: "",
          age: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          experience: "",
          certifications: "",
          emergencyName: "",
          emergencyPhone: "",
          agreeApplication: false,
          agreeWaiver: false,
          waiverOpened: false,
          waiverRead: false,
        });
        
        // Start countdown
        let timeLeft = 3;
        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            navigate("/register");
          }
        }, 1000);
      } catch (err) {
        setApiError(err.message);
      }
    }
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
    setForm((prev) => ({ ...prev, waiverRead: true }));
    setWaiverModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      {/* Success Message Banner */}
      {submitted && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Application Submitted Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Thank you for your interest in joining Seattle Leopards FC! Your application has been received and is being reviewed.</p>
                <p className="mt-1">You will be redirected to create an account in <span className="font-bold">{countdown}</span> seconds...</p>
                <button
                  onClick={() => navigate("/register")}
                  className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Skip Countdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 text-green-900">Referee Application</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Full Name <span className="text-red-600">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.name && <div className="text-xs text-red-600">{errors.name}</div>}
          </div>
          <div>
            <label className="font-semibold">Date of Birth <span className="text-red-600">*</span></label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {form.age && <div className="text-xs text-green-700">Age: {form.age}</div>}
            {errors.dob && <div className="text-xs text-red-600">{errors.dob}</div>}
          </div>
          <div>
            <label className="font-semibold">Email <span className="text-red-600">*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
          </div>
          <div>
            <label className="font-semibold">Phone Number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="font-semibold">Address <span className="text-red-600">*</span></label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.address && <div className="text-xs text-red-600">{errors.address}</div>}
          </div>
          <div>
            <label className="font-semibold">City <span className="text-red-600">*</span></label>
            <input type="text" name="city" value={form.city} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.city && <div className="text-xs text-red-600">{errors.city}</div>}
          </div>
          <div>
            <label className="font-semibold">State <span className="text-red-600">*</span></label>
            <input type="text" name="state" value={form.state} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.state && <div className="text-xs text-red-600">{errors.state}</div>}
          </div>
          <div>
            <label className="font-semibold">Zip Code <span className="text-red-600">*</span></label>
            <input type="text" name="zip" value={form.zip} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.zip && <div className="text-xs text-red-600">{errors.zip}</div>}
          </div>
        </div>
        <div>
          <label className="font-semibold">Refereeing Experience <span className="text-red-600">*</span></label>
          <textarea name="experience" value={form.experience} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" rows={2} required />
          {errors.experience && <div className="text-xs text-red-600">{errors.experience}</div>}
        </div>
        <div>
          <label className="font-semibold">Certifications (optional)</label>
          <input type="text" name="certifications" value={form.certifications} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Emergency Contact Name <span className="text-red-600">*</span></label>
            <input type="text" name="emergencyName" value={form.emergencyName} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.emergencyName && <div className="text-xs text-red-600">{errors.emergencyName}</div>}
          </div>
          <div>
            <label className="font-semibold">Emergency Contact Phone <span className="text-red-600">*</span></label>
            <input type="tel" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
            {errors.emergencyPhone && <div className="text-xs text-red-600">{errors.emergencyPhone}</div>}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeApplication"
              checked={form.agreeApplication}
              onChange={handleChange}
              required
            />
            <span>
              I confirm that all information provided is accurate and I am applying to join Seattle Leopards FC as a referee. <span className="text-red-600">*</span>
            </span>
          </label>
          {errors.agreeApplication && <div className="text-xs text-red-600">{errors.agreeApplication}</div>}
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
              disabled={!form.waiverRead}
            />
            <span>
              I have read and agree to the waiver and release of liability for participation in club activities. <span className="text-red-600">*</span>
            </span>
          </label>
          {!form.waiverOpened && <span className="text-xs text-red-600">You must open and read the waiver before agreeing.</span>}
          {form.waiverOpened && !form.waiverRead && <span className="text-xs text-yellow-700">Scroll to the bottom of the waiver to enable agreement.</span>}
          {errors.agreeWaiver && <div className="text-xs text-red-600">{errors.agreeWaiver}</div>}
        </div>
        <button
          type="submit"
          className="bg-green-900 text-white font-bold py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          disabled={Object.keys(validate()).length > 0}
        >
          Submit Application
        </button>
        {apiError && <div className="text-red-600 text-sm mt-2">{apiError}</div>}
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
              I Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 