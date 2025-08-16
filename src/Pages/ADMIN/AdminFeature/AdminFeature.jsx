import React from 'react'
import AdminNavbar from '../../../Components/AdminNavbar/AdminNavbar'
import FeatureAnEvent from '../../../Components/FeatureAnEvent/FeatureAnEvent'
import FeatureEventForm from '../../../Components/FeatureEventForm/FeatureEventForm'

const AdminFeature = () => {
  return (
    <div>
        <AdminNavbar/>
        <FeatureAnEvent/>
        <FeatureEventForm/>
    </div>
  )
}

export default AdminFeature