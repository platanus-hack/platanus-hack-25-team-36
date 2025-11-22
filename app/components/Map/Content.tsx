import { useState } from "react";
import Map from "../ui/Map";

type Props = {
  initialLongitude?: number;
  initialLatitude?: number;
  initialZoom?: number;
};

const Content = ({ initialLongitude, initialLatitude, initialZoom }: Props) => {
  console.log(initialLongitude, initialLatitude, initialZoom);
  const [viewState, setViewState] = useState({
    longitude: initialLongitude ?? -70.6693,
    latitude: initialLatitude ?? -33.4489,
    zoom: initialZoom ?? 10,
  });

  return <Map viewState={viewState} setViewState={setViewState} />;
};

export default Content;
