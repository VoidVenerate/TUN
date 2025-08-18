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
    const [displayedPercentage, setDisplayedPercentage] = useState(0); // 👈 For animation


    const [totalEvents, setTotalEvents] = useState(0)
    const [totalBanner, setTotalBanner] = useState(0)
    const [discoverCount, setDiscoverCount] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
              // ✅ Get token from localStorage
              const token = localStorage.getItem('token'); 
              if (!token) {
                  console.warn('No token found — user might not be logged in');
                  return;
              }
            //pending events
                const pendingRes = await api.get('https://lagos-turnup.onrender.com/pendingevents', 
                  { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
                )
                const pendingData = pendingRes.data
                const newPending = pendingData.length

                if (prevPendingEvents !=null) {
                    const diff = newPending - prevPendingEvents
                    const percent = prevPendingEvents > 0 ? Math.abs((diff/prevPendingEvents) * 100).toFixed(1) : 0 
                    setPercentageChange(percent);

                    if (diff > 0) {
                        setTrend('up')
                    }else if(diff < 0) {
                        setTrend('down')
                    } else {
                        null
                    }
                    
                } 
                setPrevPendingEvents(newPending)
                setPendingEvents(newPending)
            //total events
                const eventRes = await axios.get('https://lagos-turnup.onrender.com/event/events', 
                  { headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${token}`  } }
                )
                const eventData = eventRes.data
                setTotalEvents(eventData.length)

            //total banners
                const bannerRes = await axios.get ('https://lagos-turnup.onrender.com/event/banners', 
                  { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
                )
                const bannerData = bannerRes.data
                setTotalBanner(bannerData.length)
            
            //discover lagos
                const discoverRes = await axios.get ('https://lagos-turnup.onrender.com/discoverlagos', 
                  { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
                )
                const discoverData = discoverRes.data
                setDiscoverCount(discoverData.length)
            } catch (error) {
                console.error('Error fetching Data', error)
            }
        }
        fetchData()
    },[prevPendingEvents])

     // 👇 Animate displayedPercentage when percentageChange updates
  useEffect(() => {
    let start = displayedPercentage;
    let end = percentageChange;
    let step = (end - start) / 20; // smooth steps

    let animation = setInterval(() => {
      start += step;
      if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
        start = end;
        clearInterval(animation);
      }
      setDisplayedPercentage(start.toFixed(1));
    }, 30);

    return () => clearInterval(animation);
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