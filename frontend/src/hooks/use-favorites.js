import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/utils/axios'

// ============================================================================
// Hooks
// ============================================================================

export function useSavedCarparks(userId) {
  return useQuery({
    queryKey: ['saved-carparks', userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/favorites/${userId}`)
      return data
    },
    enabled: !!userId,
  })
}

export function useSaveCarpark() {
  return useMutation({
    mutationFn: async ({ userId, carparkId }) => {
      const { data } = await axiosInstance.post('/api/favorites', { userId, carparkId })
      return data
    },
  })
}

export function useDeleteSavedCarpark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, carparkId }) => {
      const { data } = await axiosInstance.delete('/api/favorites', { data: { userId, carparkId } })
      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-carparks', userId] })
    },
  })
}
