import React from 'react'
import UserNavbar from '../../Components/UserNavbar/UserNavbar'
import Billboard from '../../Components/Billboard/Billboard'
import './Home.css'
import FtEvents from '../../Components/FtEvents/FtEvents'
import Visit from '../../Components/Visit/Visit'
import LagEvents from '../../Components/LagEvents/LagEvents'
import BlEvents from '../../Components/BlEvents/BlEvents'
import EventsPromoBanner from '../../Components/EventsPromoBanner/EventsPromoBanner'
import Footer from '../../Components/Footer/Footer'

const Home = () => {
  return (
    <div>
        <UserNavbar/>
        <Billboard />
        <FtEvents />
        <Visit />
        <LagEvents />
        <BlEvents />
        <EventsPromoBanner />
        <Footer />
    </div>
  )
}

export default Home