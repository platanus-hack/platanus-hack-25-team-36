"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-white z-50 px-6 py-4 flex justify-between items-center"
      style={{ borderBottom: "1px solid #000" }}
    >
        <Image
          src="/web-app-manifest-512x512.png"
          alt="Pasa el dato"
          width={48}
          height={48}
        />
        <Image
          src="/header-min.png"
          alt="Pasa el dato"
          width={200}
          height={70}
          className="absolute left-1/2 transform -translate-x-1/2 md:w-[300px] w-[200px]"
        />
        <div className="w-12"></div>
      {session && (
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="hidden sm:block">{session.user?.name}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="py-2">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <p className="font-medium">{session.user?.name}</p>
                  <p className="text-gray-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
