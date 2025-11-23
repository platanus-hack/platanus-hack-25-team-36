"use client";

import { Suspense, useState } from "react";
import { DiscussionCard } from "@/app/components/DiscussionCard";
import Header from "@/app/components/Header";
import { User } from "lucide-react";
import Map from "@/app/components/Map";
import { useGetTipById } from "@/app/hooks/api";
import Loader from "@/app/components/Loader";

type Props = {
  id: string;
};

const Content = ({ id }: Props) => {
  const [joined, setJoined] = useState(false);

  const { data: tipData, isLoading, error } = useGetTipById(id);

  if (!tipData) return <div>Cargando...</div>;
  const tip = tipData;
  const color = "colour" in tip ? tip.colour : "var(--color-primary)";
  const backgroundImage = "background_image" in tip ? tip.background_image : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      {/* Portada, avatar, title, Unirse button */}
      <div
        className="relative w-full h-48 md:h-64 flex flex-col items-start justify-end rounded-b-lg"
        style={{
          background: "transparent",
          boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
          lineHeight: 1.1,
          minHeight: 0,
          borderBottom: !backgroundImage ? "2px solid #000" : undefined,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full rounded-b-lg"
          style={{
            background: color,
            border: "2px solid #000",
            borderTop: 0,
          }}
        />
        <div className="absolute left-4 bottom-[-80px] flex items-end">
          <div
            className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-white border-0 border-[var(--background)] shadow-lg overflow-hidden relative z-10"
            style={{
              border: "1.5px solid rgb(0, 0, 0)",
              boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
              lineHeight: 1.1,
              minHeight: 0,
            }}
          >
              {backgroundImage ? (
              <img
                src={backgroundImage}
                alt="Avatar"
                width={160}
                height={160}
                className="object-cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <User
                className="w-full h-full"
                style={{ color: "var(--foreground)" }}
              />
            )}
          </div>
          <div className="ml-6 mt-6 flex flex-col py-5">
            <h1 className="text-lg md:text-3xl font-bold text-[var(--foreground)] drop-shadow-sm">
              {tip.title}
            </h1>
          </div>
        </div>
      </div>
      {/* Spacer for avatar overlap */}
      <div className="h-26" />
      {/* Description */}
      <div className="px-4 md:px-8 py-2">
        <p className="text-[var(--foreground)] text-base whitespace-pre-line">
          {tip.description}
        </p>
      </div>
      {/* Map section */}
      {tip.type !== "text" && (
        <div className="mx-4 md:mx-8 my-2 h-[400px] rounded-lg overflow-hidden">
          <Map pins={[tip]} communities={[]} />
        </div>
      )}
      {/* Discussions section */}
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Discussions
          </h2>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all w-fit bg-[var(--color-chip-3)]`}
            style={{
              color: "var(--foreground)",
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              border: "1.5px solid rgb(0, 0, 0)",
              boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
              lineHeight: 1.1,
              minHeight: 0,
            }}
          >
            Crear +
          </button>
        </div>
        <div className="flex flex-col gap-4 py-4">
            {tip.comments.map((comment) => (
            <Suspense key={comment} fallback={<Loader />}>
              <DiscussionCard discussion={comment} />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Content;
