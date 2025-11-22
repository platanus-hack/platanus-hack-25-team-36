"use client";

import { ReactNode } from "react";
import AuthProvider from "../providers/AuthProvider";
import QueryProvider from "../providers/QueryProvider";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
}
