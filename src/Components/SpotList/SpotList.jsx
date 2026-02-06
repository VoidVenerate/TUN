import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './SpotList.css'
import { ChevronLeft } from 'lucide-react'

const SpotList = ({ spotType, title }) => {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

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
        
        // Handle different response structures
        let data = []
        let pagination = {}
        
        if (Array.isArray(res.data)) {
          data = res.data
          // If it's just an array, assume no more pages if empty
          setHasNextPage(res.data.length > 0)
        } else {
          data = res.data.items || res.data.data || []
          pagination = res.data.pagination || {}
          setTotalPages(pagination.totalPages || 1)
          setHasNextPage(pagination.hasNextPage || false)
        }
        
        setSpots(data)
        
        // If no results and not on first page, go back to first page
        if (data.length === 0 && currentPage > 1) {
          setCurrentPage(1)
        }
      } catch (err) {
        console.error('Error fetching spots:', err)
        setError('Could not load spots. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [spotType, currentPage, searchTerm])

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm])

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (hasNextPage || spots.length > 0) {
      setCurrentPage(p => p + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="club-container">
        <div className="club-loading">
          <div className="loading-spinner"></div>
          <p>Loading {spotType}s...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="club-container">
        <div className="club-error">
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='club-container'>
      <div className="club-header">
        <div className="club-header-title">
          <ChevronLeft 
            size={24} 
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer' }}
          />
          <h2 style={{ fontFamily: "Rushon Ground" }}>
            {title || `Best ${spotType}s in Lagos`}
          </h2>
        </div>

        {/* 🔍 Search box */}
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
          <div className="no-results">
            <p>No {spotType}s found.</p>
            {searchTerm && (
              <button 
                className="clear-search-button"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          spots.map((spot) => (
            <div className="club-card" key={spot.id}>
              <div className="clubs">
                <img 
                  src={spot.cover_image} 
                  alt={spot.location_name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250?text=No+Image'
                  }}
                />
                <div className="club-text">
                  <h3>{spot.location_name}</h3>
                  <p>{spot.city}</p>
                </div>
                <p className="club-description">
                  {spot.additional_info 
                    ? spot.additional_info.split(" ").slice(0, 15).join(" ") + '...'
                    : 'No description available'
                  }
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔄 Pagination - always visible */}
      <div className="club-pagination">
        <button 
          disabled={currentPage === 1} 
          onClick={handlePrevPage}
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button 
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default SpotList