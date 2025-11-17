import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from './config/api';

const AdminEmailSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSaving, setTestingSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    adminEmail: '',
    supportEmail: '',
    noreplyEmail: '',
    emailProvider: 'gmail',
    emailTemplateHeader: '',
    emailTemplateFooter: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      if (response.data) {
        setSettings({
          emailNotifications: response.data.emailNotifications ?? true,
          adminEmail: response.data.adminEmail || '',
          supportEmail: response.data.supportEmail || '',
          noreplyEmail: response.data.noreplyEmail || '',
          emailProvider: response.data.emailProvider || 'gmail',
          emailTemplateHeader: response.data.emailTemplateHeader || '',
          emailTemplateFooter: response.data.emailTemplateFooter || ''
        });
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast.error('Failed to load email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', settings);
      toast.success('✅ Email settings saved successfully!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('❌ Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      setTestingSaving(true);
      await api.post('/settings/test-email', { email: testEmail });
      toast.success(`✅ Test email sent to ${testEmail}!`);
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('❌ Failed to send test email. Check your email configuration.');
    } finally {
      setTestingSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure email notifications and templates for your soccer club
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Email Notifications Toggle */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="emailNotifications" className="text-base font-medium text-gray-900">
                Enable Email Notifications
              </label>
              <p className="text-sm text-gray-500">
                Send automatic email notifications for applications, approvals, and other events
              </p>
            </div>
            <div className="ml-4">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleInputChange}
                className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Email Configuration Required</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>To send emails, you need to configure environment variables on your server:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><code className="bg-blue-100 px-1 rounded">EMAIL_USER</code> or <code className="bg-blue-100 px-1 rounded">SMTP_USER</code> - Your email address</li>
                    <li><code className="bg-blue-100 px-1 rounded">EMAIL_PASS</code> or <code className="bg-blue-100 px-1 rounded">SMTP_PASS</code> - Your email app password</li>
                    <li><code className="bg-blue-100 px-1 rounded">FRONTEND_URL</code> - Your frontend URL (for email links)</li>
                  </ul>
                  <p className="mt-2">
                    <strong>Gmail Users:</strong> You need to create an "App Password" from your Google Account security settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Addresses */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Addresses</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Primary contact email for administrative purposes
              </p>
              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                placeholder="admin@seattleleopardsfc.com"
              />
            </div>

            <div>
              <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                Support Email
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Email address displayed for support inquiries
              </p>
              <input
                type="email"
                id="supportEmail"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                placeholder="support@seattleleopardsfc.com"
              />
            </div>

            <div>
              <label htmlFor="noreplyEmail" className="block text-sm font-medium text-gray-700">
                No-Reply Email
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Email address used for automated notifications
              </p>
              <input
                type="email"
                id="noreplyEmail"
                name="noreplyEmail"
                value={settings.noreplyEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                placeholder="noreply@seattleleopardsfc.com"
              />
            </div>
          </div>
        </div>

        {/* Email Provider */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Provider</h2>
          
          <div>
            <label htmlFor="emailProvider" className="block text-sm font-medium text-gray-700">
              Service Provider
            </label>
            <select
              id="emailProvider"
              name="emailProvider"
              value={settings.emailProvider}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="yahoo">Yahoo</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="custom">Custom SMTP</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Select your email service provider (configuration done via environment variables)
            </p>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Templates</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="emailTemplateHeader" className="block text-sm font-medium text-gray-700">
                Email Header
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Custom header text or HTML to include at the top of all emails
              </p>
              <textarea
                id="emailTemplateHeader"
                name="emailTemplateHeader"
                value={settings.emailTemplateHeader}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                placeholder="Optional custom header for all emails..."
              />
            </div>

            <div>
              <label htmlFor="emailTemplateFooter" className="block text-sm font-medium text-gray-700">
                Email Footer
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Custom footer text or HTML to include at the bottom of all emails
              </p>
              <textarea
                id="emailTemplateFooter"
                name="emailTemplateFooter"
                value={settings.emailTemplateFooter}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                placeholder="Optional custom footer for all emails..."
              />
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Email Configuration</h2>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Send Test Email
              </label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                placeholder="your-email@example.com"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testingSaving || !testEmail}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testingSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Test'
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Send a test email to verify your email configuration is working correctly
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>

      {/* Email Types Info */}
      <div className="mt-8 bg-gray-50 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Automated Email Types</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Application Submission Confirmation</h3>
              <p className="text-sm text-gray-500">Sent immediately when someone submits an application</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Application Approval</h3>
              <p className="text-sm text-gray-500">Sent when an admin approves an application with team placement details</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Application Status Updates</h3>
              <p className="text-sm text-gray-500">Sent when application status changes (pending, under review, rejected)</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Correction Requests</h3>
              <p className="text-sm text-gray-500">Sent when an admin requests corrections to an application</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSettings;

