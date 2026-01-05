# Admin Login Guide

## Quick Login Information

### Development Mode (Default)
The system automatically creates a default admin account in development mode:

- **Email**: `admin@soccerclub.com`
- **Username**: `admin`
- **Password**: `admin123`

### Production Mode
In production, you need to set up the admin account using one of the methods below.

---

## How to Log In

1. **Navigate to the Login Page**
   - Go to your application URL
   - Click "Sign In" in the navigation menu
   - Or navigate directly to `/login`

2. **Enter Credentials**
   - You can use either your **email** or **username**
   - Enter your **password**
   - Click "Sign In"

3. **Access Admin Dashboard**
   - After successful login, super admins are automatically redirected to `/admin`
   - Regular users are redirected to `/account`

---

## Setting Up Admin Account

### Method 1: Environment Variables (Recommended for Production)

Add these variables to your `backend/.env` file:

```env
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password-here
ADMIN_USERNAME=admin
ADMIN_NAME=Super Admin
ADMIN_PHONE=555-0000
```

The admin account will be created automatically when the server starts.

**Important**: In production, the admin account is only created if `ADMIN_EMAIL` is set in environment variables.

### Method 2: Using the Setup Script

Run the admin creation script:

```bash
cd backend
node scripts/create-admin.js admin@example.com your-password admin "Super Admin" "555-0000"
```

**Script Parameters:**
- `email` - Admin email address
- `password` - Admin password
- `username` - Admin username (optional, defaults to 'admin')
- `name` - Admin display name (optional, defaults to 'Super Admin')
- `phone` - Admin phone number (optional, defaults to '555-0000')

**Example:**
```bash
node scripts/create-admin.js admin@mysoccerclub.com MySecurePass123 admin "John Admin" "555-1234"
```

### Method 3: Reset Admin Account (Recommended for Troubleshooting)

If you're having trouble logging in, use the reset script to check and fix the admin account:

```bash
cd backend
node scripts/reset-admin.js
```

This script will:
- Check if admin account exists
- Reset password to default (`admin123`) or environment variable password
- Ensure `isSuperAdmin` is set to true
- Update username, email, and other fields if needed
- Test the login credentials
- Display the current login credentials

**With custom password:**
```bash
node scripts/reset-admin.js admin@example.com mynewpassword123
```

### Method 4: Test Admin Login

To verify your admin login credentials work:

```bash
cd backend
node scripts/test-admin-login.js
```

This will test:
- Finding admin by email
- Finding admin by username  
- Password verification
- Login query (as the login endpoint does)

---

## Troubleshooting

### Can't Log In?

1. **Reset the admin account (Easiest solution):**
   ```bash
   cd backend
   node scripts/reset-admin.js
   ```
   This will reset the password and ensure everything is correct.

2. **Test the login credentials:**
   ```bash
   cd backend
   node scripts/test-admin-login.js
   ```
   This will verify that the credentials work correctly.

3. **Check if admin account exists:**
   ```bash
   # Use the reset script to check and fix
   node scripts/reset-admin.js
   ```

4. **Verify environment variables:**
   - Make sure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `backend/.env`
   - Restart the server after changing environment variables

5. **Check server logs:**
   - Look for messages like "✅ Super admin created" or "✅ Super admin already exists"
   - Check for any error messages
   - Make sure MongoDB is running and connected

6. **Try both email and username:**
   - You can log in with either `admin@soccerclub.com` OR `admin`
   - Make sure you're using the correct password

### Forgot Admin Credentials?

If you've forgotten your admin credentials:

1. **Development**: Use the default credentials (`admin@soccerclub.com` / `admin123`)

2. **Production**: 
   - Use the setup script to reset the password
   - Or check your environment variables in `backend/.env`
   - Or connect to MongoDB directly to check/reset

---

## Security Best Practices

1. **Change Default Password**: Always change the default password in production
2. **Use Strong Passwords**: Use a strong, unique password for admin accounts
3. **Environment Variables**: Never commit `.env` files to version control
4. **Regular Updates**: Regularly update admin passwords
5. **Limit Access**: Only grant super admin access to trusted individuals

---

## Admin Account Features

Once logged in as a super admin, you have access to:

- ✅ User Management
- ✅ Application Management
- ✅ Team Management
- ✅ Schedule Management
- ✅ Gallery Management
- ✅ Marketplace Moderation
- ✅ Payment Management
- ✅ Site Settings
- ✅ Broadcast System
- ✅ Content Management
- ✅ And much more!

---

## Need Help?

If you're having trouble logging in or setting up the admin account:

1. Check the server logs for error messages
2. Verify your MongoDB connection
3. Ensure environment variables are set correctly
4. Try using the setup script to create/update the admin account

For more information, see the main [README.md](README.md) file.

