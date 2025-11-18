"use client"

import { useQuery } from "@tanstack/react-query"
import { clientService } from "@/lib/services/client.service"

export function useClient() {
  return useQuery({
    queryKey: ["client", "me"],
    queryFn: () => clientService.getMe(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })
}

export default useClient
