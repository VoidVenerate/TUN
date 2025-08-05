import { createContext, useState, useContext } from "react";

const BannerContext = createContext()

export const BannerProvider = ({ children }) => {
    const [bannerData, setBannerData] = useState({
        bannerName: '',
        flyer: null,
        bannerLink: ''
    })
    return (
        <BannerContext.Provider value={{bannerData, setBannerData}}>
            {children}
        </BannerContext.Provider>
    )
}

export const useBanner = () => useContext(BannerContext)