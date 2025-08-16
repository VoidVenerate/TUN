import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Router } from 'react-router-dom'
import { AuthProvider } from './Components/RoleContext/RoleContext.jsx'
import { EventProvider } from './Components/EventContext/EventContext.jsx'
import { BannerProvider } from './Components/BannerContext/BannerContext.jsx'
import { LocationProvider } from './Components/LocationContext/LocationContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const CLIENT_ID =  '912921479335-htfbosii409g963noetkup30llnmgpm6.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
 
  <StrictMode>
    
    <GoogleOAuthProvider clientId = {CLIENT_ID}>
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <AuthProvider>
            <EventProvider>
              <LocationProvider>
                <BannerProvider>
                  <App />
                </BannerProvider>
              </LocationProvider>
            </EventProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
