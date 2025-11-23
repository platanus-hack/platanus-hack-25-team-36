import MapComponent from "../ui/Map";
import { MapPin } from "@/types/app";
import { getS3Url } from "../../services/s3";

import "mapbox-gl/dist/mapbox-gl.css";
import { ComponentProps } from "react";

// Interface for markers expected by MapComponent
interface MapComponentMarker {
  id: string;
  title: string;
  description: string;
  longitude: number;
  latitude: number;
  color: string;
  picture?: string;
  authorAvatar?: string;
  subtype?: string;
}

/**
 * Parses MapPin data from API to format expected by MapComponent
 */
const parseMapDataToMarkers = (mapPins: MapPin[]): MapComponentMarker[] => {
  return mapPins.map((pin) => ({
    id: pin.id,
    title: pin.title,
    description: pin.description,
    longitude: pin.location.point.coordinates[0], // GeoJSON format: [longitude, latitude]
    latitude: pin.location.point.coordinates[1],
    color: pin.colour || "#9ECAD6", // Default color if not provided
    picture: getS3Url(pin.picture), // Convert S3 key to accessible URL
    authorAvatar: undefined, // TODO: Get from author data when user authentication is implemented
    subtype: pin.icon || pin.subtype, // Use custom icon if available, fallback to subtype
  }));
};

type Props = Pick<ComponentProps<typeof MapComponent>, "onChangeCenter"> & {
  pins: MapPin[];
};

const Map = ({ pins, onChangeCenter }: Props) => {
  const markers = parseMapDataToMarkers(pins);

  return <MapComponent markers={markers} onChangeCenter={onChangeCenter} />;
};

export default Map;
