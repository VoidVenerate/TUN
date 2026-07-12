import React, { useState } from 'react';
import BannerCard from '../BannerCard/BannerCard';
import BannerForm from '../BannerForm/BannerForm';
import { Upload } from 'lucide-react';
import './BannerComponent.css';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import { useAdminApprovedBanners, useDeleteBanner } from '../../hooks/queries/useBanners';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/queries/queryKeys';

const BannerComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [bannersPerPage] = useState(5);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, bannerId: null });
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    subMessage: '',
    type: '',
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useAdminApprovedBanners();
  const deleteBanner = useDeleteBanner();

  const refreshBanners = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
  };

  const handleDelete = async (id) => {
    try {
      await deleteBanner.mutateAsync(id);
      setModalInfo({
        show: true,
        title: 'Banner Deleted',
        message: 'The banner has been successfully removed.',
        type: 'success',
      });
    } catch (err) {
      setModalInfo({
        show: true,
        title: 'Error',
        message: 'Could not delete banner. Please try again.',
        type: 'error',
      });
      console.error(err);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleAddNew = () => {
    navigate('/newbanner');
    setShowForm(true);
  };

  const indexOfLast = currentPage * bannersPerPage;
  const indexOfFirst = indexOfLast - bannersPerPage;
  const currentBanners = banners.slice(indexOfFirst, indexOfLast);

  if (isLoading) {
    return <p style={{ color: '#ccc', padding: '2rem' }}>Loading banners...</p>;
  }

  return (
    <div className="banner-manager">
      <div className="banner-manager-header">
        <h2 style={{ color: 'white', fontFamily: 'Rushon Ground' }}>Banners</h2>
        <button onClick={handleAddNew}>
          <Upload size={16} /> Add New Banner
        </button>
      </div>

      {showForm ? (
        <BannerForm
          editingBanner={editingBanner}
          onClose={() => setShowForm(false)}
          onRefresh={refreshBanners}
        />
      ) : (
        <>
          <div className="banner-list">
            {currentBanners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onEdit={() => handleEdit(banner)}
                onDelete={() =>
                  setConfirmDelete({ show: true, bannerId: banner.id })
                }
              />
            ))}
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => (indexOfLast < banners.length ? p + 1 : p))}
              disabled={indexOfLast >= banners.length}
            >
              Next Page
            </button>
          </div>
        </>
      )}

      {confirmDelete.show && (
        <Modal
          show={confirmDelete.show}
          onClose={() => setConfirmDelete({ show: false, bannerId: null })}
          title=""
          type="duration"
          message="Are you sure you want to delete this banner?"
          subMessage="This action is permanent and cannot be undone."
          footerButtons={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="modal-close-btn"
                onClick={() => setConfirmDelete({ show: false, bannerId: null })}
              >
                Cancel
              </button>
              <button
                className="modal-close-btn-primary"
                onClick={async () => {
                  await handleDelete(confirmDelete.bannerId);
                  setConfirmDelete({ show: false, bannerId: null });
                }}
              >
                Yes, Delete
              </button>
            </div>
          }
        />
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
