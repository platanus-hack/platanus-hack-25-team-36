"use client";

import React, { useState } from "react";
import { DiscussionCard } from "@/app/components/DiscussionCard";
import Header from "@/app/components/Header";
import Image from "next/image";
import { User } from "lucide-react";
import Map from "@/app/components/Map";
import { MapPinType, PinSubtype } from "@/types/app";

// Dummy props for now, replace with real data fetching
const mockData = {
  avatarUrl: "",
  portadaUrl: "",
  title: "Ciclistas de Bellavista",
  description:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.\n\nIt has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing.",
  location: { coordinates: [-70.6009, -33.4173] },
  mapPins: [
    {
      id: "69223cb5b6ded3ffe0399b37",
      authorId: "69223cb2b6ded3ffe0399b0f",
      communityId: "69223cb3b6ded3ffe0399b1d",
      type: MapPinType.PIN,
      subtype: PinSubtype.BUSINESS,
      title: "Farmacia Ahumada 24 Horas",
      description:
        "Farmacia abierta las 24 horas en Avenida Providencia cerca del Costanera Center. Muy útil para emergencias y medicamentos.",
      tags: ["farmacia", "24 horas", "emergencias", "medicamentos", "salud"],
      background_image:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
      location: {
        point: {
          type: "Point" as const,
          coordinates: [-70.602, -33.418] as [number, number],
        },
        radius: 50,
      },
      address: "Avenida Providencia, Providencia, Santiago",
      colour: "#FF5733",
      startDate: "2025-11-22T23:07:07.588Z",
      contact: {},
      comments: [],
      likedBy: ["69223cb2b6ded3ffe0399b11", "69223cb2b6ded3ffe0399b13"],
      dislikedBy: [],
      createdAt: "2025-11-22T22:44:05.446Z",
      updatedAt: "2025-11-22T22:44:05.448Z",
    },
  ],
  discussions: [
    {
      MainPost: {
        userId: "1",
        content: "Titulo lorem ipsum lorem ipsum",
        timestamp: "2025-11-22T10:00:00Z",
        avatarUrl: "",
      },
      Messages: [
        {
          userId: "2",
          content: "Mensaje 1 de ejemplo, alineado a la izquierda.",
          avatarUrl: "",
          timestamp: "2025-11-22T10:01:00Z",
        },
        {
          userId: "1",
          content: "Respuesta del autor, alineada a la derecha.",
          avatarUrl: "",
          timestamp: "2025-11-22T10:02:00Z",
        },
        {
          userId: "3",
          content: "Otro mensaje, alineado a la izquierda.",
          avatarUrl: "",
          timestamp: "2025-11-22T10:03:00Z",
        },
        {
          userId: "1",
          content: "Otra respuesta del autor, alineada a la derecha.",
          avatarUrl: "",
          timestamp: "2025-11-22T10:04:00Z",
        },
      ],
    },
    {
      MainPost: {
        userId: "4",
        content: "Otro título de discusión",
        timestamp: "2025-11-22T11:00:00Z",
        avatarUrl: "",
      },
      Messages: [],
    },
  ],
};

export default function TipIdentifierPage({
  params,
}: {
  params: { identifier: string };
}) {
  // TODO: fetch data using params.identifier
  const data = mockData;
  const [joined, setJoined] = useState(false);

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
        }}
      >
        {data.portadaUrl ? (
          <Image
            src={data.portadaUrl}
            alt="Portada"
            fill
            style={{ objectFit: "cover", borderBottom: "2px solid #000" }}
            className="rounded-b-lg"
          />
        ) : (
          <div
            className="absolute top-0 left-0 w-full h-full rounded-b-lg"
            style={{
              background: "var(--color-primary)",
              border: "1.5px solid rgb(0, 0, 0)",
            }}
          />
        )}
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
            {data.avatarUrl ? (
              <Image
                src={data.avatarUrl}
                alt="Avatar"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <User
                className="w-full h-full"
                style={{ color: "var(--foreground)" }}
              />
            )}
          </div>
          <div className="ml-6 mt-6 flex flex-col">
            <h1 className="text-lg md:text-3xl font-bold text-[var(--foreground)] drop-shadow-sm">
              {data.title}
            </h1>
            <button
              onClick={() => setJoined((prev) => !prev)}
              className={
                `mt-2 px-2 py-0.5 rounded-full text-xs font-medium transition-all w-fit ` +
                (joined
                  ? "bg-[var(--color-chip-3)]"
                  : "bg-[var(--color-chip-4)]")
              }
              style={{
                color: "var(--foreground)",
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                border: "1.5px solid rgb(0, 0, 0)",
                boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
                lineHeight: 1.1,
                minHeight: 0,
              }}
            >
              {joined ? "Soy Parte!" : "Unirse"}
            </button>
          </div>
        </div>
      </div>
      {/* Spacer for avatar overlap */}
      <div className="h-26" />
      {/* Description */}
      <div className="px-4 md:px-8 py-2">
        <p className="text-[var(--foreground)] text-base whitespace-pre-line">
          {data.description}
        </p>
      </div>
      {/* Map section */}
      <div className="mx-4 md:mx-8 my-2 h-[400px] rounded-lg overflow-hidden">
        <Map pins={data.mapPins} />
      </div>
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
        <div className="flex flex-col gap-4">
          {data.discussions.map((discussion, idx) => (
            <DiscussionCard key={idx} discussion={discussion} />
          ))}
        </div>
      </div>
    </div>
  );
}
