"use client";

import { User, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetUserAvatar } from "../hooks/api";

type TipCardProps = {
  authorId: string;
  title: string;
  backgroundColor?: string;
  tipId?: string;
};

export default function TipCard({
  authorId,
  title,
  backgroundColor,
  tipId,
}: TipCardProps) {
  const buttonBg = backgroundColor || "var(--color-chip-5)";
  const router = useRouter();

  const handleNavigate = () => {
    if (tipId) {
      router.push(`/tip/${tipId}`);
    }
  };

  const { data: avatarData } = useGetUserAvatar(authorId);

  const avatar = avatarData?.image;

  return (
    <div
      className="w-full px-4 py-3 md:px-6 md:py-5 flex items-center gap-3 md:gap-4"
      style={{
        backgroundColor: "white",
        border: "1.5px solid rgb(0, 0, 0)",
        borderRadius: "8px",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Avatar */}
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-8 h-8" style={{ color: "var(--foreground)" }} />
        )}
      </div>
      {/* Title */}
      <div className="flex-1">
        <p
          className="font-medium"
          style={{
            color: "var(--foreground)",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          }}
        >
          {title}
        </p>
      </div>
      {/* Circular External Link Button */}
      <button
        type="button"
        onClick={handleNavigate}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1px solid black",
          backgroundColor: buttonBg,
          boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          cursor: "pointer",
        }}
        aria-label="Enlace externo"
      >
        <ExternalLink size={24} color="black" />
      </button>
    </div>
  );
}
