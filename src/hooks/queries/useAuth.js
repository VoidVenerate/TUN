import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from './queryKeys'

const BASE_URL = 'https://lagos-turnup-ecy5.onrender.com'
const GUEST_RULES = { role: 'guest', permissions: [] }

async function fetchUserRules() {
  const token = localStorage.getItem('token')
  if (!token) return GUEST_RULES

  try {
    const response = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching user rules:', error)
    return GUEST_RULES
  }
}

function getInitialRules() {
  const savedRules = localStorage.getItem('user_rules')
  return savedRules ? JSON.parse(savedRules) : GUEST_RULES
}

export function useUserRules() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchUserRules,
    initialData: getInitialRules,
    staleTime: 5 * 60_000,
  })
}
