import React, { useRef, useState, useEffect } from 'react'
import ft from '../../assets/ft'
import './FtEvents.css'

const FtEvents = () => {
  // 🔹 State to track which button is active (index + type)
  // Example: { index: 2, type: 'details' }
  const [activeBtn, setActiveBtn] = useState({ index: null, type: null })

  // 🔹 Ref for the slider container (to control scrolling)
  const sliderRef = useRef(null)

  // 🔹 Ref to store the scroll interval ID (so we can start/stop it)
  const scrollInterval = useRef(null)

  /**
   * 🔹 Handles "View Details" button click
   * - Toggles active state when clicked
   * - If the same button is clicked again, it closes (sets to null)
   */
  const handleClick = (index, type) => {
    if (activeBtn.index === index && activeBtn.type === type) {
      // If the clicked button is already active → deactivate it
      setActiveBtn({ index: null, type: null })
    } else {
      // Otherwise, set the clicked button as active
      setActiveBtn({ index, type })
    }
  }

  /**
   * 🔹 useEffect runs when component mounts
   * - Starts auto-scroll
   * - Cleans up (stops scroll) when component unmounts
   */
  useEffect(() => {
    startScroll()   // Start scrolling when component mounts
    return () => stopScroll() // Stop scrolling when component unmounts
  }, [])

  /**
   * 🔹 Starts the auto-scrolling effect
   * - Uses setInterval to increment scroll position
   * - Resets position halfway through for seamless looping
   */
  const startScroll = () => {
    // Prevent starting multiple intervals at the same time
    if (scrollInterval.current) return

    // Create interval to auto-scroll
    scrollInterval.current = setInterval(() => {
      const slider = sliderRef.current
      if (slider) {
        // Move the scroll position slightly each tick
        slider.scrollLeft += 0.5 // Smaller value = slower speed

        /**
         * 🔥 Key trick for seamless looping:
         * - We duplicated the list of items ([...ft, ...ft])
         * - Total scrollWidth = width of both lists
         * - When we reach halfway (end of first list),
         *   instantly jump scrollLeft back to 0
         * - This creates an endless loop without a gap
         */
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0 // Reset instantly
        }
      }
    }, 10) // Interval speed in ms (higher = slower scroll)
  }

  /**
   * 🔹 Stops the auto-scrolling
   * - Clears the interval so the slider pauses
   * - Used when hovering or when component unmounts
   */
  const stopScroll = () => {
    clearInterval(scrollInterval.current) // Stop scrolling
    scrollInterval.current = null // Reset reference
  }

  return (
    <nav className='ft-events'>
      {/* 🔹 Header section */}
      <div className="ft-header">
        <p style={{ fontFamily: 'Rushon Ground' }}>Featured Events🔥</p>
      </div>

      {/* 🔹 Slider container
          - Uses sliderRef for JS control
          - onMouseEnter stops scroll (pause on hover)
          - onMouseLeave starts scroll (resume on leave) */}
      <div
        className="slider"
        ref={sliderRef}
        onMouseEnter={stopScroll}   // Pause when hover
        onMouseLeave={startScroll}  // Resume when leave
      >
        {/* 🔹 List of events
            - We duplicate ft array ([...ft, ...ft]) for seamless looping
            - display:flex arranges items horizontally */}
        <ul style={{ display: 'flex' }}>
          {[...ft, ...ft].map((event, index) => (
            <li
              key={`${event.id}-${index}`} // Unique key for each duplicate
              style={{ flex: '0 0 auto', marginRight: '16px' }} // Keep items inline
            >
              <div className="slider-info">
                {/* 🔹 Event info section */}
                <div className="event-info">
                  {/* Event Image */}
                  <img src={event.image} alt={event.title} className="event-img" />
                  {/* Event Text (Title + Location) */}
                  <div className="event-text">
                    <p>{event.title}</p>
                    <p>{event.location}</p>
                  </div>
                </div>

                {/* 🔹 Buttons section */}
                <div className="slider-btn">
                  {/* View Details Button
                      - Adds 'active' class if this button is currently selected */}
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

                  {/* Buy Tickets Button (currently disabled) */}
                  <button disabled className='buy-tickets-btn'>
                    Buy Tickets
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default FtEvents
