import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BannerCard from '../BannerCard/BannerCard';
import BannerForm from '../BannerForm/BannerForm';
import { Upload } from 'lucide-react';
import './BannerComponent.css';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import api from '../api';

const BannerComponent = () => {
  // State to store all banners fetched from the API
  const [banners, setBanners] = useState([]);
  // Pagination state: current page number
  const [currentPage, setCurrentPage] = useState(1);
  // Number of banners displayed per page
  const [bannersPerPage] = useState(5);
  // Stores the banner currently being edited (null means no banner selected)
  const [editingBanner, setEditingBanner] = useState(null);
  // Controls whether the BannerForm is visible or not
  const [showForm, setShowForm] = useState(false);

  // React Router navigation hook for navigating programmatically
  const navigate = useNavigate();

  // Fetch banners once when the component mounts
  const [modalInfo, setModalInfo] = useState({
      show: false,
      title: '',
      message: '',
      subMessage: '',
      type: '',
    });
  useEffect(() => {
    fetchBanners();
  }, []);

  // Fetch banner data from backend API
  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token'); 
              if (!token) {
                  console.warn('No token found — user might not be logged in');
                  return;
              }
      const res = await axios.get('https://lagos-turnup.onrender.com/event/banners', { headers: { 'Content-Type': 'multipart/form-data',Authorization: `Bearer ${token}`  } }); // Adjust to your actual API endpoint
      console.log('Fetch Banner:', res.data);
      setBanners(res.data);
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  };

  // Handler to delete a banner by ID
  const handleDelete = async (id) => {
    // Confirm before deleting
     try {
      const token = localStorage.getItem('token'); 
              if (!token) {
                  console.warn('No token found — user unable to delete ');
                  return;
              }
    await api.delete(`https://lagos-turnup.onrender.com/event/banners/${id}`, { headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${token}`  } });
    setModalInfo({
      show: true,
      title: 'Banner Deleted',
      message: 'The banner has been successfully removed.',
      type: 'success'
    });
    fetchBanners();
  } catch (err) {
    setModalInfo({
      show: true,
      title: 'Error',
      message: 'Could not delete banner. Please try again.',
      type: 'error'
    });
    console.error(err);
  }
    // Refresh banners list after deletion
    fetchBanners();
  };

  // Handler to set a banner for editing and show the form
  const handleEdit = (banner) => {
    setEditingBanner(banner); // Set the selected banner to edit
    setShowForm(true);        // Show the BannerForm component
  };

  // Handler to start adding a new banner
  const handleAddNew = () => {
    // Navigate to a route for new banner if you have a dedicated page
    navigate('/newbanner');
    // Show the BannerForm component (in "add" mode since editingBanner is null)
    setShowForm(true);
  };

  // Calculate the indices for paginated banners slice
  const indexOfLast = currentPage * bannersPerPage;       // e.g., page 1 * 5 = 5
  const indexOfFirst = indexOfLast - bannersPerPage;      // e.g., 5 - 5 = 0
  const currentBanners = banners.slice(indexOfFirst, indexOfLast); // Banners to display on current page

  return (
    <div className="banner-manager">
      {/* Header with title and Add New button */}
      <div className="banner-manager-header">
        <h2 style={{ color: 'white', fontFamily: 'Rushon Ground' }}>Banners</h2>
        <button onClick={handleAddNew}>
          <Upload size={16} /> Add New Banner
        </button>
      </div>

      {/* Conditional rendering: show form or banner list */}
      {showForm ? (
        // Show the BannerForm component, passing down editingBanner & handlers
        <BannerForm
          editingBanner={editingBanner}
          onClose={() => setShowForm(false)}  // Close form handler
          onRefresh={fetchBanners}            // Refresh banners list after add/edit
        />
      ) : (
        <>
          {/* List of banners displayed as BannerCard components */}
          <div className="banner-list">
            {/* 
              IMPORTANT: fix this to remove the extra brackets,
              so map correctly iterates over banners array:
            */}
            {currentBanners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onEdit={() => handleEdit(banner)}      // Pass banner to edit handler
                onDelete={() => handleDelete(banner.id)} // Pass banner ID to delete handler
              />
            ))}
          </div>

          {/* Pagination controls */}
          <div className="banner-pagination-controls">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} // Prev page, min 1
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ color: '#fff' }}>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(p => (indexOfLast < banners.length ? p + 1 : p))} // Next page only if more banners exist
              disabled={indexOfLast >= banners.length}
            >
              Next Page
            </button>
          </div>
        </>
      )}
      {modalInfo.show && (
        <Modal
          title={modalInfo.title}
          message={modalInfo.message}
          subMessage={modalInfo.subMessage}
          type={modalInfo.type}
          onClose={() => setModalInfo({ ...modalInfo, show: false })}
        />
      )}
    </div>
  );
};

export default BannerComponent;
