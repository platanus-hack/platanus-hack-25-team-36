import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import {
  MapPin,
  MapPinType,
  TextTip,
  UserPreferences,
  Community,
} from "@/types/app";
import type { PinFormData, PinLocation } from "../services/pins";

interface MapResponse {
  data: MapPin[];
  success?: boolean;
  error?: string;
}

interface CreatePinRequest {
  formData: PinFormData;
  location: PinLocation;
}

interface TipResponse {
  success: boolean;
  data: MapPin;
  error?: string;
}

interface GetTipsResponse {
  pins: MapPin[];
  nonPins: TextTip[];
}

interface GetUserAvatarResponse {
  image: string;
}

interface GetTipByIdResponse {
  data: MapPin | TextTip;
}

interface GetMessageByIdResponse {
  authorId: {
    _id: string;
    image: string;
  };
  text: string;
}

// API functions
const userPreferencesApi = {
  getUserPreferences: (): Promise<UserPreferences[]> =>
    api.get("/user-preferences"),
  getUserPreference: (id: string): Promise<UserPreferences> =>
    api.get(`/user-preferences/${id}`),
  createUserPreference: (
    userPreferenceData: Omit<UserPreferences, "id">
  ): Promise<UserPreferences> =>
    api.post("/user-preferences", userPreferenceData),
  updateUserPreference: (
    id: string,
    userPreferenceData: Partial<UserPreferences>
  ): Promise<UserPreferences> =>
    api.put(`/user-preferences/${id}`, userPreferenceData),
  deleteUserPreference: (id: string): Promise<void> =>
    api.delete(`/user-preferences/${id}`),
};

const mapApi = {
  getMapData: (): Promise<MapResponse> => api.get("/map"),
};

const tipsApi = {
  createTip: (
    pinData: CreatePinRequest & { userId?: string }
  ): Promise<TipResponse> => {
    const requestBody = {
      type: MapPinType.PIN,
      title: pinData.formData.title,
      description: pinData.formData.description || "No description provided",
      address: pinData.formData.address,
      subtype: pinData.formData.subtype,
      location: {
        point: {
          type: "Point" as const,
          coordinates: [pinData.location.lng, pinData.location.lat],
        },
        radius: pinData.location.radius,
      },
      colour: pinData.formData.colour,
      picture: pinData.formData.picture || "",
      background_image: pinData.formData.background_image || "",
      tags: [],
      contact: {},
      comments: [],
      likedBy: [],
      dislikedBy: [],
      // Use authenticated user ID or generate temporary ID
      authorId: pinData.userId || generateObjectId(),
      communityId: generateObjectId(), // TODO: Implement community selection
    };

    return api.post("/tips", requestBody);
  },
  getTips: (
    search?: string,
    longitudeParam?: number,
    latitudeParam?: number,
    allowedSubtypes?: string[],
    isCommunityMode?: boolean
  ): Promise<GetTipsResponse> => {
    const params: Record<string, string | number> = {};
    if (search) params.search = search;
    if (longitudeParam !== undefined) params.longitude = longitudeParam;
    if (latitudeParam !== undefined) params.latitude = latitudeParam;
    if (allowedSubtypes !== undefined) {
      params.allowedSubtypes = allowedSubtypes.join(",");
    }
    if (isCommunityMode !== undefined) {
      params.isCommunityMode = isCommunityMode ? "true" : "false";
    }

    return api.get("/tips", { params });
  },
  getTipById: (id: string): Promise<GetTipByIdResponse> =>
    api.get(`/tips/${id}`),
};

const communitiesApi = {
  getCommunities: (
    longitude?: number,
    latitude?: number
  ): Promise<Community[]> => {
    const params: Record<string, string | number> = {};
    if (longitude !== undefined) params.longitude = longitude;
    if (latitude !== undefined) params.latitude = latitude;

    return api.get("/communities", { params });
  },
};

const usersApi = {
  getAvatar: (id: string): Promise<GetUserAvatarResponse> =>
    api.get(`/users/${id}`),
};

const messagesApi = {
  getMessageById: (id: string): Promise<GetMessageByIdResponse> =>
    api.get(`/messages?id=${id}`),
};

/**
 * Generates a valid MongoDB ObjectId
 * This is a temporary placeholder until we implement proper authentication
 */
function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0");
  const randomHex = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return timestamp + randomHex;
}

// React Query hooks for user preferences
export const useUserPreferences = () => {
  return useQuery({
    queryKey: ["user-preferences"],
    queryFn: userPreferencesApi.getUserPreferences,
  });
};

export const useUserPreference = (id: string) => {
  return useQuery({
    queryKey: ["user-preferences", id],
    queryFn: () => userPreferencesApi.getUserPreference(id),
    enabled: !!id, // Only run query if id exists
  });
};

export const useCreateUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferencesApi.createUserPreference,
    onSuccess: () => {
      // Invalidate and refetch user preferences list
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });
};

export const useUpdateUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userPreferenceData,
    }: {
      id: string;
      userPreferenceData: Partial<UserPreferences>;
    }) => userPreferencesApi.updateUserPreference(id, userPreferenceData),
    onSuccess: (data, variables) => {
      // Update the specific user preference in cache
      queryClient.setQueryData(["user-preferences", variables.id], data);
      // Invalidate user preferences list
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });
};

export const useDeleteUserPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferencesApi.deleteUserPreference,
    onSuccess: (_, id) => {
      // Remove user preference from cache
      queryClient.removeQueries({ queryKey: ["user-preferences", id] });
      // Invalidate user preferences list
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });
};

// React Query hooks for map
export const useMapData = () => {
  return useQuery({
    queryKey: ["map"],
    queryFn: mapApi.getMapData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// React Query hooks for tips/pins
export const useCreateTip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pinData: CreatePinRequest & { userId?: string }) =>
      tipsApi.createTip(pinData),
    onSuccess: () => {
      // Invalidate map data to refresh pins on the map
      queryClient.invalidateQueries({ queryKey: ["map"] });
    },
    onError: (error) => {
      console.error("Failed to create tip:", error);
    },
  });
};

/**
 * Hook that automatically includes the authenticated user ID
 */
export const useCreateTipWithAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pinData: CreatePinRequest) => {
      // Dynamically import to avoid SSR issues
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      return tipsApi.createTip({
        ...pinData,
        userId: session?.user?.id,
      });
    },
    onSuccess: () => {
      // Invalidate map data to refresh pins on the map
      queryClient.invalidateQueries({ queryKey: ["map"] });
    },
    onError: (error) => {
      console.error("Failed to create tip:", error);
    },
  });
};

/**
 * Alternative hook that uses the existing pins service function
 * This maintains compatibility with your existing savePinToDatabase function
 */
export const useCreatePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, location }: CreatePinRequest) => {
      // Use the existing savePinToDatabase function from pins service
      const { savePinToDatabase } = await import("../services/pins");
      return savePinToDatabase(formData, location);
    },
    onSuccess: () => {
      // Invalidate map data to refresh pins on the map
      queryClient.invalidateQueries({ queryKey: ["map"] });
    },
    onError: (error) => {
      console.error("Failed to create pin:", error);
    },
  });
};

export const useGetTips = ({
  search,
  longitude,
  latitude,
  allowedSubtypes,
  isCommunityMode,
}: {
  search?: string;
  longitude?: number;
  latitude?: number;
  allowedSubtypes?: string[];
  isCommunityMode?: boolean;
}) => {
  return useQuery({
    queryKey: ["tips", { search, longitude, latitude, allowedSubtypes, isCommunityMode }],
    queryFn: () => tipsApi.getTips(search, longitude, latitude, allowedSubtypes, isCommunityMode),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

// React Query hooks for communities
export const useGetCommunities = ({
  longitude,
  latitude,
}: {
  longitude?: number;
  latitude?: number;
} = {}) => {
  return useQuery({
    queryKey: ["communities", { longitude, latitude }],
    queryFn: () => communitiesApi.getCommunities(longitude, latitude),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useGetUserAvatar = (id: string) => {
  return useQuery({
    queryKey: ["users", id, "avatar"],
    queryFn: () => usersApi.getAvatar(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useGetTipById = (id: string) => {
  return useQuery({
    queryKey: ["tips", id],
    queryFn: () => tipsApi.getTipById(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useGetMessageById = (id: string) => {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => messagesApi.getMessageById(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};
