import React from 'react'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import Footer from '../../../Components/Footer/Footer'
import SpotList from '../../../Components/SpotList/SpotList'

const BestHotels = () => {
  return (
    <div>
        <UserNavbar/>
        <SpotList spotType="hotel" title="Best Clubs in Lagos" />
        <Footer/>
    </div>
  )
}

export default BestHotels