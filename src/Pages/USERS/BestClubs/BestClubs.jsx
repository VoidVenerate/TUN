import React from 'react'
import UserNavbar from '../../../Components/UserNavbar/UserNavbar'
import Clubs from '../../../Components/SpotList/SpotList'
import Footer from '../../../Components/Footer/Footer'
import SpotList from '../../../Components/SpotList/SpotList'

const BestClubs = () => {
  return (
    <div>
        <UserNavbar/>
        <SpotList spotType="club" title="Best Clubs in Lagos" />
        <Footer/>
    </div>
  )
}

export default BestClubs