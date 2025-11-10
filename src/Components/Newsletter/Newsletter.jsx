import React, { useEffect, useState, useRef } from 'react';
import Modal from '../Modal/Modal';
import { Upload, TrendingUp, TrendingDown, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './Newsletter.css';
import api from '../api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Newsletter = () => {
  const [subscriptions, setSubscriptions] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [trend, setTrend] = useState(null);
  const [displayedPercentage, setDisplayedPercentage] = useState(0);
  const [subscriptionsList, setSubscriptionsList] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // how many emails per page

  // Form + modal states
  const [flyer, setFlyer] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    subMessage: '',
    type: '',
  });
  const [isPublishHover, setIsPublishHover] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Button styles
  const closeBtnStyle = {
    backgroundColor: 'transparent',
    border: '1px solid #2f2f2fff',
    color: '#ccc',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  };
  const publishBtnStyle = (hover) => ({
    backgroundColor: hover ? '#6c43e6' : '#5423D2',
    color: 'white',
    border: 'none',
    marginTop: '10px',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  });

  // Hover handlers
  const handlePublishMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsPublishHover(true);
  };
  const handlePublishMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsPublishHover(false), 250);
  };

  // Fetch subscription count + list
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const today = new Date().toDateString();
        const lastUpdate = localStorage.getItem("newsletterLastUpdate");

        const res = await api.get('/event/newsletter?limit=1000&offset=0');
        const data = res.data;
        const subs = data?.subscriptions || [];
        setSubscriptionsList(subs);

        const newCount = data?.metadata?.total ?? subs.length;
        const oldCount = Number(localStorage.getItem("prevSubscriptions")) || 0;

        if (oldCount > 0) {
          const diff = newCount - oldCount;
          const percent = ((diff / oldCount) * 100).toFixed(1);
          setPercentageChange(Number(percent));
          setTrend(diff > 0 ? "up" : diff < 0 ? "down" : "flat");
        } else if (oldCount === 0 && newCount > 0) {
          setPercentageChange(100);
          setTrend("up");
        }

        setSubscriptions(newCount);

        if (lastUpdate !== today) {
          localStorage.setItem("prevSubscriptions", newCount);
          localStorage.setItem("newsletterLastUpdate", today);
        }
      } catch (error) {
        console.error("Error fetching newsletter subscriptions:", error);
        setModalInfo({
          show: true,
          title: "Error!",
          message: "Failed to fetch newsletter subscriptions.",
          subMessage: error.response?.data?.message || "",
          type: "error",
        });
      }
    };

    fetchSubscription();
  }, []);

  // Animate percentage
  useEffect(() => {
    let startValue = displayedPercentage;
    const endValue = percentageChange;
    let startTime = null;
    const duration = 800;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newValue = startValue + (endValue - startValue) * progress;
      setDisplayedPercentage(Number(newValue.toFixed(1)));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [percentageChange]);

  // Pagination logic
  const totalPages = Math.ceil(subscriptionsList.length / itemsPerPage);
  const paginatedList = subscriptionsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Export Excel
  const exportSubscribersToExcel = async () => {
    try {
      const res = await api.get('/event/newsletter?limit=1000&offset=0');
      const data = res.data?.subscriptions || [];

      if (data.length === 0) {
        setModalInfo({
          show: true,
          title: "No Data",
          message: "There are no subscribers to export.",
          subMessage: "",
          type: "info",
        });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(file, 'newsletter_subscribers.xlsx');
    } catch (error) {
      console.error("Error exporting subscribers", error);
      setModalInfo({
        show: true,
        title: "Error!",
        message: "Failed to export subscribers.",
        type: "error",
      });
    }
  };

  return (
    <div className='subscription-container'>
      {/* Stats */}
      <div className="subscription-cards">
        <div className="subscription-card">
          <h3>Newsletter Subscribers <Mail size={16} /></h3>
          <p>{subscriptions}</p>
          <div className="subscription-data">
            {trend ? (
              <div className={`trend ${trend}`}>
                {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{displayedPercentage}%</span>
              </div>
            ) : (
              <div className="trend flat"><span>0%</span></div>
            )}
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", marginTop: "24px" }}>
              from yesterday
            </p>
          </div>
        </div>
        <div className="export-card">
          <button className="button" onClick={exportSubscribersToExcel}>
            <Upload size={16} /> Export Emails
          </button>
        </div>
      </div>

      {/* Subscriber List */}
      <div className="newsletter-list">
        <h3 style={{ marginBottom: "12px", marginLeft: "4vw", color: "#fff", marginTop: "72px" }}>
          List of Subscribers
        </h3>

        <div className="notification-list">
          {paginatedList.length > 0 ? (
            paginatedList.map((sub, index) => (
              <div key={index} className="notification-card">
                <div className="notification-info">
                  <p style={{ fontWeight: 500 }}>{sub.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ opacity: 0.6 }}>No subscribers found yet.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {subscriptionsList.length > itemsPerPage && (
          <div className="pagination-controls" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px'
          }}>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#ccc' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
