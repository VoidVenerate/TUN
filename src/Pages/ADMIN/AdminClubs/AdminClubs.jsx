import React from 'react'
import ReusableSpots from '../../../Components/ReusableSpots/ReusableSpots'
import AdminNavbar from '../../../Components/AdminNavbar/AdminNavbar'

const AdminClubs = () => {
  return (
    <>
      <AdminNavbar/>
      <ReusableSpots spotType="club" addPath="/adminaddclub" editPath="/editlocation" />
    </>
  )
}

export default AdminClubs