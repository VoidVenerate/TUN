import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../Components/api'
import { queryKeys } from './queryKeys'

const PAGE_SIZE = 100

export function useNewsletterSubscriptions(page = 1, limit = PAGE_SIZE) {
  const offset = (page - 1) * limit

  return useQuery({
    queryKey: queryKeys.newsletterPage(page, limit),
    queryFn: async () => {
      const res = await api.get(`/event/newsletter?limit=${limit}&offset=${offset}`)
      const data = res.data
      const subs = data?.subscriptions || []
      return {
        subscriptions: subs,
        total: data?.metadata?.total ?? subs.length,
      }
    },
    staleTime: 2 * 60_000,
  })
}

export function useSubscribeNewsletter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email) => api.post('/event/newsletter', { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletter })
      queryClient.invalidateQueries({ queryKey: ['newsletter'] })
    },
  })
}

export async function fetchAllNewsletterSubscribers() {
  const res = await api.get('/event/newsletter?limit=10000&offset=0')
  return res.data?.subscriptions || []
}
