import {createContext, useState, useContext} from 'react'

// 1️⃣ Create the Event Context
// This will hold all event-related data that multiple pages need to access.
const LocationContext = createContext()

// 2️⃣ EventProvider Component
// Wraps the app (or specific routes) to provide shared event state.

export const LocationProvider = ({children}) => {
    // 🗂️ Global state to store all event information
    // This is shared between Upload Location and Review pages

    const [locationData, setLocationData] = useState({
        locationName: '',
        city: '',
        state: 'Lagos',
        typeOfSpot: '',
        additionalInformation: '',
        flyer: null,
        flyerPreview: null,
    })
    
    return (
        // 3️⃣ Provide locationData & setLocationData to all children components
        <LocationContext.Provider value={{ locationData, setLocationData }}>
            {children}
        </LocationContext.Provider>
    )
}

// 4️⃣ Custom Hook: useEvent()
// Easy access to locationData & setLocationData in any component

export const useLocate = () => useContext(LocationContext)