import React from 'react'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import Billboard from '../../../Components/Billboard/Billboard'
import './Home.css'
import FtEvents from '../../../Components/FtEvents/FtEvents'
import Visit from '../../../Components/Visit/Visit'
import LagEvents from '../../../Components/AllEvents/AllEvents'
import BlEvents from '../../../Components/BlEvents/BlEvents'
import EventsPromoBanner from '../../../Components/EventsPromoBanner/EventsPromoBanner'
import Footer from '../../../Components/Footer/Footer'
import AllEvents from '../../../Components/AllEvents/AllEvents'

const Home = () => {
  return (
    <div>
        <UserNavbar/>
        <Billboard />
        <FtEvents />
        <Visit />
        <AllEvents stateFilter="Lagos" limit = {18} />
        <AllEvents stateFilter="Outside Lagos" limit = {18} />
        <EventsPromoBanner />
        <Footer />
    </div>
  )
}

export default Home