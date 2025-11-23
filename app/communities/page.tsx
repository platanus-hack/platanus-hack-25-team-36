
"use client";

// ...existing code...
import Image from "next/image";
import { User, Check, Plus } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetCommunities, useJoinCommunity, useLeaveCommunity } from "@/app/hooks/api";
import Loader from "@/app/components/Loader";


// Reusable emoji/color array
export const communityEmoji = [
  { emoji: "🎨", hex: "#F8E4A6" },
  { emoji: "🎸", hex: "#F3C8A2" },
  { emoji: "📚", hex: "#B8E6C4" },
  { emoji: "🎮", hex: "#C9D1D9" },
  { emoji: "🧑‍💻", hex: "#B3DAF5" },
  { emoji: "🏋️‍♂️", hex: "#A8D4EF" },
  { emoji: "🍳", hex: "#F9EDB0" },
  { emoji: "🌍", hex: "#B7DDF7" },
  { emoji: "📷", hex: "#D6D6D6" },
  { emoji: "🚴‍♂️", hex: "#F7EBA8" },
  { emoji: "🧗‍♂️", hex: "#F4D2B1" },
  { emoji: "🎬", hex: "#D4D4D4" },
  { emoji: "🌱", hex: "#C2EDCE" },
  { emoji: "🧩", hex: "#BDDFF5" },
  { emoji: "♟️", hex: "#E1E1E1" },
  { emoji: "🧵", hex: "#C9E7F7" },
  { emoji: "🏍️", hex: "#F4B6B6" },
  { emoji: "🐟", hex: "#C8E8F3" },
  { emoji: "🍷", hex: "#E9A8B2" },
  { emoji: "🧘‍♂️", hex: "#B6DDF2" },
];

// Reusable avatar/emoji generator
export function CommunityAvatar({ identifier, avatarUrl, size = 48 }: { identifier: string; avatarUrl?: string; size?: number }) {
  if (avatarUrl) {
    return <Image src={avatarUrl} alt="Avatar" width={size} height={size} className="w-full h-full object-cover" />;
  }
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % communityEmoji.length;
  return (
    <span style={{ fontSize: size / 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      {communityEmoji[idx].emoji}
    </span>
  );
}

type CommunityCardProps = {
  communityId: string;
  avatarUrl: string;
  portadaUrl: string;
  title: string;
  isPartOf: boolean;
  onToggle: (communityId: string, currentState: boolean) => void;
};

function CommunityCard({ communityId, avatarUrl, portadaUrl, title, isPartOf: initialIsPartOf, onToggle }: CommunityCardProps) {
  const [isPartOf, setIsPartOf] = useState(initialIsPartOf);

  const handleClick = () => {
    setIsPartOf((prev) => {
      const newState = !prev;
      onToggle(communityId, prev);
      return newState;
    });
  };

  return (
    <div
      className="relative flex flex-col w-full min-w-[160px] h-28 rounded-lg shadow-md flex-grow cursor-pointer"
      style={{
        background: "transparent",
        boxShadow: "3px 3px 0px rgba(0,0,0,0.7)",
        border: isPartOf ? "3px solid black" : "1px solid black",
        cursor: "pointer",
      }}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-pressed={isPartOf}
    >
      {/* Portada */}
      {portadaUrl ? (
        <Image
          src={portadaUrl}
          alt="Portada"
          fill
          style={{ objectFit: "cover", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        />
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-2/5 rounded-t-lg"
          style={{ background: !isPartOf ? "var(--color-chip-1)" : "var(--color-chip-9)", height: "40%" }}
        />
      )}
      {/* Avatar and title row */}
      <div className="flex items-center absolute left-2 top-8">
        <div
          className="w-12 h-12 rounded-full shadow-lg overflow-hidden flex items-center justify-center"
          style={{
            border: "1.5px solid rgb(0,0,0)",
            boxShadow: "3px 3px 0px rgba(0,0,0,0.7)",
            background: avatarUrl
              ? '#fff'
              : (() => {
                  let hash = 0;
                  for (let i = 0; i < communityId.length; i++) {
                    hash = communityId.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  const idx = Math.abs(hash) % communityEmoji.length;
                  return communityEmoji[idx].hex;
                })(),
          }}
        >
          <CommunityAvatar identifier={communityId} avatarUrl={avatarUrl} size={48} />
        </div>
        <div className="ml-2 flex items-center flex-1 min-w-0">
          <span className="font-semibold text-xs sm:text-sm md:text-lg mt-4 break-words flex-1" style={{}}>{title}</span>
          <button
            className="ml-2 flex items-center justify-center w-6 h-6 rounded-full border border-black shadow mt-4 flex-shrink-0"
            style={{
              background: isPartOf ? "var(--color-chip-9)" : "var(--color-chip-1",
              boxShadow: "2px 2px 0px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              cursor: "pointer",
            }}
            tabIndex={-1}
            aria-label={isPartOf ? "Ya eres parte" : "Unirse"}
          >
            {isPartOf ? (
              <Check size={16} color="#fff" className="" />
            ) : (
              <Plus size={16} color="#1976D2" className="" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const Communities = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Get current user session
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch all communities from API
  const { data: communitiesData = [], isLoading } = useGetCommunities(undefined);

  // Mutation hooks for joining/leaving communities
  const joinCommunityMutation = useJoinCommunity();
  const leaveCommunityMutation = useLeaveCommunity();

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/');
    }, 1200);
  };

  // Handle toggle membership
  const handleToggleMembership = (communityId: string, currentState: boolean) => {
    if (!userId) {
      alert("Debes iniciar sesión para unirte a una comunidad");
      return;
    }

    // If currently part of community (currentState = true), leave it
    // If not part of community (currentState = false), join it
    if (currentState) {
      leaveCommunityMutation.mutate(communityId);
    } else {
      joinCommunityMutation.mutate(communityId);
    }
  };

  // Transform API data to match CommunityCard props
  const communities = communitiesData.map((community: any) => ({
    communityId: community.id,
    avatarUrl: community.background_image, // Communities don't have avatars in the current schema
    portadaUrl: "", // Communities don't have cover images in the current schema
    title: community.title, // API transforms 'name' to 'title'
    isPartOf: userId ? community.memberIds?.includes(userId) : false,
  }));

  if (isLoading) {
    return (<Loader />);
  }

  return (
    <div className="px-2 py-4 mt-24 flex flex-col min-h-[80vh]">
      <h1 className="font-bold text-lg mb-4">🌳 Mis comunidades</h1>
      {communities.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">No hay comunidades disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          {communities.map((c: any, idx: number) => (
            <CommunityCard key={idx} {...c} onToggle={handleToggleMembership} />
          ))}
        </div>
      )}
      <div className="flex-grow" />
      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        style={{
          backgroundColor: "var(--color-third)",
          border: "1.5px solid rgb(0, 0, 0)",
          boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          color: "var(--foreground)",
        }}
      >
        {isSubmitting ? "Enviando..." : "¡Vamos!"}
      </button>
    </div>
  );
};

export default Communities;
