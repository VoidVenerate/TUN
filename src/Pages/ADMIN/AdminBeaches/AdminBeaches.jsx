import React from 'react'
import ReusableSpots from '../../../Components/ReusableSpots/ReusableSpots'
import AdminNavbar from '../../../Components/AdminNavbar/AdminNavbar'

const AdminBeaches = () => {
  return (
    <>
      <AdminNavbar/>
      <ReusableSpots spotType='beaches' editPath='/editlocation'/>
    </>
  )
}

export default AdminBeaches