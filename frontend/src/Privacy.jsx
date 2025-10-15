import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-2">
          This Privacy Policy explains how Seattle Leopards FC collects, uses, and protects your personal information. 
          We are committed to transparency and protecting your privacy rights.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">1. Information We Collect</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Personal Information You Provide</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Registration Data:</strong> Name, email, phone number, address, and date of birth</li>
                  <li><strong>Emergency Contacts:</strong> Names and contact information for emergency situations</li>
                  <li><strong>Medical Information:</strong> Health conditions, allergies, medications, and insurance details</li>
                  <li><strong>Payment Information:</strong> Credit card details, billing addresses, and payment history</li>
                  <li><strong>Program Preferences:</strong> Team preferences, skill levels, and participation history</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Information We Collect Automatically</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on site, and interaction patterns</li>
                  <li><strong>Location Data:</strong> General location information (city/state level only)</li>
                  <li><strong>Cookies and Tracking:</strong> Session cookies, preference cookies, and analytics data</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Information from Third Parties</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Payment Processors:</strong> Transaction confirmations and payment status</li>
                  <li><strong>Social Media:</strong> Public profile information when you connect social accounts</li>
                  <li><strong>Partners:</strong> Tournament organizers and league administrators</li>
                  <li><strong>Public Records:</strong> Information from publicly available sources</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">2. How We Use Your Information</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Primary Uses</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Service Delivery:</strong> Process registrations, manage teams, and coordinate programs</li>
                  <li><strong>Communication:</strong> Send important updates, emergency notifications, and program information</li>
                  <li><strong>Safety and Security:</strong> Ensure participant safety and respond to emergencies</li>
                  <li><strong>Payment Processing:</strong> Handle fees, donations, and financial transactions</li>
                  <li><strong>Legal Compliance:</strong> Meet regulatory requirements and maintain records</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Secondary Uses</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Service Improvement:</strong> Analyze usage patterns to enhance our programs</li>
                  <li><strong>Personalization:</strong> Customize content and recommendations based on preferences</li>
                  <li><strong>Marketing:</strong> Send promotional materials (with your consent)</li>
                  <li><strong>Research:</strong> Conduct anonymous analytics and program evaluation</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Legal Basis for Processing</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Contract Performance:</strong> Processing necessary to provide our services</li>
                  <li><strong>Legitimate Interest:</strong> Business operations, security, and service improvement</li>
                  <li><strong>Consent:</strong> Marketing communications and optional features</li>
                  <li><strong>Legal Obligation:</strong> Compliance with laws and regulations</li>
                  <li><strong>Vital Interest:</strong> Emergency situations and safety concerns</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">3. Information Sharing and Disclosure</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              We do not sell, rent, or trade your personal information. We may share your information only in the following circumstances:
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Service Providers</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Payment Processors:</strong> Stripe, PayPal, and other secure payment services</li>
                  <li><strong>Email Services:</strong> Mailchimp and other communication platforms</li>
                  <li><strong>Cloud Storage:</strong> AWS, Google Cloud, and other secure hosting providers</li>
                  <li><strong>Analytics:</strong> Google Analytics and other anonymous usage tracking</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Legal Requirements</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Law Enforcement:</strong> When required by law or legal process</li>
                  <li><strong>Government Agencies:</strong> For regulatory compliance and reporting</li>
                  <li><strong>Court Orders:</strong> Subpoenas, warrants, and other legal demands</li>
                  <li><strong>Safety Emergencies:</strong> Emergency situations requiring immediate action</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">With Your Consent</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Marketing Partners:</strong> Only with explicit consent for promotional activities</li>
                  <li><strong>Social Media:</strong> Public sharing of approved photos and videos</li>
                  <li><strong>Community Events:</strong> Participation in local soccer community activities</li>
                  <li><strong>Research Studies:</strong> Anonymized data for educational research</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">4. Data Security and Protection</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your personal information from unauthorized access, 
              disclosure, alteration, and destruction.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Technical Security</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Encryption:</strong> All sensitive data encrypted in transit and at rest</li>
                  <li><strong>SSL/TLS:</strong> Secure website connections with HTTPS protocol</li>
                  <li><strong>Firewalls:</strong> Network security and intrusion prevention</li>
                  <li><strong>Regular Updates:</strong> Software patches and security updates</li>
                  <li><strong>Backup Security:</strong> Encrypted backups with secure access controls</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Access Controls</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Multi-Factor Authentication:</strong> Additional security for sensitive accounts</li>
                  <li><strong>Role-Based Access:</strong> Employees only access data necessary for their role</li>
                  <li><strong>Password Policies:</strong> Strong password requirements and regular updates</li>
                  <li><strong>Session Management:</strong> Automatic logout and session timeouts</li>
                  <li><strong>Audit Logging:</strong> Comprehensive logging of data access and changes</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Incident Response</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>24/7 Monitoring:</strong> Continuous security monitoring and threat detection</li>
                  <li><strong>Rapid Response:</strong> Immediate response to security incidents</li>
                  <li><strong>Breach Notification:</strong> Prompt notification to affected individuals</li>
                  <li><strong>Recovery Procedures:</strong> Comprehensive incident recovery and remediation</li>
                  <li><strong>Regulatory Compliance:</strong> Compliance with breach notification laws</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">5. Your Privacy Rights</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              You have important rights regarding your personal information. We are committed to honoring these rights 
              and providing you with control over your data.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Access and Control Rights</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Right to Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Right to Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Right to Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Right to Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Right to Restriction:</strong> Limit how we process your information</li>
                  <li><strong>Right to Object:</strong> Object to certain types of processing</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Communication Preferences</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Marketing Opt-Out:</strong> Opt out of marketing communications at any time</li>
                  <li><strong>Email Preferences:</strong> Control frequency and types of emails you receive</li>
                  <li><strong>Text Message Opt-Out:</strong> Opt out of SMS communications</li>
                  <li><strong>Cookie Preferences:</strong> Control cookie and tracking settings</li>
                  <li><strong>Account Settings:</strong> Manage your privacy preferences in your account</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Exercising Your Rights</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Request Methods:</strong> Submit requests via email, phone, or our privacy portal</li>
                  <li><strong>Identity Verification:</strong> We may need to verify your identity before processing</li>
                  <li><strong>Response Timeline:</strong> We will respond to requests within 30 days</li>
                  <li><strong>No Discrimination:</strong> We will not discriminate for exercising your rights</li>
                  <li><strong>Appeal Process:</strong> Right to appeal if we deny your request</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">6. Children's Privacy Protection</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              We are committed to protecting children's privacy and comply with the Children's Online Privacy Protection Act (COPPA) 
              and other applicable laws.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Age Requirements</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Under 13:</strong> We do not knowingly collect personal information from children under 13</li>
                  <li><strong>13-17:</strong> Parental consent required for children under 18</li>
                  <li><strong>Consent Verification:</strong> We verify parental consent through appropriate methods</li>
                  <li><strong>Revocation Rights:</strong> Parents may revoke consent at any time</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Limited Collection</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Necessary Information Only:</strong> Only collect information needed for program participation</li>
                  <li><strong>Educational Purpose:</strong> Information used primarily for educational and safety purposes</li>
                  <li><strong>No Marketing:</strong> We do not use children's information for marketing</li>
                  <li><strong>Parental Access:</strong> Parents have full access to their child's information</li>
                  <li><strong>Deletion Rights:</strong> Parents may request deletion of their child's information</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">7. Cookies and Tracking Technologies</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to enhance your experience and provide personalized services.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Types of Cookies</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for website functionality and security</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors use our website</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Marketing Cookies:</strong> Used for advertising and promotional purposes</li>
                  <li><strong>Analytics Cookies:</strong> Help us improve our services</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Managing Cookies</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Browser Settings:</strong> Control cookies through your browser settings</li>
                  <li><strong>Cookie Banner:</strong> Manage preferences through our cookie consent banner</li>
                  <li><strong>Opt-Out Options:</strong> Opt out of non-essential cookies</li>
                  <li><strong>Third-Party Control:</strong> Control third-party tracking and advertising</li>
                  <li><strong>Mobile Apps:</strong> Manage tracking in mobile app settings</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">8. Data Retention and Deletion</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy 
              and comply with legal obligations.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Retention Periods</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Active Accounts:</strong> Retained while you are actively using our services</li>
                  <li><strong>Financial Records:</strong> Retained for 7 years for tax and accounting purposes</li>
                  <li><strong>Legal Requirements:</strong> Retained as required by applicable laws</li>
                  <li><strong>Safety Records:</strong> Retained indefinitely for liability and safety purposes</li>
                  <li><strong>Marketing Data:</strong> Retained until you opt out or request deletion</li>
                  <li><strong>Inactive Accounts:</strong> Deleted after 3 years of inactivity</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Deletion Process</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Request Processing:</strong> Deletion requests processed within 30 days</li>
                  <li><strong>Identity Verification:</strong> Verification required before deletion</li>
                  <li><strong>Complete Removal:</strong> Information removed from all systems and backups</li>
                  <li><strong>Confirmation:</strong> Written confirmation provided upon completion</li>
                  <li><strong>Legal Exceptions:</strong> Some data may be retained for legal requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">9. International Data Transfers</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Your personal information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Transfer Safeguards</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection</li>
                  <li><strong>Standard Contractual Clauses:</strong> EU-approved data transfer agreements</li>
                  <li><strong>Privacy Shield:</strong> For transfers to the United States</li>
                  <li><strong>Binding Corporate Rules:</strong> Internal data protection policies</li>
                  <li><strong>Encryption:</strong> All international transfers are encrypted</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Your Rights for International Transfers</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Information Rights:</strong> Right to know about international transfers</li>
                  <li><strong>Consent Rights:</strong> Right to consent to or object to transfers</li>
                  <li><strong>Redress Rights:</strong> Right to seek redress for transfer violations</li>
                  <li><strong>Supervisory Authority:</strong> Right to lodge complaints with authorities</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">10. Changes to This Privacy Policy</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
              legal requirements, or other factors.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Notification of Changes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Website Updates:</strong> Changes posted on our website with effective dates</li>
                  <li><strong>Email Notification:</strong> Material changes communicated via email</li>
                  <li><strong>Advance Notice:</strong> 30 days advance notice for material changes</li>
                  <li><strong>Consent Requirements:</strong> Some changes may require explicit consent</li>
                  <li><strong>Version History:</strong> Previous versions archived and available</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Acceptance of Changes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Continued Use:</strong> Continued use constitutes acceptance of changes</li>
                  <li><strong>Explicit Consent:</strong> Some changes may require explicit consent</li>
                  <li><strong>Opt-Out Rights:</strong> Users may opt out of certain changes</li>
                  <li><strong>Grandfathering:</strong> Some existing users may be grandfathered</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">11. Contact Information and Complaints</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, 
              please contact us using the information below.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Privacy Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Privacy Officer</h4>
                    <p className="text-gray-700">
                      Seattle Leopards FC<br />
                      123 Soccer Way<br />
                      Seattle, WA 98101<br />
                      United States
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Contact Details</h4>
                    <p className="text-gray-700">
                      Email: privacy@seattleleopardsfc.com<br />
                      Phone: (206) 555-0126<br />
                      Fax: (206) 555-0127
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Complaint Procedures</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Internal Resolution:</strong> We investigate and respond to complaints within 30 days</li>
                  <li><strong>Regulatory Authorities:</strong> Right to file complaints with privacy authorities</li>
                  <li><strong>Legal Recourse:</strong> Right to pursue legal action for privacy violations</li>
                  <li><strong>No Retaliation:</strong> We will not retaliate for filing complaints</li>
                  <li><strong>Confidentiality:</strong> All complaints handled confidentially</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Regulatory Authorities</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Federal Trade Commission (FTC):</strong> For COPPA and general privacy complaints</li>
                  <li><strong>Washington State Attorney General:</strong> For state privacy law violations</li>
                  <li><strong>European Data Protection Authorities:</strong> For GDPR-related complaints</li>
                  <li><strong>Other Authorities:</strong> As applicable in your jurisdiction</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t pt-6 mt-8">
          <p className="text-sm text-gray-500 text-center">
            By using our services, you acknowledge that you have read, understood, and agree to this Privacy Policy. 
            If you do not agree with any part of this policy, please do not use our services.
          </p>
        </div>
      </div>
    </div>
  );
} 