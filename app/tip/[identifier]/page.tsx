import { use } from "react";
import { MapPinType, PinSubtype } from "@/types/app";
import { useGetTipById } from "@/app/hooks/api";
import Content from "./Content";

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
  const data = mockData;

  const prms = use(Promise.resolve(params));

  return <Content id={prms.identifier} />;
}
