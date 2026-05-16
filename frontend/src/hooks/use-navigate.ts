import { useMutation } from '@tanstack/react-query'
import axiosInstance from '@/utils/axios'

// ============================================================================
// Hooks
// ============================================================================

export function useRoute() {
  return useMutation({
    mutationFn: async ({ start, end }: { start: [number, number]; end: [number, number] }) => {
      const { data } = await axiosInstance.post('/api/navigate/route', { start, end })
      return data // { pts, steps, totalDist }
    },
  })
}
