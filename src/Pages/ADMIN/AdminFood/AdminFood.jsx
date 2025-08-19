import React from 'react'
import ReusableSpots from '../../../Components/ReusableSpots/ReusableSpots'
import AdminNavbar from '../../../Components/AdminNavbar/AdminNavbar'
const AdminFood = () => {
  return (
    <>
      <AdminNavbar/>
      <ReusableSpots spotType="food_spot" addPath="/adminaddfoodspot" editPath="/editlocation" />
    </>
  )
}

export default AdminFood