# Authentication Setup Guide

Your Prompt Builder app now has simple email/password authentication using Auth.js!

## ✅ What's Already Done

1. **Auth.js Installed** - `next-auth@beta` with Credentials provider
2. **Database Tables** - User table with email and password fields in Neon
3. **Password Hashing** - bcryptjs for secure password storage
4. **AUTH_SECRET Generated** - Stored in `app/.env.local`
5. **Auth UI Added** - Sign in/sign up pages with email/password forms
6. **Registration API** - Create new users at `/api/auth/register`

## 🚀 How to Use

### 1. Make Sure Your Environment is Set Up

Check that `app/.env.local` has your `AUTH_SECRET`:
```bash
AUTH_SECRET=your_generated_auth_secret_here
```

If not, generate it:
```bash
npx auth secret
```

### 2. Start the Dev Server

```bash
npm run dev
```

### 3. Create an Account

1. Visit http://localhost:3322
2. Click **"Sign In"** in the header
3. Click **"Sign up"** link at the bottom
4. Fill in:
   - Name (optional)
   - Email
   - Password (at least 6 characters)
   - Confirm password
5. Click **"Create Account"**
6. You'll be automatically signed in and redirected to the home page

### 4. Sign In

1. Visit http://localhost:3322/auth/signin
2. Enter your email and password
3. Click **"Sign In"**
4. You're authenticated! Your avatar will appear in the header

### 5. Sign Out

1. Click your avatar in the header
2. Click **"Sign out"** from the dropdown menu

## 📁 File Structure

```
app/
├── auth.ts                           # Auth.js configuration with Credentials provider
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/            # Auth API routes
│   │   │   └── route.ts
│   │   └── register/                 # Registration endpoint
│   │       └── route.ts
│   └── auth/
│       ├── signin/                   # Sign-in page
│       │   └── page.tsx
│       └── register/                 # Registration page
│           └── page.tsx
├── components/
│   ├── auth/
│   │   ├── AuthButton.tsx           # Auth button component
│   │   └── SignInButton.tsx         # Client wrapper
│   └── core/
│       ├── Header.tsx               # Updated with auth
│       └── ThemeToggle.tsx          # Theme toggle
└── .env.local                       # Your AUTH_SECRET (not in git!)

db/
└── schema.ts                        # User table with password field
```

## 🔒 Security Features

- **Password Hashing** - All passwords are hashed with bcryptjs (10 rounds)
- **JWT Sessions** - Secure session management with JSON Web Tokens
- **AUTH_SECRET** - Cookie encryption key (gitignored)
- **Validation** - Email format and password length validation
- **Error Handling** - User-friendly error messages without exposing details

## 🎯 How It Works

1. **User registers** → Password hashed → User stored in Neon database
2. **User signs in** → Email/password verified → JWT token created → Session active
3. **Session persists** → JWT stored in secure HTTP-only cookie
4. **User signs out** → Session cleared → Redirected to home page

## 🛠️ Customization

### Change Password Requirements

Edit `app/app/api/auth/register/route.ts`:

```typescript
if (password.length < 8) {  // Change from 6 to 8
  return NextResponse.json(
    { error: 'Password must be at least 8 characters' },
    { status: 400 }
  );
}
```

### Add Password Strength Validation

```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
if (!passwordRegex.test(password)) {
  return NextResponse.json(
    { error: 'Password must include uppercase, lowercase, number, and special character' },
    { status: 400 }
  );
}
```

### Protect Routes

Use the `auth()` function to protect pages:

```typescript
// app/dashboard/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/signin');
  }

  return <div>Protected content for {session.user.email}</div>;
}
```

### Access User in API Routes

```typescript
// app/api/protected/route.ts
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ user: session.user });
}
```

## 🌐 Production Deployment

When deploying to Vercel:

1. **Add Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=your_neon_url
   AUTH_SECRET=your_auth_secret
   ```

2. **Deploy!** Everything else is already set up.

## 📚 Resources

- **Auth.js Docs**: https://authjs.dev
- **Next.js Auth**: https://nextjs.org/docs/app/building-your-application/authentication
- **Neon + Auth.js**: https://neon.com/docs/guides/auth-authjs
- **bcrypt Security**: https://github.com/kelektiv/node.bcrypt.js

## 🎉 You're All Set!

Start creating accounts and signing in! Your users are stored securely in your Neon Postgres database with hashed passwords.
