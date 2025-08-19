import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Modal from '../Modal/Modal';

const EditableLocationRHF = () => {
  const navigate = useNavigate();
  const { spot_id } = useParams(); // 👈 grab spot_id from URL

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      locationName: '',
      city: '',
      state: '',
      typeOfSpot: '',
      additionalInfo: '',
      flyerFile: null,
      flyerPreview: null,
    },
  });

  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', subMessage: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const previewUrlRef = useRef(null);
  const flyerFile = watch('flyerFile');

  // ✅ Flyer preview
  useEffect(() => {
    if (flyerFile && flyerFile.length > 0) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const preview = URL.createObjectURL(flyerFile[0]);
      previewUrlRef.current = preview;
      setValue('flyerPreview', preview);
    }
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [flyerFile, setValue]);

  // ✅ Fetch spot details
  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/event/spots", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        const spots = (Array.isArray(res.data) ? res.data : []).map((s) => ({
          ...s,
          id: String(s.id), // keep IDs safe as strings
        }));

        console.log("All spots:", spots);

        const spot = spots.find((s) => s.id === spot_id);

        console.log("Fetched spot:", spot);

        if (spot) {
          reset({
            locationName: spot.location_name,
            city: spot.city,
            state: spot.state,
            typeOfSpot: spot.spot_type,
            additionalInfo: spot.additional_info,
            flyerPreview: spot.cover_image
            ? `https://lagos-turnup.onrender.com/${spot.cover_image}`
            : "",
          });
        }
      } catch (err) {
        console.error("Error fetching spot:", err);
      }
    };
    fetchSpot();
  }, [spot_id, reset]);




  // ✅ Save changes
  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("location_name", data.locationName);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("spot_type", data.typeOfSpot);
      formData.append("additional_info", data.additionalInfo);
      if (data.flyerFile && data.flyerFile[0]) {
         formData.append("cover_image", data.flyerFile[0]);
      }

      await api.put(`/event/spots/edit/${spot_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Redirect to new spot type admin page
      let redirectPath = "/discoverlagos";
      switch (data.typeOfSpot) {
        case "club":
          redirectPath = "/adminclubs";
          break;
        case "hotel":
          redirectPath = "/adminhotels";
          break;
        case "food_spot":
          redirectPath = "/adminfoodspots";
          break;
        case "beach":
          redirectPath = "/adminbeaches";
          break;
      }
      navigate(redirectPath);
    } catch (err) {
      console.error("Error updating spot:", err);
    }
  };


  // ✅ Delete spot
  const handleDelete = () => {
    if (!spot_id) {
      setModalInfo({ show: true, title: 'Error', message: 'No spot ID to delete.', subMessage: '' });
      return;
    }

    setModalInfo({
      show: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this spot?',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await api.delete(`/event/spots/${spot_id}`);
          setModalInfo({ show: true, title: 'Deleted', message: 'Spot deleted successfully.', subMessage: '' });
          navigate('/discoverlagos');
        } catch (err) {
          setModalInfo({
            show: true,
            title: 'Error',
            message: 'Failed to delete spot.',
            subMessage: err?.message || '',
          });
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const closeModal = () => setModalInfo(prev => ({ ...prev, show: false }));

  return (
    <div className="review-container">
      <header className="review-header">
        <h1 className="review-header-title">
          <button onClick={() => navigate(-1)} className="review-back-btn">←</button>
          EDIT LOCATION
        </h1>
      </header>

      <form id="spotForm" onSubmit={handleSubmit(onSubmit)} className="review-content" encType="multipart/form-data">
        {/* Flyer Upload */}
        <div className="review-upload-section">
          <div className="review-upload-label">
            <span className="review-upload-text">Location Flyer</span>
          </div>
          <div className="review-upload-area">
            <img
              src={watch('flyerPreview') || '/placeholder.png'}
              alt="Spot Flyer Preview"
              className="review-flyer-preview"
              onError={(e) => (e.target.src = '/placeholder.png')}
            />
          </div>
          <input type="file" accept="image/*" {...register('flyerFile')} className="review-file-input" />
        </div>

        {/* Location details form */}
        <div className="review-form">
          <div className="review-fields">
            <div className="review-group">
              <label className="review-label" htmlFor="locationName">Location Name</label>
              <input id="locationName" className="form-input" {...register('locationName', { required: true })} />
            </div>

            <div className="review-group">
              <label className="review-label" htmlFor="city">City</label>
              <input id="city" className="form-input" {...register('city', { required: true })} />
            </div>

            <div className="review-group">
              <label className="review-label" htmlFor="state">State</label>
              <input id="state" className="form-input" {...register('state', { required: true })} readOnly />
            </div>

            <div className="review-group">
              <label className="review-label" htmlFor="typeOfSpot">Type of Spot</label>
              <select id="typeOfSpot" className="form-select" {...register('typeOfSpot', { required: true })}>
                <option value="">Select One</option>
                <option value="club">Club</option>
                <option value="hotel">Hotel</option>
                <option value="food_spot">Food Spot</option>
                <option value="beach">Beach</option>
              </select>
            </div>

            <div className="review-group review-full">
              <label className="review-label" htmlFor="additionalInfo">Additional Info</label>
              <textarea id="additionalInfo" className="form-textarea" {...register('additionalInfo')} />
            </div>
          </div>
        </div>

        <footer className="review-footer">
          <button type="submit" className="review-submit-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className="review-submit-btn" disabled={deleting} onClick={handleDelete}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </footer>
      </form>

      {/* Feedback Modal */}
      <Modal
        show={modalInfo.show}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
        subMessage={modalInfo.subMessage}
        footerButtons={
          modalInfo.onConfirm ? (
            <>
              <button onClick={closeModal}>Cancel</button>
              <button
                onClick={() => {
                  modalInfo.onConfirm();
                  closeModal();
                }}
              >
                Confirm
              </button>
            </>
          ) : (
            <button onClick={closeModal}>Close</button>
          )
        }
      />
    </div>
  );
};

export default EditableLocationRHF;
