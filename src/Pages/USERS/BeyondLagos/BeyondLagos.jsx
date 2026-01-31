import React, { useState } from 'react'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import Footer from '../../../Components/Footer/Footer'
import AllEvents from '../../../Components/AllEvents/AllEvents'

const BeyondLagos = () => {
  const cardsPerPage = 27
  const [currentPage, setCurrentPage] = useState(1)

  const handleNext = (totalEvents) => {
    const totalPages = Math.ceil(totalEvents / cardsPerPage)
    if (currentPage < totalPages) setCurrentPage(p => p + 1)
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1)
  }

  return (
    <div>
      <UserNavbar />

      <AllEvents stateFilter="Outside Lagos" page={currentPage} limit={cardsPerPage} />

      {/* controls — parent can know total events if you lift state, 
          or just leave here as "dumb" prev/next */}
      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage}</span>
        {/* we’ll need total count if you want “disable on last page” */}
        <button onClick={() => handleNext(9999)}>Next</button>
      </div>

      <Footer />
    </div>
  )
}

export default BeyondLagos
