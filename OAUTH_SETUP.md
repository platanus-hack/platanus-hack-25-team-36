# OAuth Authentication Setup Guide

## 🚀 Quick Start

Your project now includes OAuth authentication with Google and GitHub providers. Follow these steps to complete the setup:

## 📋 Prerequisites

1. **MongoDB Database** - You'll need a MongoDB instance running
2. **OAuth App Credentials** - Create apps with Google and GitHub
3. **Environment Variables** - Configure your `.env.local` file

## 🔧 Setup Steps

### 1. Copy Environment Variables

```bash
cp .env.local.example .env.local
```

### 2. Configure MongoDB

Update `MONGODB_URI` in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/pasaeldato
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pasaeldato
```

### 3. Generate NextAuth Secret

```bash
# Generate a secure random secret
openssl rand -base64 32
```

Add it to `.env.local`:

```env
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 5. Setup GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App:
   - Application name: `Pasa el Dato`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Secret to `.env.local`:

```env
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## 🏗️ Architecture Overview

### Authentication Flow

```
User visits app → AuthGuard → Redirect to /auth/signin → OAuth → Protected routes
```

### File Structure

```
app/
├── auth/
│   ├── signin/page.tsx          # Login page
│   └── error/page.tsx           # Auth error page
├── api/auth/[...nextauth]/      # NextAuth API routes
├── components/
│   ├── auth/
│   │   ├── AuthGuard.tsx        # Route protection
│   │   └── LoadingSpinner.tsx   # Loading states
│   └── Header.tsx               # Header with user menu
├── providers/
│   └── AuthProvider.tsx         # Session provider
└── lib/auth.ts                  # Auth configuration
```

### Protected Routes

- All routes are protected by default using `AuthGuard`
- Unauthenticated users are redirected to `/auth/signin`
- Public routes: `/auth/signin`, `/auth/error`

## 🎯 Usage Examples

### Check Authentication Status

```tsx
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  return <p>Signed in as {session.user?.email}</p>;
}
```

### Create Authenticated Pins

```tsx
import { useCreateTipWithAuth } from "@/app/hooks/api";

function CreatePinForm() {
  const createTipMutation = useCreateTipWithAuth();

  const handleSubmit = async (formData, location) => {
    // User ID is automatically included
    await createTipMutation.mutateAsync({ formData, location });
  };
}
```

### Sign Out

```tsx
import { signOut } from "next-auth/react";

function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
      Sign Out
    </button>
  );
}
```

## 🚦 Testing

1. Start your development server:

```bash
pnpm dev
```

2. Visit `http://localhost:3000`
3. You should be redirected to `/auth/signin`
4. Sign in with Google or GitHub
5. You should be redirected back to the main app

## 🔒 Security Features

- **Session-based authentication** using MongoDB adapter
- **CSRF protection** built into NextAuth.js
- **Secure session cookies** with proper httpOnly flags
- **OAuth state validation** to prevent attacks
- **Automatic session refresh** when tokens expire

## 📱 Production Deployment

For production, update these values:

```env
NEXTAUTH_URL=https://yourdomain.com
```

And update OAuth redirect URIs to:

- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

## 🎨 Customization

### Adding More Providers

Edit `app/lib/auth.ts` and add providers like:

```tsx
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  providers: [
    // ... existing providers
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
};
```

### Custom Sign-in Page

Modify `app/auth/signin/page.tsx` to match your design.

### User Profile Pages

Create `app/profile/page.tsx` for user profile management.

## 🆘 Troubleshooting

### Common Issues

1. **"Configuration" error**: Check your environment variables
2. **"AccessDenied" error**: Check OAuth app settings and domains
3. **Database connection issues**: Verify MongoDB URI and connection
4. **Redirect URI mismatch**: Ensure OAuth apps have correct callback URLs

### Debug Mode

Enable NextAuth.js debug mode:

```env
NEXTAUTH_DEBUG=true
```

Check the browser console and server logs for detailed error information.

---

Your app now has complete OAuth authentication! Users must sign in before accessing any protected content, and you can use their authentication data throughout your application. 🔐✨
