"use client";

import { useGetTips } from "@/app/hooks/api";
import Content from "./Content";
import { useState } from "react";

const Main = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const {
    data: tipsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTips({
    ...(search && search !== "" && { search }),
    ...(latitude && { latitude }),
    ...(longitude && { longitude }),
  });

  const onChangeMapCenter = (newLongitude: number, newLatitude: number) => {
    setLongitude(newLongitude);
    setLatitude(newLatitude);
  };

  const handleChangeSearch = (newSearch: string) => {
    setSearch(newSearch);
  };

  return (
    <Content
      mapPins={tipsData?.pins || []}
      onChangeMapCenter={onChangeMapCenter}
      onChangeSearch={handleChangeSearch}
    />
  );
};

export default Main;
