import Image from "next/image";
import Map from "./components/Map";
import SearchBox from "./components/SearchBox";
import ChipFilters from "./components/ChipFilter";
import TipCard from "./components/TipCard";
import UsersExample from "./components/UsersExample";

export default function Home() {
  const mockTips = [
    { id: 1, title: "Titulo lorem ipsum lorem ipsum" },
    { id: 2, title: "Titulo lorem ipsum lorem ipsum" },
    { id: 3, title: "Titulo lorem ipsum lorem ipsum" },
    { id: 4, title: "Titulo lorem ipsum lorem ipsum" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 px-6 py-4 border-b border-gray-200">
        <Image
          src="/web-app-manifest-512x512.png"
          alt="Pasa el dato"
          width={48}
          height={48}
        />
      </header>

      {/* Main Content */}
      <main className="flex flex-col pt-24 px-6 pb-6 gap-6">
        {/* Search and Filters Section */}
        <section className="flex flex-col gap-4">
          <SearchBox />
          <ChipFilters />
        </section>

        {/* Map Section */}
        <section className="w-full h-[400px] -mx-6 px-6 rounded-lg overflow-hidden">
          <Map />
        </section>

        {/* Tips List Section */}
        <section className="flex flex-col gap-4">
          {mockTips.map((tip) => (
            <TipCard key={tip.id} title={tip.title} />
          ))}
        </section>
        <UsersExample />
      </main>
    </div>
  );
}
