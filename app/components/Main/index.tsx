"use client";

import { useGetTips } from "@/app/hooks/api";
import Content from "./Content";
import { useState, useCallback } from "react";

const Main = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [activeSubtypes, setActiveSubtypes] = useState<string[]>([]);

  const hasActiveSearch = search !== null && search.trim() !== "";

  const {
    data: tipsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTips({
    ...(hasActiveSearch && { search: search.trim() }),
    ...(latitude && { latitude }),
    ...(longitude && { longitude }),
    allowedSubtypes: activeSubtypes,
  });

  console.log("Tips data:", tipsData?.nonPins);

  const onChangeMapCenter = (newLongitude: number, newLatitude: number) => {
    setLongitude(newLongitude);
    setLatitude(newLatitude);
  };

  const handleChangeSearch = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleActiveSubtypesChange = useCallback((subtypes: string[]) => {
    setActiveSubtypes(subtypes);
  }, []);

  return (
    <Content
      mapPins={tipsData?.pins || []}
      tips={tipsData?.nonPins || []}
      onChangeMapCenter={onChangeMapCenter}
      onChangeSearch={handleChangeSearch}
      onActiveSubtypesChange={handleActiveSubtypesChange}
    />
  );
};

export default Main;
