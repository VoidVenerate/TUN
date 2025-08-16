import React from 'react'
import AdminNavbar from '../../../Components/AdminNavbar/AdminNavbar'
import PendingEvents from '../../../Components/PendingEvents/PendingEvents'
import AdminCards from '../../../Components/AdminCards/AdminCards'

const AdminPendingEvents = () => {
  return (
    <div>
        <AdminNavbar />
        <AdminCards />
        <PendingEvents />
    </div>
  )
}

export default AdminPendingEvents