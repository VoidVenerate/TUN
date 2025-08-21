import React from 'react'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import EventDetails from '../../../Components/EventDetails/EventDetails'
import Footer from '../../../Components/Footer/Footer'

const UserEventDetails = () => {
  return (
    <div>
        <UserNavbar/>
        <EventDetails/>
        <Footer/>
    </div>
  )
}

export default UserEventDetails