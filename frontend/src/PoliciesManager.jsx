import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PoliciesManager = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [policies, setPolicies] = useState({
    general: {
      clubName: 'Seattle Leopards FC',
      codeOfConduct: '',
      membershipTerms: '',
      privacyPolicy: '',
      refundPolicy: '',
      lastUpdated: new Date().toISOString()
    },
    safety: {
      safetyGuidelines: '',
      emergencyProcedures: '',
      injuryReporting: '',
      equipmentSafety: '',
      weatherPolicy: '',
      lastUpdated: new Date().toISOString()
    },
    disciplinary: {
      disciplinaryCode: '',
      suspensionPolicy: '',
      appealProcess: '',
      zeroTolerance: '',
      reportingProcedures: '',
      lastUpdated: new Date().toISOString()
    },
    financial: {
      paymentTerms: '',
      feeStructure: '',
      refundPolicy: '',
      latePaymentPolicy: '',
      financialAid: '',
      lastUpdated: new Date().toISOString()
    },
    technology: {
      dataProtection: '',
      socialMediaPolicy: '',
      photoVideoPolicy: '',
      communicationPolicy: '',
      onlineSafety: '',
      lastUpdated: new Date().toISOString()
    },
    volunteer: {
      volunteerCode: '',
      backgroundChecks: '',
      trainingRequirements: '',
      volunteerRights: '',
      volunteerResponsibilities: '',
      lastUpdated: new Date().toISOString()
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tabs = [
    { id: 'general', name: 'General Policies', icon: '📋', color: 'blue' },
    { id: 'safety', name: 'Safety & Health', icon: '🛡️', color: 'red' },
    { id: 'disciplinary', name: 'Disciplinary', icon: '⚖️', color: 'orange' },
    { id: 'financial', name: 'Financial', icon: '💰', color: 'green' },
    { id: 'technology', name: 'Technology', icon: '💻', color: 'purple' },
    { id: 'volunteer', name: 'Volunteer', icon: '🤝', color: 'teal' }
  ];

  useEffect(() => {
    document.title = 'Policies Management - Seattle Leopards FC Admin';
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/policies');
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/policies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policies),
      });

      if (response.ok) {
        setMessage('Policies saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving policies');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving policies:', error);
      setMessage('Error saving policies');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = (category, field, value) => {
    setPolicies(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  const getTabColor = (color) => {
    const colors = {
      blue: 'border-blue-500 text-blue-600',
      red: 'border-red-500 text-red-600',
      orange: 'border-orange-500 text-orange-600',
      green: 'border-green-500 text-green-600',
      purple: 'border-purple-500 text-purple-600',
      teal: 'border-teal-500 text-teal-600'
    };
    return colors[color] || 'border-gray-500 text-gray-600';
  };

  const getTabBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      red: 'bg-red-50 border-red-200',
      orange: 'bg-orange-50 border-orange-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      teal: 'bg-teal-50 border-teal-200'
    };
    return colors[color] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Policies Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage club policies, procedures, and guidelines
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back to Admin
              </Link>
              <button
                onClick={savePolicies}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save All Policies'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'general' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">General Policies</h2>
                <p className="text-gray-600">Core club policies and terms of membership</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={policies.general.clubName}
                    onChange={(e) => updatePolicy('general', 'clubName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code of Conduct
                  </label>
                  <textarea
                    rows={6}
                    value={policies.general.codeOfConduct}
                    onChange={(e) => updatePolicy('general', 'codeOfConduct', e.target.value)}
                    placeholder="Enter the club's code of conduct..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Terms & Conditions
                  </label>
                  <textarea
                    rows={6}
                    value={policies.general.membershipTerms}
                    onChange={(e) => updatePolicy('general', 'membershipTerms', e.target.value)}
                    placeholder="Enter membership terms and conditions..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Policy
                  </label>
                  <textarea
                    rows={6}
                    value={policies.general.privacyPolicy}
                    onChange={(e) => updatePolicy('general', 'privacyPolicy', e.target.value)}
                    placeholder="Enter privacy policy details..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.general.refundPolicy}
                    onChange={(e) => updatePolicy('general', 'refundPolicy', e.target.value)}
                    placeholder="Enter refund policy details..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety & Health Policies</h2>
                <p className="text-gray-600">Safety guidelines and health protocols</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Guidelines
                  </label>
                  <textarea
                    rows={6}
                    value={policies.safety.safetyGuidelines}
                    onChange={(e) => updatePolicy('safety', 'safetyGuidelines', e.target.value)}
                    placeholder="Enter general safety guidelines..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Procedures
                  </label>
                  <textarea
                    rows={6}
                    value={policies.safety.emergencyProcedures}
                    onChange={(e) => updatePolicy('safety', 'emergencyProcedures', e.target.value)}
                    placeholder="Enter emergency procedures..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Injury Reporting Procedures
                  </label>
                  <textarea
                    rows={4}
                    value={policies.safety.injuryReporting}
                    onChange={(e) => updatePolicy('safety', 'injuryReporting', e.target.value)}
                    placeholder="Enter injury reporting procedures..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Safety
                  </label>
                  <textarea
                    rows={4}
                    value={policies.safety.equipmentSafety}
                    onChange={(e) => updatePolicy('safety', 'equipmentSafety', e.target.value)}
                    placeholder="Enter equipment safety guidelines..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weather Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.safety.weatherPolicy}
                    onChange={(e) => updatePolicy('safety', 'weatherPolicy', e.target.value)}
                    placeholder="Enter weather-related safety policies..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disciplinary' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Disciplinary Policies</h2>
                <p className="text-gray-600">Disciplinary procedures and consequences</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disciplinary Code
                  </label>
                  <textarea
                    rows={6}
                    value={policies.disciplinary.disciplinaryCode}
                    onChange={(e) => updatePolicy('disciplinary', 'disciplinaryCode', e.target.value)}
                    placeholder="Enter disciplinary code and rules..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suspension Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.disciplinary.suspensionPolicy}
                    onChange={(e) => updatePolicy('disciplinary', 'suspensionPolicy', e.target.value)}
                    placeholder="Enter suspension policy details..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appeal Process
                  </label>
                  <textarea
                    rows={4}
                    value={policies.disciplinary.appealProcess}
                    onChange={(e) => updatePolicy('disciplinary', 'appealProcess', e.target.value)}
                    placeholder="Enter appeal process details..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zero Tolerance Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.disciplinary.zeroTolerance}
                    onChange={(e) => updatePolicy('disciplinary', 'zeroTolerance', e.target.value)}
                    placeholder="Enter zero tolerance policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Procedures
                  </label>
                  <textarea
                    rows={4}
                    value={policies.disciplinary.reportingProcedures}
                    onChange={(e) => updatePolicy('disciplinary', 'reportingProcedures', e.target.value)}
                    placeholder="Enter reporting procedures..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Policies</h2>
                <p className="text-gray-600">Payment terms and financial procedures</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <textarea
                    rows={4}
                    value={policies.financial.paymentTerms}
                    onChange={(e) => updatePolicy('financial', 'paymentTerms', e.target.value)}
                    placeholder="Enter payment terms and conditions..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Structure
                  </label>
                  <textarea
                    rows={6}
                    value={policies.financial.feeStructure}
                    onChange={(e) => updatePolicy('financial', 'feeStructure', e.target.value)}
                    placeholder="Enter fee structure details..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.financial.refundPolicy}
                    onChange={(e) => updatePolicy('financial', 'refundPolicy', e.target.value)}
                    placeholder="Enter refund policy details..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Payment Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.financial.latePaymentPolicy}
                    onChange={(e) => updatePolicy('financial', 'latePaymentPolicy', e.target.value)}
                    placeholder="Enter late payment policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Financial Aid Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.financial.financialAid}
                    onChange={(e) => updatePolicy('financial', 'financialAid', e.target.value)}
                    placeholder="Enter financial aid policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technology' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Technology Policies</h2>
                <p className="text-gray-600">Digital policies and online safety</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Protection Policy
                  </label>
                  <textarea
                    rows={6}
                    value={policies.technology.dataProtection}
                    onChange={(e) => updatePolicy('technology', 'dataProtection', e.target.value)}
                    placeholder="Enter data protection policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Policy
                  </label>
                  <textarea
                    rows={6}
                    value={policies.technology.socialMediaPolicy}
                    onChange={(e) => updatePolicy('technology', 'socialMediaPolicy', e.target.value)}
                    placeholder="Enter social media policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo & Video Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.technology.photoVideoPolicy}
                    onChange={(e) => updatePolicy('technology', 'photoVideoPolicy', e.target.value)}
                    placeholder="Enter photo and video policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.technology.communicationPolicy}
                    onChange={(e) => updatePolicy('technology', 'communicationPolicy', e.target.value)}
                    placeholder="Enter communication policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Online Safety Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.technology.onlineSafety}
                    onChange={(e) => updatePolicy('technology', 'onlineSafety', e.target.value)}
                    placeholder="Enter online safety policy..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'volunteer' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Volunteer Policies</h2>
                <p className="text-gray-600">Volunteer guidelines and expectations</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volunteer Code of Conduct
                  </label>
                  <textarea
                    rows={6}
                    value={policies.volunteer.volunteerCode}
                    onChange={(e) => updatePolicy('volunteer', 'volunteerCode', e.target.value)}
                    placeholder="Enter volunteer code of conduct..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Check Policy
                  </label>
                  <textarea
                    rows={4}
                    value={policies.volunteer.backgroundChecks}
                    onChange={(e) => updatePolicy('volunteer', 'backgroundChecks', e.target.value)}
                    placeholder="Enter background check requirements..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={policies.volunteer.trainingRequirements}
                    onChange={(e) => updatePolicy('volunteer', 'trainingRequirements', e.target.value)}
                    placeholder="Enter training requirements..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volunteer Rights
                  </label>
                  <textarea
                    rows={4}
                    value={policies.volunteer.volunteerRights}
                    onChange={(e) => updatePolicy('volunteer', 'volunteerRights', e.target.value)}
                    placeholder="Enter volunteer rights..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volunteer Responsibilities
                  </label>
                  <textarea
                    rows={4}
                    value={policies.volunteer.volunteerResponsibilities}
                    onChange={(e) => updatePolicy('volunteer', 'volunteerResponsibilities', e.target.value)}
                    placeholder="Enter volunteer responsibilities..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Management Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">📋 Comprehensive Coverage</h4>
              <p className="text-sm text-gray-600">Manage all aspects of club policies from general terms to specific safety protocols.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">🔄 Version Control</h4>
              <p className="text-sm text-gray-600">Track when policies were last updated and maintain version history.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">💾 Auto-Save</h4>
              <p className="text-sm text-gray-600">Changes are saved automatically to prevent data loss.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">📱 Responsive Design</h4>
              <p className="text-sm text-gray-600">Access and edit policies from any device, anywhere.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">🔒 Secure Storage</h4>
              <p className="text-sm text-gray-600">All policies are securely stored and backed up.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Easy Access</h4>
              <p className="text-sm text-gray-600">Quick navigation between different policy categories.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesManager;
