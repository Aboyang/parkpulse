import { useMutation } from '@tanstack/react-query'
import axiosInstance from '@/utils/axios'

// ============================================================================
// Hooks
// ============================================================================

export function useRoute() {
  return useMutation({
    mutationFn: async ({ start, end }) => {
      const { data } = await axiosInstance.post('/api/navigate/route', { start, end })
      return data // { pts, steps, totalDist }
    },
  })
}
