import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import './AdminCards.css'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '../../hooks/queries/useDashboard'
import { useAnimateValue } from '../../hooks/useAnimateValue'

const AdminCards = () => {
  const { data: stats } = useDashboardStats()
  const navigate = useNavigate()

  const [eventTrend, setEventTrend] = useState(null)
  const [eventPercentage, setEventPercentage] = useState(0)
  const [bannerTrend, setBannerTrend] = useState(null)
  const [bannerPercentage, setBannerPercentage] = useState(0)

  const displayedEventPercentage = useAnimateValue(eventPercentage)
  const displayedBannerPercentage = useAnimateValue(bannerPercentage)

  useEffect(() => {
    if (!stats) return

    const today = new Date().toDateString()
    const lastUpdate = localStorage.getItem('lastUpdate')

    const oldPendingEvents = Number(localStorage.getItem('prevPendingEvents')) || 0
    const oldPendingBanners = Number(localStorage.getItem('prevPendingBanners')) || 0

    if (oldPendingEvents > 0) {
      const diff = stats.pendingEvents - oldPendingEvents
      const percent = Number(((diff / oldPendingEvents) * 100).toFixed(1))
      setEventTrend(percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat')
      setEventPercentage(percent)
    } else if (oldPendingEvents === 0 && stats.pendingEvents > 0) {
      setEventPercentage(100)
      setEventTrend('up')
    }

    if (oldPendingBanners > 0) {
      const diff = stats.pendingBanners - oldPendingBanners
      const percent = Number(((diff / oldPendingBanners) * 100).toFixed(1))
      setBannerTrend(percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat')
      setBannerPercentage(percent)
    } else if (oldPendingBanners === 0 && stats.pendingBanners > 0) {
      setBannerPercentage(100)
      setBannerTrend('up')
    }

    if (lastUpdate !== today) {
      localStorage.setItem('prevPendingEvents', stats.pendingEvents)
      localStorage.setItem('prevPendingBanners', stats.pendingBanners)
      localStorage.setItem('lastUpdate', today)
    }
  }, [stats])

  const pendingEvents = stats?.pendingEvents ?? 0
  const pendingBanner = stats?.pendingBanners ?? 0
  const totalEvents = stats?.totalEvents ?? 0
  const totalBanner = stats?.totalBanners ?? 0
  const discoverCount = stats?.discoverCount ?? 0

  return (
    <div className="dashboard-cards">
      <div className="dashboard-card">
        <h3>Pending Events <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{pendingEvents}</p>
        <div className="card-header">
          {eventTrend && (
            <div className={`trend ${eventTrend}`}>
              {eventTrend === 'up' && <TrendingUp size={14} />}
              {eventTrend === 'down' && <TrendingDown size={14} />}
              {eventTrend === 'flat' && <BarChart3 size={14} />}
              <span>{displayedEventPercentage}%</span>
            </div>
          )}
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
            from yesterday
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Pending Banners <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{pendingBanner}</p>
        <div className="card-header">
          {bannerTrend && (
            <div className={`trend ${bannerTrend}`}>
              {bannerTrend === 'up' && <TrendingUp size={14} />}
              {bannerTrend === 'down' && <TrendingDown size={14} />}
              {bannerTrend === 'flat' && <BarChart3 size={14} />}
              <span>{displayedBannerPercentage}%</span>
            </div>
          )}
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
            from yesterday
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Total Events <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{totalEvents}</p>
        <p
          onClick={() => navigate("/adminpromoteevent")}
          style={{ color: "#0084FF", cursor: "pointer", fontSize: "14px", fontWeight: '500' }}
        >
          Upload Events
        </p>
      </div>

      <div className="dashboard-card">
        <h3>Total Banners <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{totalBanner}</p>
        <p
          onClick={() => navigate("/newbanner")}
          style={{ color: "#0084FF", fontSize: "14px", cursor: "pointer", fontWeight: '500' }}
        >
          Upload Banner
        </p>
      </div>

      <div className="dashboard-card">
        <h3>Discover Lagos <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{discoverCount}</p>
        <p
          onClick={() => navigate("/adminspots")}
          style={{ color: "#0084FF", fontSize: "14px", cursor: "pointer", fontWeight: '500' }}
        >
          Upload Location
        </p>
      </div>
    </div>
  )
}

export default AdminCards
