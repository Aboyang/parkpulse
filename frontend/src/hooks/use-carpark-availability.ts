import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axios'

// ============================================================================
// Hooks
// ============================================================================

export function useCarparkAvailabilities(carparkIds) {
  return useQuery({
    queryKey: ['carpark-availabilities', carparkIds],
    queryFn: async () => {
      const results = await Promise.all(
        carparkIds.map(async (id) => {
          try {
            const { data } = await axiosInstance.get(`/api/carparks/${id}`)
            return [id, data?.availability?.lots_available ?? 'No data']
          } catch {
            return [id, 'No data']
          }
        })
      )
      return Object.fromEntries(results)
    },
    enabled: carparkIds.length > 0,
  })
}
