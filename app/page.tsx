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
      <header className="fixed top-0 left-0 right-0 bg-white z-50 px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #000' }}>
        <Image
          src="/web-app-manifest-512x512.png"
          alt="Pasa el dato"
          width={48}
          height={48}
        />
        <Image
          src="/header-min.png"
          alt="Pasa el dato"
          width={200}
          height={70}
          className="absolute left-1/2 transform -translate-x-1/2 md:w-[300px] w-[200px]"
        />
        <div className="w-12"></div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col pt-24 px-6 pb-6 gap-6">
        {/* Search and Filters Section */}
        <section className="flex flex-col gap-4 mt-3">
          <SearchBox />
          <ChipFilters />
        </section>

        {/* Map Section */}
        <section className="w-full h-[400px] rounded-lg overflow-hidden">
          <Map />
        </section>

        {/* Tips List Section */}
        <section className="flex flex-col gap-4 mt-3">
          {mockTips.map((tip) => (
            <TipCard key={tip.id} title={tip.title} />
          ))}
        </section>
        <UsersExample />
      </main>
    </div>
  );
}
