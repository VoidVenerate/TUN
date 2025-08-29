import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import './AdminCards.css'
import axios from 'axios'
import api from '../api'


const AdminCards = () => {
  const [pendingEvents, setPendingEvents] = useState(0)
  const [prevPendingEvents, setPrevPendingEvents] = useState(null)
  const [trend, setTrend] = useState(null)
  const [percentageChange, setPercentageChange] = useState(0)
  const [displayedPercentage, setDisplayedPercentage] = useState(0) // 👈 Animated value

  const [totalEvents, setTotalEvents] = useState(0)
  const [totalBanner, setTotalBanner] = useState(0)
  const [pendingBanner, setPendingBanner] = useState(0)
  const [discoverCount, setDiscoverCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const pendingRes = await api.get(
          'https://lagos-turnup.onrender.com/event/events?pending=true',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const newPending = pendingRes.data.length

        // get yesterday’s stored count
        const storedPrev = localStorage.getItem('prevPendingEvents')
        const prev = storedPrev ? parseInt(storedPrev, 10) : null

        // inside fetchData()
        if (prev !== null) {
          const diff = newPending - prev
          const percent = prev > 0 ? Number(((diff / prev) * 100).toFixed(1)) : 0
          setPercentageChange(percent)

          if (percent > 0) setTrend('up')
          else setTrend('down')
         // only when exactly 0%
        }


        // update both state + localStorage
        setPrevPendingEvents(newPending)
        localStorage.setItem('prevPendingEvents', newPending)

        setPendingEvents(newPending)

        // ✅ Total events
        const eventRes = await axios.get(
          'https://lagos-turnup.onrender.com/event/events?pending=false',
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        )
        setTotalEvents(eventRes.data.length)

        // ✅ Total banners
        const bannerRes = await axios.get('https://lagos-turnup.onrender.com/event/banners',
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        )
        const bannerData = bannerRes.data.filter(banner => banner.is_approved)
        setTotalBanner(bannerData.length)

        // ✅ Pending banners
        const pendingBannerData = bannerRes.data.filter(banner => !banner.is_approved)
        setPendingBanner(pendingBannerData.length)

        // ✅ Discover Lagos
        const discoverRes = await axios.get('https://lagos-turnup.onrender.com/event/spots',
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        )
        setDiscoverCount(discoverRes.data.length)
      } catch (error) {
        console.error('Error fetching Data', error)
      }
    }
    fetchData()
  }, [])

  // 👇 Animate displayedPercentage smoothly when percentageChange updates
  // 👇 Animate pendingEvents count itself
  const [displayedPending, setDisplayedPending] = useState(0);

  useEffect(() => {
    let startValue = displayedPending;
    let endValue = pendingEvents;
    let startTime = null;
    const duration = 800; // ms

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newValue = startValue + (endValue - startValue) * progress;
      setDisplayedPending(Math.round(newValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [pendingEvents]);



  return (
    <div className="dashboard-cards">
      <div className="dashboard-card">
        <h3>Pending Events <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <div className="card-header">
          <p>{pendingEvents}</p>
          {trend && (
            <div className={`trend ${trend}`}>
              {trend === 'up' && <TrendingUp size={14} />}
              {trend === 'down' && <TrendingDown size={14} />}
              {trend === 'flat' && <BarChart3 size={14} />} {/* Neutral icon */}
              <span>{displayedPending}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Total Events <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{totalEvents}</p>
      </div>

      <div className="dashboard-card">
        <h3>Pending Banners <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{pendingBanner}</p>
      </div>

      <div className="dashboard-card">
        <h3>Total Banners <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{totalBanner}</p>
      </div>

      <div className="dashboard-card">
        <h3>Discover Lagos <BarChart3 size={16} style={{ marginRight: '6px' }} /></h3>
        <p>{discoverCount}</p>
      </div>
    </div>
  )
}

export default AdminCards
