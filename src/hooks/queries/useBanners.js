import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import api from '../../Components/api'
import { queryKeys } from './queryKeys'

const BASE_URL = 'https://lagos-turnup-ecy5.onrender.com'

export function useApprovedBanners() {
  return useQuery({
    queryKey: queryKeys.banners.approved,
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/event/banners`, {
        params: { approved_only: true },
      })
      return res.data || []
    },
  })
}

export function useAllBanners() {
  return useQuery({
    queryKey: queryKeys.banners.all,
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${BASE_URL}/event/banners`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      return res.data || []
    },
  })
}

export function useAdminApprovedBanners() {
  const { data: allBanners = [], ...rest } = useAllBanners()
  const approved = allBanners.filter((b) => b.is_approved)
  return { data: approved, allBanners, ...rest }
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => {
      const token = localStorage.getItem('token')
      return api.delete(`${BASE_URL}/event/banners/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.approved })
    },
  })
}
