import React from 'react'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import PlacesInLagos from '../../../Components/PlacesInLagos/PlacesInLagos'
import LagEventsFooter from '../../../Components/LagEventsFooter/LagEventsFooter'
import Footer from '../../../Components/Footer/Footer'

const LagVisit = () => {
  return (
    <div>
        <UserNavbar/>
        <PlacesInLagos/>
        <LagEventsFooter/>
        <Footer/>
    </div>
  )
}

export default LagVisit