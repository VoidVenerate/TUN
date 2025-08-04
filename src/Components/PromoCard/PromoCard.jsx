// PromoCard.jsx
import React from 'react';
import './PromoCard.css';

const PromoCard = ({ title, subtitle, children }) => {
  return (
    <div className="promo-card">
      <div className="promo-text">
        <p>{subtitle}</p>
        <h2>{title}</h2>
        {children && <div className='promo-card-children'>{children}</div>}
      </div>
    </div>
  );
};

export default PromoCard;
