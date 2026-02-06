import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './SpotList.css' // you can rename to SpotList.css if using for multiple types
import { ChevronLeft } from 'lucide-react'

const SpotList = ({ spotType, title }) => {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // optional filters
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(
          `https://lagos-turnup-ecy5.onrender.com/event/spots/type/${spotType}?page=${currentPage}&search=${searchTerm}`
        )
        const data = Array.isArray(res.data) ? res.data : res.data.items || []
        setSpots(data)
      } catch (err) {
        console.error('Error fetching spots:', err)
        setError('Could not load spots')
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [spotType, currentPage, searchTerm])

  if (loading) return <p className="club-loading">Loading {spotType}s...</p>
  if (error) return <p className="club-error">{error}</p>

  return (
    <div className='club-container'>
      <div className="club-header">
        <div className="club-header-title">
          <ChevronLeft size={24} onClick={() => {navigate(-1)}}/>
          <h2 style={{fontFamily:"Rushon Ground"}}>{title || `Best ${spotType}s in Lagos`}</h2>
        </div>

        {/* 🔍 optional search box */}
        <input 
          type="text" 
          placeholder={`Search ${spotType}s...`} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="club-search"
        />
      </div>

      <div className="lag-clubs">
        {spots.length === 0 ? (
          <p style={{textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent:'center'}}>No {spotType}s found.</p>
        ) : (
          spots.map((spot) => (
            <div className="club-card" key={spot.id}>
              <div className="clubs">
                <img src={spot.cover_image} alt={spot.location_name} />
                <div className="club-text">
                  <h3>{spot.location_name}</h3>
                  <p>{spot.city}</p>
                </div>
                <p style={{width:"100%"}}>{spot.additional_info.split(" ").slice(0, 15).join(" ")+'...'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔄 Pagination (optional) */}
      <div className="club-pagination">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(p => p + 1)}>Next</button>
      </div>
    </div>
  )
}

export default SpotList
