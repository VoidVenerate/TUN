import React from 'react'
import UserNavbar from '../../Components/UserNavbar/UserNavbar'
import ContactNavbar from '../../Components/ContactNavbar/ContactNavbar'
import GetInTouch from '../../Components/GetInTouch/GetInTouch'
import LetsTalk from '../../Components/LetsTalk/LetsTalk'
import Footer from '../../Components/Footer/Footer'

const ContactUs = () => {
  return (
    <div>
        <UserNavbar/>
        <ContactNavbar />
        <GetInTouch/>
        <LetsTalk/>
        <Footer/>
    </div>
  )
}

export default ContactUs