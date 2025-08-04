import React from 'react'
import './Clubs.css'
import clubImages from '../../assets/ClubImages'

const Clubs = () => {
  return (
    <div className='club-container'>
         <div className="club-header">
            <h2>BEST CLUBS IN LAGOS</h2>
         </div>
         <div className="lag-clubs">
            {clubImages.map((club, index) => (
                <div className="club-card" key={club.id}>
                    <div className="clubs">
                        <img src={club.image} alt={club.name} />
                        <div className="club-text">
                            <h3>{club.name}</h3>
                            <p>{club.location}</p>
                        </div>
                        <p>{club.openingTime}</p>
                    </div>
                </div>
            ))}
         </div>
    </div>
  )
}

export default Clubs