import { useQuery, useMutation } from '@tanstack/react-query'
import axiosInstance from '@/utils/axios'

// ============================================================================
// Hooks
// ============================================================================

export function useCarparkRating(carparkId) {
  return useQuery({
    queryKey: ['carpark-rating', carparkId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/rating/${carparkId}`)
      return data.data
    },
    enabled: !!carparkId,
  })
}

export function useCarparkRatings(carparkIds) {
  return useQuery({
    queryKey: ['carpark-ratings', carparkIds],
    queryFn: async () => {
      const results = await Promise.all(
        carparkIds.map(async (id) => {
          try {
            const { data } = await axiosInstance.get(`/api/rating/${id}`)
            return [id, data.data ?? { message: 'No data' }]
          } catch {
            return [id, { message: 'No data' }]
          }
        })
      )
      return Object.fromEntries(results)
    },
    enabled: carparkIds.length > 0,
  })
}

export function useSubmitRating() {
  return useMutation({
    mutationFn: async ({ carparkId, userId, rating, comment }: { carparkId: string; userId: string; rating: number; comment: string }) => {
      const { data } = await axiosInstance.post('/api/rating', { carparkId, userId, rating, comment })
      return data
    },
  })
}
