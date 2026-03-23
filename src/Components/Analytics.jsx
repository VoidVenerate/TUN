import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-4789BZF60X', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};

export default Analytics;