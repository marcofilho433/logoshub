# Firebase Setup Instructions

## Prerequisites
- Google Cloud Console access
- Firebase project created

## Steps to Complete Firebase Setup

### 1. Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pivotal-expanse-468012-j0`
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the web app or create a new one
7. Copy the configuration object

### 2. Update Environment Configuration
Replace the placeholder values in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "pivotal-expanse-468012-j0.firebaseapp.com",
    projectId: "pivotal-expanse-468012-j0",
    storageBucket: "pivotal-expanse-468012-j0.appspot.com",
    messagingSenderId: "856787393642",
    appId: "YOUR_ACTUAL_APP_ID"
  }
};
```

### 3. Enable Authentication Methods
1. In Firebase Console, go to "Authentication"
2. Click on "Sign-in method"
3. Enable the following providers:

#### Email/Password Authentication
1. Click on "Email/Password"
2. Enable "Email/Password" provider
3. Optionally enable "Email link (passwordless sign-in)" if desired
4. Save the changes

#### Google Authentication
1. Click on "Google" provider
2. Enable Google authentication
3. Add your authorized domain: `localhost`
4. Save the changes

### 4. Configure OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `pivotal-expanse-468012-j0`
3. Go to "APIs & Services" > "OAuth consent screen"
4. Configure the consent screen with your app details
5. Add test users if needed

### 5. Update OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Find your OAuth 2.0 Client ID: `856787393642-lnr4q8angjdlqfqjgsht053crbcpfum3.apps.googleusercontent.com`
3. Add authorized JavaScript origins:
   - `http://localhost:4200`
4. Add authorized redirect URIs:
   - `http://localhost:4200/home`
5. Save the changes

## Current Configuration
- **Client ID**: `856787393642-lnr4q8angjdlqfqjgsht053crbcpfum3.apps.googleusercontent.com`
- **Project ID**: `pivotal-expanse-468012-j0`
- **Redirect URI**: `http://localhost:4200/home`
- **JavaScript Origins**: `http://localhost:4200`

## Testing
1. Run the application: `npm start`
2. Navigate to `http://localhost:4200`
3. Test both authentication methods:
   - **Email/Password**: Create a new account or sign in with existing credentials
   - **Google OAuth**: Click "Continue with Google" on login or signup page
4. Complete the authentication flow
5. You should be redirected to the home page

## Features Implemented
- ✅ Email/Password Registration
- ✅ Email/Password Login
- ✅ Google OAuth Sign-in/Sign-up
- ✅ Form Validation
- ✅ Error Handling
- ✅ Loading States
- ✅ Password Confirmation
- ✅ Email Format Validation

## Troubleshooting
- Make sure all Firebase configuration values are correct
- Check browser console for any errors
- Verify that both Email/Password and Google OAuth are enabled in Firebase
- Ensure authorized domains and redirect URIs are properly configured
- For email/password auth, make sure the provider is enabled in Firebase Console 