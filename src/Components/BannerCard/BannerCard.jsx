import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
import './BannerCard.css'
import placeholder from '../../assets/placeholder.png'


const BannerCard = ({ banner, onEdit, onDelete }) => {
  return (
    <div className="banner-card">
      {/* Banner Image */}
      <div className="banner-card__image">
          <img
            src={
              banner.banner_image
                ? `https://lagos-turnup.onrender.com${banner.banner_image}`
                : '/assets/placeholder.jpg'
            }
            alt={banner.name}
            onError={(e) => { e.currentTarget.src = placeholder }}
          />
        </div>

      {/* Info */}
      <div className="banner-info-btns">
        <div className="banner-card__info">
          <h3 className="banner-card__name">{banner.name}</h3>
          <p className="banner-card__link">{banner.link}</p>
          </div>

        {/* Buttons */}
        <div className="banner-card__actions">
          <button onClick={onEdit} className="banner-card__btn banner-card__btn--edit">
            <Pencil size={16}/> Edit Banner
          </button>
          <button onClick={onDelete} className="banner-card__btn banner-card__btn--delete">
            <Trash2 size={16}/> Delete Banner
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;