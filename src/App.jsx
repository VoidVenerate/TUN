import { useState } from 'react'
import userNavbar from './Components/UserNavbar/UserNavbar'
import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './Pages/Home/Home'
import ExploreLagos from './Pages/ExploreLagos/ExploreLagos'
import BeyondLagos from './Pages/BeyondLagos/BeyondLagos'
import ContactUs from './Pages/ContactUs/ContactUs'
import PromoteWithUs from './Pages/PromoteWithUs/PromoteWithUs'
import LagVisit from './Pages/LagVisit/LagVisit'
import BestClubs from './Pages/BestClubs/BestClubs'
import PromoteEvent from './Pages/PromoteEvent/PromoteEvent'
import FeatureEvent from './Pages/FeatureEvent/FeatureEvent'
import { EventProvider } from './Components/EventContext/EventContext'
import { BannerProvider } from './Components/BannerContext/BannerContext'
import Review from './Pages/Review/Review'
import Banner from './Pages/Banner/Banner'
import IntroAnimation from './Pages/IntroAnimation/IntroAnimation'

function App() {

  const client = new QueryClient()

  return (
   <QueryClientProvider client={client}>
    <Router>
      <div>
        <EventProvider>
          <BannerProvider>
            <Routes>
              <Route path='/' element = {<IntroAnimation/>} />
              <Route path='/home' element = {<Home/>} />
              <Route path='/explore' element = {<ExploreLagos/>} />
              <Route path='/beyond' element = {<BeyondLagos/>} />
              <Route path='/contact' element = {<ContactUs/>} />
              <Route path='/promote' element = {<PromoteWithUs/>} />
              <Route path='/lagvisit' element = {<LagVisit/>} />
              <Route path='/clubs' element = {<BestClubs/>} />
              <Route path='/promoteevent' element = {<PromoteEvent/>} />
              <Route path='/featureevent' element = {<FeatureEvent/>} />
              <Route path='/review' element = {<Review/>} />
              <Route path='/promotebanner' element = {<Banner/>} />
            </Routes>
          </BannerProvider>
        </EventProvider>
      </div>
    </Router>
   </QueryClientProvider>
  )
}

export default App
