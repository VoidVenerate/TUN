import { useQuery } from '@tanstack/react-query'
import api from '../../Components/api'
import { queryKeys } from './queryKeys'

const BASE_URL = 'https://lagos-turnup-ecy5.onrender.com'

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const res = await api.get(`${BASE_URL}/event/notifications`)
      return (res.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    },
    refetchInterval: 30_000,
  })
}
