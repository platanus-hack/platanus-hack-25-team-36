"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import Loader from "../Loader";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [preferencesChecked, setPreferencesChecked] = useState(false);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Don't check preferences if already on onboarding page
    if (pathname === "/onboarding") {
      setPreferencesChecked(true);
      return;
    }

    // Check user preferences after authentication
    const checkUserPreferences = async () => {
      if (!session?.user?.id) {
        setPreferencesChecked(true);
        return;
      }

      try {
        const response = await fetch(`/api/user-preferences/${session.user.id}`);
        
        // If preferences don't exist (404), redirect to onboarding
        if (response.status === 404) {
          router.push("/onboarding");
          return;
        }
        
        // Preferences exist, allow rendering
        setPreferencesChecked(true);
      } catch (error) {
        console.error("Error checking user preferences:", error);
        // On error, allow rendering to avoid blocking the user
        setPreferencesChecked(true);
      }
    };

    checkUserPreferences();
  }, [session, status, router, pathname]);

  if (status === "loading" || !preferencesChecked) {
    return fallback || <Loader />;
  }

  if (!session) {
    return fallback || <Loader />;
  }

  return <>{children}</>;
}
