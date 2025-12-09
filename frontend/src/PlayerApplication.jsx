import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS, API_BASE_URL } from "./config/api";

const WAIVER_TEXT = `
WAIVER AND RELEASE OF LIABILITY

In consideration of being allowed to participate in any way in Seattle Leopards FC programs, related events, and activities, the undersigned acknowledges, appreciates, and agrees that:

1. The risk of injury from the activities involved in this program is significant, including the potential for permanent paralysis and death, and while particular rules, equipment, and personal discipline may reduce this risk, the risk of serious injury does exist.
2. I knowingly and freely assume all such risks, both known and unknown, even if arising from the negligence of the releases or others, and assume full responsibility for my participation.
3. I willingly agree to comply with the stated and customary terms and conditions for participation. If, however, I observe any unusual significant hazard during my presence or participation, I will remove myself from participation and bring such to the attention of the nearest official immediately.
4. I, for myself and on behalf of my heirs, assigns, personal representatives, and next of kin, hereby release and hold harmless Seattle Leopards FC, their officers, officials, agents, and/or employees, other participants, sponsoring agencies, sponsors, advertisers, and if applicable, owners and lessors of premises used to conduct the event, with respect to any and all injury, disability, death, or loss or damage to person or property, whether arising from the negligence of the releases or otherwise, to the fullest extent permitted by law.
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

export default function PlayerApplication() {
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
    emergencyName: "",
    emergencyPhone: "",
    gender: "",
    position: "",
    teamLevel: "", // New field for team level selection
    medical: "",
    agreeApplication: false,
    agreeWaiver: false,
    waiverOpened: false,
    waiverRead: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [waiverModal, setWaiverModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [feeSettings, setFeeSettings] = useState(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  // Fetch fee settings on component mount
  useEffect(() => {
    const fetchFeeSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/fees`);
        if (response.ok) {
          const data = await response.json();
          // Merge with enhanced structure to ensure all fields exist
          const enhancedSettings = {
            playerFee: data.playerFee || 0,
            coachFee: data.coachFee || 0,
            refereeFee: data.refereeFee || 0,
            volunteerFee: data.volunteerFee || 0,
            feesEnabled: data.feesEnabled !== undefined ? data.feesEnabled : true,
            donationMin: data.donationMin || 0,
            donationOptions: data.donationOptions || [0, 5, 10, 25, 50, 100],
            // Enhanced team registration fees with fallbacks
            teamRegistrationFees: {
              youthU8: data.teamRegistrationFees?.youthU8 || 150,
              youthU10: data.teamRegistrationFees?.youthU10 || 175,
              youthU12: data.teamRegistrationFees?.youthU12 || 200,
              youthU14: data.teamRegistrationFees?.youthU14 || 225,
              youthU16: data.teamRegistrationFees?.youthU16 || 250,
              youthU18: data.teamRegistrationFees?.youthU18 || 275,
              adult: data.teamRegistrationFees?.adult || 300,
              competitive: data.teamRegistrationFees?.competitive || 350,
              recreational: data.teamRegistrationFees?.recreational || 200
            },
            seasonalRates: {
              spring: data.seasonalRates?.spring || 1.0,
              summer: data.seasonalRates?.summer || 0.8,
              fall: data.seasonalRates?.fall || 1.0,
              winter: data.seasonalRates?.winter || 0.9
            },
            earlyBirdDiscount: data.earlyBirdDiscount || 0.1,
            siblingDiscount: data.siblingDiscount || 0.15,
            equipmentFee: data.equipmentFee || 50,
            uniformFee: data.uniformFee || 75,
            tournamentFee: data.tournamentFee || 25
          };
          setFeeSettings(enhancedSettings);
        }
      } catch (error) {
        console.error('Error fetching fee settings:', error);
      } finally {
        setFeeLoading(false);
      }
    };

    fetchFeeSettings();
  }, []);

  // Calculate registration fee based on team level and age
  const calculateRegistrationFee = () => {
    if (!feeSettings || !feeSettings.feesEnabled) {
      return {
        baseFee: 0,
        seasonalMultiplier: 1.0,
        totalFee: 0,
        earlyBirdDiscount: 0,
        discountedFee: 0,
        teamLevel: '',
        age: form.age || 0
      };
    }
    
    const age = parseInt(form.age) || 0;
    let baseFee = 0;
    let teamLevel = form.teamLevel;
    
    // Auto-determine team level based on age if not selected
    if (!teamLevel && age) {
      if (age >= 6 && age <= 8) teamLevel = 'youthU8';
      else if (age >= 9 && age <= 10) teamLevel = 'youthU10';
      else if (age >= 11 && age <= 12) teamLevel = 'youthU12';
      else if (age >= 13 && age <= 14) teamLevel = 'youthU14';
      else if (age >= 15 && age <= 16) teamLevel = 'youthU16';
      else if (age >= 17 && age <= 18) teamLevel = 'youthU18';
      else if (age >= 19) teamLevel = 'adult';
    }
    
    // Get base fee from team registration fees
    if (teamLevel && feeSettings.teamRegistrationFees?.[teamLevel]) {
      baseFee = feeSettings.teamRegistrationFees[teamLevel];
    } else {
      // Fallback to player fee if no team level fee
      baseFee = feeSettings.playerFee || 0;
    }
    
    // Apply seasonal rate (default to spring/fall rate)
    const currentMonth = new Date().getMonth();
    let seasonalMultiplier = 1.0;
    
    if (currentMonth >= 5 && currentMonth <= 7) { // Summer (June-August)
      seasonalMultiplier = feeSettings.seasonalRates?.summer || 0.8;
    } else if (currentMonth >= 11 || currentMonth <= 1) { // Winter (December-February)
      seasonalMultiplier = feeSettings.seasonalRates?.winter || 0.9;
    } else { // Spring/Fall (March-May, September-November)
      seasonalMultiplier = feeSettings.seasonalRates?.spring || 1.0;
    }
    
    let totalFee = baseFee * seasonalMultiplier;
    
    // Apply early bird discount (if applicable - you can add logic here)
    // For now, we'll show the potential discount
    const earlyBirdDiscount = feeSettings.earlyBirdDiscount || 0.1;
    const earlyBirdAmount = totalFee * earlyBirdDiscount;
    
    return {
      baseFee,
      seasonalMultiplier,
      totalFee,
      earlyBirdDiscount: earlyBirdAmount,
      discountedFee: totalFee - earlyBirdAmount,
      teamLevel,
      age
    };
  };

  const feeCalculation = calculateRegistrationFee();

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
    if (form.age === "" || form.age < 3) newErrors.dob = "Must be at least 3 years old";
    if (!form.email) newErrors.email = "Required";
    if (!form.address) newErrors.address = "Required";
    if (!form.city) newErrors.city = "Required";
    if (!form.state) newErrors.state = "Required";
    if (!form.zip) newErrors.zip = "Required";
    if (!form.emergencyName) newErrors.emergencyName = "Required";
    if (!form.emergencyPhone) newErrors.emergencyPhone = "Required";
    if (!form.gender) newErrors.gender = "Required";
    if (!form.teamLevel) newErrors.teamLevel = "Required";
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
        console.log('Submitting application with data:', { type: "player", info: form });
        
        const res = await api.post(API_ENDPOINTS.APPLICATIONS.BASE, { type: "player", info: form });
        console.log('Application submitted successfully:', res);
        
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
          emergencyName: "",
          emergencyPhone: "",
          gender: "",
          position: "",
          teamLevel: "", // Reset team level on submission
          medical: "",
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
        console.error('Application submission error:', err);
        setApiError(err.message || 'Failed to submit application. Please try again.');
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
    setForm((prev) => ({ ...prev, waiverRead: true, agreeWaiver: true }));
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

      <h2 className="text-2xl font-bold mb-4 text-green-900">Player Application</h2>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Gender <span className="text-red-600">*</span></label>
            <select name="gender" value={form.gender} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <div className="text-xs text-red-600">{errors.gender}</div>}
          </div>
          <div>
            <label className="font-semibold">Preferred Position</label>
            <select name="position" value={form.position} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full">
              <option value="">Preferred Position</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
              <option value="Any">Any</option>
            </select>
            <div className="text-xs text-gray-600 mt-1">
              <span className="text-orange-600 font-medium">Note:</span> Preferred position is not guaranteed. Final position assignment will be based on team needs and player development.
            </div>
          </div>
        </div>
        <div>
          <label className="font-semibold">Team Level <span className="text-red-600">*</span></label>
          <select name="teamLevel" value={form.teamLevel} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required>
            <option value="">Select Team Level</option>
            {feeSettings?.teamRegistrationFees && Object.entries(feeSettings.teamRegistrationFees).map(([key, value]) => (
              <option key={key} value={key}>{key.replace('youth', 'Youth ').replace('adult', 'Adult').replace('competitive', 'Competitive').replace('recreational', 'Recreational')}</option>
            ))}
          </select>
          {errors.teamLevel && <div className="text-xs text-red-600">{errors.teamLevel}</div>}
        </div>
        <div>
          <label className="font-semibold">Medical conditions, allergies, or notes</label>
          <textarea name="medical" value={form.medical} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" rows={2} />
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
              I confirm that all information provided is accurate and I am applying to join Seattle Leopards FC as a player. <span className="text-red-600">*</span>
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

        {/* Fee Information */}
        {!feeLoading && feeSettings && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Application Fee Information</h3>
            {feeSettings.feesEnabled && (feeCalculation?.totalFee > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-blue-800">
                  <strong>Registration Fee:</strong> ${(feeCalculation?.totalFee || 0).toFixed(2)}
                </p>
                <p className="text-xs text-blue-700">
                  This fee will be collected after your application is approved. You will receive payment instructions via email.
                </p>
                {feeCalculation?.earlyBirdDiscount > 0 && (
                  <p className="text-xs text-blue-700">
                    <strong>Early Bird Discount:</strong> ${(feeCalculation?.earlyBirdDiscount || 0).toFixed(2)} (applied)
                  </p>
                )}
                <p className="text-xs text-blue-700">
                  <strong>Base Fee:</strong> ${(feeCalculation?.baseFee || 0).toFixed(2)}
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Seasonal Rate:</strong> {((feeCalculation?.seasonalMultiplier || 1) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Team Level:</strong> {feeCalculation?.teamLevel || 'Not selected'}
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Age:</strong> {feeCalculation?.age || 'Not calculated'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-blue-800">
                <strong>No registration fee required.</strong>
              </p>
            ))}
          </div>
        )}

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