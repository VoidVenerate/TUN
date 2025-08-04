import React from 'react'
import './GetInTouch.css'
import { FaEnvelope,FaPhone } from 'react-icons/fa'

const GetInTouch = () => {
  return (
    <div className='GetInTouch'>
        <p><FaEnvelope size={18} color='#fff' />&nbsp;&nbsp;&nbsp; ade@gmail.com</p>
        <p><FaPhone size={18} color='#fff' />&nbsp;&nbsp;&nbsp; +234 901 5678 776</p>
    </div>
  )
}

export default GetInTouch