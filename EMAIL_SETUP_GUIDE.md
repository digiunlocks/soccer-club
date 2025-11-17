# 📧 Email Notification Setup Guide

## Overview

This guide will help you set up automated email notifications for your Soccer Club Management System. Once configured, the system will automatically send emails for:

- ✅ **Application Submission Confirmations** - Sent immediately when applications are submitted
- ✅ **Application Approvals** - Sent when admins approve applications with team placement details
- ✅ **Application Rejections** - Sent when applications are denied
- ✅ **Application Status Updates** - Sent when application status changes
- ✅ **Correction Requests** - Sent when admins request changes to applications

---

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Follow the prompts to enable 2-factor authentication

### Step 2: Create an App Password

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "Soccer Club System"
4. Click **Generate**
5. Google will display a 16-character password - **Copy this immediately!**

### Step 3: Configure Environment Variables

Add these variables to your `backend/.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # The 16-character app password from Step 2
FRONTEND_URL=http://localhost:5173  # Or your production domain
```

### Step 4: Test Your Configuration

1. Start your backend server: `cd backend && npm start`
2. Start your frontend: `cd frontend && npm run dev`
3. Login as admin and navigate to: **Admin Dashboard → Email Settings** (`/admin/email-settings`)
4. Enter your email address in the "Send Test Email" field
5. Click **Send Test**
6. Check your inbox for the test email

**✅ If you receive the test email, your configuration is complete!**

---

## Alternative Email Providers

### Outlook/Hotmail

```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail

```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password  # Generate from Yahoo Account Security
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server

```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_USER` or `SMTP_USER` | Your email address | `noreply@soccerclub.com` |
| `EMAIL_PASS` or `SMTP_PASS` | Your email password or app password | `abcd efgh ijkl mnop` |
| `FRONTEND_URL` | Your frontend URL (for email links) | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `EMAIL_FROM` | "From" email address | `EMAIL_USER` value |
| `ADMIN_EMAIL` | Admin contact email | `admin@soccerclub.com` |
| `SUPPORT_EMAIL` | Support contact email | `support@soccerclub.com` |

---

## Email Configuration in Admin Dashboard

Once environment variables are configured, admins can manage additional email settings from the admin dashboard:

### Access Email Settings

1. Login as **Super Admin**
2. Navigate to **Admin Dashboard**
3. Click on **Email Settings** (or go to `/admin/email-settings`)

### Available Settings

- **Enable/Disable Email Notifications** - Toggle all email notifications on/off
- **Email Addresses** - Configure admin, support, and no-reply email addresses
- **Email Provider** - Select your email service provider
- **Email Templates** - Customize header and footer for all emails
- **Test Email** - Send a test email to verify configuration

---

## Troubleshooting

### Problem: "Failed to send test email"

**Solutions:**
1. Verify environment variables are correctly set in `backend/.env`
2. Restart your backend server after changing environment variables
3. For Gmail: Ensure you're using an App Password, not your regular password
4. Check that 2-factor authentication is enabled for Gmail
5. Verify your email account allows "Less secure app access" (if not using app passwords)

### Problem: Emails are not being sent automatically

**Solutions:**
1. Check that `emailNotifications` is enabled in Email Settings
2. Verify environment variables are set correctly
3. Check backend console logs for error messages
4. Ensure application has an email address in the `info.email` field

### Problem: Emails go to spam folder

**Solutions:**
1. Add the sender email to your contacts/safe senders list
2. For production: Set up SPF, DKIM, and DMARC records for your domain
3. Use a professional email service (SendGrid, Mailgun, etc.) for production
4. Ensure `EMAIL_FROM` matches your domain

### Problem: "Authentication failed"

**Solutions:**
1. For Gmail: Use App Password instead of regular password
2. Verify username and password are correct (no extra spaces)
3. Check if your email provider requires specific security settings
4. For Outlook: Enable "SMTP Auth" in your account settings

---

## Email Types & Templates

### 1. Application Submission Confirmation

**Sent When:** User submits an application  
**Recipient:** Applicant  
**Includes:**
- Application type (Player, Coach, Referee, Volunteer)
- Applicant details
- Submission date and time
- What to expect next
- Contact information

### 2. Application Approval

**Sent When:** Admin approves an application  
**Recipient:** Applicant  
**Includes:**
- Congratulations message
- Team placement (if applicable)
- Custom message from admin
- Next steps
- Registration information

### 3. Application Rejection

**Sent When:** Admin rejects an application  
**Recipient:** Applicant  
**Includes:**
- Professional notification
- Reason (if provided)
- Encouragement to reapply
- Alternative opportunities
- Contact information for feedback

### 4. Application Status Update

**Sent When:** Application status changes to pending/under review  
**Recipient:** Applicant  
**Includes:**
- Current status
- Custom message from admin
- Expected timeline
- What this means
- Contact information

### 5. Correction Request

**Sent When:** Admin requests corrections to an application  
**Recipient:** Applicant  
**Includes:**
- Specific correction needed
- Reason for correction
- How to make changes
- Contact information for questions

---

## Production Recommendations

### For Small Organizations

**Recommended:** Use Gmail with App Passwords
- **Pros:** Free, reliable, easy setup
- **Cons:** 500 emails per day limit
- **Best For:** Small clubs with < 100 applications per day

### For Medium Organizations

**Recommended:** Use SendGrid, Mailgun, or Amazon SES
- **Pros:** Higher limits, better deliverability, analytics
- **Cons:** Requires payment (but has free tiers)
- **Best For:** Growing clubs with hundreds of applications

### For Large Organizations

**Recommended:** Use professional email service with dedicated IP
- **Pros:** Maximum deliverability, no limits, dedicated support
- **Cons:** Higher cost
- **Best For:** Large organizations with thousands of emails

---

## Security Best Practices

### 1. Use App Passwords

✅ **DO:** Use app-specific passwords for Gmail  
❌ **DON'T:** Use your main email password

### 2. Secure Environment Variables

✅ **DO:** Add `.env` to `.gitignore`  
❌ **DON'T:** Commit environment variables to git

### 3. Use HTTPS in Production

✅ **DO:** Set `FRONTEND_URL` to `https://` URL  
❌ **DON'T:** Use `http://` in production

### 4. Rotate Credentials Regularly

✅ **DO:** Change email passwords periodically  
✅ **DO:** Revoke unused app passwords

### 5. Monitor Email Logs

✅ **DO:** Check backend logs for email errors  
✅ **DO:** Set up alerts for email failures

---

## Testing Checklist

Use this checklist to verify your email setup:

- [ ] Environment variables configured in `backend/.env`
- [ ] Backend server restarted after configuration
- [ ] Test email sent successfully from Email Settings page
- [ ] Test email received (check spam folder)
- [ ] Submit a test application → Confirmation email received
- [ ] Approve test application → Approval email received
- [ ] Email templates display correctly (proper formatting)
- [ ] Links in emails work correctly
- [ ] Emails not going to spam folder

---

## Support

Need help with email setup? Check these resources:

- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833
- **Outlook SMTP:** https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353
- **Yahoo App Passwords:** https://help.yahoo.com/kb/generate-manage-third-party-passwords-sln15241.html
- **Project Issues:** Create an issue on GitHub or contact your system administrator

---

## Advanced: Custom Email Templates

To customize email templates beyond the header/footer:

1. Edit `backend/services/applicationEmailService.js`
2. Modify the HTML templates for each email type
3. Restart the backend server
4. Test your changes

---

**✨ That's it! Your email notification system is now ready to use!**

