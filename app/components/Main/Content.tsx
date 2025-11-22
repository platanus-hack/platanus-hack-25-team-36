import Map from "../Map";
import SearchBox from "../SearchBox";
import ChipFilters from "../ChipFilter";
import TipCard from "../TipCard";
import { ComponentProps } from "react";

type Props = {
  mapPins: ComponentProps<typeof Map>["pins"];
  onChangeMapCenter: ComponentProps<typeof Map>["onChangeCenter"];
};

const Content = ({ mapPins, onChangeMapCenter }: Props) => {
  const mockTips = [
    { id: 1, title: "Tengo dato de gasfiter cerca del costanera" },
    { id: 2, title: "Vendo una bici" },
    { id: 3, title: "Quien sabe jugar bridge para unas partidas?" },
    { id: 4, title: "Estoy empezando un taller de costura gratis !" },
  ];

  return (
    <main className="flex flex-col pt-24 px-6 pb-6 gap-6">
      {/* Search and Filters Section */}
      <section className="flex flex-col gap-4 mt-3">
        <SearchBox />
        <ChipFilters />
      </section>

      {/* Map Section */}
      <section className="w-full h-[400px] rounded-lg overflow-hidden">
        <Map pins={mapPins} onChangeCenter={onChangeMapCenter} />
      </section>

      {/* Tips List Section */}
      <section className="flex flex-col gap-4 mt-3">
        {mockTips.map((tip) => (
          <TipCard key={tip.id} title={tip.title} />
        ))}
      </section>
    </main>
  );
};

export default Content;
