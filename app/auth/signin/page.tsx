import Image from "next/image";
import { Suspense } from "react";
import SignInForm from "./SignIn";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/web-app-manifest-512x512.png"
            alt="Pasa el dato"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Pasa el Dato
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to discover and share local tips
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <SignInForm />
        </Suspense>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
