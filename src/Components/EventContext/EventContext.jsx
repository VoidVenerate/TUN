import { createContext, useState, useContext } from 'react'

// 1️⃣ Create the Event Context
// This will hold all event-related data that multiple pages need to access.
const EventContext = createContext()

// 2️⃣ EventProvider Component
// Wraps the app (or specific routes) to provide shared event state.
export const EventProvider = ({ children }) => {
    // 🗂️ Global state to store all event information
    // This is shared between Event Details, Feature Event, and Review pages
    const [eventData, setEventData] = useState({
        eventName: '',        // Name of the event
        date: '',             // Date of the event
        location: '',         // Location (state, city, etc.)
        description: '',      // Event description text
        featureChoice: 'no-feature', // Whether the host wants to feature the event
        contactMethod: 'email',      // Preferred contact method (email, phone, WhatsApp)
        contactValue: '',     // Actual contact value (email address, phone number, etc.)
        link: '',             // Additional link (WhatsApp group, Linktree, ticket page)
        flyer: null,          // Actual flyer file (image upload)
        flyerPreview: null,   // Flyer preview URL (for display before submission)
        dresscode: '',        // Dress code for the event (optional)
        time: '',             // Event time
        venue: ''             // Venue details
    }) 

    return (
        // 3️⃣ Provide eventData & setEventData to all children components
        <EventContext.Provider value={{ eventData, setEventData }}>
            {children}
        </EventContext.Provider>
    )
}

// 4️⃣ Custom Hook: useEvent()
// Easy access to eventData & setEventData in any component
export const useEvent = () => useContext(EventContext)

