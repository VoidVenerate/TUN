import React, { useState } from 'react';
import Visit from '../../../Components/Visit/Visit';
import Le from '../../../assets/Le';
import UserNavbar from '../../../Components/UserNavbar/UserNavbar';
import Footer from '../../../Components/Footer/Footer';

const ExploreLagos = () => {
  const cardsPerPage = 9; // events per page
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(Le.length / cardsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const currentEvents = Le.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  const [activeBtn, setActiveBtn] = useState({ index: null, type: null });
  const handleClick = (index, type) => {
    if (activeBtn.index === index && activeBtn.type === type) {
      setActiveBtn({ index: null, type: null });
    } else {
      setActiveBtn({ index, type });
    }
  };

  return (
    <div>
      <UserNavbar />
      <Visit />

      <div className="LagEvents-header">
        <p style={{ fontFamily: 'Rushon Ground' }}>Lagos Events</p>
      </div>

      <div className="Lag-Events">
        {currentEvents.map((event, index) => (
          <div key={event.id} className="event-card">
            <div className="events">
              <img src={event.image} alt={event.title} />
              <div className="event-txt">
                <h3>{event.title}</h3>
                <p>{event.location}</p>
              </div>
              <p>{event.desciption}</p>
              <div className="slider-btn">
                <button
                  className={
                    activeBtn.index === index && activeBtn.type === 'details'
                      ? 'active'
                      : ''
                  }
                  onClick={() => handleClick(index, 'details')}
                >
                  View Details
                </button>
                <button disabled className="buy-tickets-btn">
                  Buy Tickets
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default ExploreLagos;
