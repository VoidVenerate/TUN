import React, { createContext, useContext, useEffect, useMemo } from 'react'
import Loader from '../Loader/Loader'
import { useUserRules } from '../../hooks/queries/useAuth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { data: rules, isLoading, isFetching } = useUserRules()

  useEffect(() => {
    if (rules) {
      localStorage.setItem('user_rules', JSON.stringify(rules))
    }
  }, [rules])

  const profile = useMemo(() => {
    if (!rules || rules.role === 'guest') return null
    return {
      firstName: rules.first_name || '',
      profileImage: rules.profile_picture_url || rules.profile_picture || null,
    }
  }, [rules])

  const value = useMemo(
    () => ({ rules, profile, setRules: () => {} }),
    [rules, profile]
  )

  if (isLoading && isFetching) {
    return <Loader />
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
