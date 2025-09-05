import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import './AdminCards.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../api'

const AdminCards = () => {
  // ====== Pending Events ======
  const [pendingEvents, setPendingEvents] = useState(0)
  const [prevPendingEvents, setPrevPendingEvents] = useState(null)
  const [eventTrend, setEventTrend] = useState(null)
  const [eventPercentage, setEventPercentage] = useState(0)
  const [displayedEventPercentage, setDisplayedEventPercentage] = useState(0)

  // ====== Pending Banners ======
  const [pendingBanner, setPendingBanner] = useState(0)
  const [prevPendingBanners, setPrevPendingBanners] = useState(null)
  const [bannerTrend, setBannerTrend] = useState(null)
  const [bannerPercentage, setBannerPercentage] = useState(0)
  const [displayedBannerPercentage, setDisplayedBannerPercentage] = useState(0)

  // ====== Other counts ======
  const [totalEvents, setTotalEvents] = useState(0)
  const [totalBanner, setTotalBanner] = useState(0)
  const [discoverCount, setDiscoverCount] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        // ✅ Pending Events
        const pendingRes = await api.get(
          "https://lagos-turnup.onrender.com/event/events?pending=true",
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const newPendingEvents = pendingRes.data.length
        const oldPendingEvents = Number(localStorage.getItem("prevPendingEvents")) || 0

        if (oldPendingEvents > 0) {
          const diff = newPendingEvents - oldPendingEvents
          let percent = Number(((diff / oldPendingEvents) * 100).toFixed(1))

          if (percent > 0) setEventTrend("up")
          else if (percent < 0) setEventTrend("down")
          else setEventTrend("flat")

          setEventPercentage(percent)
        } else if (oldPendingEvents === 0 && newPendingEvents > 0) {
          setEventPercentage(100)
          setEventTrend("up")
        }

        setPendingEvents(newPendingEvents)
        localStorage.setItem("prevPendingEvents", newPendingEvents)

        // ✅ Events (non-pending)
        const eventRes = await axios.get(
          "https://lagos-turnup.onrender.com/event/events?pending=false",
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        )
        setTotalEvents(eventRes.data.length)

        // ✅ Banners
        const bannerRes = await axios.get(
          "https://lagos-turnup.onrender.com/event/banners",
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        )
        const bannerData = bannerRes.data.filter((banner) => banner.is_approved)
        setTotalBanner(bannerData.length)

        // ✅ Pending Banners
        const pendingBannerData = bannerRes.data.filter((banner) => !banner.is_approved)
        const newPendingBanners = pendingBannerData.length
        const oldPendingBanners = Number(localStorage.getItem("prevPendingBanners")) || 0

        if (oldPendingBanners > 0) {
          const diff = newPendingBanners - oldPendingBanners
          let percent = Number(((diff / oldPendingBanners) * 100).toFixed(1))

          if (percent > 0) setBannerTrend("up")
          else if (percent < 0) setBannerTrend("down")
          else setBannerTrend("flat")

          setBannerPercentage(percent)
        } else if (oldPendingBanners === 0 && newPendingBanners > 0) {
          setBannerPercentage(100)
          setBannerTrend("up")
        }

        setPendingBanner(newPendingBanners)
        localStorage.setItem("prevPendingBanners", newPendingBanners)

        // ✅ Discover Lagos
        const discoverRes = await axios.get(
          "https://lagos-turnup.onrender.com/event/spots",
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        )
        setDiscoverCount(discoverRes.data.length)
      } catch (error) {
        console.error("Error fetching Data", error)
      }
    }
    fetchData()
  }, [])

  // ====== Animate Event Percentage ======
  useEffect(() => {
    let startValue = displayedEventPercentage
    const endValue = eventPercentage
    let startTime = null
    const duration = 800

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const newValue = startValue + (endValue - startValue) * progress
      setDisplayedEventPercentage(Number(newValue.toFixed(1)))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [eventPercentage])

  // ====== Animate Banner Percentage ======
  useEffect(() => {
    let startValue = displayedBannerPercentage
    const endValue = bannerPercentage
    let startTime = null
    const duration = 800

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const newValue = startValue + (endValue - startValue) * progress
      setDisplayedBannerPercentage(Number(newValue.toFixed(1)))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [bannerPercentage])

  return (
    <div className="dashboard-cards">
      {/* ===== Pending Events ===== */}
      <div className="dashboard-card">
        <h3>Pending Events <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{pendingEvents}</p>
        <div className="card-header">
          {eventTrend && (
            <div className={`trend ${eventTrend}`}>
              {eventTrend === 'up' && <TrendingUp size={14} />}
              {eventTrend === 'down' && <TrendingDown size={14} />}
              {eventTrend === 'flat' && <BarChart3 size={14} />}
              <span>{eventPercentage}%</span>
            </div>
          )}
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
            from yesterday
          </p>
        </div>
      </div>

      {/* ===== Pending Banners ===== */}
      <div className="dashboard-card">
        <h3>Pending Banners <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{pendingBanner}</p>
        <div className="card-header">
          {bannerTrend && (
            <div className={`trend ${bannerTrend}`}>
              {bannerTrend === 'up' && <TrendingUp size={14} />}
              {bannerTrend === 'down' && <TrendingDown size={14} />}
              {bannerTrend === 'flat' && <BarChart3 size={14} />}
              <span>{bannerPercentage}%</span>
            </div>
          )}
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
            from yesterday
          </p>
        </div>
      </div>

      {/* ===== Total Events ===== */}
      <div className="dashboard-card">
        <h3>Total Events <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{totalEvents}</p>
        <p
          onClick={() => navigate("/adminpromoteevent")}
          style={{ color: "#0084FF", cursor: "pointer", fontSize: "14px" }}
        >
          Upload Events
        </p>
      </div>

      {/* ===== Total Banners ===== */}
      <div className="dashboard-card">
        <h3>Total Banners <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{totalBanner}</p>
        <p
          onClick={() => navigate("/newbanner")}
          style={{ color: "#0084FF", fontSize: "14px", cursor: "pointer" }}
        >
          Upload Banner
        </p>
      </div>

      {/* ===== Discover Lagos ===== */}
      <div className="dashboard-card">
        <h3>Discover Lagos <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{discoverCount}</p>
        <p
          onClick={() => navigate("/adminspots")}
          style={{ color: "#0084FF", fontSize: "14px", cursor: "pointer" }}
        >
          Upload Events
        </p>
      </div>
    </div>
  )
}

export default AdminCards
