import React from 'react';
import { Trash2, Pencil } from 'lucide-react';


const BannerCard = ({ banner, onEdit, onDelete }) => {
  return (
    <div className="banner-card">
      <div className="banners">
        <img
          src={
            banner.banner_image
              ? `https://lagos-turnup.onrender.com${banner.banner_image}`
              : '/assets/placeholder.jpg'
          }
          alt={banner.name}
        />
        <div className="banner-info">
          <h3>{banner.name}</h3>
          <p>{banner.link}</p>
        </div>
        <div className="btn-group">
          <button onClick={onEdit}><Pencil size={16}/>Edit Banner</button>
          <button onClick={onDelete} className="delete-btn"><Trash2 size={16}/>Delete Banner</button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;
