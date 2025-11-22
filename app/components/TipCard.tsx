"use client";

import { useState } from "react";
import { User } from "lucide-react";
import Image from "next/image";

type TipCardProps = {
  avatar?: string;
  title: string;
};

export default function TipCard({ avatar, title }: TipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full px-4 py-3 md:px-6 md:py-5 flex items-center gap-3 md:gap-4" style={{ backgroundColor: 'white', border: '1.5px solid rgb(0, 0, 0)', borderRadius: '8px', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.7)' }}>
      {/* Avatar */}
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {avatar ? (
          <Image src={avatar} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
        ) : (
          <User className="w-8 h-8" style={{ color: 'var(--foreground)' }} />
        )}
      </div>
      
      {/* Title */}
      <div className="flex-1">
        <p className="font-medium" style={{ color: 'var(--foreground)', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>{title}</p>
      </div>
      
      {/* Dropdown Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex-shrink-0 transition-transform w-16 h-16 flex items-center justify-center"
        style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", backgroundColor: 'transparent' }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 22C15.3 22 14.7 21.7 14.3 21.2L8.3 13.2C7.5 12.1 8.3 10.5 9.7 10.5H22.3C23.7 10.5 24.5 12.1 23.7 13.2L17.7 21.2C17.3 21.7 16.7 22 16 22Z" fill="#A7875A" stroke="#A7875A" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
