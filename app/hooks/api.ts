import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { MapPin, MapPinType } from "@/types/app";
import type { PinFormData, PinLocation } from "../services/pins";

// Example types - replace with your actual data types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
}

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

// API functions
const userApi = {
  getUsers: (): Promise<User[]> => api.get("/users"),
  getUser: (id: string): Promise<User> => api.get(`/users/${id}`),
  createUser: (userData: Omit<User, "id">): Promise<User> =>
    api.post("/users", userData),
  updateUser: (id: string, userData: Partial<User>): Promise<User> =>
    api.put(`/users/${id}`, userData),
  deleteUser: (id: string): Promise<void> => api.delete(`/users/${id}`),
};

const postApi = {
  getPosts: (): Promise<Post[]> => api.get("/posts"),
  getPost: (id: string): Promise<Post> => api.get(`/posts/${id}`),
  createPost: (postData: Omit<Post, "id">): Promise<Post> =>
    api.post("/posts", postData),
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

// React Query hooks for users
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: userApi.getUsers,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id, // Only run query if id exists
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<User> }) =>
      userApi.updateUser(id, userData),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(["users", variables.id], data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, id) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: ["users", id] });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// React Query hooks for posts
export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: postApi.getPosts,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => postApi.getPost(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
