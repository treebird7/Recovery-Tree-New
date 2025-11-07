# OAuth Provider Setup Guide

This guide will walk you through setting up OAuth authentication providers (Google and Apple) for the Recovery Tree app.

## Prerequisites

- Access to your Supabase project dashboard
- Google Cloud Platform account (for Google Sign In)
- Apple Developer account (for Apple Sign In)

---

## 1. Setup Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: Recovery Tree Web
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - Your production domain (e.g., `https://recoverytree.com`)
   - **Authorized redirect URIs**:
     - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)

### Step 2: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click **Enable**
5. Enter your credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Click **Save**

### Step 3: Add Mobile OAuth Credentials (Android)

1. Go back to Google Cloud Console → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Android**
4. Configure:
   - **Name**: Recovery Tree Android
   - **Package name**: `com.recoverytree.app`
   - **SHA-1 certificate fingerprint**: Get this by running:
     ```bash
     # For debug keystore
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

     # For production, use your release keystore
     ```
5. Click **Create**
6. Add the Client ID to your Supabase Google OAuth settings under "Additional Settings" → "Authorized Client IDs"

### Step 4: Add Mobile OAuth Credentials (iOS)

1. Go back to Google Cloud Console → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **iOS**
4. Configure:
   - **Name**: Recovery Tree iOS
   - **Bundle ID**: `com.recoverytree.app`
5. Click **Create**
6. Add the Client ID to your Supabase Google OAuth settings under "Additional Settings" → "Authorized Client IDs"

---

## 2. Setup Apple Sign In

### Step 1: Configure App ID in Apple Developer

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** → **App IDs**
4. Click **+** to create a new App ID (or select existing)
5. Configure:
   - **Description**: Recovery Tree
   - **Bundle ID**: `com.recoverytree.app`
   - **Capabilities**: Enable **Sign in with Apple**
6. Click **Continue** and **Register**

### Step 2: Create a Service ID

1. Go to **Identifiers** → **Services IDs**
2. Click **+** to create a new Service ID
3. Configure:
   - **Description**: Recovery Tree Web
   - **Identifier**: `com.recoverytree.app.web` (must be different from App ID)
4. Click **Continue** and **Register**
5. Click on your new Service ID to configure it
6. Enable **Sign in with Apple**
7. Click **Configure** next to Sign in with Apple
8. Configure:
   - **Primary App ID**: Select your app ID from Step 1
   - **Domains and Subdomains**:
     - `YOUR_SUPABASE_PROJECT_ID.supabase.co`
     - Your production domain (if any)
   - **Return URLs**:
     - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
9. Click **Save** and **Continue**

### Step 3: Create a Private Key

1. Go to **Certificates, Identifiers & Profiles** → **Keys**
2. Click **+** to create a new key
3. Configure:
   - **Key Name**: Recovery Tree Apple Sign In
   - Enable **Sign in with Apple**
4. Click **Configure** next to Sign in with Apple
5. Select your **Primary App ID**
6. Click **Save** and **Continue**
7. Click **Register**
8. **Download the key file** (.p8) - you can only download it once!
9. Note the **Key ID** shown on the page

### Step 4: Configure Apple OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Apple** and click **Enable**
5. Enter your credentials:
   - **Service ID**: Your Service ID from Step 2 (e.g., `com.recoverytree.app.web`)
   - **Team ID**: Found in Apple Developer Portal (top right)
   - **Key ID**: From the key you created in Step 3
   - **Private Key**: Open the .p8 file and paste the entire content
6. Click **Save**

---

## 3. Configure Redirect URLs in Supabase

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add the following **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for web development)
   - `https://your-production-domain.com/auth/callback` (for web production)
   - `com.recoverytree.app://auth/callback` (for mobile)
3. Set **Site URL** to your production domain or `http://localhost:3000`

---

## 4. Testing OAuth

### Testing on Web (Development)

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Sign in with Google" or "Sign in with Apple"
4. You should be redirected to the provider's login page
5. After successful authentication, you'll be redirected back to your app

### Testing on Mobile (iOS Simulator)

1. Build for mobile: `npm run build:mobile`
2. Sync: `npx cap sync`
3. Open in Xcode: `npm run cap:ios`
4. Run the app in the simulator
5. Click "Sign in with Google" or "Sign in with Apple"
6. The OAuth flow should open in a browser and redirect back to the app

### Testing on Mobile (Android)

1. Build for mobile: `npm run build:mobile`
2. Sync: `npx cap sync`
3. Open in Android Studio: `npm run cap:android`
4. Run the app on an emulator or device
5. Click "Sign in with Google" or "Sign in with Apple"
6. The OAuth flow should open in a browser and redirect back to the app

---

## Troubleshooting

### "Redirect URI mismatch" error

- Verify that all redirect URIs are correctly configured in both the OAuth provider and Supabase
- Make sure there are no trailing slashes
- Check that the domain matches exactly (including http/https)

### Mobile app doesn't redirect back after OAuth

- Verify deep linking is configured correctly in `capacitor.config.ts`
- Check that the Android manifest has the correct intent filter
- Verify iOS Info.plist has the correct URL scheme
- Make sure `com.recoverytree.app://auth/callback` is added to Supabase redirect URLs

### "Invalid OAuth provider" error

- Ensure the provider is enabled in Supabase Dashboard
- Verify all credentials are correctly entered
- Check that the client ID/secret haven't expired

### Apple Sign In doesn't work on web

- Apple Sign In on web requires a valid Service ID configured
- The Service ID must be different from your App ID
- Verify the Return URLs are correctly configured

---

## Production Checklist

Before deploying to production:

- [ ] Set up production OAuth credentials (don't use dev credentials)
- [ ] Add production redirect URLs to all OAuth providers
- [ ] Update Supabase redirect URL configuration
- [ ] Test OAuth on production domain
- [ ] Verify mobile deep linking works with production app
- [ ] Enable "Sign in with Apple" if you have other social logins (App Store requirement)
- [ ] Add privacy policy URL to OAuth consent screens
- [ ] Monitor OAuth logs in Supabase Dashboard → Authentication → Logs

---

## Environment Variables

Your `.env.local` should already have:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

No additional environment variables are needed for OAuth - all configuration is in the Supabase Dashboard.
