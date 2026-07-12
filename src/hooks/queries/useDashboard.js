import { useMemo } from 'react'
import { useAdminEvents, usePendingEvents } from './useEvents'
import { useAllBanners } from './useBanners'
import { useAllSpots } from './useSpots'

export function useDashboardStats() {
  const pending = usePendingEvents()
  const events = useAdminEvents()
  const banners = useAllBanners()
  const spots = useAllSpots()

  const data = useMemo(() => {
    const allBanners = banners.data || []
    return {
      pendingEvents: pending.data?.length ?? 0,
      totalEvents: events.data?.length ?? 0,
      totalBanners: allBanners.filter((b) => b.is_approved).length,
      pendingBanners: allBanners.filter((b) => !b.is_approved).length,
      discoverCount: spots.data?.length ?? 0,
    }
  }, [pending.data, events.data, banners.data, spots.data])

  return {
    data,
    isLoading:
      pending.isLoading || events.isLoading || banners.isLoading || spots.isLoading,
    isError:
      pending.isError || events.isError || banners.isError || spots.isError,
  }
}
