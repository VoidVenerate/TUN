import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import api from '../../Components/api'
import { queryKeys } from './queryKeys'

const BASE_URL = 'https://lagos-turnup-ecy5.onrender.com'

export function useEventsByState(stateFilter) {
  return useQuery({
    queryKey: queryKeys.events.list({ state: stateFilter, pending: false }),
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/events`, {
        params: { state: stateFilter, pending: false },
      })
      return res.data || []
    },
    enabled: !!stateFilter,
  })
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: queryKeys.events.featured,
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/events`, {
        params: { is_featured: true, pending: false, limit: 10 },
      })
      return res.data || []
    },
  })
}

export function useAllPublicEvents() {
  return useQuery({
    queryKey: queryKeys.events.allPublic,
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/events`, {
        params: { pending: false },
      })
      return res.data || []
    },
    staleTime: 2 * 60_000,
  })
}

export function useEventById(id) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/events`, { params: { id } })
      return res.data[0] || null
    },
    enabled: !!id,
    staleTime: 2 * 60_000,
  })
}

export function useAdminEvents() {
  return useQuery({
    queryKey: queryKeys.events.admin,
    queryFn: async () => {
      const res = await api.get(`${BASE_URL}/event/events?pending=false`)
      const fetched = res.data.events || res.data
      return fetched.map((e) => ({
        ...e,
        event_id: e.event_id || e.id,
      }))
    },
  })
}

export function usePendingEvents() {
  return useQuery({
    queryKey: queryKeys.events.pending,
    queryFn: async () => {
      const res = await api.get(`${BASE_URL}/event/events?pending=true`)
      return res.data.events || res.data || []
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => {
      const token = localStorage.getItem('token')
      return api.delete(`/event/events/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
