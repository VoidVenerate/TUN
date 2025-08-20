import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
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
        if (!token) {
          console.warn('No token found — user might not be logged in')
          return
        }

        // ✅ Pending events
        const pendingRes = await api.get(
          'https://lagos-turnup.onrender.com/event/events?pending=true',
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        )
        const pendingData = pendingRes.data
        const newPending = pendingData.length

        if (prevPendingEvents !== null) {
          const diff = newPending - prevPendingEvents
          const percent =
            prevPendingEvents > 0
              ? Number(((diff / prevPendingEvents) * 100).toFixed(1)) // 👈 force number
              : 0
          setPercentageChange(percent)

          if (diff > 0) setTrend('up')
          else if (diff < 0) setTrend('down')
          else setTrend(null)
        }

        setPrevPendingEvents(newPending)
        setPendingEvents(newPending)

        // ✅ Total events
        const eventRes = await axios.get(
          'https://lagos-turnup.onrender.com/event/events',
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
  }, [prevPendingEvents])

  // 👇 Animate displayedPercentage smoothly when percentageChange updates
  useEffect(() => {
    let startValue = displayedPercentage;
    let endValue = percentageChange;
    let startTime = null;

    const duration = 800; // ms, you can tweak this

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newValue = startValue + (endValue - startValue) * progress;
      setDisplayedPercentage(Number(newValue.toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [percentageChange]);


  return (
    <div className="dashboard-cards">
      <div className="dashboard-card">
        <h3>Pending Events</h3>
        <p>{pendingEvents}</p>
        {trend && (
          <div className={`trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{displayedPercentage}%</span>
          </div>
        )}
      </div>

      <div className="dashboard-card">
        <h3>Total Events</h3>
        <p>{totalEvents}</p>
      </div>

      <div className="dashboard-card">
        <h3>Pending Banners</h3>
        <p>{pendingBanner}</p>
      </div>

      <div className="dashboard-card">
        <h3>Total Banners</h3>
        <p>{totalBanner}</p>
      </div>

      <div className="dashboard-card">
        <h3>Discover Lagos</h3>
        <p>{discoverCount}</p>
      </div>
    </div>
  )
}

export default AdminCards
