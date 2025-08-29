import React from 'react';
import { Trash2, Check } from 'lucide-react'; // ✅ swapped Pencil for Check
import placeholder from '../../assets/placeholder.png';

const PendingBannerCard = ({ banner, onAccept, onDelete }) => {
  return (
    <div className="banner-card">
      {/* Banner Image */}
      <div className="banner-card__image">
        <img
          src={
            banner.banner_image
              ? banner.banner_image.startsWith('http')
                ? banner.banner_image   // absolute → use as-is
                : `https://lagos-turnup.onrender.com${banner.banner_image}` // relative → prefix
              : placeholder
          }
          alt={banner.name}
          onError={(e) => { e.currentTarget.src = placeholder }}
        />
      </div>

      {/* Info + Buttons */}
      <div className="banner-info-btns">
        <div className="banner-card__info">
          <h3 className="banner-card__name">{banner.name}</h3>
          <p className="banner-card__link">{banner.link}</p>
        </div>

        {/* Actions */}
        <div className="banner-card__actions">
          <button
            onClick={onAccept}
            className="banner-card__btn banner-card__btn--accept"
          >
            <Check size={16} /> Accept Banner
          </button>
          <button
            onClick={onDelete}
            className="banner-card__btn banner-card__btn--delete"
          >
            <Trash2 size={16} /> Reject Banner
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingBannerCard;
