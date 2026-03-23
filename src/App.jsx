import { useState } from 'react'
import userNavbar from './Components/UserNavbar/UserNavbar'
import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './Pages/USERS/Home/Home'
import ExploreLagos from './Pages/USERS/ExploreLagos/ExploreLagos'
import BeyondLagos from './Pages/USERS/BeyondLagos/BeyondLagos'
import ContactUs from './Pages/USERS/ContactUs/ContactUs'
import PromoteWithUs from './Pages/USERS/PromoteWithUs/PromoteWithUs'
import LagVisit from './Pages/USERS/LagVisit/LagVisit'
import BestClubs from './Pages/USERS/BestClubs/BestClubs'
import BestBeaches from './Pages/USERS/BestBeaches/BestBeaches'
import BestFoodspots from './Pages/USERS/BestFoodSpots/BestFoodspots'
import BestHotels from './Pages/USERS/BestHotels/BestHotels'
import PromoteEvent from './Pages/USERS/PromoteEvent/PromoteEvent'
import FeatureEvent from './Pages/USERS/FeatureEvent/FeatureEvent'
import { EventProvider } from './Components/EventContext/EventContext'
import { BannerProvider } from './Components/BannerContext/BannerContext'
import Review from './Pages/USERS/Review/Review'
import Banner from './Pages/USERS/Banner/Banner'
import IntroAnimation from './Pages/USERS/IntroAnimation/IntroAnimation'
import ProtectedAuth from  './Components/ProtectedAuth/ProtectedAuth'
import Auth from './Auth/Auth'
import AdminBanner from './Pages/ADMIN/AdminBanner/Banner'
import AdminDiscover from './Pages/ADMIN/AdminDiscover/AdminDiscover'
import AdminEventsPage from './Pages/ADMIN/AdminEventsPage/AdminEventsPage'
import AdminPendingEvents from './Pages/ADMIN/AdminPendingEvents/AdminPendingEvents'
import Subscriptions from './Pages/ADMIN/Subscriptions/Subscriptions'
import Notification from './Pages/ADMIN/Notification/Notification'
import AdminPromoteEvent from './Pages/ADMIN/AdminPromoteEvent/AdminPromoteEvent'
import NewBanner from './Pages/ADMIN/NewBanner/NewBanner'
import AdminSpots from './Pages/ADMIN/AdminSpots/AdminSpots'
import ActionEvent from './Pages/ActionEvent/ActionEvent'
import AdminEditEvent from './Pages/ADMIN/AdminEditEvent/AdminEditEvent'
import Profile from './Pages/Profile/Profile'
import AdminReview from './Pages/ADMIN/AdminReview/AdminReview'
import AdminFeature from './Pages/ADMIN/AdminFeature/AdminFeature'
import AdminViewEventDetails from './Pages/ADMIN/AdminViewEventDetails/AdminViewEventDetails'
import ViewEventDetails from './Pages/USERS/ViewEventDetails/ViewEventDetails'
import AdminClubs from './Pages/ADMIN/AdminClubs/AdminClubs'
import AdminHotels from './Pages/ADMIN/AdminHotels/AdminHotels'
import AdminFood from './Pages/ADMIN/AdminFood/AdminFood'
import AdminBeaches from './Pages/ADMIN/AdminBeaches/AdminBeaches'
import EditSpot from './Pages/ADMIN/EditSpot/EditSpot'
import AdminPendingBanner from './Pages/ADMIN/AdminPendingBanner/AdminPendingBanner'
import UserEventDetails from './Pages/USERS/UserEventDetails/UserEventDetails'
import AdminAction from './Pages/ADMIN/AdminAction/AdminAction'
import AdminPromoteBanner from './Components/AdminPromoteBanner/AdminPromoteBanner'
import AIChatPage from './Components/AIChatPage/AIChatPage'
import SpotDetails from './Components/SpotDetails/SpotDetails'
import AdminSpotDetails from './Components/AdminSpotDetails/AdminSpotDetails'
import Analytics from './Components/Analytics'
// import AIChatPage from './Components/AIChatPage copy/AIChatPage'

function App() {

  return (
    <div>
      <Analytics />
      <Routes>
        <Route path='/' element = {<IntroAnimation/>} />
        <Route path='/home' element = {<Home/>} />
        <Route path='/explore' element = {<ExploreLagos/>} />
        <Route path='/beyond' element = {<BeyondLagos/>} />
        <Route path='/contact' element = {<ContactUs/>} />
        <Route path='/promote' element = {<PromoteWithUs/>} />
        <Route path='/lagvisit' element = {<LagVisit/>} />
        <Route path="/spotdetails/:id" element={<SpotDetails />} />
        <Route path='/clubs' element = {<BestClubs/>} />
        <Route path='/hotels' element = {<BestHotels/>} />
        <Route path='/foodspots' element = {<BestFoodspots/>} />
        <Route path='/beaches' element = {<BestBeaches/>} />
        <Route path='/promoteevent' element = {<PromoteEvent/>} />
        <Route path='/featureevent' element = {<FeatureEvent/>} />
        <Route path='/review' element = {<Review/>} />
        <Route path='/eventdetails' element = {<UserEventDetails/>} />
        <Route path='/viewdetails/:id' element = {<ViewEventDetails/>} />
        <Route path='/promotebanner' element = {<Banner/>} />
        <Route path='/chat' element = {<AIChatPage/>} />
        <Route path='/auth' element = {<ProtectedAuth/>} />
        <Route path='/adminhome' element = {<AdminPendingEvents/>} />
        <Route path='/adminevents' element = {<AdminEventsPage/>} />
        <Route path='/adminpromotebanner' element = {<AdminPromoteBanner/>} />
        <Route path='/adminevents' element = {<AdminEventsPage/>} />
        <Route path='/banner' element = {<AdminBanner/>} />
        <Route path='/discover' element = {<AdminDiscover/>} />
        <Route path='/subscriptions' element = {<Subscriptions/>} />
        <Route path='/notification' element = {<Notification/>} />
        <Route path='/adminpromoteevent' element = {<AdminPromoteEvent/>} />
        <Route path='/adminreviewevent' element = {<AdminReview/>} />
        <Route path='/adminfeatureevent' element = {<AdminFeature/>} />
        <Route path='/newbanner' element = {<NewBanner/>} />
        <Route path='/adminspots' element = {<AdminSpots/>} />
        <Route path='/actionevents' element = {<ActionEvent/>} />
        <Route path='/editevent/:event_id' element = {<AdminEditEvent/>} />
        <Route path='/profile' element = {<Profile/>} />
        <Route path='/adminviewdetails/:id' element = {<AdminViewEventDetails/>} />
        <Route path="/adminspotdetails/:id" element={<AdminSpotDetails />} />
        <Route path='/adminclubs' element = {<AdminClubs/>} />
        <Route path='/adminhotels' element = {<AdminHotels/>} />
        <Route path='/adminfoodspots' element = {<AdminFood/>} />
        <Route path='/adminbeaches' element = {<AdminBeaches/>} />
        <Route path='/editlocation/:spot_id' element = {<EditSpot/>} />
        <Route path='/pendingbanner' element = {<AdminPendingBanner/>} />
        <Route path='/takeaction/:event_id' element = {<AdminAction/>} />
      </Routes>
    </div>
  )
}

export default App
