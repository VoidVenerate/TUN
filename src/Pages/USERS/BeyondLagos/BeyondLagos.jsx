import React, { useEffect, useState } from 'react'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import Footer from '../../../Components/Footer/Footer'
import AllEvents from '../../../Components/AllEvents/AllEvents'
import { useEventsByState } from '../../../hooks/queries/useEvents'

const BeyondLagos = () => {
  const cardsPerPage = 27
  const [currentPage, setCurrentPage] = useState(1)
  const { data: allEvents = [] } = useEventsByState('Outside Lagos')

  const totalPages = Math.max(1, Math.ceil(allEvents.length / cardsPerPage))
  const hasPrevPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const handleNext = () => {
    if (hasNextPage) setCurrentPage(p => p + 1)
  }

  const handlePrev = () => {
    if (hasPrevPage) setCurrentPage(p => p - 1)
  }

  return (
    <div>
      <UserNavbar />

      <AllEvents stateFilter="Outside Lagos" page={currentPage} limit={cardsPerPage} showHeader={false} />

      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={!hasPrevPage}>
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNext} disabled={!hasNextPage}>
          Next
        </button>
      </div>

      <Footer />
    </div>
  )
}

export default BeyondLagos
