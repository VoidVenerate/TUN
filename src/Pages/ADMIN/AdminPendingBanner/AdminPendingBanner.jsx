import React from 'react'
import AdminNavbar from '../../../Components/AdminNavbar/AdminNavbar'
import PendingBanner from '../../../Components/PendingBanner/PendingBanner'
import AdminCards from '../../../Components/AdminCards/AdminCards'

const AdminPendingBanner = () => {
  return (
    <div>
        <AdminNavbar/>
        <AdminCards />
        <PendingBanner/>
    </div>
  )
}

export default AdminPendingBanner