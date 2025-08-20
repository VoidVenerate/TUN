import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import api from "../api";
import PendingBannerCard from "../PendingBannerCard/PendingBannerCard";
import { Search } from "lucide-react";
import './pendingBanner.css'

const PendingBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bannersPerPage = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    subMessage: "",
    type: "",
  });

  const navigate = useNavigate();

  // 🚀 Fetch ALL banners, then filter pending ones
  const fetchPendingBanners = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/event/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Keep only pending banners
      const pending = res.data.filter((banner) => !banner.is_approved);
      setBanners(pending);
    } catch (err) {
      console.error("Error fetching pending banners:", err);
    }
  };

  useEffect(() => {
    fetchPendingBanners();
  }, []);

  // ✅ Approve banner
  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.patch(`/event/banners/${id}/approve`,null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalInfo({
        show: true,
        title: "Banner Approved",
        message: "Banner successfully approved.",
        type: "success",
      });

      fetchPendingBanners();
    } catch (err) {
      console.error(err);
      setModalInfo({
        show: true,
        title: "Error",
        message: "Could not approve banner.",
        type: "error",
      });
    }
  };

  // ❌ Reject banner
  const handleReject = async (id) => {
    console.log("Rejecting banner with id:", id); // 👈 sanity check
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.delete(`https://lagos-turnup.onrender.com/event/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}`},
      });

      setModalInfo({
        show: true,
        title: "Banner Rejected",
        message: "Banner successfully rejected.",
        type: "success",
      });

      fetchPendingBanners();
    } catch (err) {
      console.error(err);
      setModalInfo({
        show: true,
        title: "Error",
        message: "Could not reject banner.",
        type: "error",
      });
    }
  };

  // 🔎 Filter by search
  const filteredBanners = banners.filter((banner) =>
    banner.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📖 Pagination
  const indexOfLast = currentPage * bannersPerPage;
  const indexOfFirst = indexOfLast - bannersPerPage;
  const currentBanners = filteredBanners.slice(indexOfFirst, indexOfLast);

  return (
    <div className="banner-manager">
      {/* Header */}
      <div className="banner-manager-header">
        <h2 style={{ color: "white", fontFamily: "Rushon Ground" }}>
          Pending Banners
        </h2>
      </div>

      {/* Search */}
      <div className="banner-controls">
        <div className="banner-search">
            <Search size={18} className="search-icon" />
            <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
            />
            {searchTerm && (
            <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchTerm("")}
            >
                ✕
            </button>
            )}
        </div>
      </div>

      {/* Banner list */}
      <div className="banner-list">
        {currentBanners.length > 0 ? (
          currentBanners.map((banner) => (
            <PendingBannerCard
              key={banner.id}
              banner={banner}
              onAccept={() => handleAccept(banner.id)}
              onDelete={() => handleReject(banner.id)}
            />
          ))
        ) : (
          <p style={{ color: "#ccc" }}>No pending banners found.</p>
        )}
      </div>

      {/* Pagination */}
      {filteredBanners.length > bannersPerPage && (
        <div className="banner-pagination-controls">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span style={{ color: "#fff" }}>Page {currentPage}</span>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                indexOfLast < filteredBanners.length ? p + 1 : p
              )
            }
            disabled={indexOfLast >= filteredBanners.length}
          >
            Next Page
          </button>
        </div>
      )}

      {/* Modal */}
      {modalInfo.show && (
        <Modal
          show={modalInfo.show}
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

export default PendingBanner;
