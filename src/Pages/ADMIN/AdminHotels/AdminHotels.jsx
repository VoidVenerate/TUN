import React from 'react'
import ReusableSpots from '../../../Components/ReusableSpots/ReusableSpots'
import AdminNavbar from '../../../Components/AdminNavbar/AdminNavbar'

const AdminHotels = () => {
  return (
    <>
      <AdminNavbar/>
      <ReusableSpots spotType="hotel" addPath="/adminaddhotel" editPath="/editlocation" />
    </>
  )
}

export default AdminHotels