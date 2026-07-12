import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import api from '../../Components/api'
import { queryKeys } from './queryKeys'

const BASE_URL = 'https://lagos-turnup-ecy5.onrender.com'

function parseSpotsResponse(res, spotType) {
  let data = []
  let totalPages = 1
  let hasNextPage = false

  if (Array.isArray(res.data)) {
    data = res.data
    hasNextPage = res.data.length > 0
  } else {
    data = res.data.items || res.data.data || res.data.spots || res.data[spotType] || []
    const pagination = res.data.pagination || {}
    totalPages = res.data.totalPages || pagination.totalPages || 1
    hasNextPage = pagination.hasNextPage || false
  }

  return { data, totalPages, hasNextPage }
}

export function useSpotsByType({ spotType, page = 1, search = '' }) {
  return useQuery({
    queryKey: queryKeys.spots.byType(spotType, page, search),
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/spots/type/${spotType}`, {
        params: { page, search },
      })
      return parseSpotsResponse(res, spotType)
    },
    enabled: !!spotType,
    placeholderData: keepPreviousData,
  })
}

export function useAdminSpotsByType({ spotType, page = 1, search = '' }) {
  return useQuery({
    queryKey: [...queryKeys.spots.byType(spotType, page, search), 'admin'],
    queryFn: async () => {
      const res = await api.get(`${BASE_URL}/event/spots/type/${spotType}`, {
        params: { page, search },
      })
      const { data, totalPages } = parseSpotsResponse(res, spotType)
      return { data, totalPages }
    },
    enabled: !!spotType,
    placeholderData: keepPreviousData,
  })
}

export function useSpotById(id) {
  return useQuery({
    queryKey: queryKeys.spots.detail(id),
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/spots`, { params: { spot_id: id } })
      return Array.isArray(res.data) ? res.data[0] : res.data
    },
    enabled: !!id,
    staleTime: 2 * 60_000,
  })
}

export function useSpotsByTypeSimilar(spotType) {
  return useQuery({
    queryKey: queryKeys.spots.byTypeOnly(spotType),
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/spots`, {
        params: { spot_type: spotType },
      })
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!spotType,
    staleTime: 2 * 60_000,
  })
}

export function useDeleteSpot(spotType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (spotId) => api.delete(`/event/spots/${spotId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', spotType] })
      queryClient.invalidateQueries({ queryKey: queryKeys.spots.all })
    },
  })
}

export function useAllSpots() {
  return useQuery({
    queryKey: queryKeys.spots.all,
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/spots`)
      return res.data || []
    },
  })
}
