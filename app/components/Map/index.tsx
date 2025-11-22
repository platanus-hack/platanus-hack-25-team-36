import MapComponent from "../ui/Map";

import "mapbox-gl/dist/mapbox-gl.css";

const Map = () => {
  const markers = [
    {
      title: "Marker 1",
      description: "Description 1",
      longitude: -70.598,
      latitude: -33.415,
      color: "#ff0000",
    },
    {
      title: "Marker 2",
      description: "Description 2",
      longitude: -70.599,
      latitude: -33.422,
      color: "#0000ff",
    },
    {
      title: "Marker 3",
      description: "Description 3",
      longitude: -70.601,
      latitude: -33.414,
      color: "#00ff00",
    },
  ];

  return <MapComponent markers={markers} />;
};

export default Map;
