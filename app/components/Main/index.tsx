"use client";

import { useGetTips, useGetCommunities } from "@/app/hooks/api";
import Content from "./Content";
import { useState, useCallback } from "react";

const Main = () => {
  const [search, setSearch] = useState<string | null>(null);
  // Initialize with Santiago coordinates so communities can load immediately
  const [latitude, setLatitude] = useState<number | null>(-33.4173);
  const [longitude, setLongitude] = useState<number | null>(-70.6009);
  const [activeSubtypes, setActiveSubtypes] = useState<string[]>([]);
  const [isCommunityMode, setIsCommunityMode] = useState<boolean>(false);

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
    isCommunityMode,
  });

  // Fetch communities when community mode is DISABLED (Ver todo mode) and we have a location
  // Note: isCommunityMode = true means "Modo Comunidad" (show only community tips)
  // We want circles in "Ver todo" mode, so fetch when isCommunityMode = false
  const { data: communitiesData = [] } = useGetCommunities(
    !isCommunityMode && latitude !== null && longitude !== null
      ? { longitude, latitude }
      : undefined
  );

  console.log("Main component state:", {
    isCommunityMode,
    latitude,
    longitude,
    communitiesCount: communitiesData?.length || 0,
  });

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

  const handleIsCommunityModeChange = useCallback((value: boolean) => {
    setIsCommunityMode(value);
  }, []);

  return (
    <Content
      mapPins={tipsData?.pins || []}
      tips={tipsData?.nonPins || []}
      communities={isCommunityMode ? communitiesData : []}
      onChangeMapCenter={onChangeMapCenter}
      onChangeSearch={handleChangeSearch}
      onActiveSubtypesChange={handleActiveSubtypesChange}
      onIsCommunityModeChange={handleIsCommunityModeChange}
    />
  );
};

export default Main;
