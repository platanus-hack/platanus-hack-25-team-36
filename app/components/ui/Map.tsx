import MapBox from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

type Props = {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
};

const MapComponent = ({ viewState, setViewState }: Props) => (
  <div className="w-80 h-80">
    <MapBox
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken="pk.eyJ1IjoidmljdG9ycGF0byIsImEiOiJja2h3dHdhMW8wM3hwMnFxejJxcXRpNHF3In0.mioBmmIYaiRDBbdyXo36qA"
    />
  </div>
);

export default MapComponent;
