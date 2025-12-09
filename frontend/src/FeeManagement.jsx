import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

const API_URL = `${API_BASE_URL}/settings`;

export default function FeeManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('registration');
  const [unauthorized, setUnauthorized] = useState(false);
  
  // Fee state
  const [fees, setFees] = useState({
    feesEnabled: true,
    currency: 'USD',
    taxEnabled: false,
    taxRate: 0,
    taxName: 'Sales Tax',
    registrationFees: {},
    monthlyFees: {},
    seasonalFees: {},
    programFees: {},
    campFees: {},
    trainingFees: {},
    equipmentFees: {},
    tournamentFees: {},
    facilityFees: {},
    adminFees: {},
    discounts: {},
    paymentPlans: {}
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchFees();
  }, [navigate]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate('/admin', { state: { section: location.state.from } });
    } else {
      navigate('/admin');
    }
  };

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/fees/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        setUnauthorized(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch fee settings');
      }

      const data = await response.json();
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fee settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/fees`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fees)
      });

      if (!response.ok) {
        throw new Error('Failed to save fee settings');
      }

      toast.success('Fee settings saved successfully!');
    } catch (error) {
      console.error('Error saving fees:', error);
      toast.error('Failed to save fee settings');
    } finally {
      setSaving(false);
    }
  };

  const updateFeeCategory = (category, field, value) => {
    setFees(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const updateGlobalSetting = (field, value) => {
    setFees(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currencySymbol = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$'
  }[fees.currency] || '$';

  const tabs = [
    { id: 'registration', name: 'Registration', icon: '📝' },
    { id: 'monthly', name: 'Monthly', icon: '📅' },
    { id: 'seasonal', name: 'Seasonal', icon: '🍂' },
    { id: 'programs', name: 'Programs', icon: '⚽' },
    { id: 'camps', name: 'Camps & Clinics', icon: '🏕️' },
    { id: 'training', name: 'Training', icon: '🎯' },
    { id: 'equipment', name: 'Equipment', icon: '👕' },
    { id: 'tournaments', name: 'Tournaments', icon: '🏆' },
    { id: 'facilities', name: 'Facilities', icon: '🏟️' },
    { id: 'admin', name: 'Administrative', icon: '📋' },
    { id: 'discounts', name: 'Discounts', icon: '💰' },
    { id: 'payments', name: 'Payment Plans', icon: '💳' }
  ];

  const FeeInput = ({ label, value, onChange, isPercent = false, description = '' }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {!isPercent && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {currencySymbol}
          </span>
        )}
        <input
          type="number"
          min="0"
          step={isPercent ? "1" : "0.01"}
          value={value || 0}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${!isPercent ? 'pl-8' : ''}`}
        />
        {isPercent && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
        )}
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="text-lg text-gray-600">Loading fee settings...</span>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to manage fee settings.</p>
          <button
            onClick={handleBack}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💵</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
              <p className="text-gray-600">Configure all registration, program, and service fees</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Global Fee Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fees.feesEnabled}
                onChange={(e) => updateGlobalSetting('feesEnabled', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="font-medium text-gray-700">Fees Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={fees.currency}
              onChange={(e) => updateGlobalSetting('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fees.taxEnabled}
                onChange={(e) => updateGlobalSetting('taxEnabled', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="font-medium text-gray-700">Tax Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={fees.taxRate || 0}
              onChange={(e) => updateGlobalSetting('taxRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={!fees.taxEnabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
            <input
              type="text"
              value={fees.taxName || 'Sales Tax'}
              onChange={(e) => updateGlobalSetting('taxName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={!fees.taxEnabled}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Registration Fees Tab */}
          {activeTab === 'registration' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Fees (One-time)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Player Registration"
                  value={fees.registrationFees?.playerRegistration}
                  onChange={(v) => updateFeeCategory('registrationFees', 'playerRegistration', v)}
                  description="New player registration fee"
                />
                <FeeInput
                  label="Coach Registration"
                  value={fees.registrationFees?.coachRegistration}
                  onChange={(v) => updateFeeCategory('registrationFees', 'coachRegistration', v)}
                  description="Coach application fee"
                />
                <FeeInput
                  label="Referee Registration"
                  value={fees.registrationFees?.refereeRegistration}
                  onChange={(v) => updateFeeCategory('registrationFees', 'refereeRegistration', v)}
                  description="Referee certification fee"
                />
                <FeeInput
                  label="Volunteer Registration"
                  value={fees.registrationFees?.volunteerRegistration}
                  onChange={(v) => updateFeeCategory('registrationFees', 'volunteerRegistration', v)}
                  description="Volunteer application fee"
                />
                <FeeInput
                  label="Family Registration"
                  value={fees.registrationFees?.familyRegistration}
                  onChange={(v) => updateFeeCategory('registrationFees', 'familyRegistration', v)}
                  description="Family package registration"
                />
                <FeeInput
                  label="Late Registration Fee"
                  value={fees.registrationFees?.lateRegistrationFee}
                  onChange={(v) => updateFeeCategory('registrationFees', 'lateRegistrationFee', v)}
                  description="Additional fee for late registration"
                />
                <FeeInput
                  label="Early Bird Discount"
                  value={fees.registrationFees?.earlyBirdDiscount}
                  onChange={(v) => updateFeeCategory('registrationFees', 'earlyBirdDiscount', v)}
                  isPercent
                  description="Discount for early registration"
                />
              </div>
            </div>
          )}

          {/* Monthly Fees Tab */}
          {activeTab === 'monthly' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Fees (Recurring)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Youth Monthly"
                  value={fees.monthlyFees?.youthMonthly}
                  onChange={(v) => updateFeeCategory('monthlyFees', 'youthMonthly', v)}
                  description="Ages 6-12"
                />
                <FeeInput
                  label="Teen Monthly"
                  value={fees.monthlyFees?.teenMonthly}
                  onChange={(v) => updateFeeCategory('monthlyFees', 'teenMonthly', v)}
                  description="Ages 13-18"
                />
                <FeeInput
                  label="Adult Monthly"
                  value={fees.monthlyFees?.adultMonthly}
                  onChange={(v) => updateFeeCategory('monthlyFees', 'adultMonthly', v)}
                  description="Ages 18+"
                />
                <FeeInput
                  label="Family Monthly"
                  value={fees.monthlyFees?.familyMonthly}
                  onChange={(v) => updateFeeCategory('monthlyFees', 'familyMonthly', v)}
                  description="Family package"
                />
                <FeeInput
                  label="Elite Monthly"
                  value={fees.monthlyFees?.eliteMonthly}
                  onChange={(v) => updateFeeCategory('monthlyFees', 'eliteMonthly', v)}
                  description="Elite/Competitive program"
                />
                <FeeInput
                  label="Auto-Pay Discount"
                  value={fees.monthlyFees?.autoPayDiscount}
                  onChange={(v) => updateFeeCategory('monthlyFees', 'autoPayDiscount', v)}
                  isPercent
                  description="Discount for automatic payments"
                />
              </div>
            </div>
          )}

          {/* Seasonal Fees Tab */}
          {activeTab === 'seasonal' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seasonal Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Spring Season"
                  value={fees.seasonalFees?.springSeasonFee}
                  onChange={(v) => updateFeeCategory('seasonalFees', 'springSeasonFee', v)}
                  description="March - May"
                />
                <FeeInput
                  label="Summer Season"
                  value={fees.seasonalFees?.summerSeasonFee}
                  onChange={(v) => updateFeeCategory('seasonalFees', 'summerSeasonFee', v)}
                  description="June - August"
                />
                <FeeInput
                  label="Fall Season"
                  value={fees.seasonalFees?.fallSeasonFee}
                  onChange={(v) => updateFeeCategory('seasonalFees', 'fallSeasonFee', v)}
                  description="September - November"
                />
                <FeeInput
                  label="Winter Season"
                  value={fees.seasonalFees?.winterSeasonFee}
                  onChange={(v) => updateFeeCategory('seasonalFees', 'winterSeasonFee', v)}
                  description="December - February"
                />
                <FeeInput
                  label="Full Year Fee"
                  value={fees.seasonalFees?.fullYearFee}
                  onChange={(v) => updateFeeCategory('seasonalFees', 'fullYearFee', v)}
                  description="All four seasons"
                />
                <FeeInput
                  label="Full Year Discount"
                  value={fees.seasonalFees?.fullYearDiscount}
                  onChange={(v) => updateFeeCategory('seasonalFees', 'fullYearDiscount', v)}
                  isPercent
                  description="Discount for paying full year upfront"
                />
              </div>
            </div>
          )}

          {/* Program Fees Tab */}
          {activeTab === 'programs' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Program Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Youth Development"
                  value={fees.programFees?.youthDevelopment}
                  onChange={(v) => updateFeeCategory('programFees', 'youthDevelopment', v)}
                />
                <FeeInput
                  label="Competitive"
                  value={fees.programFees?.competitive}
                  onChange={(v) => updateFeeCategory('programFees', 'competitive', v)}
                />
                <FeeInput
                  label="Elite Academy"
                  value={fees.programFees?.eliteAcademy}
                  onChange={(v) => updateFeeCategory('programFees', 'eliteAcademy', v)}
                />
                <FeeInput
                  label="Adult Recreational"
                  value={fees.programFees?.adultRecreational}
                  onChange={(v) => updateFeeCategory('programFees', 'adultRecreational', v)}
                />
                <FeeInput
                  label="Adult Competitive"
                  value={fees.programFees?.adultCompetitive}
                  onChange={(v) => updateFeeCategory('programFees', 'adultCompetitive', v)}
                />
                <FeeInput
                  label="Senior Program"
                  value={fees.programFees?.seniorProgram}
                  onChange={(v) => updateFeeCategory('programFees', 'seniorProgram', v)}
                />
                <FeeInput
                  label="Special Needs"
                  value={fees.programFees?.specialNeeds}
                  onChange={(v) => updateFeeCategory('programFees', 'specialNeeds', v)}
                />
                <FeeInput
                  label="Goalkeeper Training"
                  value={fees.programFees?.goalkeeperTraining}
                  onChange={(v) => updateFeeCategory('programFees', 'goalkeeperTraining', v)}
                />
              </div>
            </div>
          )}

          {/* Camp Fees Tab */}
          {activeTab === 'camps' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Camp & Clinic Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Summer Camp (Weekly)"
                  value={fees.campFees?.summerCampWeekly}
                  onChange={(v) => updateFeeCategory('campFees', 'summerCampWeekly', v)}
                />
                <FeeInput
                  label="Summer Camp (Daily)"
                  value={fees.campFees?.summerCampDaily}
                  onChange={(v) => updateFeeCategory('campFees', 'summerCampDaily', v)}
                />
                <FeeInput
                  label="Winter Camp"
                  value={fees.campFees?.winterCamp}
                  onChange={(v) => updateFeeCategory('campFees', 'winterCamp', v)}
                />
                <FeeInput
                  label="Spring Break Camp"
                  value={fees.campFees?.springBreakCamp}
                  onChange={(v) => updateFeeCategory('campFees', 'springBreakCamp', v)}
                />
                <FeeInput
                  label="Holiday Camp"
                  value={fees.campFees?.holidayCamp}
                  onChange={(v) => updateFeeCategory('campFees', 'holidayCamp', v)}
                />
                <FeeInput
                  label="Bootcamp Intensive"
                  value={fees.campFees?.bootcampIntensive}
                  onChange={(v) => updateFeeCategory('campFees', 'bootcampIntensive', v)}
                />
                <FeeInput
                  label="Skills Clinic"
                  value={fees.campFees?.skillsClinic}
                  onChange={(v) => updateFeeCategory('campFees', 'skillsClinic', v)}
                />
                <FeeInput
                  label="Goalkeeper Clinic"
                  value={fees.campFees?.goalkeeperClinic}
                  onChange={(v) => updateFeeCategory('campFees', 'goalkeeperClinic', v)}
                />
                <FeeInput
                  label="Striker Clinic"
                  value={fees.campFees?.strikerClinic}
                  onChange={(v) => updateFeeCategory('campFees', 'strikerClinic', v)}
                />
                <FeeInput
                  label="Defender Clinic"
                  value={fees.campFees?.defenderClinic}
                  onChange={(v) => updateFeeCategory('campFees', 'defenderClinic', v)}
                />
              </div>
            </div>
          )}

          {/* Training Fees Tab */}
          {activeTab === 'training' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Training & Coaching Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Private Session (1-on-1)"
                  value={fees.trainingFees?.privateSession}
                  onChange={(v) => updateFeeCategory('trainingFees', 'privateSession', v)}
                />
                <FeeInput
                  label="Semi-Private Session (2-3 players)"
                  value={fees.trainingFees?.semiPrivateSession}
                  onChange={(v) => updateFeeCategory('trainingFees', 'semiPrivateSession', v)}
                />
                <FeeInput
                  label="Group Session (4+ players)"
                  value={fees.trainingFees?.groupSession}
                  onChange={(v) => updateFeeCategory('trainingFees', 'groupSession', v)}
                />
                <FeeInput
                  label="Video Analysis"
                  value={fees.trainingFees?.videoAnalysis}
                  onChange={(v) => updateFeeCategory('trainingFees', 'videoAnalysis', v)}
                />
                <FeeInput
                  label="Fitness Assessment"
                  value={fees.trainingFees?.fitnessAssessment}
                  onChange={(v) => updateFeeCategory('trainingFees', 'fitnessAssessment', v)}
                />
                <FeeInput
                  label="Mental Coaching"
                  value={fees.trainingFees?.mentalCoaching}
                  onChange={(v) => updateFeeCategory('trainingFees', 'mentalCoaching', v)}
                />
                <FeeInput
                  label="Nutrition Consultation"
                  value={fees.trainingFees?.nutritionConsultation}
                  onChange={(v) => updateFeeCategory('trainingFees', 'nutritionConsultation', v)}
                />
              </div>
            </div>
          )}

          {/* Equipment Fees Tab */}
          {activeTab === 'equipment' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Equipment & Uniform Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Full Uniform Kit"
                  value={fees.equipmentFees?.uniformKit}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'uniformKit', v)}
                />
                <FeeInput
                  label="Practice Jersey"
                  value={fees.equipmentFees?.practiceJersey}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'practiceJersey', v)}
                />
                <FeeInput
                  label="Shorts"
                  value={fees.equipmentFees?.shorts}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'shorts', v)}
                />
                <FeeInput
                  label="Socks"
                  value={fees.equipmentFees?.socks}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'socks', v)}
                />
                <FeeInput
                  label="Training Ball"
                  value={fees.equipmentFees?.trainingBall}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'trainingBall', v)}
                />
                <FeeInput
                  label="Match Ball"
                  value={fees.equipmentFees?.matchBall}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'matchBall', v)}
                />
                <FeeInput
                  label="Shin Guards"
                  value={fees.equipmentFees?.shinguards}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'shinguards', v)}
                />
                <FeeInput
                  label="Goalkeeper Gloves"
                  value={fees.equipmentFees?.goalkeeperGloves}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'goalkeeperGloves', v)}
                />
                <FeeInput
                  label="Team Bag"
                  value={fees.equipmentFees?.teamBag}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'teamBag', v)}
                />
                <FeeInput
                  label="Warmup Suit"
                  value={fees.equipmentFees?.warmupSuit}
                  onChange={(v) => updateFeeCategory('equipmentFees', 'warmupSuit', v)}
                />
              </div>
            </div>
          )}

          {/* Tournament Fees Tab */}
          {activeTab === 'tournaments' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tournament & Competition Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Local Tournament"
                  value={fees.tournamentFees?.localTournament}
                  onChange={(v) => updateFeeCategory('tournamentFees', 'localTournament', v)}
                />
                <FeeInput
                  label="Regional Tournament"
                  value={fees.tournamentFees?.regionalTournament}
                  onChange={(v) => updateFeeCategory('tournamentFees', 'regionalTournament', v)}
                />
                <FeeInput
                  label="State Tournament"
                  value={fees.tournamentFees?.stateTournament}
                  onChange={(v) => updateFeeCategory('tournamentFees', 'stateTournament', v)}
                />
                <FeeInput
                  label="National Tournament"
                  value={fees.tournamentFees?.nationalTournament}
                  onChange={(v) => updateFeeCategory('tournamentFees', 'nationalTournament', v)}
                />
                <FeeInput
                  label="International Tournament"
                  value={fees.tournamentFees?.internationalTournament}
                  onChange={(v) => updateFeeCategory('tournamentFees', 'internationalTournament', v)}
                />
                <FeeInput
                  label="Friendly Match"
                  value={fees.tournamentFees?.friendlyMatch}
                  onChange={(v) => updateFeeCategory('tournamentFees', 'friendlyMatch', v)}
                />
                <FeeInput
                  label="League Match"
                  value={fees.tournamentFees?.leagueMatch}
                  onChange={(v) => updateFeeCategory('tournamentFees', 'leagueMatch', v)}
                />
              </div>
            </div>
          )}

          {/* Facility Fees Tab */}
          {activeTab === 'facilities' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Facility & Field Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Field Rental (Hourly)"
                  value={fees.facilityFees?.fieldRentalHourly}
                  onChange={(v) => updateFeeCategory('facilityFees', 'fieldRentalHourly', v)}
                />
                <FeeInput
                  label="Field Rental (Daily)"
                  value={fees.facilityFees?.fieldRentalDaily}
                  onChange={(v) => updateFeeCategory('facilityFees', 'fieldRentalDaily', v)}
                />
                <FeeInput
                  label="Indoor Facility (Hourly)"
                  value={fees.facilityFees?.indoorFacilityHourly}
                  onChange={(v) => updateFeeCategory('facilityFees', 'indoorFacilityHourly', v)}
                />
                <FeeInput
                  label="Lighting Fee"
                  value={fees.facilityFees?.lightingFee}
                  onChange={(v) => updateFeeCategory('facilityFees', 'lightingFee', v)}
                />
                <FeeInput
                  label="Equipment Rental"
                  value={fees.facilityFees?.equipmentRental}
                  onChange={(v) => updateFeeCategory('facilityFees', 'equipmentRental', v)}
                />
              </div>
            </div>
          )}

          {/* Admin Fees Tab */}
          {activeTab === 'admin' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Administrative Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Transfer Fee"
                  value={fees.adminFees?.transferFee}
                  onChange={(v) => updateFeeCategory('adminFees', 'transferFee', v)}
                />
                <FeeInput
                  label="Document Processing"
                  value={fees.adminFees?.documentProcessing}
                  onChange={(v) => updateFeeCategory('adminFees', 'documentProcessing', v)}
                />
                <FeeInput
                  label="ID Card Replacement"
                  value={fees.adminFees?.idCardReplacement}
                  onChange={(v) => updateFeeCategory('adminFees', 'idCardReplacement', v)}
                />
                <FeeInput
                  label="Uniform Replacement"
                  value={fees.adminFees?.uniformReplacement}
                  onChange={(v) => updateFeeCategory('adminFees', 'uniformReplacement', v)}
                />
                <FeeInput
                  label="Background Check"
                  value={fees.adminFees?.backgroundCheck}
                  onChange={(v) => updateFeeCategory('adminFees', 'backgroundCheck', v)}
                />
                <FeeInput
                  label="Coach Certification"
                  value={fees.adminFees?.coachCertification}
                  onChange={(v) => updateFeeCategory('adminFees', 'coachCertification', v)}
                />
                <FeeInput
                  label="Referee Certification"
                  value={fees.adminFees?.refereeCertification}
                  onChange={(v) => updateFeeCategory('adminFees', 'refereeCertification', v)}
                />
                <FeeInput
                  label="Insurance Fee"
                  value={fees.adminFees?.insuranceFee}
                  onChange={(v) => updateFeeCategory('adminFees', 'insuranceFee', v)}
                />
                <FeeInput
                  label="Returned Check Fee"
                  value={fees.adminFees?.returnedCheckFee}
                  onChange={(v) => updateFeeCategory('adminFees', 'returnedCheckFee', v)}
                />
                <FeeInput
                  label="Late Payment Fee"
                  value={fees.adminFees?.latePaymentFee}
                  onChange={(v) => updateFeeCategory('adminFees', 'latePaymentFee', v)}
                />
                <FeeInput
                  label="Cancellation Fee"
                  value={fees.adminFees?.cancellationFee}
                  onChange={(v) => updateFeeCategory('adminFees', 'cancellationFee', v)}
                />
              </div>
            </div>
          )}

          {/* Discounts Tab */}
          {activeTab === 'discounts' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Discounts & Scholarships</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeeInput
                  label="Sibling Discount"
                  value={fees.discounts?.siblingDiscount}
                  onChange={(v) => updateFeeCategory('discounts', 'siblingDiscount', v)}
                  isPercent
                  description="For 2 children"
                />
                <FeeInput
                  label="Multi-Child Discount"
                  value={fees.discounts?.multiChildDiscount}
                  onChange={(v) => updateFeeCategory('discounts', 'multiChildDiscount', v)}
                  isPercent
                  description="For 3+ children"
                />
                <FeeInput
                  label="Referral Bonus"
                  value={fees.discounts?.referralDiscount}
                  onChange={(v) => updateFeeCategory('discounts', 'referralDiscount', v)}
                  description="Flat amount for referrals"
                />
                <FeeInput
                  label="Military Discount"
                  value={fees.discounts?.militaryDiscount}
                  onChange={(v) => updateFeeCategory('discounts', 'militaryDiscount', v)}
                  isPercent
                />
                <FeeInput
                  label="First Responder Discount"
                  value={fees.discounts?.firstResponderDiscount}
                  onChange={(v) => updateFeeCategory('discounts', 'firstResponderDiscount', v)}
                  isPercent
                />
                <FeeInput
                  label="Loyalty Discount"
                  value={fees.discounts?.loyaltyDiscount}
                  onChange={(v) => updateFeeCategory('discounts', 'loyaltyDiscount', v)}
                  isPercent
                  description="Returning players"
                />
                <FeeInput
                  label="Senior Citizen Discount"
                  value={fees.discounts?.seniorCitizenDiscount}
                  onChange={(v) => updateFeeCategory('discounts', 'seniorCitizenDiscount', v)}
                  isPercent
                />
                <FeeInput
                  label="Max Scholarship"
                  value={fees.discounts?.maxScholarshipPercent}
                  onChange={(v) => updateFeeCategory('discounts', 'maxScholarshipPercent', v)}
                  isPercent
                  description="Maximum scholarship percentage"
                />
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fees.discounts?.scholarshipAvailable || false}
                      onChange={(e) => updateFeeCategory('discounts', 'scholarshipAvailable', e.target.checked ? 1 : 0)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="font-medium text-gray-700">Scholarships Available</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Payment Plans Tab */}
          {activeTab === 'payments' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Plan Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fees.paymentPlans?.enablePaymentPlans || false}
                      onChange={(e) => updateFeeCategory('paymentPlans', 'enablePaymentPlans', e.target.checked ? 1 : 0)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="font-medium text-gray-700">Enable Payment Plans</span>
                  </label>
                </div>
                <FeeInput
                  label="Minimum Down Payment"
                  value={fees.paymentPlans?.minimumDownPayment}
                  onChange={(v) => updateFeeCategory('paymentPlans', 'minimumDownPayment', v)}
                  isPercent
                  description="Required upfront percentage"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Installments</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={fees.paymentPlans?.maxInstallments || 6}
                    onChange={(e) => updateFeeCategory('paymentPlans', 'maxInstallments', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <FeeInput
                  label="Installment Fee"
                  value={fees.paymentPlans?.installmentFee}
                  onChange={(v) => updateFeeCategory('paymentPlans', 'installmentFee', v)}
                  description="Fee per installment"
                />
                <FeeInput
                  label="Interest Rate (Annual)"
                  value={fees.paymentPlans?.paymentPlanInterest}
                  onChange={(v) => updateFeeCategory('paymentPlans', 'paymentPlanInterest', v)}
                  isPercent
                  description="Annual interest on payment plans"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

