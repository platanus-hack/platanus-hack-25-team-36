"use client";

import { Search } from "lucide-react";

export default function SearchBox() {
  return (
    <div className="w-full flex items-center gap-3 rounded-full px-4 py-3" style={{ backgroundColor: 'white', border: '1.5px solid rgb(0, 0, 0)', boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.7)' }}>
      <Search className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
      <input
        type="text"
        placeholder="Buscar..."
        className="flex-1 bg-transparent outline-none placeholder:text-gray-500"
        style={{ color: 'var(--foreground)', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
      />
    </div>
  );
}
