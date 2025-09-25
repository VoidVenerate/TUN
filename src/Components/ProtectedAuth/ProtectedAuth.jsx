import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Auth from '../../Auth/Auth';

const ProtectedAuth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [signUpKey, setSignUpKey] = useState('');

  useEffect(() => {
    const encodedKey = searchParams.get('key');

    if (!encodedKey) {
      navigate('/', { replace: true });
      return;
    }

    try {
      const decodedKey = atob(encodedKey);

      // ✅ Check if the decoded key matches exactly
      

      setSignUpKey(decodedKey);

      // Clear URL params after validation
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error("Decoding failed:", error);
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  return signUpKey ? <Auth signUpKey={signUpKey} /> : null;
};

export default ProtectedAuth;
