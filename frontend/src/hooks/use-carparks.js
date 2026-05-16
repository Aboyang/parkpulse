import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axios'

// ============================================================================
// Hooks
// ============================================================================

export function useCarparks({ address, radius, ev_charging, _t } = {}) {
  return useQuery({
    queryKey: ['carparks', { address, radius, ev_charging, _t }],
    queryFn: async () => {
      const params = {}
      if (address) params.address = address
      if (radius) params.radius = radius
      if (ev_charging) params.ev_charging = true

      const { data } = await axiosInstance.get('/api/carparks', { params })
      const carparks = data.carparks || []

      return carparks.map((cp) => ({
        id:                   cp.carpark_no,
        name:                 cp.name,
        distance:             cp.distance,
        latitude:             cp.location?.latitude  ?? 0,
        longitude:            cp.location?.longitude ?? 0,
        available_lots:       cp.available_lots,
        total_capacity:       cp.total_capacity,
        operating_hours:      cp.operating_hours,
        free_parking:         cp.free_parking,
        free_parking_details: cp.free_parking_details,
        payment:              cp.payment,
        ev_charging:          cp.ev_charging,
        average_rating:       cp.average_rating,
        total_ratings:        cp.total_ratings,
      }))
    },
    enabled: !!address,
    staleTime: 120_000,
    gcTime:    10 * 60 * 1000,
  })
}
