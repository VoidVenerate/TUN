import React from 'react'
import UserNavbar from '../../Components/UserNavbar/UserNavbar'
import FeatureAnEvent from '../../Components/FeatureAnEvent/FeatureAnEvent'
import Footer from '../../Components/Footer/Footer'
import FeatureEventForm from '../../Components/FeatureEventForm/FeatureEventForm'

const FeatureEvent = () => {
  return (
    <div>
        <UserNavbar/>
        <FeatureAnEvent/>
        <FeatureEventForm/>
        <Footer/>
    </div>
  )
}

export default FeatureEvent