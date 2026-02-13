import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

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

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const styles = {
    clubContainer: {
      padding: '2rem',
      backgroundColor: '#0a0a0a',
      color: 'white',
      minHeight: '50vh',
      marginLeft: '3vw',
    },
    clubHeader: {
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      width: '100%',
    },
    clubHeaderTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    clubHeaderH2: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#fff',
      margin: 0,
      fontFamily: 'Rushon Ground',
    },
    lagClubs: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
      width: '100%',
      minHeight: '300px',
    },
    clubCard: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    clubs: {
      backgroundColor: '#111',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      width: '100%',
      padding: '0.8rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    },
    clubsImg: {
      width: '100%',
      height: '180px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '1rem',
      backgroundColor: '#1a1a1a',
    },
    clubText: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: '0.5rem',
    },
    clubTextH3: {
      fontSize: '1.2rem',
      margin: 0,
      fontWeight: 'bold',
      color: 'white',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
      paddingRight: '0.5rem',
    },
    clubTextP: {
      fontSize: '0.9rem',
      fontWeight: 500,
      color: '#999',
      margin: 0,
      flexShrink: 0,
    },
    clubDescription: {
      fontSize: '0.85rem',
      color: '#aaa',
      lineHeight: '1.6',
      width: '100%',
      margin: 0,
      textAlign: 'left',
    },
    clubSearch: {
      width: '90%',
      maxWidth: '400px',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #333',
      backgroundColor: '#111',
      color: '#fff',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease-in-out',
    },
    noResults: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
    },
    noResultsP: {
      fontSize: '1.2rem',
      color: '#999',
      margin: 0,
    },
    clearSearchButton: {
      backgroundColor: '#5423D2',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    clubPagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '32px',
      paddingBottom: '2rem',
    },
    paginationButton: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      minWidth: '80px',
    },
    paginationButtonDisabled: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'not-allowed',
      minWidth: '80px',
      opacity: 0.4,
    },
    paginationSpan: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#ddd',
      background: '#1a1a1a',
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #333',
      minWidth: '100px',
      textAlign: 'center',
    },
    clubLoading: {
      textAlign: 'center',
      padding: '4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      minHeight: '50vh',
    },
    clubLoadingP: {
      fontSize: '1.1rem',
      color: '#aaa',
      margin: 0,
    },
    clubError: {
      textAlign: 'center',
      padding: '4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      minHeight: '50vh',
      color: '#ff6b6b',
    },
    clubErrorP: {
      fontSize: '1.1rem',
      color: '#ff6b6b',
      margin: 0,
    },
    retryButton: {
      backgroundColor: '#5423D2',
      color: 'white',
      border: 'none',
      padding: '12px 28px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '0.5rem',
    },
  }

  // Responsive styles
  const getResponsiveStyles = () => {
    if (windowWidth <= 480) {
      return {
        clubContainer: { ...styles.clubContainer, padding: '1rem', marginLeft: 0 },
        clubHeader: { ...styles.clubHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' },
        clubHeaderH2: { ...styles.clubHeaderH2, fontSize: '1.3rem' },
        lagClubs: { ...styles.lagClubs, gridTemplateColumns: '1fr', gap: '1rem', minHeight: '200px' },
        clubsImg: { ...styles.clubsImg, height: '200px' },
        clubTextH3: { ...styles.clubTextH3, fontSize: '1rem' },
      }
    } else if (windowWidth <= 768) {
      return {
        clubContainer: { ...styles.clubContainer, marginLeft: 0, padding: '1.5rem' },
        clubHeader: { ...styles.clubHeader, flexDirection: 'column', alignItems: 'flex-start' },
        lagClubs: { ...styles.lagClubs, gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' },
        clubsImg: { ...styles.clubsImg, height: '250px' },
      }
    } else if (windowWidth <= 1024) {
      return {
        clubsImg: { ...styles.clubsImg, height: '300px' },
      }
    }
    return {}
  }

  const responsiveStyles = getResponsiveStyles()

  if (loading) {
    return (
      <div style={{ ...styles.clubContainer, ...responsiveStyles.clubContainer }}>
        <div style={styles.clubLoading}>
          <p style={styles.clubLoadingP}>Loading {spotType}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ ...styles.clubContainer, ...responsiveStyles.clubContainer }}>
        <div style={styles.clubError}>
          <p style={styles.clubErrorP}>{error}</p>
          <button 
            style={styles.retryButton}
            onClick={() => window.location.reload()}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#6634e2'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 4px 12px rgba(84, 35, 210, 0.4)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#5423D2'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...styles.clubContainer, ...responsiveStyles.clubContainer }}>
      <div style={{ ...styles.clubHeader, ...responsiveStyles.clubHeader }}>
        <div style={styles.clubHeaderTitle}>
          <ChevronLeft 
            size={24} 
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer' }}
          />
          <h2 style={{ ...styles.clubHeaderH2, ...responsiveStyles.clubHeaderH2 }}>
            {title || `Best ${spotType}s in Lagos`}
          </h2>
        </div>

        {/* 🔍 Search box */}
        <input 
          type="text" 
          placeholder={`Search ${spotType}s...`} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.clubSearch}
          onFocus={(e) => {
            e.target.style.borderColor = '#5423D2'
            e.target.style.boxShadow = '0 0 8px rgba(84, 35, 210, 0.4)'
            e.target.style.backgroundColor = '#1a1a1a'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#333'
            e.target.style.boxShadow = 'none'
            e.target.style.backgroundColor = '#111'
          }}
        />
      </div>

      <div style={{ ...styles.lagClubs, ...responsiveStyles.lagClubs }}>
        {spots.length === 0 ? (
          <div style={styles.noResults}>
            <p style={styles.noResultsP}>No {spotType} found.</p>
            {searchTerm && (
              <button 
                style={styles.clearSearchButton}
                onClick={() => setSearchTerm('')}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#6634e2'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(84, 35, 210, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#5423D2'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          spots.map((spot) => (
            <div style={styles.clubCard} key={spot.id}>
              <div 
                style={styles.clubs}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <img 
                  src={spot.cover_image} 
                  alt={spot.location_name}
                  style={{ ...styles.clubsImg, ...responsiveStyles.clubsImg }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x180?text=No+Image'
                  }}
                />
                <div style={styles.clubText}>
                  <h3 style={{ ...styles.clubTextH3, ...responsiveStyles.clubTextH3 }}>{spot.location_name}</h3>
                  <p style={styles.clubTextP}>{spot.city}</p>
                </div>
                <p style={styles.clubDescription}>
                  {spot.additional_info || 'No description available'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔄 Pagination - always visible */}
      <div style={styles.clubPagination}>
        <button 
          disabled={currentPage === 1} 
          onClick={handlePrevPage}
          style={currentPage === 1 ? styles.paginationButtonDisabled : styles.paginationButton}
          onMouseOver={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = '#333'
              e.target.style.borderColor = '#5423D2'
              e.target.style.transform = 'translateY(-2px)'
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = '#1a1a1a'
              e.target.style.borderColor = '#333'
              e.target.style.transform = 'translateY(0)'
            }
          }}
        >
          Prev
        </button>
        <span style={styles.paginationSpan}>Page {currentPage}</span>
        <button 
          onClick={handleNextPage}
          disabled={!hasNextPage && spots.length === 0}
          style={(!hasNextPage && spots.length === 0) ? styles.paginationButtonDisabled : styles.paginationButton}
          onMouseOver={(e) => {
            if (hasNextPage || spots.length > 0) {
              e.target.style.backgroundColor = '#333'
              e.target.style.borderColor = '#5423D2'
              e.target.style.transform = 'translateY(-2px)'
            }
          }}
          onMouseOut={(e) => {
            if (hasNextPage || spots.length > 0) {
              e.target.style.backgroundColor = '#1a1a1a'
              e.target.style.borderColor = '#333'
              e.target.style.transform = 'translateY(0)'
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default SpotList