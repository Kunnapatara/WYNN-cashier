import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface ResolveParams {
  giftId: string;
  country: string;
}

export function useResolveGift(params: ResolveParams | null) {
  return useQuery({
    queryKey: [api.cashier.resolve.path, params],
    queryFn: async () => {
      if (!params) return null;
      
      const searchParams = new URLSearchParams({
        giftId: params.giftId,
        country: params.country
      });
      
      const url = `${api.cashier.resolve.path}?${searchParams.toString()}`;
      
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        if (res.status === 400) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Invalid parameters");
        }
        throw new Error("Failed to resolve gift");
      }
      
      const data = await res.json();
      
      // Parse using the Zod schema from routes
      try {
        return api.cashier.resolve.responses[200].parse(data);
      } catch (err) {
        console.error("[Zod] Validation failed for cashier resolution:", err);
        throw new Error("Invalid response format from server");
      }
    },
    // Only run the query when we have actual parameters
    enabled: !!params && !!params.giftId && !!params.country,
    // Keep data around briefly so we don't flash loading states unnecessarily
    staleTime: 1000 * 60 * 5, 
    retry: 1
  });
}
