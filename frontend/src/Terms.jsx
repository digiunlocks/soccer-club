import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
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
        <h1 className="text-3xl font-bold text-green-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-2">
          This document constitutes a legally binding agreement between you and Seattle Leopards FC. 
          Please read these terms carefully before using our services.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">1. Acceptance of Terms</h2>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              By accessing, browsing, or using the Seattle Leopards FC website, mobile applications, services, and any associated platforms (collectively referred to as "Services"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Binding Agreement:</strong> These Terms constitute a legally binding agreement between you (the "User," "you," or "your") and Seattle Leopards FC ("we," "us," "our," or "the Club"). If you do not agree with any of these terms, you are prohibited from using or accessing our Services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Age Requirements:</strong> You must be at least 13 years old to use our Services. If you are under 18, you represent that you have obtained parental or guardian consent to use our Services and that your parent or guardian agrees to be bound by these Terms on your behalf.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Modifications:</strong> We reserve the right to modify these Terms at any time. Continued use of our Services after such modifications constitutes acceptance of the updated Terms. We will notify users of material changes through our website or email communications.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">2. Description of Service</h2>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Seattle Leopards FC is a premier youth soccer organization dedicated to developing skilled players, fostering sportsmanship, and building community through the beautiful game. Our comprehensive services include:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Core Services:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Youth Soccer Programs:</strong> Age-appropriate training programs for players from U8 to U18</li>
                <li><strong>Competitive Teams:</strong> Elite development teams competing in local and regional leagues</li>
                <li><strong>Recreational Programs:</strong> Community-based soccer for all skill levels</li>
                <li><strong>Coaching Development:</strong> Professional coaching staff and training programs</li>
                <li><strong>Facility Management:</strong> Access to quality training facilities and game venues</li>
                <li><strong>Tournament Organization:</strong> Hosting and participating in competitive tournaments</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Digital Platform Features:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Online Registration:</strong> Streamlined program and team registration processes</li>
                <li><strong>Team Management:</strong> Roster management, communication tools, and scheduling</li>
                <li><strong>Payment Processing:</strong> Secure online payment for fees, donations, and merchandise</li>
                <li><strong>Communication Hub:</strong> News updates, announcements, and community engagement</li>
                <li><strong>Resource Library:</strong> Training materials, policies, and educational content</li>
                <li><strong>Event Management:</strong> Tournament registration, scheduling, and results tracking</li>
                <li><strong>Mobile Accessibility:</strong> Responsive design for mobile devices and tablets</li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed">
              <strong>Service Availability:</strong> While we strive to maintain continuous service availability, we do not guarantee uninterrupted access to our Services. We may temporarily suspend or restrict access for maintenance, updates, or other operational reasons.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">3. User Accounts and Registration</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Account Creation Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                To access certain features of our Services, you may be required to create an account. Account creation is mandatory for program registration, team management, and payment processing.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You must be at least 13 years old to create an account</li>
                <li>Minors (under 18) require parental or guardian consent</li>
                <li>You must provide a valid email address for account verification</li>
                <li>You must create a strong password meeting our security requirements</li>
                <li>You must complete all required profile information accurately</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Account Information Responsibilities</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You are responsible for maintaining the accuracy and security of your account information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Accuracy:</strong> Provide accurate, current, and complete information during registration and keep it updated</li>
                <li><strong>Security:</strong> Maintain the confidentiality of your password and account credentials</li>
                <li><strong>Access Control:</strong> Prevent unauthorized access to your account and notify us immediately of any security breaches</li>
                <li><strong>Activity Monitoring:</strong> Accept responsibility for all activities conducted under your account</li>
                <li><strong>Notification:</strong> Promptly report any unauthorized use, suspicious activity, or security concerns</li>
                <li><strong>Account Transfer:</strong> Do not share, sell, or transfer your account to another person</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Account Types and Permissions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Player Accounts:</strong> For registered players with access to team information, schedules, and personal data</li>
                  <li><strong>Parent/Guardian Accounts:</strong> For parents with access to their children's information and payment management</li>
                  <li><strong>Coach Accounts:</strong> For coaching staff with team management and communication tools</li>
                  <li><strong>Volunteer Accounts:</strong> For volunteers with limited access to specific programs and events</li>
                  <li><strong>Administrator Accounts:</strong> For club staff with full system access and management capabilities</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Account Suspension and Termination</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We reserve the right to suspend or terminate accounts for violations of these Terms:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provision of false or misleading information</li>
                <li>Violation of our Code of Conduct or other policies</li>
                <li>Unauthorized access or use of our Services</li>
                <li>Non-payment of fees or other financial obligations</li>
                <li>Engagement in fraudulent or illegal activities</li>
                <li>Repeated violations of these Terms</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">4. Code of Conduct and Behavioral Standards</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Seattle Leopards FC is committed to fostering a positive, inclusive, and respectful environment for all participants. All members, including players, coaches, parents, guardians, volunteers, staff, and spectators, must adhere to our comprehensive Code of Conduct.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">General Behavioral Standards</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Respect and Courtesy:</strong> Treat all individuals with dignity, respect, and courtesy regardless of age, gender, race, ethnicity, religion, sexual orientation, or ability</li>
                  <li><strong>Positive Communication:</strong> Use appropriate language and tone in all interactions, both in-person and online</li>
                  <li><strong>Sportsmanship:</strong> Demonstrate good sportsmanship, fair play, and respect for opponents, officials, and the game</li>
                  <li><strong>Professional Conduct:</strong> Maintain professional behavior at all times, especially when representing the club</li>
                  <li><strong>Conflict Resolution:</strong> Address conflicts and disagreements through appropriate channels and constructive dialogue</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Player Code of Conduct</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Commitment:</strong> Attend practices, games, and team events regularly and on time</li>
                  <li><strong>Effort:</strong> Give maximum effort in training and competition</li>
                  <li><strong>Teamwork:</strong> Support teammates and contribute positively to team dynamics</li>
                  <li><strong>Respect for Authority:</strong> Follow instructions from coaches, officials, and club staff</li>
                  <li><strong>Equipment Care:</strong> Properly maintain and care for team equipment and facilities</li>
                  <li><strong>Academic Responsibility:</strong> Maintain good academic standing as required by club policies</li>
                  <li><strong>Health and Safety:</strong> Report injuries, illnesses, or safety concerns immediately</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Parent/Guardian Code of Conduct</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Supportive Role:</strong> Provide positive support and encouragement to your child and the team</li>
                  <li><strong>Respect Boundaries:</strong> Allow coaches to coach and officials to officiate without interference</li>
                  <li><strong>Model Behavior:</strong> Set a positive example through your own behavior and sportsmanship</li>
                  <li><strong>Communication:</strong> Communicate concerns through appropriate channels and maintain constructive dialogue</li>
                  <li><strong>Financial Responsibility:</strong> Ensure timely payment of fees and financial obligations</li>
                  <li><strong>Transportation:</strong> Ensure reliable transportation to and from practices and games</li>
                  <li><strong>Health and Safety:</strong> Keep the club informed of any health issues or special needs</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Coach Code of Conduct</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Player Development:</strong> Prioritize player development, safety, and well-being over winning</li>
                  <li><strong>Professional Standards:</strong> Maintain high professional standards and ethical behavior</li>
                  <li><strong>Communication:</strong> Communicate clearly and respectfully with players, parents, and staff</li>
                  <li><strong>Safety First:</strong> Ensure safe training environments and proper supervision</li>
                  <li><strong>Fair Play:</strong> Teach and model good sportsmanship and fair play</li>
                  <li><strong>Continuous Learning:</strong> Maintain coaching certifications and pursue professional development</li>
                  <li><strong>Confidentiality:</strong> Maintain confidentiality of player and family information</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Prohibited Behaviors</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                The following behaviors are strictly prohibited and may result in immediate disciplinary action:
              </p>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <ul className="list-disc list-inside text-red-700 space-y-2 ml-4">
                  <li><strong>Harassment and Bullying:</strong> Any form of verbal, physical, or cyber harassment, intimidation, or bullying</li>
                  <li><strong>Discrimination:</strong> Discrimination based on race, gender, ethnicity, religion, sexual orientation, or disability</li>
                  <li><strong>Violence:</strong> Physical violence, threats of violence, or aggressive behavior</li>
                  <li><strong>Substance Abuse:</strong> Use of alcohol, tobacco, or illegal substances at club events or facilities</li>
                  <li><strong>Inappropriate Language:</strong> Use of profanity, offensive language, or inappropriate comments</li>
                  <li><strong>Disrespect to Officials:</strong> Arguing with or showing disrespect to referees, officials, or staff</li>
                  <li><strong>Property Damage:</strong> Intentional damage to club property, facilities, or equipment</li>
                  <li><strong>Unauthorized Access:</strong> Accessing restricted areas or using club resources without permission</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Disciplinary Actions</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Violations of the Code of Conduct may result in the following disciplinary actions:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Verbal Warning:</strong> First-time minor violations</li>
                <li><strong>Written Warning:</strong> Repeated minor violations or first-time moderate violations</li>
                <li><strong>Suspension:</strong> Temporary suspension from participation in club activities</li>
                <li><strong>Probation:</strong> Conditional participation with specific requirements</li>
                <li><strong>Expulsion:</strong> Permanent removal from the club for serious violations</li>
                <li><strong>Legal Action:</strong> Referral to appropriate authorities for illegal activities</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">5. Payment Terms and Financial Obligations</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Seattle Leopards FC provides various programs and services that require payment of fees. By registering for our programs or making payments, you agree to the following payment terms and conditions.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Fee Structure and Payment Requirements</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Program Fees:</strong> All program fees must be paid in full before participation begins, unless a payment plan has been approved</li>
                  <li><strong>Registration Fees:</strong> Non-refundable registration fees are required for all programs</li>
                  <li><strong>Equipment Fees:</strong> Additional fees may apply for uniforms, equipment, or tournament participation</li>
                  <li><strong>Late Fees:</strong> Late payments may incur additional charges of $25 per month</li>
                  <li><strong>Payment Methods:</strong> We accept credit cards, debit cards, bank transfers, and cash payments</li>
                  <li><strong>Payment Plans:</strong> Payment plans may be available for qualifying families upon request</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Payment Processing and Security</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Secure Processing:</strong> All payments are processed through secure, encrypted payment gateways</li>
                  <li><strong>Payment Information:</strong> You must provide accurate and current payment information</li>
                  <li><strong>Authorization:</strong> By providing payment information, you authorize us to charge the specified amounts</li>
                  <li><strong>Recurring Payments:</strong> For payment plans, you authorize recurring charges until the balance is paid in full</li>
                  <li><strong>Payment Declines:</strong> Failed payments may result in immediate suspension of services</li>
                  <li><strong>Transaction Records:</strong> All payment transactions are recorded and available for review</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Refund Policy and Cancellation</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">General Refund Policy:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li><strong>Registration Fees:</strong> Non-refundable under any circumstances</li>
                  <li><strong>Program Fees:</strong> Refundable within 30 days of payment, minus any services already provided</li>
                  <li><strong>Equipment Fees:</strong> Refundable if equipment is returned unused and in original condition</li>
                  <li><strong>Tournament Fees:</strong> Subject to tournament organizer's refund policy</li>
                </ul>
                
                <h4 className="font-semibold text-green-700 mb-2">Special Circumstances:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Medical Issues:</strong> Full refunds may be provided with valid medical documentation</li>
                  <li><strong>Family Relocation:</strong> Pro-rated refunds for families moving out of the area</li>
                  <li><strong>Program Cancellation:</strong> Full refunds if the club cancels a program</li>
                  <li><strong>Force Majeure:</strong> Refunds for events beyond our control (natural disasters, pandemics, etc.)</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Financial Hardship and Assistance</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Scholarship Program:</strong> Need-based scholarships are available for qualifying families</li>
                  <li><strong>Payment Plans:</strong> Extended payment plans may be arranged for financial hardship</li>
                  <li><strong>Work Exchange:</strong> Volunteer opportunities may be available to offset program costs</li>
                  <li><strong>Application Process:</strong> Financial assistance applications must be submitted 30 days before program start</li>
                  <li><strong>Confidentiality:</strong> All financial assistance information is kept strictly confidential</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Consequences of Non-Payment</h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <ul className="list-disc list-inside text-red-700 space-y-2 ml-4">
                  <li><strong>Immediate Suspension:</strong> Services may be suspended immediately upon payment failure</li>
                  <li><strong>Collection Process:</strong> Outstanding balances may be referred to collection agencies</li>
                  <li><strong>Legal Action:</strong> We reserve the right to pursue legal action for unpaid balances</li>
                  <li><strong>Future Registration:</strong> Outstanding balances may prevent future program registration</li>
                  <li><strong>Credit Reporting:</strong> Delinquent accounts may be reported to credit bureaus</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Donations and Fundraising</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Tax Deductibility:</strong> Donations to Seattle Leopards FC may be tax-deductible</li>
                  <li><strong>Donation Receipts:</strong> Tax receipts are provided for all donations over $250</li>
                  <li><strong>Fundraising Events:</strong> Participation in fundraising events is voluntary</li>
                  <li><strong>Fund Allocation:</strong> Funds are used for program development, facility improvements, and scholarships</li>
                  <li><strong>Transparency:</strong> Annual financial reports are available upon request</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">6. Health, Safety, and Risk Management</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Seattle Leopards FC prioritizes the health and safety of all participants. Participation in soccer activities involves inherent risks, and all participants must understand and acknowledge these risks while following established safety protocols.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Inherent Risks and Assumption of Risk</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-3">
                  By participating in our programs, you acknowledge and accept the following inherent risks:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Physical Injuries:</strong> Sprains, strains, fractures, concussions, and other sports-related injuries</li>
                  <li><strong>Environmental Hazards:</strong> Weather conditions, field conditions, and facility-related risks</li>
                  <li><strong>Contact Sports Risks:</strong> Collisions, falls, and physical contact inherent in soccer</li>
                  <li><strong>Equipment Risks:</strong> Injuries related to soccer equipment, goals, and playing surfaces</li>
                  <li><strong>Medical Emergencies:</strong> Potential for serious injury requiring immediate medical attention</li>
                  <li><strong>Transportation Risks:</strong> Risks associated with travel to and from events</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Health Requirements and Medical Clearance</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Physical Examination:</strong> Annual physical examination may be required for participation</li>
                  <li><strong>Medical History:</strong> Complete disclosure of medical history and current conditions</li>
                  <li><strong>Medication Disclosure:</strong> Notification of any medications being taken</li>
                  <li><strong>Allergy Information:</strong> Disclosure of any allergies, especially severe allergies</li>
                  <li><strong>Emergency Contacts:</strong> Current emergency contact information must be provided</li>
                  <li><strong>Insurance Information:</strong> Valid health insurance information must be on file</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Safety Protocols and Guidelines</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">General Safety Guidelines:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li><strong>Proper Equipment:</strong> Wear appropriate soccer equipment including shin guards and cleats</li>
                  <li><strong>Hydration:</strong> Maintain proper hydration before, during, and after activities</li>
                  <li><strong>Weather Awareness:</strong> Follow weather-related safety protocols and cancellations</li>
                  <li><strong>Facility Rules:</strong> Adhere to all facility rules and safety guidelines</li>
                  <li><strong>Supervision:</strong> Ensure proper adult supervision at all times</li>
                </ul>
                
                <h4 className="font-semibold text-green-700 mb-2">Concussion Protocol:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li><strong>Recognition:</strong> All participants must be educated on concussion symptoms</li>
                  <li><strong>Reporting:</strong> Immediate reporting of suspected concussions is mandatory</li>
                  <li><strong>Medical Evaluation:</strong> Medical clearance required before return to play</li>
                  <li><strong>Gradual Return:</strong> Graduated return-to-play protocol must be followed</li>
                </ul>
                
                <h4 className="font-semibold text-green-700 mb-2">Emergency Procedures:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Emergency Contacts:</strong> Emergency contact information must be readily available</li>
                  <li><strong>First Aid:</strong> First aid kits and trained personnel available at all events</li>
                  <li><strong>Emergency Services:</strong> Protocol for contacting emergency services when needed</li>
                  <li><strong>Incident Reporting:</strong> All injuries and incidents must be reported immediately</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Participant Responsibilities</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Self-Assessment:</strong> Assess your own fitness and health before participation</li>
                  <li><strong>Injury Reporting:</strong> Report all injuries, illnesses, or health concerns immediately</li>
                  <li><strong>Safety Compliance:</strong> Follow all safety instructions and guidelines</li>
                  <li><strong>Equipment Maintenance:</strong> Ensure personal equipment is in good condition</li>
                  <li><strong>Medical Updates:</strong> Keep the club informed of any changes in medical status</li>
                  <li><strong>Emergency Preparedness:</strong> Know emergency procedures and contact information</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Club Safety Responsibilities</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Facility Safety:</strong> Regular inspection and maintenance of facilities and equipment</li>
                  <li><strong>Staff Training:</strong> Ongoing safety training for coaches and staff</li>
                  <li><strong>Emergency Planning:</strong> Comprehensive emergency response plans</li>
                  <li><strong>Insurance Coverage:</strong> Appropriate liability and accident insurance coverage</li>
                  <li><strong>Safety Documentation:</strong> Maintenance of safety records and incident reports</li>
                  <li><strong>Communication:</strong> Regular communication of safety policies and updates</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Weather and Environmental Safety</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Weather Monitoring:</strong> Continuous monitoring of weather conditions</li>
                  <li><strong>Lightning Policy:</strong> Immediate suspension of activities during lightning</li>
                  <li><strong>Heat Index:</strong> Activity modifications based on heat index guidelines</li>
                  <li><strong>Air Quality:</strong> Monitoring of air quality and activity restrictions</li>
                  <li><strong>Field Conditions:</strong> Assessment of field safety before activities</li>
                  <li><strong>Communication:</strong> Timely communication of weather-related cancellations</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Liability and Insurance</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Primary Insurance:</strong> Participants must maintain their own health insurance</li>
                  <li><strong>Secondary Coverage:</strong> Club provides secondary accident insurance coverage</li>
                  <li><strong>Liability Waiver:</strong> All participants must sign liability waivers</li>
                  <li><strong>Medical Authorization:</strong> Authorization for emergency medical treatment</li>
                  <li><strong>Insurance Claims:</strong> Process for filing insurance claims</li>
                  <li><strong>Coverage Limits:</strong> Understanding of insurance coverage limitations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">7. Privacy and Data Protection</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Seattle Leopards FC is committed to protecting your privacy and personal information. Our collection, use, and protection of your data is governed by our comprehensive Privacy Policy and applicable data protection laws.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Information We Collect</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Personal Information:</strong> Name, email, phone, address, and family information</li>
                  <li><strong>Medical Information:</strong> Health history, allergies, and emergency contacts</li>
                  <li><strong>Financial Information:</strong> Payment details and billing information</li>
                  <li><strong>Program Information:</strong> Registration details and participation history</li>
                  <li><strong>Technical Information:</strong> Device data, usage patterns, and cookies</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">How We Use Your Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Program Management:</strong> Registration, team assignments, and administration</li>
                  <li><strong>Communication:</strong> Updates, announcements, and emergency notifications</li>
                  <li><strong>Payment Processing:</strong> Fee collection and financial management</li>
                  <li><strong>Safety and Security:</strong> Emergency response and incident management</li>
                  <li><strong>Legal Compliance:</strong> Regulatory requirements and legal obligations</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Data Security and Your Rights</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Encryption:</strong> All sensitive data is encrypted during transmission and storage</li>
                  <li><strong>Access Controls:</strong> Strict access controls and authentication measures</li>
                  <li><strong>Your Rights:</strong> Access, correction, deletion, and portability of your data</li>
                  <li><strong>Opt-Out:</strong> Right to opt out of certain communications and data processing</li>
                  <li><strong>Complaints:</strong> Right to file complaints with privacy authorities</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">8. Intellectual Property and Content Usage</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              All content, materials, and intellectual property associated with Seattle Leopards FC are protected by copyright, trademark, and other intellectual property laws.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Ownership and Permitted Uses</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Club Ownership:</strong> Website content, program materials, brand assets, and publications</li>
                  <li><strong>Personal Use:</strong> Viewing and using content for personal, non-commercial purposes</li>
                  <li><strong>Program Participation:</strong> Using materials as part of club programs and activities</li>
                  <li><strong>Educational Purposes:</strong> Using content for educational and training purposes</li>
                  <li><strong>Social Media Sharing:</strong> Sharing approved content on personal social media accounts</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Prohibited Uses</h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <ul className="list-disc list-inside text-red-700 space-y-2 ml-4">
                  <li><strong>Commercial Use:</strong> Using content for commercial purposes without permission</li>
                  <li><strong>Modification:</strong> Altering, modifying, or creating derivative works</li>
                  <li><strong>Distribution:</strong> Redistributing content without authorization</li>
                  <li><strong>Competitive Use:</strong> Using content to compete with Seattle Leopards FC</li>
                  <li><strong>Defamatory Use:</strong> Using content in a defamatory or harmful manner</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">9. Limitation of Liability and Disclaimers</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Seattle Leopards FC provides its services on an "as is" and "as available" basis. We disclaim all warranties and limit our liability as described in this section.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Disclaimer of Warranties</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>No Guarantees:</strong> We do not guarantee specific outcomes or results from participation</li>
                  <li><strong>Service Availability:</strong> We do not guarantee uninterrupted or error-free service</li>
                  <li><strong>Third-Party Services:</strong> We are not responsible for third-party services or content</li>
                  <li><strong>Accuracy:</strong> While we strive for accuracy, we do not guarantee the accuracy of all information</li>
                  <li><strong>Security:</strong> We cannot guarantee absolute security of data transmission or storage</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Limitation of Liability</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-3">
                  To the maximum extent permitted by law, Seattle Leopards FC shall not be liable for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Indirect Damages:</strong> Indirect, incidental, special, or consequential damages</li>
                  <li><strong>Lost Profits:</strong> Lost profits, revenue, or business opportunities</li>
                  <li><strong>Data Loss:</strong> Loss of data, information, or content</li>
                  <li><strong>Personal Injury:</strong> Personal injury or property damage not caused by our gross negligence</li>
                  <li><strong>Third-Party Actions:</strong> Actions or omissions of third parties</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  <strong>Maximum Liability:</strong> Our total liability shall not exceed the amount paid by you for the specific service in question.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">10. Dispute Resolution and Legal Matters</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              This section outlines the procedures for resolving disputes and the legal framework governing our relationship.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Governing Law and Jurisdiction</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Governing Law:</strong> These Terms are governed by the laws of the State of Washington</li>
                  <li><strong>Jurisdiction:</strong> Disputes shall be resolved in the courts of King County, Washington</li>
                  <li><strong>Venue:</strong> You consent to the personal jurisdiction of these courts</li>
                  <li><strong>Choice of Law:</strong> Washington law applies regardless of your location</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Dispute Resolution Process</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Step 1:</strong> Informal resolution through direct communication</li>
                  <li><strong>Step 2:</strong> Mediation if informal resolution fails</li>
                  <li><strong>Step 3:</strong> Binding arbitration for unresolved disputes</li>
                  <li><strong>Step 4:</strong> Litigation only after exhausting other options</li>
                  <li><strong>Class Action Waiver:</strong> All disputes must be brought on an individual basis</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">11. Termination and Account Closure</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              This section describes the circumstances under which your access to our services may be terminated and the consequences of such termination.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Termination Rights</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Voluntary Termination:</strong> You may withdraw from programs at any time</li>
                  <li><strong>Account Deletion:</strong> You may request account deletion through our support team</li>
                  <li><strong>Our Termination:</strong> We may terminate for Terms violations, non-payment, or safety concerns</li>
                  <li><strong>Immediate Effects:</strong> Access to services ceases immediately upon termination</li>
                  <li><strong>Data Retention:</strong> Some data may be retained for legal and regulatory purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">12. Changes to Terms and Policies</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Seattle Leopards FC reserves the right to modify these Terms and related policies. This section explains how changes are communicated and when they take effect.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Modification and Notification</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Modification Rights:</strong> We may modify these Terms at any time</li>
                  <li><strong>Website Posting:</strong> Changes are posted on our website</li>
                  <li><strong>Email Notification:</strong> Material changes are communicated via email</li>
                  <li><strong>Advance Notice:</strong> Material changes provide 30 days advance notice</li>
                  <li><strong>Continued Use:</strong> Continued use constitutes acceptance of changes</li>
                  <li><strong>Version History:</strong> Previous versions are archived and available</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">13. Miscellaneous Provisions</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              This section contains important legal provisions that apply to these Terms and our relationship.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Legal Provisions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Severability:</strong> If any provision is invalid, the remainder remains in effect</li>
                  <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between parties</li>
                  <li><strong>Waiver:</strong> Failure to enforce any provision does not constitute a waiver</li>
                  <li><strong>Assignment:</strong> We may assign these Terms; you may not without our consent</li>
                  <li><strong>Notices:</strong> Notices may be provided electronically or via website posting</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-green-900 mb-4">14. Contact Information and Support</h2>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              For questions, concerns, or support related to these Terms or our services, please contact us using the information provided below.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Seattle Leopards FC</h4>
                    <p className="text-gray-700">
                      123 Soccer Way<br />
                      Seattle, WA 98101<br />
                      United States
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Contact Details</h4>
                    <p className="text-gray-700">
                      Phone: (206) 555-0123<br />
                      Email: info@seattleleopardsfc.com<br />
                      Website: www.seattleleopardsfc.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Specialized Support</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Technical Support</h4>
                    <p className="text-gray-700">
                      Email: support@seattleleopardsfc.com<br />
                      Phone: (206) 555-0124<br />
                      Hours: Monday-Friday, 9 AM - 5 PM PST
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Legal Inquiries</h4>
                    <p className="text-gray-700">
                      Email: legal@seattleleopardsfc.com<br />
                      Phone: (206) 555-0125<br />
                      Hours: Monday-Friday, 9 AM - 5 PM PST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Emergency Contact</h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-700 font-semibold mb-2">For Emergencies Only:</p>
                <p className="text-red-700">
                  Emergency Hotline: (206) 555-9111<br />
                  Available 24/7 for urgent safety or medical emergencies
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t pt-6 mt-8">
          <p className="text-sm text-gray-500 text-center">
            By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
} 